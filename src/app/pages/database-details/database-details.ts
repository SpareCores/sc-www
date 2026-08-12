import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { LucideCheck } from "@lucide/angular";
import { Subscription } from "rxjs";
import {
  Database,
  DatabasePrice,
  Region,
  Vendor,
} from "../../../../sdk/data-contracts";
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
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ToastService } from "../../services/toast.service";
import { ReduceUnitNamePipe } from "../../pipes/reduce-unit-name.pipe";

type LoadedDatabase = Database & {
  vendor?: Vendor;
  prices?: (DatabasePrice & { region?: Region })[];
};

@Component({
  selector: "sc-database-details",
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbsComponent,
    Button,
    LoadingSpinnerComponent,
    ServerPropertyCardComponent,
    LucideCheck,
    ReduceUnitNamePipe,
  ],
  templateUrl: "./database-details.html",
  styleUrl: "./database-details.scss",
})
export class DatabaseDetails implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private keeperAPI = inject(KeeperAPIService);
  private SEOHandler = inject(SeoHandlerService);
  private analytics = inject(AnalyticsService);
  private toastService = inject(ToastService);

  isLoading = true;
  databaseDetails: LoadedDatabase | null = null;
  keeperResponseErrorMsg = "Failed to load database details.";
  description = "";
  cardPriceDescription = "";
  features: { name: string; value: string }[] = [];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Databases", url: "/databases" },
  ];

  metadataSections: ServerPropertySection[] = [];
  engineSections: ServerPropertySection[] = [];
  capacitySections: ServerPropertySection[] = [];
  featureSections: ServerPropertySection[] = [];
  securitySections: ServerPropertySection[] = [];

  expandedCards: Record<string, boolean> = {
    details: false,
    engine: false,
    capacity: false,
    features: false,
    security: false,
    availability: false,
  };

  availabilityRows: {
    region_id: string;
    display_name: string;
    api_reference: string;
    allocation: string;
    ha: string;
    ha_strategy: string;
    price: number | null;
    currency: string;
    unit: string;
  }[] = [];

  clipboardIcon = "clipboard";

  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe((params) => {
        const vendor = params["vendor"];
        const id = params["id"];
        this.loadDatabase(vendor, id);
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadDatabase(vendor: string, id: string) {
    this.isLoading = true;
    this.databaseDetails = null;

    Promise.all([
      this.keeperAPI.getDatabase(vendor, id),
      this.keeperAPI.getDatabasePrices(vendor, id),
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions(),
    ])
      .then(([databaseResponse, pricesResponse, vendorsResponse, regionsResponse]) => {
        const database = databaseResponse.body;
        if (!database) {
          this.keeperResponseErrorMsg = "Database not found.";
          return;
        }

        const vendors = (vendorsResponse?.body || []) as Vendor[];
        const regions = (regionsResponse?.body || []) as Region[];
        const prices = (pricesResponse?.body || []) as DatabasePrice[];

        this.databaseDetails = {
          ...database,
          vendor: vendors.find((v) => v.vendor_id === database.vendor_id),
          prices: prices
            .map((price) => ({
              ...price,
              region: regions.find(
                (region) =>
                  region.vendor_id === price.vendor_id &&
                  region.region_id === price.region_id,
              ),
            }))
            .sort((a, b) => a.price - b.price),
        };

        this.breadcrumbs = [
          { name: "Home", url: "/" },
          { name: "Databases", url: "/databases" },
          {
            name: this.databaseDetails.vendor?.name || database.vendor_id,
            url: `/databases?vendor=${database.vendor_id}`,
          },
          {
            name: database.display_name,
            url: `/database/${database.vendor_id}/${database.api_reference}`,
          },
        ];

        this.description =
          database.description ||
          `${database.display_name} managed database offered by ${
            this.databaseDetails.vendor?.name || database.vendor_id
          }.`;

        this.cardPriceDescription = "";
        if (this.databaseDetails.prices?.length) {
          const cheapest = this.databaseDetails.prices[0];
          const roundedPrice =
            cheapest.price < 1
              ? cheapest.price.toPrecision(2)
              : cheapest.price.toFixed(2);
          this.cardPriceDescription = ` Pricing starts at ${roundedPrice} ${cheapest.currency}/${cheapest.unit}.`;
        }

        this.features = [
          {
            name: "vCPUs",
            value:
              database.vcpus === null || database.vcpus === undefined
                ? "-"
                : String(database.vcpus),
          },
          {
            name: "Memory",
            value:
              database.memory_amount === null ||
              database.memory_amount === undefined
                ? "-"
                : `${(database.memory_amount / 1024).toFixed(1)} GiB`,
          },
          {
            name: "Storage",
            value:
              database.storage_size === null ||
              database.storage_size === undefined
                ? "-"
                : `${database.storage_size} GB`,
          },
          {
            name: "Engine",
            value: database.engine || "-",
          },
        ];

        this.buildPropertySections(database);
        this.buildAvailabilityRows();

        this.SEOHandler.updateTitleAndMetaTags(
          `${database.display_name} by ${
            this.databaseDetails.vendor?.name || database.vendor_id
          } - Spare Cores`,
          this.description + this.cardPriceDescription,
          "cloud, database, dbaas, price, comparison, sparecores",
        );
      })
      .catch((err) => {
        this.analytics.SentryException(err, {
          tags: {
            location: this.constructor.name,
            function: "loadDatabase",
          },
        });
        console.error(err);
        this.keeperResponseErrorMsg =
          err.error?.detail || "Failed to load database details.";
        this.toastService.show({
          title: "Failed to load database",
          body: this.keeperResponseErrorMsg,
          type: "error",
          id: "database-details-error",
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private buildPropertySections(database: Database) {
    this.metadataSections = [
      {
        name: "Database Metadata",
        properties: this.rows([
          { id: "name", name: "Name", value: database.name },
          {
            id: "display_name",
            name: "Display Name",
            value: database.display_name,
          },
          {
            id: "api_reference",
            name: "API Reference",
            value: database.api_reference,
          },
          {
            id: "database_id",
            name: "Database ID",
            value: database.database_id,
          },
          { id: "family", name: "Family", value: database.family },
          {
            id: "server_id",
            name: "Underlying Server",
            value: database.server_id,
          },
          { id: "status", name: "Status", value: database.status },
        ]),
      },
    ];

    this.engineSections = [
      {
        name: "Engine",
        properties: this.rows([
          { id: "engine", name: "Engine", value: database.engine },
          {
            id: "wire_protocol",
            name: "Wire Protocol",
            value: database.wire_protocol,
          },
          {
            id: "engine_versions",
            name: "Engine Versions",
            value: this.formatList(database.engine_versions),
          },
          {
            id: "auto_upgrade_versions",
            name: "Auto Upgrade Versions",
            value: this.formatBoolean(database.auto_upgrade_versions),
          },
          {
            id: "custom_config",
            name: "Custom Config",
            value: this.formatBoolean(database.custom_config),
          },
          {
            id: "custom_extensions",
            name: "Custom Extensions",
            value: this.formatBoolean(database.custom_extensions),
          },
        ]),
      },
    ];

    this.capacitySections = [
      {
        name: "Capacity",
        properties: this.rows([
          { id: "vcpus", name: "vCPUs", value: database.vcpus },
          {
            id: "memory_amount",
            name: "Memory",
            value:
              database.memory_amount === null ||
              database.memory_amount === undefined
                ? null
                : `${(database.memory_amount / 1024).toFixed(1)} GiB`,
          },
          {
            id: "storage_size",
            name: "Bundled Storage",
            value:
              database.storage_size === null ||
              database.storage_size === undefined
                ? null
                : `${database.storage_size} GB`,
          },
          {
            id: "storage_extra_min",
            name: "Extra Storage Min",
            value:
              database.storage_extra_min === null ||
              database.storage_extra_min === undefined
                ? null
                : `${database.storage_extra_min} GB`,
          },
          {
            id: "storage_extra_max",
            name: "Extra Storage Max",
            value:
              database.storage_extra_max === null ||
              database.storage_extra_max === undefined
                ? null
                : `${database.storage_extra_max} GB`,
          },
          {
            id: "storage_extra_autosize",
            name: "Storage Autosize",
            value: this.formatBoolean(database.storage_extra_autosize),
          },
          {
            id: "max_read_replicas",
            name: "Max Read Replicas",
            value: database.max_read_replicas,
          },
          {
            id: "sla",
            name: "SLA",
            value:
              database.sla === null || database.sla === undefined
                ? null
                : `${database.sla}%`,
          },
        ]),
      },
    ];

    this.featureSections = [
      {
        name: "Features",
        properties: this.rows([
          {
            id: "ha",
            name: "High Availability",
            value: this.formatList(database.ha),
          },
          {
            id: "ha_strategy",
            name: "HA Strategy",
            value: this.formatList(database.ha_strategy),
          },
          {
            id: "scheduled_backups",
            name: "Scheduled Backups",
            value: this.formatBoolean(database.scheduled_backups),
          },
          {
            id: "continuous_backups",
            name: "Continuous Backups (days)",
            value: database.continuous_backups,
          },
          {
            id: "connection_pool",
            name: "Connection Pool",
            value: this.formatBoolean(database.connection_pool),
          },
          {
            id: "system_monitoring",
            name: "System Monitoring",
            value: this.formatBoolean(database.system_monitoring),
          },
          {
            id: "database_monitoring",
            name: "Database Monitoring",
            value: this.formatBoolean(database.database_monitoring),
          },
          {
            id: "autotuning_advice",
            name: "Autotuning Advice",
            value: this.formatBoolean(database.autotuning_advice),
          },
          {
            id: "autotuning_apply",
            name: "Autotuning Apply",
            value: this.formatBoolean(database.autotuning_apply),
          },
        ]),
      },
    ];

    this.securitySections = [
      {
        name: "Security",
        properties: this.rows([
          {
            id: "disk_encryption",
            name: "Disk Encryption",
            value: this.formatBoolean(database.disk_encryption),
          },
          {
            id: "security_features",
            name: "Security Features",
            value: this.formatList(database.security_features),
          },
        ]),
      },
    ];
  }

  private buildAvailabilityRows() {
    const prices = this.databaseDetails?.prices || [];
    this.availabilityRows = prices.map((price) => ({
      region_id: price.region_id,
      display_name: price.region?.display_name || price.region_id,
      api_reference: price.region?.api_reference || price.region_id,
      allocation: price.allocation || "ondemand",
      ha: price.ha || "none",
      ha_strategy: price.ha_strategy || "none",
      price: price.price,
      currency: price.currency || "USD",
      unit: price.unit,
    }));
  }

  private rows(
    items: { id: string; name: string; value: unknown }[],
  ): ServerPropertyRow[] {
    return items
      .map((item) => ({
        id: item.id,
        name: item.name,
        value: this.toDisplayValue(item.value),
      }))
      .filter((item) => item.value !== "");
  }

  private toDisplayValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    if (typeof value === "boolean") {
      return value ? "check" : "x";
    }
    return String(value);
  }

  private formatBoolean(value: boolean | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value ? "check" : "x";
  }

  private formatList(value: unknown): string | null {
    if (!Array.isArray(value) || !value.length) {
      return null;
    }
    return value.join(", ");
  }

  toggleCard(cardId: string) {
    this.expandedCards[cardId] = !this.expandedCards[cardId];
  }

  clipboardURL() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    navigator.clipboard.writeText(window.location.href);
    this.clipboardIcon = "check";
    this.toastService.show({
      title: "Link copied to clipboard!",
      type: "success",
      duration: 2000,
    });
    setTimeout(() => {
      this.clipboardIcon = "clipboard";
    }, 3000);
  }
}
