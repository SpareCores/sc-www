import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  LucideCheck,
  LucideCircleArrowUp,
  LucideDynamicIcon,
  LucideInfo,
  LucideTriangleAlert,
  LucideX,
} from "@lucide/angular";
import { Subscription } from "rxjs";
import {
  Benchmark,
  Database,
  DatabasePrice,
  DatabaseSecurityFeature,
  PriceUnit,
  Region,
  Vendor,
} from "../../../../sdk/data-contracts";
import openApiSpec from "../../../../sdk/openapi.json";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { Button } from "../../components/button/button";
import { BenchmarkLineChartComponent } from "../../components/charts/line/benchmark-line-chart.component";
import {
  LineBenchmarkMeta,
  LineChartServer,
  PGBENCH_HEAVY_READ_ONLY_ID,
  PgbenchScore,
} from "../../components/charts/line/benchmark-line-chart.types";
import { ChartTooltipService } from "../../components/charts/shared/chart-tooltip.service";
import { CompareChartLegendVisibilityService } from "../../components/charts/shared/compare-chart-legend-visibility.service";
import { getBenchmarkMetaNote } from "../../components/charts/shared/chart-tooltip.utils";
import {
  formatCompareDeltaLabel,
  formatCompareSignedPercentageDeltaLabel,
  getBestNumericCompareCellStyle,
  isCompareBaselineServer,
  toCompareDeltaView,
  type CompareDeltaView,
} from "../../components/charts/shared/server-compare-table.utils";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { PageHeader } from "../../components/page-header/page-header";
import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";
import { formatKebabTitle } from "../../pipes/pipe-utils";
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import {
  DatabaseCompare,
  DatabaseCompareBaseline,
  ServerCompareService,
} from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import {
  decodeBase64JsonUrlState,
  isDatabaseCompareUrlState,
} from "../../tools/encoded-url-state";
import { encodeQueryParams } from "../../tools/queryParamFunctions";
import { CurrencyOption, availableCurrencies } from "../../tools/shared_data";
import { AdvisorUiService } from "../advisor/advisor-ui.service";
import {
  getCompareColumnWidthStyle,
  getCompareFixedHolderStyle,
  getCompareMainTableWidthStyle,
  getCompareStickyFirstColStyle,
} from "../server-compare/compare-table-layout.utils";
import { pushBrowserQueryState } from "../server-compare/compare-url-state.utils";
import {
  INITIAL_SCROLLBAR_MIRROR_STATE,
  ScrollbarMirrorController,
  ScrollbarMirrorState,
} from "../server-compare/scrollbar-mirror.controller";
import databaseComparesData from "./database-compares.js";

type LoadedCompareDatabase = Database & {
  vendor?: Vendor;
  prices?: (DatabasePrice & { region?: Region })[];
  benchmark_scores: PgbenchScore[];
  bestHourPrice?: DatabasePrice;
  bestMonthPrice?: DatabasePrice;
  underlyingServer?: {
    display_name: string;
    api_reference: string;
  };
};

type ComparePropertyRow = {
  id: string;
  name: string;
  values: string[];
  rawValues: Array<number | null>;
  description?: string;
  lowerIsBetter?: boolean;
};

type ComparePropertySection = {
  name: string;
  rows: ComparePropertyRow[];
};

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

const INVALID_COMPARE_URL_TOAST_ID = "bad-database-compare-url-param";
const INVALID_URL_TOAST_TITLE = "Invalid URL";
const INVALID_COMPARE_URL_TOAST_BODY =
  'Visit the <a href="/databases" class="underline font-semibold">Database Navigator page</a> to select databases to compare.';
const DATABASE_COMPARE_GUIDE_TITLE = "Cloud Database Compare Guide";
const DATABASE_COMPARISON_TITLE = "Cloud Database Comparison";
const DATABASE_COMPARE_BREADCRUMB = "Compare";
const DATABASE_COMPARE_PARENT_BREADCRUMB = "Databases";
const DATABASE_CUSTOM_COMPARISON_BREADCRUMB = "Custom Comparison";
const DATABASE_COMPARE_GUIDE_DESCRIPTION =
  "Compare managed databases (DBaaS) and their key specs, including engine type and versions supported, vCPU and RAM, storage throughput and backup options, high availability features etc. alongside benchmark metrics to find the optimal managed cloud database for your workload.";
const PGBENCH_TITLE_FALLBACK = "PostgreSQL heavy read-only throughput";
const PGBENCH_PEAK_BENCHMARK_ID = "pgbench:heavy_read_only:peak";
const DATABASE_COMPARE_TABLE_ID = "database-compare-table";
const DATABASE_COMPARE_TABLE_HOLDER_ID = "database_compare_table_holder";
const DATABASE_COMPARE_FIRST_COL_ID = "database-compare-table-first-col";
const LOWER_IS_BETTER_ROW_IDS = new Set(["best_hour", "best_month"]);

