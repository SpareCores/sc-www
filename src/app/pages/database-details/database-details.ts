import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  afterNextRender,
  inject,
  viewChild,
} from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { LucideCheck } from "@lucide/angular";
import { Subscription } from "rxjs";
import {
  Benchmark,
  Database,
  DatabasePrice,
  PriceUnit,
  Region,
  Vendor,
} from "../../../../sdk/data-contracts";
import openApiSpec from "../../../../sdk/openapi.json";
import { BenchmarkLineChartComponent } from "../../components/charts/line/benchmark-line-chart.component";
import { BenchmarkLineChartBuilderService } from "../../components/charts/line/benchmark-line-chart-builder.service";
import {
  PgbenchChartResult,
  PgbenchScore,
} from "../../components/charts/line/benchmark-line-chart.types";
import { getBenchmarkMetaNote } from "../../components/charts/shared/chart-tooltip.utils";
import { lineChartOptionsPgbench } from "../server-details/chartOptions";
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
  ServerPropertyTooltip,
} from "../../components/server-property-card/server-property-card.component";
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ServerCompareService } from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import { ReduceUnitNamePipe } from "../../pipes/reduce-unit-name.pipe";
import { formatKebabTitle } from "../../pipes/pipe-utils";

type LoadedDatabase = Database & {
  vendor?: Vendor;
  prices?: (DatabasePrice & { region?: Region })[];
  underlyingServer?: {
    display_name: string;
    api_reference: string;
    cpu_cores?: number;
    vcpus?: number;
  };
};

const PGBENCH_CHART_BENCHMARK_ID = "pgbench:heavy_read_only";
const PGBENCH_PEAK_BENCHMARK_ID = "pgbench:heavy_read_only:peak";
const PGBENCH_SINGLE_BENCHMARK_ID = "pgbench:heavy_read_only:single";
const PGBENCH_TITLE_FALLBACK = "pgbench Heavy Read-Only";

type OpenApiProperty = {
  description?: string;
};

const DATABASE_SCHEMA_PROPERTIES: Record<string, OpenApiProperty> =
  (
    openApiSpec as {
      components?: {
        schemas?: {
          Database?: {
            properties?: Record<string, OpenApiProperty>;
          };
        };
      };
    }
  ).components?.schemas?.Database?.properties ?? {};

