import {
  Component,
  DOCUMENT,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  inject,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { LucideCheck } from "@lucide/angular";
import { Subscription } from "rxjs";
import {
  Region,
  Vendor,
  VendorDebugInfo,
  Zone,
} from "../../../../sdk/data-contracts";
import openApiSpec from "../../../../sdk/openapi.json";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { Button } from "../../components/button/button";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import {
  ServerPropertyCardComponent,
  ServerPropertyRow,
  ServerPropertySection,
} from "../../components/server-property-card/server-property-card.component";
import { CountryIdtoNamePipe } from "../../pipes/country-idto-name.pipe";
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";

declare let Datamap: any;

const SCRIPT_PATH = "assets/datamaps/d3.min.js";
const SCRIPT_PATH2 = "assets/datamaps/topojson.js";
const SCRIPT_PATH3 = "assets/datamaps/datamaps.world.min.js";

const VENDOR_MAP_COLOR = "#34D399";

type OpenApiProperty = {
  description?: string;
};

const VENDOR_SCHEMA_PROPERTIES: Record<string, OpenApiProperty> =
  (
    openApiSpec as {
      components?: {
        schemas?: {
          Vendor?: {
            properties?: Record<string, OpenApiProperty>;
          };
        };
      };
    }
  ).components?.schemas?.Vendor?.properties ?? {};

@Component({
  selector: "sc-vendor-details",
  imports: [
    RouterModule,
    BreadcrumbsComponent,
    Button,
    LoadingSpinnerComponent,
    ServerPropertyCardComponent,
    LucideCheck,
    CountryIdtoNamePipe,
  ],
  templateUrl: "./vendor-details.component.html",
  styleUrl: "./vendor-details.component.scss",
})
export class VendorDetailsComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);
  private route = inject(ActivatedRoute);
  private keeperAPI = inject(KeeperAPIService);
  private SEOHandler = inject(SeoHandlerService);
  private analytics = inject(AnalyticsService);
  private renderer = inject(Renderer2);
  private countryNamePipe = new CountryIdtoNamePipe();

  isLoading = true;
  vendor: Vendor | null = null;
  vendorRegions: Region[] = [];
  keeperResponseErrorMsg =
    "Failed to load vendor data. Please try again later.";

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Vendors", url: "/vendors" },
  ];

  features: { name: string; value: string }[] = [];
  description = "";

  metadataSections: ServerPropertySection[] = [];
  billingSections: ServerPropertySection[] = [];
  expandedCards: Record<string, boolean> = {
    details: false,
    billing: true,
    regions: false,
  };

  regionCount = 0;
  zoneCount = 0;
  serverCount = 0;
  databaseCount: number | null = null;

  private bubbleMap: any;
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe((params) => {
        const vendorId = params["vendorId"];
        this.loadVendor(vendorId);
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.SEOHandler.cleanupStructuredData(this.document);
  }

  toggleCard(cardId: string) {
    this.expandedCards[cardId] = !this.expandedCards[cardId];
  }

  private loadVendor(vendorId: string) {
    this.isLoading = true;
    this.vendor = null;
    this.bubbleMap = null;

    Promise.all([
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions(),
      this.keeperAPI.getZones(),
      this.keeperAPI.getDebugInfo().catch(() => ({ body: { vendors: [] } })),
      this.keeperAPI
        .searchDatabases({
          vendor: vendorId as any,
          add_total_count_header: true,
          limit: 1,
        })
        .catch(() => null),
    ])
      .then(
        ([
          vendorsResponse,
          regionsResponse,
          zonesResponse,
          debugResponse,
          databasesResponse,
        ]) => {
          const vendors = (vendorsResponse?.body || []) as Vendor[];
          const regions = (regionsResponse?.body || []) as Region[];
          const zones = (zonesResponse?.body || []) as Zone[];
          const vendorDebugList = (debugResponse?.body?.vendors ||
            []) as VendorDebugInfo[];

          const vendor = vendors.find((item) => item.vendor_id === vendorId);
          if (!vendor) {
            this.keeperResponseErrorMsg = "The requested vendor was not found.";
            return;
          }

          this.vendor = vendor;
          this.vendorRegions = regions.filter(
            (region) => region.vendor_id === vendorId,
          );
          this.regionCount = this.vendorRegions.length;
          this.zoneCount = zones.filter(
            (zone) => zone.vendor_id === vendorId,
          ).length;
          this.serverCount =
            vendorDebugList.find((item) => item.vendor_id === vendorId)?.all ??
            0;

          if (databasesResponse?.headers) {
            this.databaseCount = parseInt(
              databasesResponse.headers.get("x-total-count") || "0",
              10,
            );
          }

          this.breadcrumbs = [
            { name: "Home", url: "/" },
            { name: "Vendors", url: "/vendors" },
            {
              name: vendor.name,
              url: `/vendors/${vendor.vendor_id}`,
            },
          ];

          this.description = this.buildDescription(vendor);
          this.features = this.buildFeatures();
          this.buildPropertySections(vendor);
          this.updateSeo(vendor);
        },
      )
      .catch((error) => {
        console.error(error);
        this.analytics.SentryException(error, {
          tags: {
            location: this.constructor.name,
            function: "loadVendor",
          },
        });
        if (error?.status === 404) {
          this.keeperResponseErrorMsg = "The requested vendor was not found.";
        } else {
          this.keeperResponseErrorMsg =
            "Failed to load vendor data. Please try again later.";
        }
      })
      .finally(() => {
        this.isLoading = false;
        if (isPlatformBrowser(this.platformId) && this.vendor) {
          setTimeout(() => this.initMap());
        }
      });
  }

  private buildDescription(vendor: Vendor): string {
    const countryName = this.countryNamePipe.transform(
      vendor.country_id,
    ) as string;
    let text = `${vendor.name} is a cloud provider tracked by Spare Cores`;
    if (vendor.founding_year) {
      text += `, launched in ${vendor.founding_year}`;
    }
    if (vendor.city || countryName) {
      const location = [vendor.city, countryName].filter(Boolean).join(", ");
      text += `, headquartered in ${location}`;
    }
    text += ".";
    return text;
  }

  private buildFeatures(): { name: string; value: string }[] {
    const features = [
      { name: "Regions", value: String(this.regionCount) },
      { name: "Zones", value: String(this.zoneCount) },
    ];
    if (this.serverCount >= 1) {
      features.push({ name: "Servers", value: String(this.serverCount) });
    }
    if (this.databaseCount !== null && this.databaseCount >= 1) {
      features.push({
        name: "Databases",
        value: String(this.databaseCount),
      });
    }
    return features;
  }

  private buildPropertySections(vendor: Vendor) {
    const countryName = this.countryNamePipe.transform(
      vendor.country_id,
    ) as string;

    this.metadataSections = [
      {
        name: "Vendor Metadata",
        properties: this.rows([
          { id: "vendor_id", name: "Vendor ID", value: vendor.vendor_id },
          { id: "name", name: "Full Name", value: vendor.name },
          {
            id: "founding_year",
            name: "Launched",
            value: vendor.founding_year,
          },
          {
            id: "address_line",
            name: "Address",
            value: vendor.address_line,
          },
          { id: "city", name: "City", value: vendor.city },
          { id: "state", name: "State", value: vendor.state },
          { id: "zip_code", name: "ZIP Code", value: vendor.zip_code },
          {
            id: "country_id",
            name: "Country",
            value: countryName,
          },
          {
            id: "homepage",
            name: "Homepage",
            value: vendor.homepage
              ? `<a class="underline decoration-dotted hover:text-gray-500" href="${vendor.homepage}" target="_blank" rel="noopener">${vendor.homepage}</a>`
              : null,
          },
          {
            id: "status_page",
            name: "Status Page",
            value: vendor.status_page
              ? `<a class="underline decoration-dotted hover:text-gray-500" href="${vendor.status_page}" target="_blank" rel="noopener">${vendor.status_page}</a>`
              : null,
          },
          { id: "status", name: "Status", value: vendor.status },
          {
            id: "observed_at",
            name: "Observed At",
            value: vendor.observed_at
              ? new Date(vendor.observed_at).toLocaleString()
              : null,
          },
        ]),
      },
    ];

    this.billingSections = [
      {
        name: "Billing",
        properties: this.rows([
          {
            id: "stopped_server_charged",
            name: "Stopped Server Charged",
            value:
              vendor.stopped_server_charged === null ||
              vendor.stopped_server_charged === undefined
                ? null
                : vendor.stopped_server_charged
                  ? "check"
                  : "x",
          },
          {
            id: "billing_increment_seconds",
            name: "Billing Increment",
            value:
              vendor.billing_increment_seconds === null ||
              vendor.billing_increment_seconds === undefined
                ? null
                : `${vendor.billing_increment_seconds}s`,
          },
          {
            id: "minimum_billing_seconds",
            name: "Minimum Billing",
            value:
              vendor.minimum_billing_seconds === null ||
              vendor.minimum_billing_seconds === undefined
                ? null
                : `${vendor.minimum_billing_seconds}s`,
          },
          {
            id: "billing_comment",
            name: "Billing Comment",
            value: vendor.billing_comment,
          },
        ]),
      },
    ];
  }

  private rows(
    items: {
      id: string;
      name: string;
      value: unknown;
    }[],
  ): ServerPropertyRow[] {
    return items
      .map((item) => {
        const description = VENDOR_SCHEMA_PROPERTIES[item.id]?.description;
        return {
          id: item.id,
          name: item.name,
          value: this.toDisplayValue(item.value),
          tooltips: description
            ? [{ key: item.id, content: description }]
            : undefined,
        };
      })
      .filter((item) => item.value !== "");
  }

  private toDisplayValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    return String(value);
  }

  private updateSeo(vendor: Vendor) {
    const title = `${vendor.name} - Spare Cores`;
    const keywords = `${vendor.name}, ${vendor.vendor_id}, cloud vendor, sparecores`;
    this.SEOHandler.updateTitleAndMetaTags(title, this.description, keywords);

    const url = this.SEOHandler.getBaseURL() + "/vendors/" + vendor.vendor_id;
    this.SEOHandler.updateCanonical(this.document, url);

    if (vendor.logo) {
      this.SEOHandler.setupStructuredData(this.document, [
        JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Organization",
          name: vendor.name,
          logo: vendor.logo,
          url: vendor.homepage || url,
        }),
      ]);
    }
  }

  private initMap() {
    this.loadJsScript(SCRIPT_PATH)
      .then(() => this.loadJsScript(SCRIPT_PATH2))
      .then(() => this.loadJsScript(SCRIPT_PATH3))
      .then(() => {
        const element = this.document.getElementById("vendor_datamapdiv");
        if (!element || !this.vendor) {
          return;
        }

        element.innerHTML = "";

        this.bubbleMap = new Datamap({
          element,
          geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false,
          },
          bubblesConfig: {
            fillOpacity: 1,
            borderOpacity: 0,
            highlightFillColor: VENDOR_MAP_COLOR,
            highlightBorderOpacity: 0,
          },
          fills: {
            defaultFill: "#06263a",
            [this.vendor.vendor_id]: VENDOR_MAP_COLOR,
          },
        });

        this.generateBubbles();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private generateBubbles() {
    if (!this.bubbleMap || !this.vendor) {
      return;
    }

    this.bubbleMap.bubbles(
      this.vendorRegions.map((region) => ({
        name: region.name,
        display_name: region.display_name,
        region: region.region_id,
        vendor: region.vendor_id,
        founding_year: region.founding_year,
        green_energy: region.green_energy,
        location: `${region.lat},${region.lon}`,
        radius: 5,
        country: region.country_id,
        fillKey: region.vendor_id,
        latitude: region.lat,
        longitude: region.lon,
      })),
      {
        popupTemplate: this.popupTemplate.bind(this),
      },
    );
  }

  private popupTemplate(_geo: any, data: any) {
    const countryName = this.countryNamePipe.transform(data.country) as string;
    let html = `<div class="hoverinfo"> <ul>`;
    html += `<li><b>Region ID</b>: ${data.region}</li>`;
    html += `<li><b>Region name</b>: ${data.name}</li>`;
    html += `<li><b>Country</b>: ${countryName}</li>`;
    html += `<li><b>Location</b>: ${data.display_name}</li>`;
    if (data.founding_year) {
      html += `<li><b>Founding year</b>: ${data.founding_year}</li>`;
    }
    html += `<li><b>100% green energy</b>: ${data.green_energy ? "✅" : "🔴"}</li>`;
    html += `</ul> </div>`;
    return html;
  }

  private loadJsScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = this.renderer.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      this.renderer.appendChild(this.document.head, script);
    });
  }
}