@Component({
  selector: "sc-database-compare",
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbsComponent,
    Button,
    PageHeader,
    LoadingSpinnerComponent,
    BenchmarkLineChartComponent,
    BenchmarkIconPipe,
    FlowbiteDropdownDirective,
    LucideCheck,
    LucideCircleArrowUp,
    LucideDynamicIcon,
    LucideInfo,
    LucideTriangleAlert,
    LucideX,
  ],
  templateUrl: "./database-compare.component.html",
  styleUrl: "./database-compare.component.scss",
  providers: [CompareChartLegendVisibilityService],
})
export class DatabaseCompareComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);
  private keeperAPI = inject(KeeperAPIService);
  private seoHandler = inject(SeoHandlerService);
  private serverCompare = inject(ServerCompareService);
  private analytics = inject(AnalyticsService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private advisorUi = inject(AdvisorUiService);
  private chartTooltip = inject(ChartTooltipService);
  private legendVisibility = inject(CompareChartLegendVisibilityService);

  @ViewChild("tableHolder") tableHolder!: ElementRef;
  chartSectionTooltip = viewChild<ElementRef>("chartSectionTooltip");
  currencyDropdown = viewChild<FlowbiteDropdownDirective>("currencyDropdown");
  baselineDropdown = viewChild<FlowbiteDropdownDirective>("baselineDropdown");
  scrollbarMirrorBottomEl = viewChild<ElementRef>("scrollbarMirrorBottomRef");
  readonly scrollbarMirrorController = ScrollbarMirrorController;
  readonly scrollbarMirror = signal<ScrollbarMirrorState>({
    ...INITIAL_SCROLLBAR_MIRROR_STATE,
  });

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: DATABASE_COMPARE_PARENT_BREADCRUMB, url: "/databases" },
    { name: DATABASE_COMPARE_BREADCRUMB, url: "/databases/compare" },
  ];

  title = DATABASE_COMPARE_GUIDE_TITLE;
  description = DATABASE_COMPARE_GUIDE_DESCRIPTION;
  keywords = "cloud, database, dbaas, compare, sparecores";

  isLoading = false;
  instances: DatabaseCompare[] = [];
  instancesRaw = "";
  private lastEncodedCompareQuery: string | null = null;
  databases: LoadedCompareDatabase[] = [];
  lineCompareServers: LineChartServer[] = [];
  propertySections: ComparePropertySection[] = [];
  priceRows: ComparePropertyRow[] = [];
  databaseCompares: any[] = databaseComparesData;

  availableCurrencies: CurrencyOption[] = availableCurrencies;
  selectedCurrency = this.availableCurrencies[0];
  baselineDatabase: LoadedCompareDatabase | null = null;

  clipboardIcon = "clipboard";
  pgbenchTitle = PGBENCH_TITLE_FALLBACK;
  pgbenchInfoTooltip = "";
  pgbenchNoteTooltip = "";
  chartTooltipContent = "";
  benchmarkMeta: LineBenchmarkMeta[] = [];
  readonly isTableOutsideViewport = signal(false);
  readonly bestCellStyle = "font-weight: 600; color: #34D399";

  private subscription = new Subscription();
  private compareLoadId = 0;
  private stickyLayoutFrameId: number | null = null;
  private mirrorLayoutTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private mirrorCtrl?: ScrollbarMirrorController;

  private readonly flushStickyLayout = () => {
    this.stickyLayoutFrameId = null;
    const top =
      this.document
        .getElementById("database-compare-table")
        ?.getBoundingClientRect().top ?? 0;
    this.isTableOutsideViewport.set(top < 70);
    this.mirrorCtrl?.update();
  };

  private readonly updateMirrorLayout = () => {
    this.mirrorCtrl?.update();
    this.updateStickyLayout();
  };

  readonly updateStickyLayout = () => {
    if (
      !isPlatformBrowser(this.platformId) ||
      this.stickyLayoutFrameId !== null
    ) {
      return;
    }

    this.stickyLayoutFrameId = window.requestAnimationFrame(
      this.flushStickyLayout,
    );
  };

  ngOnInit() {
    this.seoHandler.updateTitleAndMetaTags(
      this.title,
      this.description,
      this.keywords,
    );

    this.subscription.add(
      this.route.queryParams.subscribe(() => {
        this.setup();
      }),
    );

    this.subscription.add(
      this.route.params.subscribe(() => {
        this.setup();
      }),
    );

    this.subscription.add(
      this.serverCompare.databaseBaselineChanged.subscribe((baseline) => {
        this.applyBaselineFromService(baseline);
      }),
    );

    this.subscription.add(
      this.serverCompare.databaseSelectionChanged.subscribe((selection) => {
        this.applySelectionFromService(selection);
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener("scroll", this.updateMirrorLayout);
      window.removeEventListener("resize", this.updateMirrorLayout);
      window.removeEventListener("orientationchange", this.updateMirrorLayout);
      if (this.stickyLayoutFrameId !== null) {
        cancelAnimationFrame(this.stickyLayoutFrameId);
        this.stickyLayoutFrameId = null;
      }
      if (this.mirrorLayoutTimeoutId !== null) {
        clearTimeout(this.mirrorLayoutTimeoutId);
        this.mirrorLayoutTimeoutId = null;
      }
    }

    this.mirrorCtrl?.destroy();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.mirrorCtrl = new ScrollbarMirrorController(
        () => this.tableHolder,
        this.scrollbarMirrorBottomEl,
        this.scrollbarMirror,
        {
          tableId: "database-compare-table",
          firstColId: "database-compare-table-first-col",
          bottomAnchorRowId: "database-compare-view-server-row",
        },
      );

      window.addEventListener("scroll", this.updateMirrorLayout);
      window.addEventListener("resize", this.updateMirrorLayout);
      window.addEventListener("orientationchange", this.updateMirrorLayout);
      this.updateMirrorLayout();
    }
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getBaselineDatabaseLabel(): string {
    if (!this.baselineDatabase) {
      return "No baseline";
    }
    return `${this.baselineDatabase.display_name} (${this.baselineDatabase.vendor_id})`;
  }

  isBaselineDatabase(database: LoadedCompareDatabase): boolean {
    return isCompareBaselineServer(database, this.baselineDatabase);
  }

  showChartTooltip(el: MouseEvent, content?: string): void {
    this.chartTooltip.showIfPresent({
      tooltipElement: this.chartSectionTooltip()?.nativeElement,
      event: el,
      content,
      onShow: (tooltipContent) => {
        this.chartTooltipContent = tooltipContent;
      },
    });
  }

  showChartWarningTooltip(el: MouseEvent, content?: string): void {
    this.chartTooltip.showIfPresent({
      tooltipElement: this.chartSectionTooltip()?.nativeElement,
      event: el,
      content,
      variant: "warning-wide",
      onShow: (tooltipContent) => {
        this.chartTooltipContent = tooltipContent;
      },
    });
  }

  hideChartTooltip(): void {
    this.chartTooltip.hide(this.chartSectionTooltip()?.nativeElement);
  }

  toUpper(value: string): string {
    return value?.toUpperCase() || "";
  }

  getDatabaseColumnWidth(database: LoadedCompareDatabase): string {
    const displayNameLength = database.display_name?.length ?? 0;
    return `max(10.5rem, ${displayNameLength + 3}ch)`;
  }

  onMirrorScroll(event: Event): void {
    this.mirrorCtrl?.syncFromMirror(event.target as HTMLElement);
  }

  getBestCellStyle(row: ComparePropertyRow, databaseIndex: number): string {
    return getBestNumericCompareCellStyle(
      row.rawValues[databaseIndex],
      row.rawValues,
      this.bestCellStyle,
      row.lowerIsBetter || LOWER_IS_BETTER_ROW_IDS.has(row.id),
    );
  }

  getStyle(index: number) {
    return getCompareColumnWidthStyle(
      this.document,
      DATABASE_COMPARE_TABLE_ID,
      index,
      this.databases.length,
    );
  }

  getMainTableWidth() {
    return getCompareMainTableWidthStyle(
      this.document,
      DATABASE_COMPARE_TABLE_ID,
      this.tableHolder?.nativeElement,
    );
  }

  getFixedDivStyle() {
    return getCompareFixedHolderStyle(
      this.document,
      DATABASE_COMPARE_TABLE_HOLDER_ID,
    );
  }

  getStickyHeaderFirstColStyle() {
    return getCompareStickyFirstColStyle(
      this.document,
      DATABASE_COMPARE_FIRST_COL_ID,
    );
  }

  shouldShowDeltaRow(row: ComparePropertyRow): boolean {
    if (!this.baselineDatabase) {
      return false;
    }

    const baselineIndex = this.databases.findIndex((database) =>
      this.isBaselineDatabase(database),
    );
    if (baselineIndex < 0 || row.rawValues[baselineIndex] === null) {
      return false;
    }

    return this.databases.some(
      (database, index) =>
        !this.isBaselineDatabase(database) && row.rawValues[index] !== null,
    );
  }

  getRowDelta(
    row: ComparePropertyRow,
    databaseIndex: number,
  ): CompareDeltaView | null {
    if (!this.baselineDatabase || !this.shouldShowDeltaRow(row)) {
      return null;
    }

    if (this.isBaselineDatabase(this.databases[databaseIndex])) {
      return null;
    }

    const baselineIndex = this.databases.findIndex((database) =>
      this.isBaselineDatabase(database),
    );
    const candidateValue = row.rawValues[databaseIndex];
    const baselineValue = row.rawValues[baselineIndex];
    if (candidateValue === null || baselineValue === null) {
      return null;
    }

    const lowerIsBetter =
      row.lowerIsBetter || LOWER_IS_BETTER_ROW_IDS.has(row.id);
    const delta = lowerIsBetter
      ? this.advisorUi.buildPriceDelta(candidateValue, baselineValue)
      : this.advisorUi.buildComparableResourceDelta(
          candidateValue,
          baselineValue,
        );

    return toCompareDeltaView(
      delta,
      lowerIsBetter
        ? formatCompareSignedPercentageDeltaLabel
        : formatCompareDeltaLabel,
    );
  }

  selectBaselineDatabase(database: LoadedCompareDatabase | null): void {
    this.baselineDropdown()?.hide();
    if (!database) {
      this.serverCompare.setBaselineDatabase(null);
      return;
    }
    this.serverCompare.setBaselineDatabase({
      vendor: database.vendor_id,
      database: database.api_reference,
    });
  }

  selectCurrency(currency: CurrencyOption): void {
    this.currencyDropdown()?.hide();
    this.selectedCurrency = currency;
    if (this.instances.length) {
      this.setup();
    }
  }

  clipboardURL(): void {
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

  private setup() {
    const loadId = ++this.compareLoadId;
    const id = this.route.snapshot.paramMap.get("id");
    const param = this.route.snapshot.queryParams["instances"];

    this.instances = [];
    this.instancesRaw = "";
    this.databases = [];
    this.lineCompareServers = [];
    this.legendVisibility.clear();
    this.propertySections = [];
    this.priceRows = [];

    if (id) {
      const specialCompare = this.databaseCompares.find(
        (x: any) => x.id === id,
      );
      if (specialCompare) {
        this.instances = specialCompare.instances || [];
        this.instancesRaw = btoa(JSON.stringify(this.instances));
        this.toastService.removeToast(INVALID_COMPARE_URL_TOAST_ID);
        this.applyComparisonChrome(
          specialCompare.title,
          specialCompare.description,
        );
        this.setPremadeCompareBreadcrumb(
          specialCompare.title,
          specialCompare.id,
        );
      } else {
        this.toastService.removeToast(INVALID_COMPARE_URL_TOAST_ID);
        this.applyGuideChrome();
      }
    } else if (param) {
      const decodedInstances = decodeBase64JsonUrlState(
        param,
        isDatabaseCompareUrlState,
      );

      if (!decodedInstances.value) {
        console.warn("Invalid instances data in URL:", decodedInstances.error);
        this.applyGuideChrome();
        if (isPlatformBrowser(this.platformId)) {
          this.toastService.show({
            title: INVALID_URL_TOAST_TITLE,
            body: INVALID_COMPARE_URL_TOAST_BODY,
            type: "error",
            id: INVALID_COMPARE_URL_TOAST_ID,
          });
        }
        this.isLoading = false;
        return;
      }

      this.instances = decodedInstances.value;
      this.instancesRaw = this.instances.length > 0 ? param : "";
      this.toastService.removeToast(INVALID_COMPARE_URL_TOAST_ID);
      if (this.instances.length) {
        this.applyComparisonChrome();
      } else {
        this.applyGuideChrome();
      }
      this.updateCompareBreadcrumb(this.instances.length);
    } else {
      this.toastService.removeToast(INVALID_COMPARE_URL_TOAST_ID);
      this.applyGuideChrome();
      this.isLoading = false;
      return;
    }

    if (!this.instances.length) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    const loadInstances = this.instances.slice();
    const promises: Promise<unknown>[] = [
      this.keeperAPI.getServerBenchmarkMeta(),
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions(),
    ];
    loadInstances.forEach((instance) => {
      promises.push(
        this.keeperAPI.getDatabase(instance.vendor, instance.database),
      );
      promises.push(
        this.keeperAPI.getDatabasePrices(instance.vendor, instance.database, {
          currency: this.selectedCurrency.slug,
        }),
      );
      promises.push(
        this.keeperAPI.getDatabaseBenchmarks(
          instance.vendor,
          instance.database,
        ),
      );
    });

    Promise.all(promises)
      .then(async (data) => {
        if (loadId !== this.compareLoadId) {
          return;
        }

        const bodies = data.map((item: any) => item.body);
        const [benchmarkMeta, vendors, regions, ...databasePayloads] = bodies;
        this.benchmarkMeta = (benchmarkMeta || []) as LineBenchmarkMeta[];
        const meta = (benchmarkMeta as Benchmark[]).find(
          (item) => item.benchmark_id === PGBENCH_HEAVY_READ_ONLY_ID,
        );
        this.pgbenchTitle = meta?.name || PGBENCH_TITLE_FALLBACK;
        this.pgbenchInfoTooltip = meta?.description || "";
        this.pgbenchNoteTooltip =
          getBenchmarkMetaNote(
            this.benchmarkMeta,
            PGBENCH_HEAVY_READ_ONLY_ID,
          ) || "";

        this.databases = [];
        this.serverCompare.clearDatabaseCompare();

        for (let i = 0; i < loadInstances.length; i++) {
          const database = databasePayloads[i * 3] as Database;
          const prices = (databasePayloads[i * 3 + 1] || []) as DatabasePrice[];
          const scores = (databasePayloads[i * 3 + 2] || []) as PgbenchScore[];

          const loaded: LoadedCompareDatabase = {
            ...database,
            vendor: (vendors as Vendor[]).find(
              (vendor) => vendor.vendor_id === database.vendor_id,
            ),
            prices: prices
              .map((price) => ({
                ...price,
                region: (regions as Region[]).find(
                  (region) =>
                    region.vendor_id === price.vendor_id &&
                    region.region_id === price.region_id,
                ),
              }))
              .sort((a, b) => a.price - b.price),
            benchmark_scores: scores,
          };

          const hourPrices =
            loaded.prices?.filter((price) => price.unit === PriceUnit.Hour) ||
            [];
          const monthPrices =
            loaded.prices?.filter((price) => price.unit === PriceUnit.Month) ||
            [];
          loaded.bestHourPrice = hourPrices[0];
          loaded.bestMonthPrice = monthPrices[0];

          this.databases.push(loaded);
          this.serverCompare.toggleDatabaseCompare(true, {
            vendor: database.vendor_id,
            database: database.api_reference,
            display_name: database.display_name,
          });
        }

        await Promise.all(
          this.databases.map(async (database) => {
            if (!database.server_id) {
              return;
            }
            try {
              const serverResponse = await this.keeperAPI.getServerV2(
                database.vendor_id,
                database.server_id,
              );
              const server = serverResponse?.body;
              if (server?.display_name && server?.api_reference) {
                database.underlyingServer = {
                  display_name: server.display_name,
                  api_reference: server.api_reference,
                };
              }
            } catch {
              database.underlyingServer = undefined;
            }
          }),
        );

        if (loadId !== this.compareLoadId) {
          return;
        }

        this.buildPropertySections();
        this.buildPriceRows();
        this.refreshLineCompareServers();
        this.applyBaselineFromQuery();
      })
      .catch((err) => {
        this.analytics.SentryException(err, {
          tags: {
            location: this.constructor.name,
            function: "setup",
          },
        });
        console.error(err);
        this.toastService.show({
          title: "Failed to load database compare",
          body: err.error?.detail || "Please try again later.",
          type: "error",
          id: "database-compare-error",
        });
      })
      .finally(() => {
        if (loadId === this.compareLoadId) {
          this.isLoading = false;
          if (isPlatformBrowser(this.platformId)) {
            if (this.mirrorLayoutTimeoutId !== null) {
              clearTimeout(this.mirrorLayoutTimeoutId);
            }
            this.mirrorLayoutTimeoutId = setTimeout(() => {
              this.mirrorLayoutTimeoutId = null;
              this.updateMirrorLayout();
            }, 150);
          }
        }
      });
  }

  private applyBaselineFromQuery(): void {
    const vendor = this.route.snapshot.queryParams["baseline_vendor"];
    const database = this.route.snapshot.queryParams["baseline_database"];
    if (!vendor || !database) {
      this.baselineDatabase = null;
      this.serverCompare.setBaselineDatabase(null);
      this.lastEncodedCompareQuery = encodeQueryParams(
        this.getCompareUrlQueryParams(),
      );
      return;
    }

    const match = this.databases.find(
      (item) => item.vendor_id === vendor && item.api_reference === database,
    );
    if (!match) {
      this.baselineDatabase = null;
      this.serverCompare.setBaselineDatabase(null);
      this.lastEncodedCompareQuery = encodeQueryParams(
        this.getCompareUrlQueryParams(),
      );
      return;
    }

    this.baselineDatabase = match;
    this.serverCompare.setBaselineDatabase({
      vendor: match.vendor_id,
      database: match.api_reference,
    });
    this.lastEncodedCompareQuery = encodeQueryParams(
      this.getCompareUrlQueryParams(),
    );
  }

  getCompareUrlQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};

    if (this.instancesRaw) {
      params.instances = this.instancesRaw;
    }

    if (this.baselineDatabase) {
      params.baseline_vendor = this.baselineDatabase.vendor_id;
      params.baseline_database = this.baselineDatabase.api_reference;
    }

    return params;
  }

  private syncCompareUrlState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const encodedQuery = encodeQueryParams(this.getCompareUrlQueryParams());
    if (encodedQuery === this.lastEncodedCompareQuery) {
      return;
    }

    this.lastEncodedCompareQuery = encodedQuery;
    pushBrowserQueryState(encodedQuery);
  }

  private applySelectionFromService(selection: DatabaseCompare[]): void {
    if (this.isLoading) {
      return;
    }

    if (!this.instances.length) {
      return;
    }

    if (
      selection.length === this.instances.length &&
      selection.every(
        (item, index) =>
          item.vendor === this.instances[index]?.vendor &&
          item.database === this.instances[index]?.database,
      )
    ) {
      return;
    }

    this.serverCompare.syncDatabaseCompareRoute();
  }

  private applyBaselineFromService(
    baseline: DatabaseCompareBaseline | null,
  ): void {
    if (this.isLoading) {
      return;
    }

    if (!baseline) {
      this.baselineDatabase = null;
      this.syncCompareUrlState();
      return;
    }

    this.baselineDatabase =
      this.databases.find(
        (item) =>
          item.vendor_id === baseline.vendor &&
          item.api_reference === baseline.database,
      ) || null;
    this.syncCompareUrlState();
  }

  private applyGuideChrome(): void {
    this.title = DATABASE_COMPARE_GUIDE_TITLE;
    this.description = DATABASE_COMPARE_GUIDE_DESCRIPTION;
    this.breadcrumbs = this.baseCompareBreadcrumbs();
    this.seoHandler.updateTitleAndMetaTags(
      this.title,
      this.description,
      this.keywords,
    );
  }

  private applyComparisonChrome(title?: string, description?: string): void {
    this.title = title || DATABASE_COMPARISON_TITLE;
    this.description = description || DATABASE_COMPARE_GUIDE_DESCRIPTION;
    this.breadcrumbs = this.baseCompareBreadcrumbs();
    this.seoHandler.updateTitleAndMetaTags(
      this.title,
      this.description,
      this.keywords,
    );
  }

  private baseCompareBreadcrumbs(): BreadcrumbSegment[] {
    return [
      { name: "Home", url: "/" },
      { name: DATABASE_COMPARE_PARENT_BREADCRUMB, url: "/databases" },
      { name: DATABASE_COMPARE_BREADCRUMB, url: "/databases/compare" },
    ];
  }

  private setPremadeCompareBreadcrumb(title: string, id: string): void {
    this.breadcrumbs = [
      ...this.baseCompareBreadcrumbs(),
      { name: title, url: `/databases/compare/${id}` },
    ];
  }

  private updateCompareBreadcrumb(count: number): void {
    if (count > 0) {
      this.breadcrumbs = [
        ...this.baseCompareBreadcrumbs(),
        {
          name: `${DATABASE_CUSTOM_COMPARISON_BREADCRUMB} (${count})`,
          url: `/databases/compare`,
          queryParams: this.instancesRaw
            ? { instances: this.instancesRaw }
            : undefined,
        },
      ];
      return;
    }

    this.breadcrumbs = this.baseCompareBreadcrumbs();
  }

  private buildPropertySections(): void {
    const sections: Array<{
      name: string;
      fields: Array<{
        id: string;
        name: string;
        value: (database: LoadedCompareDatabase) => unknown;
        raw?: (database: LoadedCompareDatabase) => number | null;
        lowerIsBetter?: boolean;
      }>;
    }> = [
      {
        name: "",
        fields: [
          {
            id: "vendor",
            name: "Vendor",
            value: (d) => d.vendor?.logo || d.vendor?.name || d.vendor_id,
          },
          { id: "name", name: "Name", value: (d) => d.name },
          {
            id: "display_name",
            name: "Display Name",
            value: (d) => d.display_name,
          },
          {
            id: "api_reference",
            name: "API Reference",
            value: (d) => d.api_reference,
          },
          { id: "family", name: "Family", value: (d) => d.family },
          { id: "status", name: "Status", value: (d) => d.status },
        ],
      },
      {
        name: "Engine",
        fields: [
          { id: "engine", name: "Engine", value: (d) => d.engine },
          {
            id: "wire_protocol",
            name: "Wire Protocol",
            value: (d) => d.wire_protocol,
          },
          {
            id: "engine_versions",
            name: "Engine Versions",
            value: (d) => this.formatList(d.engine_versions),
          },
          {
            id: "auto_upgrade_versions",
            name: "Auto Upgrade Versions",
            value: (d) => this.formatBoolean(d.auto_upgrade_versions),
          },
          {
            id: "custom_config",
            name: "Custom Config",
            value: (d) => this.formatBoolean(d.custom_config),
          },
          {
            id: "custom_extensions",
            name: "Custom Extensions",
            value: (d) => this.formatBoolean(d.custom_extensions),
          },
        ],
      },
      {
        name: "Capacity",
        fields: [
          {
            id: "vcpus",
            name: "vCPUs",
            value: (d) => d.vcpus,
            raw: (d) => this.toRawNumber(d.vcpus),
          },
          {
            id: "memory_amount",
            name: "Memory",
            value: (d) =>
              d.memory_amount === null || d.memory_amount === undefined
                ? null
                : `${(d.memory_amount / 1024).toFixed(1)} GiB`,
            raw: (d) => this.toRawNumber(d.memory_amount),
          },
          {
            id: "storage_size",
            name: "Bundled Storage",
            value: (d) =>
              d.storage_size === null || d.storage_size === undefined
                ? null
                : `${d.storage_size} GB`,
            raw: (d) => this.toRawNumber(d.storage_size),
          },
          {
            id: "storage_extra_min",
            name: "Extra Storage Min",
            value: (d) =>
              d.storage_extra_min === null || d.storage_extra_min === undefined
                ? null
                : `${d.storage_extra_min} GB`,
            raw: (d) => this.toRawNumber(d.storage_extra_min),
          },
          {
            id: "storage_extra_max",
            name: "Extra Storage Max",
            value: (d) =>
              d.storage_extra_max === null || d.storage_extra_max === undefined
                ? null
                : `${d.storage_extra_max} GB`,
            raw: (d) => this.toRawNumber(d.storage_extra_max),
          },
          {
            id: "storage_extra_autosize",
            name: "Storage Autosize",
            value: (d) => this.formatBoolean(d.storage_extra_autosize),
          },
          {
            id: "max_read_replicas",
            name: "Max Read Replicas",
            value: (d) => d.max_read_replicas,
            raw: (d) => this.toRawNumber(d.max_read_replicas),
          },
          {
            id: "sla",
            name: "SLA",
            value: (d) =>
              d.sla === null || d.sla === undefined ? null : `${d.sla}%`,
            raw: (d) => this.toRawNumber(d.sla),
          },
        ],
      },
      {
        name: "Features",
        fields: [
          {
            id: "ha",
            name: "High Availability",
            value: (d) => this.formatList(d.ha),
          },
          {
            id: "ha_strategy",
            name: "HA Strategy",
            value: (d) => this.formatList(d.ha_strategy),
          },
          {
            id: "scheduled_backups",
            name: "Scheduled Backups",
            value: (d) => this.formatBoolean(d.scheduled_backups),
          },
          {
            id: "continuous_backups",
            name: "Continuous Backups (days)",
            value: (d) => d.continuous_backups,
            raw: (d) => this.toRawNumber(d.continuous_backups),
          },
          {
            id: "connection_pool",
            name: "Connection Pool",
            value: (d) => this.formatBoolean(d.connection_pool),
          },
          {
            id: "system_monitoring",
            name: "System Monitoring",
            value: (d) => this.formatBoolean(d.system_monitoring),
          },
          {
            id: "database_monitoring",
            name: "Database Monitoring",
            value: (d) => this.formatBoolean(d.database_monitoring),
          },
          {
            id: "autotuning_advice",
            name: "Autotuning Advice",
            value: (d) => this.formatBoolean(d.autotuning_advice),
          },
          {
            id: "autotuning_apply",
            name: "Autotuning Apply",
            value: (d) => this.formatBoolean(d.autotuning_apply),
          },
        ],
      },
      {
        name: "Security",
        fields: [
          {
            id: "disk_encryption",
            name: "Disk Encryption",
            value: (d) => this.formatBoolean(d.disk_encryption),
          },
          ...this.buildSecurityFeatureFields(),
        ],
      },
    ];

    const alwaysShowSectionNames = new Set(["Capacity", "Features"]);

    this.propertySections = sections
      .map((section) => ({
        name: section.name,
        rows: section.fields
          .map((field) => ({
            id: field.id,
            name: field.name,
            values: this.databases.map((database) =>
              field.id === "vendor"
                ? this.toVendorDisplay(database)
                : this.toDisplayValue(field.value(database)),
            ),
            rawValues: this.databases.map((database) =>
              field.raw ? field.raw(database) : null,
            ),
            description: DATABASE_SCHEMA_PROPERTIES[field.id]?.description,
            lowerIsBetter: field.lowerIsBetter,
          }))
          .filter((row) =>
            alwaysShowSectionNames.has(section.name) || row.id === "vendor"
              ? true
              : row.values.some((value) => value !== "-"),
          ),
      }))
      .filter((section) => section.rows.length > 0);
  }

  private buildSecurityFeatureFields(): Array<{
    id: string;
    name: string;
    value: (database: LoadedCompareDatabase) => unknown;
  }> {
    const present = new Set<string>();
    for (const database of this.databases) {
      for (const feature of database.security_features || []) {
        present.add(feature);
      }
    }

    const knownFeatures = Object.values(DatabaseSecurityFeature);
    const orderedFeatures = [
      ...knownFeatures.filter((feature) => present.has(feature)),
      ...[...present]
        .filter(
          (feature) =>
            !knownFeatures.includes(feature as DatabaseSecurityFeature),
        )
        .sort(),
    ];

    return orderedFeatures.map((feature) => ({
      id: feature,
      name: formatKebabTitle(feature),
      value: (database: LoadedCompareDatabase) =>
        (database.security_features || []).includes(
          feature as DatabaseSecurityFeature,
        )
          ? "check"
          : "x",
    }));
  }

  private refreshLineCompareServers(): void {
    this.lineCompareServers = this.databases.map((database) => ({
      display_name: database.display_name,
      vendor_id: database.vendor_id,
      api_reference: database.api_reference,
      benchmark_scores:
        database.benchmark_scores as LineChartServer["benchmark_scores"],
    }));
  }

  hasPgbenchCompareChart(): boolean {
    return this.lineCompareServers.some((server) =>
      (server.benchmark_scores ?? []).some(
        (score) =>
          score.benchmark_id === PGBENCH_HEAVY_READ_ONLY_ID &&
          score.score != null,
      ),
    );
  }

  private buildPriceRows(): void {
    this.priceRows = [
      {
        id: "best_hour",
        name: "Best Hourly Price",
        values: this.databases.map((database) =>
          this.formatPrice(database.bestHourPrice),
        ),
        rawValues: this.databases.map((database) =>
          this.toRawNumber(database.bestHourPrice?.price),
        ),
        lowerIsBetter: true,
      },
      this.buildCostEfficiencyRow(),
      {
        id: "best_month",
        name: "Best Monthly Price",
        values: this.databases.map((database) =>
          this.formatPrice(database.bestMonthPrice),
        ),
        rawValues: this.databases.map((database) =>
          this.toRawNumber(database.bestMonthPrice?.price),
        ),
        lowerIsBetter: true,
      },
    ].filter((row) =>
      row.values.some((value) => value !== "-" && value !== ""),
    );
  }

  private buildCostEfficiencyRow(): ComparePropertyRow {
    const rawValues = this.databases.map((database) => {
      const peakScore = database.benchmark_scores?.find(
        (score) => score.benchmark_id === PGBENCH_PEAK_BENCHMARK_ID,
      )?.score;
      const hourlyPrice = database.bestHourPrice?.price;
      if (
        typeof peakScore !== "number" ||
        !Number.isFinite(peakScore) ||
        typeof hourlyPrice !== "number" ||
        !Number.isFinite(hourlyPrice) ||
        hourlyPrice <= 0
      ) {
        return null;
      }
      return peakScore / hourlyPrice;
    });

    return {
      id: "cost_efficiency",
      name: "Cost-efficiency",
      description:
        "Peak pgbench performance per price ratio showing how much throughput you get for $1/hour.",
      values: rawValues.map((value) =>
        value === null ? "" : value.toFixed(2),
      ),
      rawValues,
    };
  }

  private formatPrice(price?: DatabasePrice): string {
    if (!price) {
      return "-";
    }
    const rounded =
      price.price < 1 ? price.price.toPrecision(2) : price.price.toFixed(2);
    return `${rounded} ${price.currency}/${price.unit}`;
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

  private toDisplayValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return String(value);
  }

  private toVendorDisplay(database: LoadedCompareDatabase): string {
    if (database.vendor?.logo) {
      return `logo:${database.vendor.logo}`;
    }
    return database.vendor?.name || database.vendor_id || "-";
  }

  private toRawNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    return null;
  }
}
