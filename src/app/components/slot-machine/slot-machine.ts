import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { KeeperAPI } from "../../services/keeper-api";
import { isAbortError } from "../../services/keeper-http-client";
import { Toast } from "../../services/toast";
import { QUERY_ERROR_LANDING_TOAST_ID } from "../../services/toast-ids";
import { Analytics } from "../../services/analytics";
import { spinner_initial_data } from "../../tools/spinner_initial_data";
import {
  SearchServersServersGetData,
  TableRegionTableRegionGetData,
} from "../../../../sdk/data-contracts";
import {
  SlotMachineContents,
  SlotMachineRegionItem,
  SlotMachineServerItem,
  SlotMachineServerListingQuery,
  SlotMachineVendorItem,
} from "./slot-machine.types";

@Component({
  selector: "sc-slot-machine",
  imports: [FormsModule, RouterLink],
  templateUrl: "./slot-machine.html",
  styleUrl: "./slot-machine.css",
})
export class SlotMachine {
  private platformId = inject(PLATFORM_ID);
  private keeperAPI = inject(KeeperAPI);
  private toastService = inject(Toast);
  private destroyRef = inject(DestroyRef);
  private analyticsService = inject(Analytics);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private readonly timeouts = new Set<ReturnType<typeof setTimeout>>();
  private priceInterval: ReturnType<typeof setInterval> | null = null;
  private searchRequestId = 0;
  private searchAbortController: AbortController | null = null;
  private regionLookupPromise?: Promise<
    Map<string, TableRegionTableRegionGetData[number]>
  >;

  priceValue = "$0.00150";
  cpuCount = 2;
  ramCount = 4;

  spinnerContents = spinner_initial_data as SlotMachineContents;
  SPINNER_COUNT = 36;
  SPINNER_RADIUS = 780;
  MAX_CPU_COUNT = 128;
  MAX_RAM_COUNT = 512;

