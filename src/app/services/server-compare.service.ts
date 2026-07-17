import { Injectable, OnDestroy, inject } from "@angular/core";
import { ServerPKs } from "../../../sdk/data-contracts";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

export interface ZoneAndRegion {
  zone: string;
  region: string;
}

export interface ServerCompare {
  display_name: string;
  vendor: string;
  server: string;
  zonesRegions: ZoneAndRegion[];
}

export interface ServerCompareItem {
  display_name: string;
  vendor: string;
  server: string;
  zoneRegion?: ZoneAndRegion;
}

export interface ServerCompareBaseline {
  vendor: string;
  server: string;
}

@Injectable({
  providedIn: "root",
})
export class ServerCompareService implements OnDestroy {
  private router = inject(Router);

  public selectedForCompare: ServerCompare[] = [];
  public selectionChanged: Subject<ServerCompare[]> = new Subject();
  public baselineChanged: Subject<ServerCompareBaseline | null> = new Subject();
  public baselineServer: ServerCompareBaseline | null = null;

  toggleCompare(event: boolean, server: ServerCompareItem) {
    if (event) {
      let existing = this.selectedForCompare.find(
        (item) =>
          item.vendor === server.vendor && item.server === server.server,
      );
      if (existing) {
        if (
          server.zoneRegion &&
          !existing.zonesRegions.find(
            (zone) =>
              zone.region === server.zoneRegion?.region &&
              zone.zone === server.zoneRegion?.zone,
          )
        ) {
          existing.zonesRegions.push(server.zoneRegion);
        }
      } else {
        this.selectedForCompare.push({
          display_name: server.display_name,
          vendor: server.vendor,
          server: server.server,
          zonesRegions: server.zoneRegion ? [server.zoneRegion] : [],
        });
      }
    } else {
      // removing the whole server
      if (!server.zoneRegion) {
        this.selectedForCompare = this.selectedForCompare.filter(
          (item) =>
            item.vendor !== server.vendor || item.server !== server.server,
        );
        this.clearBaselineIfMatches(server);
      } else {
        // removing a zone
        let existing = this.selectedForCompare.find(
          (item) =>
            item.vendor === server.vendor && item.server === server.server,
        );
        if (existing) {
          // remove if no zones left
          existing.zonesRegions = existing.zonesRegions.filter(
            (zone) =>
              zone.region !== server.zoneRegion?.region &&
              zone.zone !== server.zoneRegion?.zone,
          );
          if (existing.zonesRegions.length === 0) {
            this.selectedForCompare = this.selectedForCompare.filter(
              (item) =>
                item.vendor !== server.vendor || item.server !== server.server,
            );
            this.clearBaselineIfMatches(server);
          }
        }
      }
    }
    this.selectionChanged.next(this.selectedForCompare);
  }

  compareCount(): number {
    return this.selectedForCompare?.length;
  }

  setBaselineServer(baseline: ServerCompareBaseline | null): void {
    if (this.isSameBaseline(baseline)) {
      return;
    }

    this.baselineServer = baseline;
    this.baselineChanged.next(baseline);
  }

  toggleBaselineServer(server: { vendor: string; server: string }): void {
    if (this.isBaselineServer(server)) {
      this.setBaselineServer(null);
      return;
    }

    this.setBaselineServer({
      vendor: server.vendor,
      server: server.server,
    });
  }

  isBaselineServer(server: { vendor: string; server: string }): boolean {
    return (
      !!this.baselineServer &&
      this.baselineServer.vendor === server.vendor &&
      this.baselineServer.server === server.server
    );
  }

  clearCompare() {
    this.selectedForCompare = [];
    this.setBaselineServer(null);
    this.selectionChanged.next(this.selectedForCompare);
  }

  reorderSelectedForCompare(previousIndex: number, currentIndex: number) {
    if (previousIndex === currentIndex) {
      return;
    }

    if (
      previousIndex < 0 ||
      currentIndex < 0 ||
      previousIndex >= this.selectedForCompare.length ||
      currentIndex >= this.selectedForCompare.length
    ) {
      return;
    }

    const [server] = this.selectedForCompare.splice(previousIndex, 1);
    this.selectedForCompare.splice(currentIndex, 0, server);
    this.selectionChanged.next(this.selectedForCompare);
  }

  isSelected(server: ServerPKs) {
    return (
      this.selectedForCompare.findIndex(
        (item) =>
          item.vendor === server.vendor_id &&
          item.server === server.api_reference,
      ) !== -1
    );
  }

  openCompare() {
    if (this.selectedForCompare.length < 2) {
      alert("Please select at least two servers to compare");
      return;
    }

    this.router.navigateByUrl(this.buildCompareUrl());
  }

  syncCompareRoute(): void {
    const path = this.router.url.split("?")[0].split("#")[0];
    if (!path.startsWith("/compare")) {
      return;
    }

    this.router.navigateByUrl(this.buildCompareUrl());
  }

  private buildCompareUrl(): string {
    if (!this.selectedForCompare.length) {
      return "/compare";
    }

    const encoded = btoa(JSON.stringify(this.selectedForCompare));
    let url = "/compare?instances=" + encoded;

    if (this.baselineServer) {
      url +=
        "&baseline_vendor=" +
        encodeURIComponent(this.baselineServer.vendor) +
        "&baseline_server=" +
        encodeURIComponent(this.baselineServer.server);
    }

    return url;
  }

  private clearBaselineIfMatches(server: {
    vendor: string;
    server: string;
  }): void {
    if (this.isBaselineServer(server)) {
      this.setBaselineServer(null);
    }
  }

  private isSameBaseline(baseline: ServerCompareBaseline | null): boolean {
    return baseline
      ? this.isBaselineServer(baseline)
      : this.baselineServer === null;
  }

  ngOnDestroy() {
    this.selectionChanged.complete();
    this.baselineChanged.complete();
  }
}