@Component({
  selector: "sc-database-details",
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbsComponent,
    Button,
    LoadingSpinnerComponent,
    ServerPropertyCardComponent,
    BenchmarkLineChartComponent,
    LucideCheck,
    ReduceUnitNamePipe,
  ],
  templateUrl: "./database-details.html",
  styleUrl: "./database-details.scss",
  encapsulation: ViewEncapsulation.None,
})
export class DatabaseDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private keeperAPI = inject(KeeperAPIService);
  private lineChartBuilder = inject(BenchmarkLineChartBuilderService);
  private SEOHandler = inject(SeoHandlerService);
  private analytics = inject(AnalyticsService);
  private toastService = inject(ToastService);
  private serverCompare = inject(ServerCompareService);

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
    ha: string;
    ha_strategy: string;
    price: number | null;
    currency: string;
    unit: string;
  }[] = [];

  availabilityCanExpand = false;
  pgbenchChart: PgbenchChartResult | undefined;
  pgbenchTitle = PGBENCH_TITLE_FALLBACK;
  pgbenchInfoTooltip = "";
  pgbenchNoteTooltip = "";
  pgbenchPeakScore: string | null = null;
  pgbenchSingleScore: string | null = null;
  showUnderlyingServerPerformance = false;
  underlyingServerPgbenchChart: PgbenchChartResult | undefined;
  underlyingServerLink: string[] | null = null;

  private availabilityCard =
    viewChild<ElementRef<HTMLDivElement>>("availabilityCard");
  private availabilityOverflowCheckTimeout?: ReturnType<typeof setTimeout>;
  private subscription = new Subscription();
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.scheduleAvailabilityOverflowCheck();
    });

    this.destroyRef.onDestroy(() => {
      if (this.availabilityOverflowCheckTimeout) {
        clearTimeout(this.availabilityOverflowCheckTimeout);
      }
    });
  }

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

  @HostListener("window:resize")
  onResize() {
    this.scheduleAvailabilityOverflowCheck();
  }

  private loadDatabase(vendor: string, id: string) {
    this.isLoading = true;
    this.databaseDetails = null;

    Promise.all([
      this.keeperAPI.getDatabase(vendor, id),
      this.keeperAPI.getDatabasePrices(vendor, id),
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions(),
      this.keeperAPI.getDatabaseBenchmarks(vendor, id).catch(() => ({
        body: [],
      })),
      this.keeperAPI.getServerBenchmarkMeta().catch(() => ({
        body: [],
      })),
    ])
      .then(
        async ([
          databaseResponse,
          pricesResponse,
          vendorsResponse,
          regionsResponse,
          benchmarksResponse,
          benchmarkMetaResponse,
        ]) => {
          const database = databaseResponse.body;
          if (!database) {
            this.keeperResponseErrorMsg = "Database not found.";
            return;
          }

          const vendors = (vendorsResponse?.body || []) as Vendor[];
          const regions = (regionsResponse?.body || []) as Region[];
          const prices = (pricesResponse?.body || []) as DatabasePrice[];
          let underlyingServer: LoadedDatabase["underlyingServer"];
          let underlyingServerScores: PgbenchScore[] = [];
          if (database.server_id) {
            try {
              const [serverResponse, serverBenchmarksResponse] =
                await Promise.all([
                  this.keeperAPI.getServerV2(
                    database.vendor_id,
                    database.server_id,
                  ),
                  this.keeperAPI
                    .getServerBenchmark(database.vendor_id, database.server_id)
                    .catch(() => ({ body: [] })),
                ]);
              const server = serverResponse?.body;
              if (server?.display_name && server?.api_reference) {
                underlyingServer = {
                  display_name: server.display_name,
                  api_reference: server.api_reference,
                  cpu_cores: server.cpu_cores,
                  vcpus: server.vcpus,
                };
              }
              underlyingServerScores = (serverBenchmarksResponse?.body ||
                []) as PgbenchScore[];
            } catch {
              underlyingServer = undefined;
              underlyingServerScores = [];
            }
          }

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
            underlyingServer,
          };

          this.breadcrumbs = [
            { name: "Home", url: "/" },
            { name: "Databases", url: "/databases" },
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
          const priceParts: string[] = [];
          for (const unit of [PriceUnit.Hour, PriceUnit.Month]) {
            const unitPrices =
              this.databaseDetails.prices?.filter(
                (price) => price.unit === unit,
              ) || [];
            if (!unitPrices.length) {
              continue;
            }
            const cheapest = unitPrices[0];
            const roundedPrice =
              cheapest.price < 1
                ? cheapest.price.toPrecision(2)
                : cheapest.price.toFixed(2);
            priceParts.push(
              `${roundedPrice} ${cheapest.currency}/${cheapest.unit}`,
            );
          }
          if (priceParts.length) {
            this.cardPriceDescription = ` Pricing starts at ${priceParts.join(" and ")}.`;
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
            ...(database.storage_size === null ||
            database.storage_size === undefined
              ? []
              : [
                  {
                    name: "Storage",
                    value: `${database.storage_size} GB`,
                  },
                ]),
            {
              name: "Engine",
              value: database.engine || "-",
            },
          ];

          this.buildPropertySections(this.databaseDetails);
          this.buildAvailabilityRows();
          const benchmarkMeta = (benchmarkMetaResponse?.body ||
            []) as Benchmark[];
          this.applyPgbenchBenchmarks(
            benchmarksResponse?.body || [],
            benchmarkMeta,
            database.vcpus,
          );
          this.applyUnderlyingServerBenchmarks(
            underlyingServer,
            underlyingServerScores,
            benchmarkMeta,
          );

          this.SEOHandler.updateTitleAndMetaTags(
            `${database.display_name} by ${
              this.databaseDetails.vendor?.name || database.vendor_id
            } - Spare Cores`,
            this.description + this.cardPriceDescription,
            "cloud, database, dbaas, price, comparison, sparecores",
          );
        },
      )
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
        this.scheduleAvailabilityOverflowCheck();
      });
  }

  private buildPropertySections(database: LoadedDatabase) {
    this.metadataSections = [
      {
        name: "Database Metadata",
        properties: this.dedupeMetadataProperties(
          this.rows(
            [
              {
                id: "name",
                name: "Name",
                value: database.name,
              },
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
                ...this.formatUnderlyingServer(database),
              },
              { id: "status", name: "Status", value: database.status },
            ],
            true,
          ),
        ),
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
          ...(database.security_features || []).map((feature) => ({
            id: feature,
            name: formatKebabTitle(feature),
            value: "check",
          })),
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
      ha: price.ha || "none",
      ha_strategy: price.ha_strategy || "none",
      price: price.price,
      currency: price.currency || "USD",
      unit: price.unit,
    }));
  }

  get hasPgbenchHeaderScores() {
    return this.pgbenchPeakScore !== null && this.pgbenchSingleScore !== null;
  }

  addToCompare() {
    if (!this.databaseDetails) {
      return;
    }

    this.serverCompare.toggleDatabaseCompare(
      !this.serverCompare.isDatabaseSelected(this.databaseDetails),
      {
        database: this.databaseDetails.api_reference,
        vendor: this.databaseDetails.vendor_id,
        display_name: this.databaseDetails.display_name,
      },
    );
  }

  compareText() {
    if (!this.databaseDetails) {
      return "Compare";
    }

    return this.serverCompare.isDatabaseSelected(this.databaseDetails)
      ? "Don't Compare"
      : "Compare";
  }

  private applyPgbenchBenchmarks(
    scores: PgbenchScore[],
    benchmarkMeta: Benchmark[],
    vcpus?: number | null,
  ) {
    const peak = scores.find(
      (score) => score.benchmark_id === PGBENCH_PEAK_BENCHMARK_ID,
    );
    const single = scores.find(
      (score) => score.benchmark_id === PGBENCH_SINGLE_BENCHMARK_ID,
    );
    this.pgbenchPeakScore = peak ? peak.score.toFixed(0) : null;
    this.pgbenchSingleScore = single ? single.score.toFixed(0) : null;

    const meta = benchmarkMeta.find(
      (item) => item.benchmark_id === PGBENCH_CHART_BENCHMARK_ID,
    );
    this.pgbenchTitle = meta?.name || PGBENCH_TITLE_FALLBACK;
    this.pgbenchInfoTooltip = meta?.description || "";
    this.pgbenchNoteTooltip =
      getBenchmarkMetaNote(benchmarkMeta, PGBENCH_CHART_BENCHMARK_ID) || "";
    this.pgbenchChart = this.lineChartBuilder.buildDetailsPgbenchChart({
      scores,
      vcpus,
      optionsBase: lineChartOptionsPgbench,
      scoreUnit: meta?.unit,
    });
  }

  private applyUnderlyingServerBenchmarks(
    underlyingServer: LoadedDatabase["underlyingServer"],
    scores: PgbenchScore[],
    benchmarkMeta: Benchmark[],
  ) {
    this.showUnderlyingServerPerformance = false;
    this.underlyingServerPgbenchChart = undefined;
    this.underlyingServerLink = null;

    if (!underlyingServer) {
      return;
    }

    this.underlyingServerLink = [
      "/server",
      this.databaseDetails!.vendor_id,
      underlyingServer.api_reference,
    ];

    const hasPgbenchScores = scores.some(
      (score) => score.benchmark_id === PGBENCH_CHART_BENCHMARK_ID,
    );
    if (!hasPgbenchScores) {
      return;
    }

    const meta = benchmarkMeta.find(
      (item) => item.benchmark_id === PGBENCH_CHART_BENCHMARK_ID,
    );
    this.underlyingServerPgbenchChart =
      this.lineChartBuilder.buildDetailsPgbenchChart({
        scores,
        vcpus: underlyingServer.vcpus ?? underlyingServer.cpu_cores,
        optionsBase: lineChartOptionsPgbench,
        scoreUnit: meta?.unit,
      });

    this.showUnderlyingServerPerformance = !!this.underlyingServerPgbenchChart;
  }

  private formatUnderlyingServer(database: LoadedDatabase): {
    value: unknown;
    routerLink?: string[];
  } {
    if (database.underlyingServer) {
      const { display_name, api_reference } = database.underlyingServer;
      return {
        value: display_name,
        routerLink: ["/server", database.vendor_id, api_reference],
      };
    }

    return { value: database.server_id };
  }

  private dedupeMetadataProperties(
    properties: ServerPropertyRow[],
  ): ServerPropertyRow[] {
    const nameProperty = properties.find((property) => property.id === "name");
    if (!nameProperty) {
      return properties;
    }

    const hiddenMetadataIds = new Set([
      "database_id",
      "api_reference",
      "display_name",
    ]);
    const identityPropertyIds = [
      "database_id",
      "name",
      "api_reference",
      "display_name",
    ];
    const matchingIdentityProperties = properties.filter(
      (property) =>
        property.id !== "name" &&
        identityPropertyIds.includes(property.id) &&
        this.normalizeComparableValue(property.value) ===
          this.normalizeComparableValue(nameProperty.value),
    );
    const shouldAggregateIdentityTooltips =
      matchingIdentityProperties.length > 0;
    const nameTooltips = shouldAggregateIdentityTooltips
      ? this.uniqueTooltips(
          [nameProperty, ...matchingIdentityProperties].flatMap(
            (property) => property.tooltips || [],
          ),
        )
      : nameProperty.tooltips || [];

    const filteredProperties = properties.filter((property) => {
      if (!hiddenMetadataIds.has(property.id)) {
        return true;
      }

      if (
        this.normalizeComparableValue(property.value) !==
        this.normalizeComparableValue(nameProperty.value)
      ) {
        return true;
      }

      return false;
    });

    return filteredProperties.map((property) => {
      if (property.id !== "name") {
        return property;
      }

      return {
        ...property,
        tooltips: nameTooltips,
      };
    });
  }

  private uniqueTooltips(tooltips: ServerPropertyTooltip[]) {
    const seen = new Set<string>();

    return tooltips.filter((tooltip) => {
      if (seen.has(tooltip.key)) {
        return false;
      }

      seen.add(tooltip.key);
      return true;
    });
  }

  private normalizeComparableValue(value: string) {
    return value
      .replace(/<[^>]*>/g, "")
      .trim()
      .toLowerCase();
  }

  private rows(
    items: {
      id: string;
      name: string;
      value: unknown;
      description?: string;
      routerLink?: string[] | string;
    }[],
    useSchemaDescriptions = false,
  ): ServerPropertyRow[] {
    return items
      .map((item) => {
        const description =
          item.description ??
          (useSchemaDescriptions
            ? DATABASE_SCHEMA_PROPERTIES[item.id]?.description
            : undefined);
        return {
          id: item.id,
          name: item.name,
          value: this.toDisplayValue(item.value),
          tooltips: description
            ? [{ key: item.id, content: description }]
            : undefined,
          routerLink: item.routerLink,
        };
      })
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
    if (cardId === "availability") {
      this.scheduleAvailabilityOverflowCheck();
    }
  }

  private scheduleAvailabilityOverflowCheck() {
    if (this.availabilityOverflowCheckTimeout) {
      clearTimeout(this.availabilityOverflowCheckTimeout);
    }

    this.availabilityOverflowCheckTimeout = setTimeout(() => {
      this.updateAvailabilityOverflowState();
    }, 0);
  }

  private updateAvailabilityOverflowState() {
    const cardElement = this.availabilityCard()?.nativeElement;
    if (!cardElement) {
      return;
    }

    const hadOpenClass = cardElement.classList.contains("open");
    if (hadOpenClass) {
      cardElement.classList.remove("open");
    }

    this.availabilityCanExpand =
      cardElement.scrollHeight > cardElement.clientHeight + 1;

    if (hadOpenClass) {
      cardElement.classList.add("open");
    }
  }
}
