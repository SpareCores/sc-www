import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Subscription } from "rxjs";
import {
  Benchmark,
  DatabasePrice,
  PriceUnit,
  Region,
  Vendor,
} from "../../../../sdk/data-contracts";
import { BenchmarkLineChart } from "../../components/charts/line/benchmark-line-chart";
import {
  PgbenchChartResult,
  PgbenchScore,
} from "../../components/charts/line/benchmark-line-chart.types";
import { formatNumberWithCommas } from "../../components/charts/shared/server-compare-table.utils";
import {
  BreadcrumbSegment,
  Breadcrumbs,
} from "../../components/breadcrumbs/breadcrumbs";
import { Button } from "../../components/button/button";
import { HeaderAnchor } from "../../components/header-anchor/header-anchor";
import { LoadingSpinner } from "../../components/loading-spinner/loading-spinner";
import { EmbedWidgetButton } from "../../components/embed-dialog/embed-widget-button";
import {
  DatabasePgbench,
  hasPgbenchScores,
} from "../../services/database-pgbench";
import { PgbenchChartMeta } from "../../services/details-embed.types";
import { EmbedWidgetOption } from "../../components/embed-dialog/embed-dialog.types";
import { DetailsCard } from "../../components/details-card/details-card";
import { DetailsHeader } from "../../components/details-header/details-header";
import { DetailsCardSection } from "../../components/details-card/details-card.types";
import { Analytics } from "../../services/analytics";
import { KeeperAPI } from "../../services/keeper-api";
import { SeoHandler } from "../../services/seo-handler";
import { CompareSelection } from "../../services/compare-selection";
import { Toast } from "../../services/toast";
import { DATABASE_DETAILS_ERROR_TOAST_ID } from "../../services/toast-ids";
import {
  DATABASE_PGBENCH_WIDGET_ID,
  DATABASE_SPEC_CARD_WIDGETS,
  UNDERLYING_SERVER_PGBENCH_WIDGET_ID,
} from "../../services/database-embed.constants";
import { DatabaseSpecCards } from "../../services/database-spec-cards";
import { LoadedDatabase } from "../../services/database-spec-cards.types";
import { DatabaseUnderlyingServer } from "../../services/database-underlying-server";
import {
  DETAILS_PGBENCH_TITLE_FALLBACK,
  PGBENCH_PEAK_BENCHMARK_ID,
  PGBENCH_SINGLE_BENCHMARK_ID,
} from "../../services/database-pgbench.constants";

