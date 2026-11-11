import { isPlatformBrowser } from "@angular/common";
import { ComparePageController } from "../shared/compare-page/compare-page.controller";
import { CompareGuide } from "../../components/compare-guide/compare-guide";
import { CompareToolbar } from "../../components/compare-toolbar/compare-toolbar";
import { ScrollbarMirror } from "../../components/scrollbar-mirror/scrollbar-mirror";
import {
  AfterViewInit,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  LucideCircleArrowUp,
  LucideDynamicIcon,
  LucideInfo,
  LucideTriangleAlert,
} from "@lucide/angular";
import { Subscription } from "rxjs";
import { DatabasePrice, PriceUnit } from "../../../../sdk/data-contracts";
import { Breadcrumbs } from "../../components/breadcrumbs/breadcrumbs";
import { Button } from "../../components/button/button";
import { BenchmarkLineChart } from "../../components/charts/line/benchmark-line-chart";
import {
  LineBenchmarkMeta,
  LineChartServer,
} from "../../components/charts/line/benchmark-line-chart.types";
import { ChartTooltip } from "../../components/charts/shared/chart-tooltip";
import { CompareChartLegendVisibility } from "../../components/charts/shared/compare-chart-legend-visibility";
import { isCompareBaselineServer } from "../../components/charts/shared/server-compare-table.utils";
import { LoadingSpinner } from "../../components/loading-spinner/loading-spinner";
import { PageHeader } from "../../components/page-header/page-header";
import { EmbedWidgetButton } from "../../components/embed-dialog/embed-widget-button";
import { DatabaseCompareSpecRows } from "../../components/database-compare-spec-rows/database-compare-spec-rows";
import {
  DatabasePgbench,
  hasPgbenchScores,
} from "../../services/database-pgbench";
import { COMPARE_PGBENCH_TITLE_FALLBACK } from "../../services/database-pgbench.constants";
import { PgbenchChartMeta } from "../../services/details-embed.types";
import { EmbedWidgetOption } from "../../components/embed-dialog/embed-dialog.types";
import {
  DATABASE_COMPARE_SPECS_WIDGET,
  DATABASE_PGBENCH_WIDGET_ID,
} from "../../services/database-embed.constants";
import { DatabaseCompareSpecs } from "../../services/database-compare-specs";
import { BEST_COMPARE_CELL_STYLE } from "../../services/database-compare-specs.constants";
import {
  ComparePropertyRow,
  ComparePropertySection,
  LoadedCompareDatabase,
} from "../../services/database-compare-specs.types";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon-pipe";
import { Analytics } from "../../services/analytics";
import { KeeperAPI } from "../../services/keeper-api";
import { showInvalidUrlParamToast } from "../../services/page-toast.helpers";
import { SeoHandler } from "../../services/seo-handler";
import {
  ComparedDatabase,
  DatabaseCompareBaseline,
  CompareSelection,
} from "../../services/compare-selection";
import { Toast } from "../../services/toast";
import {
  BAD_DATABASE_COMPARE_URL_TOAST_ID,
  DATABASE_COMPARE_ERROR_TOAST_ID,
} from "../../services/toast-ids";
import {
  INVALID_DATABASE_COMPARE_URL_TOAST_ACTION_LABEL as INVALID_COMPARE_URL_TOAST_ACTION_LABEL,
  INVALID_DATABASE_COMPARE_URL_TOAST_BODY as INVALID_COMPARE_URL_TOAST_BODY,
} from "../../services/url-toast-content";
import { CollectionSaveModal } from "../../components/collections/collection-save-modal/collection-save-modal";
import {
  decodeBase64JsonUrlState,
  isDatabaseCompareUrlState,
} from "../../tools/encoded-url-state";
import { CurrencyOption, availableCurrencies } from "../../tools/shared_data";
import { CompareStickyLayoutController } from "../shared/compare-table/compare-sticky-layout.controller";
import * as compareTableLayout from "../shared/compare-table/compare-table-layout.utils";
import {
  DATABASE_COMPARE_FIRST_COL_ID,
  DATABASE_COMPARE_TABLE_HOLDER_ID,
  DATABASE_COMPARE_TABLE_ID,
  DATABASE_COMPARE_VIEW_SERVER_ROW_ID,
} from "./database-compare.constants";
import {
  INITIAL_SCROLLBAR_MIRROR_STATE,
  ScrollbarMirrorState,
} from "../shared/compare-table/scrollbar-mirror.controller";
import {
  DATABASE_COMPARE_GUIDE_DESCRIPTION,
  DATABASE_COMPARE_GUIDE_TITLE,
  DATABASE_COMPARE_KEYWORDS,
  DATABASE_COMPARE_PARENT_BREADCRUMB,
  DATABASE_COMPARISON_TITLE,
} from "./database-compare.constants";
import databaseComparesData from "./database-compares.js";

