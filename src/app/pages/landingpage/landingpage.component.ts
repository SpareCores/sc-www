import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  PLATFORM_ID,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
} from "@angular/core";
import { ArticleMeta, ArticlesService } from "../../services/articles.service";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { spinner_initial_data } from "../../tools/spinner_initial_data";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { FormsModule } from "@angular/forms";
import { ThemeTextComponent } from "../../components/theme-text/theme-text.component";
import { RouterLink } from "@angular/router";
import {
  LucideCheck,
  LucideMessageSquareMore,
  LucideQuote,
  LucideRocket,
  LucideScanEye,
  LucideSquareArrowDown,
  LucideSquareArrowUpRight,
} from "@lucide/angular";
import { ArticleCardComponent } from "../../components/article-card/article-card.component";
import {
  SearchServersServersGetData,
  TableRegionTableRegionGetData,
} from "../../../../sdk/data-contracts";
import { AnalyticsService } from "../../services/analytics.service";
import { NeetoCalService } from "../../services/neeto-cal.service";
import { PrismService } from "../../services/prism.service";
import {
  SlotMachineContents,
  SlotMachineRegionItem,
  SlotMachineServerItem,
  SlotMachineServerListingQuery,
  SlotMachineVendorItem,
} from "./landingpage.types";

@Component({
  selector: "app-landingpage",
  imports: [
    CommonModule,
    FormsModule,
    ThemeTextComponent,
    RouterLink,
    LucideCheck,
    LucideMessageSquareMore,
    LucideQuote,
    LucideRocket,
    LucideScanEye,
    LucideSquareArrowDown,
    LucideSquareArrowUpRight,
    ArticleCardComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./landingpage.component.html",
  styleUrl: "./landingpage.component.scss",
})
export class LandingpageComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private keeperAPI = inject(KeeperAPIService);
  private SEOHandler = inject(SeoHandlerService);
  private articles = inject(ArticlesService);
  private analyticsService = inject(AnalyticsService);
  private neetoCalService = inject(NeetoCalService);
  private prismService = inject(PrismService);

  featuredArticles: ArticleMeta[] = [];

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
  private regionLookupPromise?: Promise<
    Map<string, TableRegionTableRegionGetData[number]>
  >;

  @ViewChild("tooltipVendors") tooltip!: ElementRef;

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "Spare Cores: Run DS/ML/AI Workloads Faster, Cheaper, and with Less Hassle",
      "Help you auto-track resource usage and optimize allocations on optimal cloud servers.",
      "data science, machine learning, batch workloads, cloud, server, price, comparison, sparecores",
    );

    this.SEOHandler.updateThumbnail(
      "https://sparecores.com/assets/images/og/landing.png",
    );

    if (isPlatformBrowser(this.platformId)) {
      this.articles.getArticlesByType("featured").then((articles) => {
        this.featuredArticles = articles;
      });

      const spinner1 = [];
      const spinner2 = [];
      const spinner3 = [];
      for (let i = 0; i < this.SPINNER_COUNT; i++) {
        spinner1.push({ name: "AWS" });
        spinner2.push({ name: "t4g.nano" });
        spinner3.push({ name: "US East", city: "Ashburn" });
      }
      this.welcomeAnim();

      document
        .getElementById("ramCount")
        ?.addEventListener("keypress", function (e) {
          if (!/[0-9]/.test(String.fromCharCode(e.which))) {
            e.preventDefault();
          }
        });

      document
        .getElementById("cpuCount")
        ?.addEventListener("keypress", function (e) {
          if (!/[0-9]/.test(String.fromCharCode(e.which))) {
            e.preventDefault();
          }
        });
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.prismService.highlightAll();
      this.neetoCalService.initialize();
    }
  }

  welcomeAnim(startingDelay: number = 1000) {
    // get the cheapest machine
    this.keeperAPI
      .searchServers({
        vcpus_min: this.cpuCount,
        memory_min: this.ramCount,
        limit: 25,
      })
      .then((servers) => {
        if (!this.spinnerClicked) {
          setTimeout(() => {
            if (!this.spinnerClicked) {
              // move spin_button up and down a bit to attact attention
              const spinButton = document.getElementById("spin_button");
              if (spinButton) {
                spinButton.style.animation = "bounce 1s 3";
              }
            }
          }, startingDelay + 7000);

          setTimeout(() => {
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
        this.analyticsService.SentryException(err, {
          tags: { location: this.constructor.name, function: "welcomeAnim" },
        });
        console.error(err);
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

  getInnerStyle(i: number) {
    if (i > 0) {
      return "";
    }

    if (this.isSpinning || !this.hasRealValues) {
      return "";
    }

    return "background: rgba(255,255,255,1) !important; color: #000 !important;";
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

    this.keeperAPI
      .searchServers({
        vcpus_min: this.cpuCount,
        memory_min: this.ramCount,
        limit: 25,
      })
      .then((servers) => {
        this.spinAnim(servers.body);
      })
      .catch((err) => {
        this.analyticsService.SentryException(err, {
          tags: { location: this.constructor.name, function: "spinClicked" },
        });
        console.error(err);
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

    const spinAnimDiff = Date.now() - this.spinStart;
    const spinAnimEnd = Math.max(0, 4200 - spinAnimDiff);
    const spinAnimFraction = Math.max(0, 50 - spinAnimDiff / 50);

    const animPriceStart = servers[servers.length - 1]?.price ?? 0;
    const animPriceEnd = servers[0]?.price ?? 0;

    let price = animPriceStart;
    let fraction = (animPriceStart - animPriceEnd) / 50;

    // convert fraction to 5 decimal precision
    fraction = Math.floor(fraction * 100000) / 100000;

    const interval = setInterval(() => {
      price -= fraction;
      if (price < animPriceEnd) {
        price = animPriceEnd;
      }
      this.priceValue = "$" + Math.round(price * 10000) / 10000;
    }, spinAnimFraction);

    setTimeout(() => {
      void this.populateSpinnerContents(servers);
    }, 200);

    setTimeout(() => {
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
      clearInterval(interval);
      this.priceValue = "$" + animPriceEnd;
      this.isSpinning = false;
      this.hasRealValues = true;
      this.analyticsService.trackEvent("slot machine finished", {
        autostarted: isFake,
      });
    }, spinAnimEnd);
  }

  toggleQuote(event: Event) {
    const clickedElement = event.currentTarget as HTMLElement;
    const quoteContainer = clickedElement.closest(".quote-container");
    if (quoteContainer) {
      const preview = quoteContainer.querySelector(".quote-preview");
      const full = quoteContainer.querySelector(".quote-full");
      if (preview && full) {
        preview.classList.toggle("hidden");
        full.classList.toggle("hidden");
      }
    }
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
}
