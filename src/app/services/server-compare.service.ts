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

export interface DatabaseCompare {
  display_name: string;
  vendor: string;
  database: string;
}

export interface DatabaseCompareBaseline {
  vendor: string;
  database: string;
}

@Injectable({
  providedIn: "root",
})
export class ServerCompareService implements OnDestroy {
  private router = inject(Router);

  public selectedForCompare: ServerCompare[] = [];
  public selectedDatabases: DatabaseCompare[] = [];
  public selectionChanged: Subject<ServerCompare[]> = new Subject();
  public databaseSelectionChanged: Subject<DatabaseCompare[]> = new Subject();
  public baselineChanged: Subject<ServerCompareBaseline | null> = new Subject();
  public databaseBaselineChanged: Subject<DatabaseCompareBaseline | null> =
    new Subject();
  public baselineServer: ServerCompareBaseline | null = null;
  public baselineDatabase: DatabaseCompareBaseline | null = null;

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
      if (!server.zoneRegion) {
        this.selectedForCompare = this.selectedForCompare.filter(
          (item) =>
            item.vendor !== server.vendor || item.server !== server.server,
        );
        this.clearBaselineIfMatches(server);
      } else {
        let existing = this.selectedForCompare.find(
          (item) =>
            item.vendor === server.vendor && item.server === server.server,
        );
        if (existing) {
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

  toggleDatabaseCompare(event: boolean, database: DatabaseCompare) {
    if (event) {
      const existing = this.selectedDatabases.find(
        (item) =>
          item.vendor === database.vendor &&
          item.database === database.database,
      );
      if (!existing) {
        this.selectedDatabases.push({
          display_name: database.display_name,
          vendor: database.vendor,
          database: database.database,
        });
      }
    } else {
      this.selectedDatabases = this.selectedDatabases.filter(
        (item) =>
          item.vendor !== database.vendor ||
          item.database !== database.database,
      );
      this.clearDatabaseBaselineIfMatches(database);
    }
    this.databaseSelectionChanged.next(this.selectedDatabases);
  }

  compareCount(): number {
    return this.serverCompareCount() + this.databaseCompareCount();
  }

  serverCompareCount(): number {
    return this.selectedForCompare?.length || 0;
  }

  databaseCompareCount(): number {
    return this.selectedDatabases?.length || 0;
  }

  setBaselineServer(baseline: ServerCompareBaseline | null): void {
    if (this.isSameBaseline(baseline)) {
      return;
    }

    this.baselineServer = baseline;
    this.baselineChanged.next(baseline);
  }

  setBaselineDatabase(baseline: DatabaseCompareBaseline | null): void {
    if (this.isSameDatabaseBaseline(baseline)) {
      return;
    }

    this.baselineDatabase = baseline;
    this.databaseBaselineChanged.next(baseline);
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

  toggleBaselineDatabase(database: { vendor: string; database: string }): void {
    if (this.isBaselineDatabase(database)) {
      this.setBaselineDatabase(null);
      return;
    }

    this.setBaselineDatabase({
      vendor: database.vendor,
      database: database.database,
    });
  }

  isBaselineServer(server: { vendor: string; server: string }): boolean {
    return (
      !!this.baselineServer &&
      this.baselineServer.vendor === server.vendor &&
      this.baselineServer.server === server.server
    );
  }

  isBaselineDatabase(database: { vendor: string; database: string }): boolean {
    return (
      !!this.baselineDatabase &&
      this.baselineDatabase.vendor === database.vendor &&
      this.baselineDatabase.database === database.database
    );
  }

  clearCompare() {
    this.selectedForCompare = [];
    this.setBaselineServer(null);
    this.selectionChanged.next(this.selectedForCompare);
  }

  clearDatabaseCompare() {
    this.selectedDatabases = [];
    this.setBaselineDatabase(null);
    this.databaseSelectionChanged.next(this.selectedDatabases);
  }

  reorderSelectedForCompare(previousIndex: number, currentIndex: number) {
    this.reorderSelection(
      this.selectedForCompare,
      previousIndex,
      currentIndex,
      this.selectionChanged,
    );
  }

  reorderSelectedDatabases(previousIndex: number, currentIndex: number) {
    this.reorderSelection(
      this.selectedDatabases,
      previousIndex,
      currentIndex,
      this.databaseSelectionChanged,
    );
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

  isDatabaseSelected(database: {
    vendor_id: string;
    api_reference: string;
  }): boolean {
    return (
      this.selectedDatabases.findIndex(
        (item) =>
          item.vendor === database.vendor_id &&
          item.database === database.api_reference,
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

  openDatabaseCompare() {
    if (this.selectedDatabases.length < 2) {
      alert("Please select at least two databases to compare");
      return;
    }

    this.router.navigateByUrl(this.buildDatabaseCompareUrl());
  }

  syncCompareRoute(): void {
    this.syncCompareRouteForPath("/servers/compare", () =>
      this.buildCompareUrl(),
    );
  }

  syncDatabaseCompareRoute(): void {
    this.syncCompareRouteForPath("/databases/compare", () =>
      this.buildDatabaseCompareUrl(),
    );
  }

  private syncCompareRouteForPath(
    pathPrefix: string,
    buildUrl: () => string,
  ): void {
    const path = this.router.url.split("?")[0].split("#")[0];
    if (!path.startsWith(pathPrefix)) {
      return;
    }

    this.router.navigateByUrl(buildUrl());
  }

  private buildCompareUrl(): string {
    return this.buildEncodedCompareUrl({
      path: "/servers/compare",
      items: this.selectedForCompare,
      baseline: this.baselineServer,
      baselineIdKey: "baseline_server",
      getBaselineId: (baseline) => baseline.server,
    });
  }

  private buildDatabaseCompareUrl(): string {
    return this.buildEncodedCompareUrl({
      path: "/databases/compare",
      items: this.selectedDatabases,
      baseline: this.baselineDatabase,
      baselineIdKey: "baseline_database",
      getBaselineId: (baseline) => baseline.database,
    });
  }

  private buildEncodedCompareUrl<
    TBaseline extends { vendor: string },
  >(options: {
    path: string;
    items: unknown[];
    baseline: TBaseline | null;
    baselineIdKey: string;
    getBaselineId: (baseline: TBaseline) => string;
  }): string {
    if (!options.items.length) {
      return options.path;
    }

    const encoded = btoa(JSON.stringify(options.items));
    let url = options.path + "?instances=" + encodeURIComponent(encoded);

    if (options.baseline) {
      url +=
        "&baseline_vendor=" +
        encodeURIComponent(options.baseline.vendor) +
        "&" +
        options.baselineIdKey +
        "=" +
        encodeURIComponent(options.getBaselineId(options.baseline));
    }

    return url;
  }

  private reorderSelection<T>(
    list: T[],
    previousIndex: number,
    currentIndex: number,
    subject: Subject<T[]>,
  ): void {
    if (previousIndex === currentIndex) {
      return;
    }

    if (
      previousIndex < 0 ||
      currentIndex < 0 ||
      previousIndex >= list.length ||
      currentIndex >= list.length
    ) {
      return;
    }

    const [item] = list.splice(previousIndex, 1);
    list.splice(currentIndex, 0, item);
    subject.next(list);
  }

  private clearBaselineIfMatches(server: {
    vendor: string;
    server: string;
  }): void {
    if (this.isBaselineServer(server)) {
      this.setBaselineServer(null);
    }
  }

  private clearDatabaseBaselineIfMatches(database: {
    vendor: string;
    database: string;
  }): void {
    if (this.isBaselineDatabase(database)) {
      this.setBaselineDatabase(null);
    }
  }

  private isSameBaseline(baseline: ServerCompareBaseline | null): boolean {
    return baseline
      ? this.isBaselineServer(baseline)
      : this.baselineServer === null;
  }

  private isSameDatabaseBaseline(
    baseline: DatabaseCompareBaseline | null,
  ): boolean {
    return baseline
      ? this.isBaselineDatabase(baseline)
      : this.baselineDatabase === null;
  }

  ngOnDestroy() {
    this.selectionChanged.complete();
    this.databaseSelectionChanged.complete();
    this.baselineChanged.complete();
    this.databaseBaselineChanged.complete();
  }
}