@Component({
  selector: "sc-database-compare",
  imports: [
    RouterModule,
    Breadcrumbs,
    Button,
    PageHeader,
    LoadingSpinner,
    BenchmarkLineChart,
    BenchmarkIconPipe,
    LucideCircleArrowUp,
    LucideDynamicIcon,
    LucideInfo,
    LucideTriangleAlert,
    CollectionSaveModal,
    EmbedWidgetButton,
    DatabaseCompareSpecRows,
    CompareGuide,
    CompareToolbar,
    ScrollbarMirror,
  ],
  templateUrl: "./database-compare.html",
  styleUrl: "./database-compare.css",
  providers: [CompareChartLegendVisibility],
})
export class DatabaseCompare implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);
  private keeperAPI = inject(KeeperAPI);
  private seoHandler = inject(SeoHandler);
  private serverCompare = inject(CompareSelection);
  private analytics = inject(Analytics);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(Toast);
  private destroyRef = inject(DestroyRef);
  private chartTooltip = inject(ChartTooltip);
  private legendVisibility = inject(CompareChartLegendVisibility);
  private compareSpecs = inject(DatabaseCompareSpecs);
  private pgbench = inject(DatabasePgbench);
  saveComparisonModal = viewChild(CollectionSaveModal);
  readonly comparePage = new ComparePageController(
    {
      collectionTarget: "compare-databases",
      comparePath: "/databases/compare",
      parentBreadcrumb: {
        name: DATABASE_COMPARE_PARENT_BREADCRUMB,
        url: "/databases",
      },
      guideTitle: DATABASE_COMPARE_GUIDE_TITLE,
      guideDescription: DATABASE_COMPARE_GUIDE_DESCRIPTION,
      comparisonTitle: DATABASE_COMPARISON_TITLE,
      baselineIdParam: "baseline_database",
      keywords: DATABASE_COMPARE_KEYWORDS,
    },
    {
      instances: () => this.getCompareInstancesForSave(),
      instancesRaw: () => this.instancesRaw,
      baseline: () => this.baselineDatabase,
      currency: () => this.selectedCurrency,
      isLoading: () => this.isLoading,
      compareDataReady: () => this.compareDataReady,
      saveModal: () => this.saveComparisonModal(),
      onLoadFinished: () => {
        this.isLoading = false;
        this.refreshCompareTableLayout();
      },
    },
  );

  @ViewChild("tableHolder") tableHolder!: ElementRef;
  chartSectionTooltip = viewChild<ElementRef>("chartSectionTooltip");
  private scrollbarMirrorComponent = viewChild(ScrollbarMirror);
  scrollbarMirrorBottomEl = computed(() =>
    this.scrollbarMirrorComponent()?.element(),
  );
  readonly scrollbarMirror = signal<ScrollbarMirrorState>({
    ...INITIAL_SCROLLBAR_MIRROR_STATE,
  });

  isLoading = true;
  instances: ComparedDatabase[] = [];
  instancesRaw = "";
  private compareDataReady = false;
  databases: LoadedCompareDatabase[] = [];
  lineCompareServers: LineChartServer[] = [];
  propertySections: ComparePropertySection[] = [];
  priceRows: ComparePropertyRow[] = [];
  databaseCompares: any[] = databaseComparesData;

  selectedCurrency: CurrencyOption = availableCurrencies[0];
  baselineDatabase: LoadedCompareDatabase | null = null;

  pgbenchMeta: PgbenchChartMeta = this.pgbench.meta(
    [],
    COMPARE_PGBENCH_TITLE_FALLBACK,
  );
  chartTooltipContent = "";
  benchmarkMeta: LineBenchmarkMeta[] = [];
  embeddableWidgets: EmbedWidgetOption[] = [];
  readonly isTableOutsideViewport = signal(false);
  readonly stickyFixedDivStyle = signal("");
  readonly stickyMainTableStyle = signal("");
  readonly stickyFirstColStyle = signal<{ width?: string }>({});
  readonly stickyColumnStyles = signal<string[]>([]);
  readonly bestCellStyle = BEST_COMPARE_CELL_STYLE;

  private subscription = new Subscription();
  private compareLoadId = 0;
  private stickyLayout = new CompareStickyLayoutController({
    document: this.document,
    isBrowser: () => this.isBrowser(),
    tableHolder: () => this.tableHolder,
    bottomMirror: this.scrollbarMirrorBottomEl,
    scrollbarMirror: this.scrollbarMirror,
    isTableOutsideViewport: this.isTableOutsideViewport,
    stickyStyles: {
      fixedDivStyle: this.stickyFixedDivStyle,
      mainTableStyle: this.stickyMainTableStyle,
      firstColStyle: this.stickyFirstColStyle,
      columnStyles: this.stickyColumnStyles,
    },
    ids: {
      tableId: DATABASE_COMPARE_TABLE_ID,
      tableHolderId: DATABASE_COMPARE_TABLE_HOLDER_ID,
      firstColId: DATABASE_COMPARE_FIRST_COL_ID,
    },
    itemCount: () => this.databases.length,
    mirrorOptions: {
      bottomAnchorRowId: DATABASE_COMPARE_VIEW_SERVER_ROW_ID,
    },
  });

  ngOnInit() {
    this.seoHandler.updateTitleAndMetaTags(
      this.comparePage.title,
      this.comparePage.description,
      this.comparePage.keywords,
    );

    this.comparePage.watchRoute(() => this.setup());

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
    this.stickyLayout.destroy();
    this.toastService.removeToast(DATABASE_COMPARE_ERROR_TOAST_ID);
    this.toastService.removeToast(BAD_DATABASE_COMPARE_URL_TOAST_ID);
  }

  ngAfterViewInit() {
    this.stickyLayout.init();
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  updateStickyLayout(): void {
    this.stickyLayout.scheduleUpdate();
  }

  private refreshCompareTableLayout(): void {
    if (!this.isBrowser()) {
      return;
    }

    const table = this.document.getElementById(DATABASE_COMPARE_TABLE_ID);
    table?.style.removeProperty("min-width");
    compareTableLayout.resetCompareTableHolderScroll(
      this.document,
      DATABASE_COMPARE_TABLE_HOLDER_ID,
    );
    this.stickyLayout.scheduleDeferredUpdate();
  }

  onMirrorScroll(event: Event) {
    this.stickyLayout.syncFromMirror(event.target as HTMLElement);
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
    return this.compareSpecs.columnWidth(database.display_name);
  }

  baselineIndex(): number {
    return this.databases.findIndex((database) =>
      this.isBaselineDatabase(database),
    );
  }

  getComparePinnedRowLayout() {
    return compareTableLayout.resolveComparePinnedRowLayout({
      document: this.document,
      holderId: DATABASE_COMPARE_TABLE_HOLDER_ID,
      tableId: DATABASE_COMPARE_TABLE_ID,
      itemCount: this.databases.length,
      isBrowser: this.isBrowser(),
    });
  }

  selectBaselineDatabase(database: LoadedCompareDatabase | null): void {
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
    this.selectedCurrency = currency;
    this.comparePage.syncUrlState();

    if (!this.databases.length) {
      return;
    }

    Promise.all(
      this.databases.map((database) =>
        this.keeperAPI.getDatabasePrices(
          database.vendor_id,
          database.api_reference,
          { currency: this.selectedCurrency.slug },
        ),
      ),
    ).then((responses) => {
      responses.forEach((response, index) => {
        const database = this.databases[index];
        const prices = ((response.body || []) as DatabasePrice[])
          .map((price) => ({
            ...price,
            region: database.prices?.find(
              (existing) =>
                existing.vendor_id === price.vendor_id &&
                existing.region_id === price.region_id,
            )?.region,
          }))
          .sort((a, b) => a.price - b.price);

        database.prices = prices;
        const hourPrices = prices.filter(
          (price) => price.unit === PriceUnit.Hour,
        );
        const monthPrices = prices.filter(
          (price) => price.unit === PriceUnit.Month,
        );
        database.bestHourPrice = hourPrices[0];
        database.bestMonthPrice = monthPrices[0];
      });

      this.priceRows = this.compareSpecs.buildPriceRows(this.databases);
      this.refreshCompareTableLayout();
    });
  }

  private setup() {
    const loadId = ++this.compareLoadId;
    const id = this.route.snapshot.paramMap.get("id");
    const param = this.route.snapshot.queryParams["instances"];
    this.toastService.removeToast(DATABASE_COMPARE_ERROR_TOAST_ID);

    this.instances = [];
    this.instancesRaw = "";
    this.databases = [];
    this.lineCompareServers = [];
    this.legendVisibility.clear();
    this.propertySections = [];
    this.priceRows = [];
    this.baselineDatabase = null;
    this.compareDataReady = false;
    this.stickyLayout.reset();
    this.selectedCurrency = this.comparePage.currencyFromUrl();

    if (id || param) {
      this.isLoading = true;
      this.comparePage.breadcrumbs = this.comparePage.baseBreadcrumbs();
    }

    if (id) {
      const specialCompare = this.databaseCompares.find(
        (x: any) => x.id === id,
      );
      if (specialCompare) {
        this.instances = specialCompare.instances || [];
        this.instancesRaw = btoa(JSON.stringify(this.instances));
        this.toastService.removeToast(BAD_DATABASE_COMPARE_URL_TOAST_ID);
      } else {
        this.comparePage.applyGuideChrome();
        showInvalidUrlParamToast(this.toastService, this.platformId, {
          id: BAD_DATABASE_COMPARE_URL_TOAST_ID,
          body: INVALID_COMPARE_URL_TOAST_BODY,
          action: {
            label: INVALID_COMPARE_URL_TOAST_ACTION_LABEL,
            onClick: () => this.router.navigate(["/databases"]),
          },
        });
        this.isLoading = false;
        return;
      }
    } else if (param) {
      const decodedInstances = decodeBase64JsonUrlState(
        param,
        isDatabaseCompareUrlState,
      );

      if (!decodedInstances.value) {
        console.warn("Invalid instances data in URL:", decodedInstances.error);
        this.comparePage.applyGuideChrome();
        showInvalidUrlParamToast(this.toastService, this.platformId, {
          id: BAD_DATABASE_COMPARE_URL_TOAST_ID,
          body: INVALID_COMPARE_URL_TOAST_BODY,
          action: {
            label: INVALID_COMPARE_URL_TOAST_ACTION_LABEL,
            onClick: () => this.router.navigate(["/databases"]),
          },
        });
        this.isLoading = false;
        return;
      }

      this.instances = decodedInstances.value;
      this.instancesRaw = this.instances.length > 0 ? param : "";
      this.toastService.removeToast(BAD_DATABASE_COMPARE_URL_TOAST_ID);
      if (!this.instances.length) {
        this.comparePage.applyGuideChrome();
        this.isLoading = false;
      }
    } else {
      this.toastService.removeToast(BAD_DATABASE_COMPARE_URL_TOAST_ID);
      this.comparePage.applyGuideChrome();
      this.isLoading = false;
      return;
    }

    if (!this.instances.length) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    const loadInstances = this.instances.slice();

    this.compareSpecs
      .load(loadInstances, this.selectedCurrency.slug)
      .then(async ({ benchmarkMeta, databases }) => {
        if (this.destroyRef.destroyed || loadId !== this.compareLoadId) {
          return;
        }

        this.benchmarkMeta = benchmarkMeta as LineBenchmarkMeta[];
        this.pgbenchMeta = this.pgbench.meta(
          benchmarkMeta,
          COMPARE_PGBENCH_TITLE_FALLBACK,
        );

        this.serverCompare.clearDatabaseCompare();
        this.databases = databases;

        this.serverCompare.replaceDatabaseCompareSelection(
          this.databases.map((database) => ({
            vendor: database.vendor_id,
            database: database.api_reference,
            display_name: database.display_name,
          })),
        );

        await this.compareSpecs.attachUnderlyingServers(this.databases);

        if (this.destroyRef.destroyed || loadId !== this.compareLoadId) {
          return;
        }

        this.propertySections = this.compareSpecs.buildPropertySections(
          this.databases,
        );
        this.priceRows = this.compareSpecs.buildPriceRows(this.databases);
        this.refreshLineCompareServers();
        this.toastService.removeToast(DATABASE_COMPARE_ERROR_TOAST_ID);
      })
      .catch((err) => {
        if (this.destroyRef.destroyed || loadId !== this.compareLoadId) {
          return;
        }

        this.analytics.SentryException(err, {
          tags: {
            location: this.constructor.name,
            function: "setup",
          },
        });
        console.error(err);
        this.toastService.showHttpError(err, {
          id: DATABASE_COMPARE_ERROR_TOAST_ID,
          title: "Failed to load database comparison",
        });
      })
      .finally(() => {
        if (this.destroyRef.destroyed || loadId !== this.compareLoadId) {
          return;
        }

        this.applyBaselineFromQuery();
        const specialId = this.route.snapshot.paramMap.get("id");
        if (specialId && !this.comparePage.exactSavedComparison()) {
          const specialCompare = this.databaseCompares.find(
            (x: any) => x.id === specialId,
          );
          if (specialCompare) {
            this.comparePage.applyComparisonChrome(
              specialCompare.title,
              specialCompare.description,
            );
            this.comparePage.setPremadeBreadcrumb(
              specialCompare.title,
              specialCompare.id,
            );
          }
        }
        this.compareDataReady = true;
        this.comparePage.finishLoadIfReady();
      });
  }

  private applyBaselineFromQuery(): void {
    const params = isPlatformBrowser(this.platformId)
      ? Object.fromEntries(new URLSearchParams(window.location.search))
      : this.route.snapshot.queryParams;
    const vendor = params["baseline_vendor"];
    const database = params["baseline_database"];
    if (!vendor || !database) {
      this.baselineDatabase = null;
      this.serverCompare.setBaselineDatabase(null);
      this.comparePage.rememberUrlState();
      return;
    }

    const match = this.databases.find(
      (item) => item.vendor_id === vendor && item.api_reference === database,
    );
    if (!match) {
      this.baselineDatabase = null;
      this.serverCompare.setBaselineDatabase(null);
      this.comparePage.rememberUrlState();
      return;
    }

    this.baselineDatabase = match;
    this.serverCompare.setBaselineDatabase({
      vendor: match.vendor_id,
      database: match.api_reference,
    });
    this.comparePage.rememberUrlState();
  }

  private applySelectionFromService(selection: ComparedDatabase[]): void {
    if (this.isLoading) {
      return;
    }

    if (!selection.length) {
      if (!this.databases.length && !this.instances.length) {
        return;
      }

      this.databases = [];
      this.instances = [];
      this.instancesRaw = "";
      this.lineCompareServers = [];
      this.propertySections = [];
      this.priceRows = [];
      this.baselineDatabase = null;
      this.comparePage.setCustomBreadcrumb(0);
      this.comparePage.syncSavedComparisonChrome();
      if (this.route.snapshot.paramMap.get("id")) {
        this.serverCompare.syncDatabaseCompareRoute();
      } else {
        this.comparePage.syncUrlState();
      }
      return;
    }

    if (!this.instances.length) {
      return;
    }

    const nextDatabases: LoadedCompareDatabase[] = [];
    const indexMap: number[] = [];

    for (const item of selection) {
      const oldIndex = this.databases.findIndex(
        (database) =>
          database.vendor_id === item.vendor &&
          database.api_reference === item.database,
      );

      if (oldIndex === -1) {
        this.serverCompare.syncDatabaseCompareRoute();
        return;
      }

      indexMap.push(oldIndex);
      nextDatabases.push(this.databases[oldIndex]);
    }

    const orderUnchanged =
      indexMap.length === this.databases.length &&
      indexMap.every((oldIndex, index) => oldIndex === index);

    if (orderUnchanged) {
      return;
    }

    if (this.route.snapshot.paramMap.get("id")) {
      this.serverCompare.syncDatabaseCompareRoute();
    }

    this.databases = nextDatabases;
    this.instances = selection.map((item) => ({
      display_name: item.display_name,
      vendor: item.vendor,
      database: item.database,
    }));
    this.instancesRaw = btoa(JSON.stringify(this.instances));
    this.comparePage.setCustomBreadcrumb(this.databases.length);

    if (
      this.baselineDatabase &&
      !this.databases.some((database) => this.isBaselineDatabase(database))
    ) {
      this.baselineDatabase = null;
    }

    this.propertySections = this.compareSpecs.buildPropertySections(
      this.databases,
    );
    this.priceRows = this.compareSpecs.buildPriceRows(this.databases);
    this.refreshLineCompareServers();
    if (!this.route.snapshot.paramMap.get("id")) {
      this.comparePage.syncUrlState();
    }
    this.refreshCompareTableLayout();
  }

  private applyBaselineFromService(
    baseline: DatabaseCompareBaseline | null,
  ): void {
    if (this.isLoading) {
      return;
    }

    if (!baseline) {
      this.baselineDatabase = null;
      this.comparePage.syncUrlState();
      return;
    }

    this.baselineDatabase =
      this.databases.find(
        (item) =>
          item.vendor_id === baseline.vendor &&
          item.api_reference === baseline.database,
      ) || null;
    this.comparePage.syncUrlState();
  }

  private getCompareInstancesForSave(): ComparedDatabase[] {
    return this.instances.map((instance) => ({
      display_name: instance.display_name,
      vendor: instance.vendor,
      database: instance.database,
    }));
  }

  private refreshLineCompareServers(): void {
    this.lineCompareServers = this.pgbench.lineServers(this.databases);
  }

  updateEmbeddableWidgets() {
    this.embeddableWidgets = [
      DATABASE_COMPARE_SPECS_WIDGET,
      ...(this.hasPgbenchCompareChart()
        ? [{ id: DATABASE_PGBENCH_WIDGET_ID, name: this.pgbenchMeta.title }]
        : []),
    ];
  }

  hasPgbenchCompareChart(): boolean {
    return this.lineCompareServers.some((server) =>
      hasPgbenchScores(server.benchmark_scores),
    );
  }
}