  isSpinning = false;
  spinnerClicked = false;
  hasRealValues = false;
  spinStart: number = 0;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.searchAbortController?.abort();
      this.searchAbortController = null;
      this.timeouts.forEach((timeout) => clearTimeout(timeout));
      this.timeouts.clear();
      this.stopPriceInterval();
      this.toastService.removeToast(QUERY_ERROR_LANDING_TOAST_ID);
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      this.welcomeAnim();
    });
  }

  allowDigitsOnly(event: KeyboardEvent) {
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  welcomeAnim(startingDelay: number = 1000) {
    const requestId = ++this.searchRequestId;
    this.searchAbortController?.abort();
    const abortController = new AbortController();
    this.searchAbortController = abortController;
    this.toastService.removeToast(QUERY_ERROR_LANDING_TOAST_ID);

    this.keeperAPI
      .searchServers(
        {
          vcpus_min: this.cpuCount,
          memory_min: this.ramCount,
          limit: 25,
        },
        { signal: abortController.signal },
      )
      .then((servers) => {
        if (
          this.destroyRef.destroyed ||
          requestId !== this.searchRequestId ||
          abortController.signal.aborted
        ) {
          return;
        }

        this.toastService.removeToast(QUERY_ERROR_LANDING_TOAST_ID);

        if (!this.spinnerClicked) {
          this.schedule(() => {
            if (!this.spinnerClicked) {
              const spinButton = document.getElementById("spin_button");
              if (spinButton) {
                spinButton.style.animation = "sc-bounce 1s 3";
              }
            }
          }, startingDelay + 7000);

          this.schedule(() => {
            const spinButton = document.getElementById("spin_button");
            if (spinButton) {
              spinButton.style.animation = "press 1.0s";
            }

            const spinners = ["ring1", "ring2", "ring3"];
            spinners.forEach((spinner, i) => {
              const el = document.getElementById(spinner);
              if (el) {
                el.style.animation = `${Math.random() > 0.5 ? "spin-slot" : "spin-back-slot"} ${3.5 + i * 0.25}s ease-in-out`;
              }
            });

            this.spinStart = Date.now();

            this.spinAnim(servers.body, true);
          }, startingDelay);
        }
      })
      .catch((err) => {
        if (
          isAbortError(err) ||
          this.destroyRef.destroyed ||
          requestId !== this.searchRequestId ||
          abortController.signal.aborted
        ) {
          return;
        }

        this.analyticsService.SentryException(err, {
          tags: { location: this.constructor.name, function: "welcomeAnim" },
        });
        console.error(err);
        this.showSearchErrorToast(err);
      })
      .finally(() => {
        if (this.searchAbortController === abortController) {
          this.searchAbortController = null;
        }
      });
  }

  getStyle(i: number) {
    const transform =
      "rotateX(" +
      (360 / this.SPINNER_COUNT) * i +
      "deg) translateZ(" +
      this.SPINNER_RADIUS +
      "px)";
    return {
      transform: transform,
    };
  }

  isSlotLinkActive(index: number) {
    return index === 0 && !this.isSpinning && this.hasRealValues;
  }

  hasVendorLink(item: SlotMachineVendorItem) {
    return Boolean(item.vendorId);
  }

  hasServerLink(item: SlotMachineServerItem) {
    return Boolean(item.vendorId && item.apiReference);
  }

  hasRegionLink(item: SlotMachineRegionItem) {
    return Boolean(item.vendorId && item.regionId);
  }

  private getNormalizedCpuCount(value: number) {
    if (Number.isNaN(value) || !value || value < 1) {
      return 2;
    }

    return Math.min(value, this.MAX_CPU_COUNT);
  }

  private getNormalizedRamCount(value: number) {
    if (Number.isNaN(value) || !value || value < 0.1) {
      return 4;
    }

    return Math.min(value, this.MAX_RAM_COUNT);
  }

  private getServerListingFilters() {
    return {
      vcpus_min: this.getNormalizedCpuCount(this.cpuCount),
      memory_min: this.getNormalizedRamCount(this.ramCount),
    };
  }

  private getServerListingQuery(
    query: Pick<SlotMachineServerListingQuery, "vendor" | "vendor_regions">,
  ): SlotMachineServerListingQuery {
    return {
      ...query,
      ...this.getServerListingFilters(),
    };
  }

  getVendorQueryParams(item: SlotMachineVendorItem) {
    return item.vendorId
      ? this.getServerListingQuery({ vendor: item.vendorId })
      : null;
  }

  getVendorRouteCommands(item: SlotMachineVendorItem) {
    if (!item.vendorId) {
      return null;
    }

    return ["/vendors", item.vendorId];
  }

  getServerRouteCommands(item: SlotMachineServerItem) {
    if (!item.vendorId || !item.apiReference) {
      return null;
    }

    return ["/server", item.vendorId, item.apiReference];
  }

  getRegionQueryParams(item: SlotMachineRegionItem) {
    if (!item.vendorId || !item.regionId) {
      return null;
    }

    return this.getServerListingQuery({
      vendor_regions: this.buildVendorRegionFilter(
        item.vendorId,
        item.regionId,
      ),
    });
  }

  private buildVendorRegionFilter(vendorId: string, regionId: string) {
    return `${vendorId}~${regionId}`;
  }

  private getTopSpinnerServers(servers: SearchServersServersGetData) {
    const topServers: SearchServersServersGetData = [];
    const seenVendorIds = new Set<string>();
    const selectedServerIds = new Set<string>();

    for (const server of servers) {
      if (seenVendorIds.has(server.vendor_id)) {
        continue;
      }

      topServers.push(server);
      seenVendorIds.add(server.vendor_id);
      selectedServerIds.add(server.server_id);

      if (topServers.length === 3) {
        return topServers;
      }
    }

    for (const server of servers) {
      if (selectedServerIds.has(server.server_id)) {
        continue;
      }

      topServers.push(server);
      selectedServerIds.add(server.server_id);

      if (topServers.length === 3) {
        return topServers;
      }
    }

    return topServers;
  }

  private getRegionLookup(): Promise<
    Map<string, TableRegionTableRegionGetData[number]>
  > {
    if (!this.regionLookupPromise) {
      this.regionLookupPromise = this.keeperAPI
        .getRegions()
        .then(
          (response): Map<string, TableRegionTableRegionGetData[number]> => {
            return new Map<string, TableRegionTableRegionGetData[number]>(
              response.body.map(
                (region: TableRegionTableRegionGetData[number]) =>
                  [
                    this.buildVendorRegionFilter(
                      region.vendor_id,
                      region.region_id,
                    ),
                    region,
                  ] as const,
              ),
            );
          },
        )
        .catch((error) => {
          this.regionLookupPromise = undefined;
          throw error;
        });
    }

    return this.regionLookupPromise;
  }

  private getPendingRegionItem(): SlotMachineRegionItem {
    return {
      name: "Loading...",
    };
  }

  private getUnavailableRegionItem(): SlotMachineRegionItem {
    return {
      name: "Region unavailable",
    };
  }

  private async getSpinnerRegionItem(
    server: SearchServersServersGetData[number],
  ): Promise<SlotMachineRegionItem> {
    const serverPricesResponse = await this.keeperAPI.getServerPrices(
      server.vendor_id,
      server.api_reference || server.server_id,
    );
    const serverPrices = serverPricesResponse.body;

    if (!serverPrices.length) {
      return this.getUnavailableRegionItem();
    }

    let cheapestServerPrice = serverPrices[0];

    for (const serverPrice of serverPrices.slice(1)) {
      if (serverPrice.price < cheapestServerPrice.price) {
        cheapestServerPrice = serverPrice;
      }
    }

    const regionLookup = await this.getRegionLookup();
    const region = regionLookup.get(
      this.buildVendorRegionFilter(
        server.vendor_id,
        cheapestServerPrice.region_id,
      ),
    );

    return {
      name: region?.display_name || cheapestServerPrice.region_id,
      city: region?.city || undefined,
      vendorId: server.vendor_id,
      regionId: cheapestServerPrice.region_id,
    };
  }

  private async populateSpinnerContents(servers: SearchServersServersGetData) {
    const indices = [0, 1, 35];
    const top3server = this.getTopSpinnerServers(servers);

    indices.forEach((index, i) => {
      const server = top3server[i];

      if (!server) {
        return;
      }

      this.spinnerContents[0][index] = {
        name: server.vendor.vendor_id.toString().toUpperCase(),
        logo: server.vendor.logo,
        vendorId: server.vendor.vendor_id,
      };
      this.spinnerContents[1][index] = {
        name: server.display_name,
        architecture: server.cpu_architecture,
        vendorId: server.vendor_id,
        apiReference: server.api_reference,
      };
      this.spinnerContents[2][index] = this.getPendingRegionItem();
    });

    const regionItems = await Promise.allSettled(
      top3server.map((server) => this.getSpinnerRegionItem(server)),
    );

    if (this.destroyRef.destroyed) {
      return;
    }

    regionItems.forEach((result, i) => {
      const index = indices[i];

      if (typeof index === "undefined") {
        return;
      }

      if (result.status === "fulfilled") {
        this.spinnerContents[2][index] = result.value;
        return;
      }

      this.analyticsService.SentryException(result.reason, {
        tags: {
          location: this.constructor.name,
          function: "populateSpinnerContents",
        },
      });
      console.error(result.reason);
      this.spinnerContents[2][index] = this.getUnavailableRegionItem();
    });

    this.cdr.detectChanges();
  }

  spinClicked() {
    this.cpuCount = this.getNormalizedCpuCount(this.cpuCount);
    this.ramCount = this.getNormalizedRamCount(this.ramCount);

    const spinButton = document.getElementById("spin_button");
    if (spinButton) {
      spinButton.style.animation = "press 1.0s";
    }

    const spinners = ["ring1", "ring2", "ring3"];
    spinners.forEach((spinner, i) => {
      const el = document.getElementById(spinner);
      if (el) {
        el.style.animation = `${Math.random() > 0.5 ? "spin-slot" : "spin-back-slot"} ${3.5 + i * 0.25}s ease-in-out`;
      }
    });

    this.spinStart = Date.now();

    const requestId = ++this.searchRequestId;
    this.searchAbortController?.abort();
    const abortController = new AbortController();
    this.searchAbortController = abortController;
    this.toastService.removeToast(QUERY_ERROR_LANDING_TOAST_ID);

    this.keeperAPI
      .searchServers(
        {
          vcpus_min: this.cpuCount,
          memory_min: this.ramCount,
          limit: 25,
        },
        { signal: abortController.signal },
      )
      .then((servers) => {
        if (
          this.destroyRef.destroyed ||
          requestId !== this.searchRequestId ||
          abortController.signal.aborted
        ) {
          return;
        }

        this.toastService.removeToast(QUERY_ERROR_LANDING_TOAST_ID);
        this.spinAnim(servers.body);
      })
      .catch((err) => {
        if (
          isAbortError(err) ||
          this.destroyRef.destroyed ||
          requestId !== this.searchRequestId ||
          abortController.signal.aborted
        ) {
          return;
        }

        this.analyticsService.SentryException(err, {
          tags: { location: this.constructor.name, function: "spinClicked" },
        });
        console.error(err);
        this.showSearchErrorToast(err);
      })
      .finally(() => {
        if (this.searchAbortController === abortController) {
          this.searchAbortController = null;
        }
      });
  }

  private showSearchErrorToast(err: unknown): void {
    this.toastService.showHttpError(err, {
      id: QUERY_ERROR_LANDING_TOAST_ID,
      title: "Servers query error!",
    });
  }

  spinAnim(servers: SearchServersServersGetData, isFake = false) {
    this.analyticsService.trackEvent("slot machine started", {
      autostarted: isFake,
    });
    if (this.isSpinning) {
      return;
    }

    if (!isFake) {
      this.spinnerClicked = true;
    }

    this.isSpinning = true;
    this.cdr.detectChanges();

    const spinAnimDiff = Date.now() - this.spinStart;
    const spinAnimEnd = Math.max(0, 4200 - spinAnimDiff);
    const spinAnimFraction = Math.max(0, 50 - spinAnimDiff / 50);

    const animPriceStart = servers[servers.length - 1]?.price ?? 0;
    const animPriceEnd = servers[0]?.price ?? 0;

    let price = animPriceStart;
    let fraction = (animPriceStart - animPriceEnd) / 50;

    fraction = Math.floor(fraction * 100000) / 100000;

    this.ngZone.runOutsideAngular(() => {
      this.priceInterval = setInterval(
        () => {
          price -= fraction;
          if (price < animPriceEnd) {
            price = animPriceEnd;
          }
          this.priceValue = "$" + Math.round(price * 10000) / 10000;
          this.cdr.detectChanges();
        },
        Math.max(16, spinAnimFraction),
      );
    });

    this.schedule(() => {
      void this.populateSpinnerContents(servers);
    }, 200);

    this.schedule(() => {
      const spinButton = document.getElementById("spin_button");
      if (spinButton) {
        spinButton.style.animation = "none";
      }

      const spinners = ["ring1", "ring2", "ring3"];
      spinners.forEach((spinner) => {
        const el = document.getElementById(spinner);
        if (el) {
          el.style.animation = "none";
        }
      });
      this.stopPriceInterval();
      this.priceValue = "$" + animPriceEnd;
      this.isSpinning = false;
      this.hasRealValues = true;
      this.cdr.detectChanges();
      this.analyticsService.trackEvent("slot machine finished", {
        autostarted: isFake,
      });
    }, spinAnimEnd);
  }

  private schedule(callback: () => void, delay: number): void {
    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);
      callback();
    }, delay);
    this.timeouts.add(timeout);
  }

  private stopPriceInterval(): void {
    if (this.priceInterval !== null) {
      clearInterval(this.priceInterval);
      this.priceInterval = null;
    }
  }
}