@Component({
  selector: "sc-database-details",
  imports: [
    RouterModule,
    Breadcrumbs,
    Button,
    LoadingSpinner,
    DetailsCard,
    BenchmarkLineChart,
    EmbedWidgetButton,
    DetailsHeader,
    HeaderAnchor,
  ],
  templateUrl: "./database-details.html",
  styleUrl: "./database-details.css",
})
export class DatabaseDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private keeperAPI = inject(KeeperAPI);
  private pgbench = inject(DatabasePgbench);
  private SEOHandler = inject(SeoHandler);
  private analytics = inject(Analytics);
  private toastService = inject(Toast);
  private serverCompare = inject(CompareSelection);
  private specCards = inject(DatabaseSpecCards);
  private underlyingServerLoader = inject(DatabaseUnderlyingServer);

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

  metadataSections: DetailsCardSection[] = [];
  engineSections: DetailsCardSection[] = [];
  capacitySections: DetailsCardSection[] = [];
  featureSections: DetailsCardSection[] = [];
  securitySections: DetailsCardSection[] = [];

  expandedCards: Record<string, boolean> = {
    details: false,
    engine: false,
    capacity: false,
    features: false,
    security: false,
    availability: false,
  };

  availabilitySections: DetailsCardSection[] = [];

  pgbenchChart: PgbenchChartResult | undefined;
  pgbenchMeta: PgbenchChartMeta = this.pgbench.meta(
    [],
    DETAILS_PGBENCH_TITLE_FALLBACK,
  );
  pgbenchPeakScore: string | null = null;
  pgbenchSingleScore: string | null = null;
  showUnderlyingServerPerformance = false;
  underlyingServerPgbenchChart: PgbenchChartResult | undefined;
  underlyingServerLink: string[] | null = null;
  embeddableWidgets: EmbedWidgetOption[] = [];

  private subscription = new Subscription();
  private destroyRef = inject(DestroyRef);
  private loadRequestId = 0;

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
    this.toastService.removeToast(DATABASE_DETAILS_ERROR_TOAST_ID);
  }

  private loadDatabase(vendor: string, id: string) {
    const requestId = ++this.loadRequestId;
    this.isLoading = true;
    this.databaseDetails = null;
    this.toastService.removeToast(DATABASE_DETAILS_ERROR_TOAST_ID);

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
          if (this.destroyRef.destroyed || requestId !== this.loadRequestId) {
            return;
          }

          const database = databaseResponse.body;
          if (!database) {
            this.keeperResponseErrorMsg = "Database not found.";
            return;
          }

          const vendors = (vendorsResponse?.body || []) as Vendor[];
          const regions = (regionsResponse?.body || []) as Region[];
          const prices = (pricesResponse?.body || []) as DatabasePrice[];
          const { server: underlyingServer, scores: underlyingServerScores } =
            await this.underlyingServerLoader.load(database, true);

          if (this.destroyRef.destroyed || requestId !== this.loadRequestId) {
            return;
          }

          this.databaseDetails = {
            ...database,
            vendor: vendors.find((v) => v.vendor_id === database.vendor_id),
            prices: this.specCards.attachPrices(prices, regions),
            underlyingServer,
          };

          this.breadcrumbs = [
            { name: "Home", url: "/" },
            { name: "Databases", url: "/databases" },
            {
              name: this.databaseDetails.vendor?.name || database.vendor_id,
              url: `/vendors/${database.vendor_id}`,
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

          const sections = this.specCards.buildSections(this.databaseDetails);
          this.metadataSections = sections.metadataSections;
          this.engineSections = sections.engineSections;
          this.capacitySections = sections.capacitySections;
          this.featureSections = sections.featureSections;
          this.securitySections = sections.securitySections;
          this.availabilitySections = this.specCards.buildAvailabilitySections(
            this.databaseDetails.prices || [],
          );
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
          this.toastService.removeToast(DATABASE_DETAILS_ERROR_TOAST_ID);
        },
      )
      .catch((err) => {
        if (this.destroyRef.destroyed || requestId !== this.loadRequestId) {
          return;
        }

        this.analytics.SentryException(err, {
          tags: {
            location: this.constructor.name,
            function: "loadDatabase",
          },
        });
        console.error(err);
        this.keeperResponseErrorMsg =
          err.error?.detail || "Failed to load database details.";
        this.toastService.showHttpError(err, {
          id: DATABASE_DETAILS_ERROR_TOAST_ID,
          title: "Failed to load database details.",
        });
      })
      .finally(() => {
        if (this.destroyRef.destroyed || requestId !== this.loadRequestId) {
          return;
        }

        this.isLoading = false;
      });
  }

  get hasPgbenchHeaderScores() {
    return this.pgbenchPeakScore !== null && this.pgbenchSingleScore !== null;
  }

  updateEmbeddableWidgets() {
    this.embeddableWidgets = [
      ...DATABASE_SPEC_CARD_WIDGETS,
      ...(this.pgbenchChart
        ? [{ id: DATABASE_PGBENCH_WIDGET_ID, name: this.pgbenchMeta.title }]
        : []),
      ...(this.showUnderlyingServerPerformance
        ? [
            {
              id: UNDERLYING_SERVER_PGBENCH_WIDGET_ID,
              name: `Underlying Server: ${this.pgbenchMeta.title}`,
            },
          ]
        : []),
    ];
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
    this.pgbenchPeakScore = peak
      ? formatNumberWithCommas(Math.round(peak.score))
      : null;
    this.pgbenchSingleScore = single
      ? formatNumberWithCommas(Math.round(single.score))
      : null;

    this.pgbenchMeta = this.pgbench.meta(
      benchmarkMeta,
      DETAILS_PGBENCH_TITLE_FALLBACK,
    );
    this.pgbenchChart = this.pgbench.detailsChart(scores, vcpus, benchmarkMeta);
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

    if (!hasPgbenchScores(scores)) {
      return;
    }

    this.underlyingServerPgbenchChart = this.pgbench.detailsChart(
      scores,
      underlyingServer.vcpus ?? underlyingServer.cpu_cores,
      benchmarkMeta,
    );

    this.showUnderlyingServerPerformance = !!this.underlyingServerPgbenchChart;
  }

  toggleCard(cardId: string) {
    this.expandedCards[cardId] = !this.expandedCards[cardId];
  }
}
