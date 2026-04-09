import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute, Params, RouterLink } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { Subject, Subscription, debounceTime } from "rxjs";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import {
  SearchBarComponent,
  SearchBarBenchmarkConfigGroup,
  SearchBarBenchmarkConfigOption,
  SearchBarCustomControl,
  SearchBarParameter,
} from "../../components/search-bar/search-bar.component";
import {
  BenchmarkScore,
  OrderDir,
  SearchServersServersGetData,
  SearchServersServersGetParams,
  ServerPKs,
} from "../../../../sdk/data-contracts";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ServerCompareService } from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import { encodeQueryParams } from "../../tools/queryParamFunctions";
import openApiSpec from "../../../../sdk/openapi.json";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import {
  ADVISOR_BREADCRUMBS,
  ADVISOR_DEFAULT_SERVER_COLUMNS,
  ADVISOR_FILTER_CATEGORIES,
  ADVISOR_OPTIMIZATION_GOAL_OPTIONS,
  ADVISOR_PAGE_LIMITS,
  ADVISOR_TABLE_COLUMNS,
} from "./advisor.constants";
import {
  ADVISOR_PAGE_DESCRIPTION,
  ADVISOR_PAGE_TITLE,
  ADVISOR_RESULTS_PANEL_DESCRIPTION,
  ADVISOR_SEO,
} from "./advisor.copy";
import { AdvisorUiService } from "./advisor-ui.service";
import { AdvisorBaselineServer, AdvisorTableColumn } from "./advisor.types";
import { normalizeBenchmarkConfig, stableStringify } from "./advisor.utils";

const ADVISOR_RECOMMENDATION_DEBOUNCE_MS = 350;
const ADVISOR_RECOMMENDATION_CACHE_TTL_MS = 60_000;

type RecommendationRequest = {
  key: string;
  query: SearchServersServersGetParams;
};

type RecommendationCacheEntry = {
  recommendations: SearchServersServersGetData;
  totalCount: number;
  totalPages: number;
  cachedAt: number;
};

@Component({
  selector: "app-advisor",
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    LucideAngularModule,
    LoadingSpinnerComponent,
    RouterLink,
    SearchBarComponent,
  ],
  templateUrl: "./advisor.component.html",
  styleUrl: "./advisor.component.scss",
})
export class AdvisorComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private seoHandler = inject(SeoHandlerService);
  private keeperApi = inject(KeeperAPIService);
  private route = inject(ActivatedRoute);
  private serverCompare = inject(ServerCompareService);
  private toastService = inject(ToastService);
  private advisorUi = inject(AdvisorUiService);
  private compareSubscription = new Subscription();
  private lastEncodedQuery: string | null = null;
  private clipboardResetTimeout: ReturnType<typeof setTimeout> | null = null;
  private recommendationRequests = new Subject<RecommendationRequest | null>();
  private recommendationCache = new Map<string, RecommendationCacheEntry>();
  private recommendationRequestVersion = 0;
  private activeRecommendationRequestKey: string | null = null;

  readonly title = ADVISOR_PAGE_TITLE;
  readonly description = ADVISOR_PAGE_DESCRIPTION;
  readonly resultsPanelDescription = ADVISOR_RESULTS_PANEL_DESCRIPTION;

  readonly breadcrumbs = signal<BreadcrumbSegment[]>(ADVISOR_BREADCRUMBS);

  readonly isCollapsed = signal(false);
  readonly query = signal<Record<string, unknown>>({});
  readonly serverTableRows = signal<AdvisorBaselineServer[]>([]);
  readonly baselineServerInput = signal("");
  readonly selectedBaselineServer = signal<AdvisorBaselineServer | null>(null);
  readonly isLoadingBaselineServers = signal(false);
  readonly benchmarkConfigInput = signal("");
  readonly selectedBenchmarkConfig =
    signal<SearchBarBenchmarkConfigOption | null>(null);
  readonly benchmarkConfigOptions = signal<SearchBarBenchmarkConfigOption[]>(
    [],
  );
  readonly isLoadingBenchmarkConfigs = signal(false);
  readonly baselineBenchmarkScores = signal<BenchmarkScore[]>([]);
  readonly isLoadingBaselineBenchmarkScores = signal(false);
  readonly optimizationGoal = signal<
    "performance" | "cost" | "cost-efficiency"
  >("cost");
  readonly averageCpuUtilization = signal<number | null>(null);
  readonly minimumMemoryGiB = signal<number | null>(0.5);
  readonly peakGpuMemoryGiB = signal<number>(0);
  readonly recommendations = signal<SearchServersServersGetData>([]);
  readonly isLoadingRecommendations = signal(false);
  readonly totalRecommendationCount = signal(0);
  readonly compareSelectionKeys = signal<string[]>([]);
  readonly clipboardIcon = signal("clipboard");
  readonly pendingBaselineVendorId = signal<string | null>(null);
  readonly pendingBaselineApiReference = signal<string | null>(null);
  readonly pendingWorkloadId = signal<string | null>(null);
  readonly pendingWorkloadConfig = signal<string | null>(null);
  readonly hasRestoredRouteState = signal(false);
  readonly page = signal(1);
  readonly limit = signal(25);
  readonly totalPages = signal(0);
  readonly manualOrderBy = signal<string | undefined>(undefined);
  readonly manualOrderDir = signal<OrderDir | undefined>(undefined);
  readonly pageLimits = ADVISOR_PAGE_LIMITS;

  readonly advisorFilterCategories = ADVISOR_FILTER_CATEGORIES;

  searchParameters: SearchBarParameter[] = [];
  readonly optimizationGoalOptions = ADVISOR_OPTIMIZATION_GOAL_OPTIONS;
  readonly advisorTableColumns: AdvisorTableColumn[] = ADVISOR_TABLE_COLUMNS;

  readonly activeFilterCount = computed(() => Object.keys(this.query()).length);
  readonly filteredBaselineServers = computed(() => {
    return this.advisorUi.filterBaselineServers(
      this.serverTableRows(),
      this.baselineServerInput(),
    );
  });

  readonly visibleBenchmarkConfigOptions = computed(() => {
    const searchTerm = this.benchmarkConfigInput().trim().toLowerCase();
    const options = this.benchmarkConfigOptions();

    if (searchTerm.length < 3) {
      return options;
    }

    return options.filter((option) => {
      const category = (
        option.category ||
        option.framework ||
        ""
      ).toLowerCase();
      const displayName = option.displayName.toLowerCase();
      const config = option.config.toLowerCase();
      const description = (
        option.benchmarkTemplate?.description || ""
      ).toLowerCase();

      return (
        category.includes(searchTerm) ||
        displayName.includes(searchTerm) ||
        config.includes(searchTerm) ||
        description.includes(searchTerm)
      );
    });
  });

  readonly benchmarkGroups = computed<SearchBarBenchmarkConfigGroup[]>(() => {
    const grouped = new Map<string, SearchBarBenchmarkConfigOption[]>();

    for (const option of this.visibleBenchmarkConfigOptions()) {
      const groupName = option.category || option.framework || "Other";
      if (!grouped.has(groupName)) {
        grouped.set(groupName, []);
      }
      grouped.get(groupName)!.push(option);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, options]) => ({
        name,
        options: options.sort((left, right) =>
          left.displayName.localeCompare(right.displayName),
        ),
      }));
  });

  readonly recommendationOrderBy = computed(() => {
    switch (this.optimizationGoal()) {
      case "performance":
        return "selected_benchmark_score";
      case "cost-efficiency":
        return "selected_benchmark_score_per_price";
      case "cost":
      default:
        return "min_price";
    }
  });

  readonly matchedBaselineBenchmarkScore = computed<BenchmarkScore | null>(
    () => {
      const selectedBenchmarkConfig = this.selectedBenchmarkConfig();

      if (!selectedBenchmarkConfig) {
        return null;
      }

      const selectedConfigKey = normalizeBenchmarkConfig(
        selectedBenchmarkConfig.config,
      );

      return (
        this.baselineBenchmarkScores().find((benchmarkScore) => {
          return (
            benchmarkScore.benchmark_id ===
              selectedBenchmarkConfig.benchmark_id &&
            normalizeBenchmarkConfig(benchmarkScore.config) ===
              selectedConfigKey
          );
        }) || null
      );
    },
  );

  readonly benchmarkScoreMinimum = computed<number | null>(() => {
    const benchmarkScore = this.matchedBaselineBenchmarkScore();
    const cpuUtilization = this.averageCpuUtilization();

    if (!benchmarkScore || cpuUtilization === null) {
      return null;
    }

    return Number(((benchmarkScore.score * cpuUtilization) / 100).toFixed(2));
  });

  readonly missingRequiredInputs = computed(() => {
    const missing: string[] = [];

    if (!this.selectedBaselineServer()) {
      missing.push("Baseline server");
    }

    if (!this.selectedBenchmarkConfig()) {
      missing.push("Server workload");
    }

    if (!this.optimizationGoal()) {
      missing.push("Optimization goal");
    }

    if (this.averageCpuUtilization() === null) {
      missing.push("Average utilization");
    }

    if (this.minimumMemoryGiB() === null) {
      missing.push("Minimum memory");
    }

    return missing;
  });

  readonly canRequestRecommendations = computed(
    () =>
      this.missingRequiredInputs().length === 0 &&
      this.matchedBaselineBenchmarkScore() !== null,
  );
  readonly topRecommendation = computed<ServerPKs | null>(
    () => this.recommendations()[0] || null,
  );
  readonly recommendationSummary = computed(() =>
    this.advisorUi.buildRecommendationSummary(this.totalRecommendationCount()),
  );
  readonly recommendationEmptyStateMessage = computed(() =>
    this.advisorUi.buildMissingInputsMessage(this.missingRequiredInputs()),
  );
  readonly compareCount = computed(() => this.compareSelectionKeys().length);
  readonly isBaselineSelectedForCompare = computed(() => {
    const selectedBaselineServer = this.selectedBaselineServer();

    if (!selectedBaselineServer) {
      return false;
    }

    return this.compareSelectionKeys().includes(
      this.getCompareKey(selectedBaselineServer),
    );
  });
  readonly baselineCompareButtonLabel = computed(() =>
    this.isBaselineSelectedForCompare()
      ? "Remove baseline"
      : "Compare baseline",
  );
  readonly activeOrderBy = computed(
    () => this.manualOrderBy() || this.recommendationOrderBy(),
  );
  readonly activeOrderDir = computed(
    () => this.manualOrderDir() || OrderDir.Desc,
  );

  readonly recommendationQuery = computed<SearchServersServersGetParams | null>(
    () => {
      const selectedBenchmarkConfig = this.selectedBenchmarkConfig();
      const benchmarkScoreMinimum = this.benchmarkScoreMinimum();
      const minimumMemoryGiB = this.minimumMemoryGiB();

      if (
        !this.canRequestRecommendations() ||
        !selectedBenchmarkConfig ||
        benchmarkScoreMinimum === null ||
        minimumMemoryGiB === null
      ) {
        return null;
      }

      const sharedQuery = {
        ...(this.query() as SearchServersServersGetParams),
      };

      return {
        ...sharedQuery,
        benchmark_id: selectedBenchmarkConfig.benchmark_id,
        benchmark_config: selectedBenchmarkConfig.config,
        benchmark_score_min: benchmarkScoreMinimum,
        memory_min: minimumMemoryGiB,
        gpu_memory_total:
          this.peakGpuMemoryGiB() > 0 ? this.peakGpuMemoryGiB() : undefined,
        order_by: this.activeOrderBy(),
        order_dir: this.activeOrderDir(),
        limit: this.limit(),
        page: this.page(),
        add_total_count_header: true,
      };
    },
  );

  readonly customControls = computed<SearchBarCustomControl[]>(() => [
    {
      name: "baseline_server",
      category_id: "advisor",
      type: "serverAutocomplete",
      title: "Baseline Server",
      placeholder: "Search for server...",
      required: true,
      minCharacters: 3,
      inputValue: this.baselineServerInput(),
      selectedServer: this.selectedBaselineServer(),
      options: this.filteredBaselineServers(),
      emptyMessage: this.isLoadingBaselineServers()
        ? "Loading server catalog..."
        : "No matching servers found.",
    },
    {
      name: "server_workload",
      category_id: "advisor",
      type: "benchmarkConfigSelect",
      title: "Server workload",
      placeholder: "Search benchmark or browse categories...",
      required: true,
      minCharacters: 3,
      inputValue: this.benchmarkConfigInput(),
      selectedBenchmarkConfig: this.selectedBenchmarkConfig(),
      benchmarkOptions: this.visibleBenchmarkConfigOptions(),
      benchmarkGroups: this.benchmarkGroups(),
      emptyMessage: this.isLoadingBenchmarkConfigs()
        ? "Loading benchmark workloads..."
        : "No matching workloads found.",
    },
    {
      name: "optimization_goal",
      category_id: "advisor",
      type: "singleSelect",
      title: "Optimization goal",
      required: true,
      description:
        "Selecting performance will search for servers delivering higher performance for the same price, while selecting cost-efficiency will find the cheapest option of right-sized server types.",
      selectedValue: this.optimizationGoal(),
      selectOptions: this.optimizationGoalOptions,
    },
    {
      name: "average_cpu_utilization",
      category_id: "advisor",
      type: "rangeSlider",
      title: "Average utilization",
      required: true,
      description:
        "The selected workload score threshold is derived from the baseline server score scaled by this expected Average utilization.",
      numericValue: this.averageCpuUtilization(),
      min: 0,
      max: 100,
      step: 10,
      unit: "%",
      tickValues: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      showUnitInTicks: false,
    },
    {
      name: "minimum_memory",
      category_id: "advisor",
      type: "powerOfTwoStepper",
      title: "Minimum memory",
      required: true,
      description:
        "Memory requirement in GB. The stepper follows powers of two starting at 0.5 GB.",
      numericValue: this.minimumMemoryGiB(),
      unit: "GB",
      defaultNumericValue: 0.5,
    },
    {
      name: "peak_gpu_memory",
      category_id: "advisor",
      type: "powerOfTwoStepper",
      title: "Peak GPU memory usage",
      description:
        "Total GPU memory requirement in GB. Leave at 0 to avoid applying GPU filters.",
      numericValue: this.peakGpuMemoryGiB(),
      unit: "GB",
      allowZero: true,
      defaultNumericValue: 0,
    },
  ]);

  constructor() {
    this.compareSubscription.add(
      this.recommendationRequests
        .pipe(debounceTime(ADVISOR_RECOMMENDATION_DEBOUNCE_MS))
        .subscribe((request) => {
          if (!request) {
            return;
          }

          void this.requestRecommendations(request.key, request.query);
        }),
    );

    effect(() => {
      const pendingBaselineVendorId = this.pendingBaselineVendorId();
      const pendingBaselineApiReference = this.pendingBaselineApiReference();

      if (!pendingBaselineVendorId || !pendingBaselineApiReference) {
        return;
      }

      const matchedServer = this.serverTableRows().find((server) => {
        return (
          server.vendor_id === pendingBaselineVendorId &&
          server.api_reference === pendingBaselineApiReference
        );
      });

      if (!matchedServer) {
        return;
      }

      this.selectedBaselineServer.set(matchedServer);
      this.baselineServerInput.set(
        `${matchedServer.vendor_id} ${matchedServer.api_reference}`,
      );
      this.pendingBaselineVendorId.set(null);
      this.pendingBaselineApiReference.set(null);
    });

    effect(() => {
      const pendingWorkloadId = this.pendingWorkloadId();
      const pendingWorkloadConfig = this.pendingWorkloadConfig();

      if (!pendingWorkloadId) {
        return;
      }

      const matchedWorkload = this.benchmarkConfigOptions().find((option) => {
        return (
          option.benchmark_id === pendingWorkloadId &&
          option.config === (pendingWorkloadConfig || "{}")
        );
      });

      if (!matchedWorkload) {
        return;
      }

      this.selectedBenchmarkConfig.set(matchedWorkload);
      this.benchmarkConfigInput.set(matchedWorkload.displayName);
      this.pendingWorkloadId.set(null);
      this.pendingWorkloadConfig.set(null);
    });

    effect(() => {
      const selectedBaselineServer = this.selectedBaselineServer();

      if (!selectedBaselineServer) {
        this.baselineBenchmarkScores.set([]);
        return;
      }

      void this.loadBaselineBenchmarkScores(selectedBaselineServer);
    });

    effect(() => {
      const recommendationQuery = this.recommendationQuery();

      if (!recommendationQuery) {
        this.recommendationRequestVersion += 1;
        this.activeRecommendationRequestKey = null;
        this.resetRecommendationState();
        this.recommendationRequests.next(null);
        return;
      }

      this.recommendationRequests.next({
        key: this.getRecommendationQueryKey(recommendationQuery),
        query: recommendationQuery,
      });
    });

    effect(() => {
      if (
        !this.hasRestoredRouteState() ||
        !isPlatformBrowser(this.platformId)
      ) {
        return;
      }

      const encodedQuery = encodeQueryParams(this.getUrlStateQueryParams());

      if (encodedQuery === this.lastEncodedQuery) {
        return;
      }

      this.lastEncodedQuery = encodedQuery;
      const path = window.location.pathname || "/advisor";

      if (encodedQuery?.length) {
        window.history.pushState({}, "", `${path}?${encodedQuery}`);
      } else {
        window.history.pushState({}, "", path);
      }
    });
  }

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      ADVISOR_SEO.title,
      ADVISOR_SEO.description,
      ADVISOR_SEO.keywords,
    );

    const parameters = openApiSpec.paths["/servers"].get.parameters || [];
    this.searchParameters = parameters
      .filter((p: any) => p.name !== "regions")
      .map(
        (parameter: any): SearchBarParameter => ({
          name: parameter.name,
          modelValue: null,
          schema: parameter.schema,
        }),
      );

    this.loadBaselineServerRows();
    this.loadBenchmarkConfigs();
    this.restoreStateFromRoute();
    this.syncCompareSelection();
    this.compareSubscription.add(
      this.serverCompare.selectionChanged.subscribe(() => {
        this.syncCompareSelection();
      }),
    );
  }

  ngOnDestroy(): void {
    this.compareSubscription.unsubscribe();

    if (this.clipboardResetTimeout) {
      clearTimeout(this.clipboardResetTimeout);
      this.clipboardResetTimeout = null;
    }
  }

  toggleCollapse(): void {
    this.isCollapsed.update((value) => !value);
  }

  toggleOrdering(column: AdvisorTableColumn): void {
    if (!column.orderField) {
      return;
    }

    if (this.manualOrderBy() === column.orderField) {
      if (this.manualOrderDir() === OrderDir.Desc) {
        this.manualOrderDir.set(OrderDir.Asc);
      } else {
        this.manualOrderBy.set(undefined);
        this.manualOrderDir.set(undefined);
      }
    } else {
      this.manualOrderBy.set(column.orderField);
      this.manualOrderDir.set(OrderDir.Desc);
    }

    this.page.set(1);
  }

  getOrderingIcon(column: AdvisorTableColumn): string | null {
    if (!column.orderField || this.activeOrderBy() !== column.orderField) {
      return null;
    }

    return this.activeOrderDir() === OrderDir.Desc
      ? "arrow-down-wide-narrow"
      : "arrow-down-narrow-wide";
  }

  selectPageSize(limit: number): void {
    this.limit.set(limit);
    this.page.set(1);
  }

  goToPreviousPage(): void {
    if (this.page() > 1) {
      this.page.update((page) => page - 1);
    }
  }

  goToNextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((page) => page + 1);
    }
  }

  getVisiblePageNumbers(): number[] {
    const currentPage = this.page();
    const totalPages = this.totalPages();
    const min = Math.max(currentPage - 1, 1);
    const max = Math.min(currentPage + 1, totalPages);

    return Array.from({ length: Math.max(max - min + 1, 0) }, (_, index) => {
      return min + index;
    });
  }

  goToPage(pageTarget: number): void {
    const boundedPage = Math.max(1, Math.min(pageTarget, this.totalPages()));
    this.page.set(boundedPage);
  }

  formatMemoryGiB(value: number | null | undefined): string {
    if (!value) {
      return "-";
    }

    return `${(value / 1024).toFixed(1)} GiB`;
  }

  formatStorageGb(value: number | null | undefined): string {
    if (!value) {
      return "-";
    }

    return `${value} GB`;
  }

  formatPrice(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return "-";
    }

    return `${value} USD/hr`;
  }

  formatScore(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return "-";
    }

    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  showApiReference(item: ServerPKs): boolean {
    return (
      item.display_name !== item.api_reference &&
      item.display_name !== item.api_reference.replace("Standard_", "")
    );
  }

  isSelectedForCompare(server: ServerPKs): boolean {
    return this.compareSelectionKeys().includes(this.getCompareKey(server));
  }

  toggleCompareSelection(event: Event, server: ServerPKs): void {
    event.stopPropagation();

    const shouldSelect = !this.isSelectedForCompare(server);
    this.serverCompare.toggleCompare(shouldSelect, {
      server: server.api_reference,
      vendor: server.vendor_id,
      display_name: server.display_name,
    });
  }

  toggleCompareRecommendation(server: ServerPKs): void {
    const shouldSelect = !this.isSelectedForCompare(server);
    this.serverCompare.toggleCompare(shouldSelect, {
      server: server.api_reference,
      vendor: server.vendor_id,
      display_name: server.display_name,
    });
  }

  toggleBaselineCompare(): void {
    const selectedBaselineServer = this.selectedBaselineServer();

    if (!selectedBaselineServer) {
      return;
    }

    const shouldSelect = !this.isBaselineSelectedForCompare();
    this.serverCompare.toggleCompare(shouldSelect, {
      server: selectedBaselineServer.api_reference,
      vendor: selectedBaselineServer.vendor_id,
      display_name:
        selectedBaselineServer.display_name ||
        selectedBaselineServer.api_reference,
    });
  }

  clearCompareSelection(): void {
    this.serverCompare.clearCompare();
  }

  async clipboardURL(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      this.clipboardIcon.set("check");
      this.toastService.show({
        title: "Link copied to clipboard!",
        type: "success",
        duration: 2000,
      });

      if (this.clipboardResetTimeout) {
        clearTimeout(this.clipboardResetTimeout);
      }

      this.clipboardResetTimeout = setTimeout(() => {
        this.clipboardIcon.set("clipboard");
        this.clipboardResetTimeout = null;
      }, 3000);
    } catch (error) {
      console.error("Failed to copy advisor link", error);
      this.toastService.show({
        title: "Failed to copy link",
        body: "Clipboard access is not available in this browser context.",
        type: "error",
        duration: 3000,
      });
    }
  }

  openCompare(): void {
    this.serverCompare.openCompare();
  }

  onSearchChanged(query: Record<string, unknown>): void {
    this.query.set(query);
    this.page.set(1);
  }

  onCustomControlChanged(event: { name: string; value: unknown }): void {
    if (event.name === "baseline_server") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as {
              inputValue?: string;
              selectedServer?: AdvisorBaselineServer | null;
            })
          : {};

      this.baselineServerInput.set(nextValue.inputValue || "");
      this.selectedBaselineServer.set(nextValue.selectedServer || null);
      this.pendingBaselineVendorId.set(null);
      this.pendingBaselineApiReference.set(null);
      this.page.set(1);
      return;
    }

    if (event.name === "server_workload") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as {
              inputValue?: string;
              selectedBenchmarkConfig?: SearchBarBenchmarkConfigOption | null;
            })
          : {};

      this.benchmarkConfigInput.set(nextValue.inputValue || "");
      this.selectedBenchmarkConfig.set(
        nextValue.selectedBenchmarkConfig || null,
      );
      this.pendingWorkloadId.set(null);
      this.pendingWorkloadConfig.set(null);
      this.page.set(1);
      return;
    }

    if (event.name === "optimization_goal") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as { selectedValue?: string | null })
          : {};

      const selectedValue = nextValue.selectedValue;
      if (
        selectedValue === "performance" ||
        selectedValue === "cost" ||
        selectedValue === "cost-efficiency"
      ) {
        this.optimizationGoal.set(selectedValue);
      }

      this.page.set(1);

      return;
    }

    if (event.name === "average_cpu_utilization") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as { numericValue?: number | null })
          : {};

      this.averageCpuUtilization.set(nextValue.numericValue ?? null);
      this.page.set(1);
      return;
    }

    if (event.name === "minimum_memory") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as { numericValue?: number | null })
          : {};

      this.minimumMemoryGiB.set(nextValue.numericValue ?? 0.5);
      this.page.set(1);
      return;
    }

    if (event.name === "peak_gpu_memory") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as { numericValue?: number | null })
          : {};

      this.peakGpuMemoryGiB.set(nextValue.numericValue ?? 0);
      this.page.set(1);
    }
  }

  clearFilters(): void {
    const defaultBenchmarkConfig = this.getDefaultBenchmarkConfig();

    this.query.set({});
    this.selectedBaselineServer.set(null);
    this.baselineServerInput.set("");
    this.pendingBaselineVendorId.set(null);
    this.pendingBaselineApiReference.set(null);
    this.selectedBenchmarkConfig.set(defaultBenchmarkConfig);
    this.benchmarkConfigInput.set(defaultBenchmarkConfig?.displayName || "");
    this.pendingWorkloadId.set(null);
    this.pendingWorkloadConfig.set(null);
    this.optimizationGoal.set("cost");
    this.averageCpuUtilization.set(null);
    this.minimumMemoryGiB.set(0.5);
    this.peakGpuMemoryGiB.set(0);
    this.page.set(1);
    this.limit.set(25);
    this.manualOrderBy.set(undefined);
    this.manualOrderDir.set(undefined);
  }

  private loadBaselineServerRows(): void {
    this.isLoadingBaselineServers.set(true);

    this.keeperApi
      .getServersSelect([...ADVISOR_DEFAULT_SERVER_COLUMNS])
      .then((response) => {
        this.serverTableRows.set(response?.body || []);
      })
      .catch((error) => {
        console.error("Failed to preload advisor baseline servers", error);
        this.serverTableRows.set([]);
      })
      .finally(() => {
        this.isLoadingBaselineServers.set(false);
      });
  }

  private loadBenchmarkConfigs(): void {
    this.isLoadingBenchmarkConfigs.set(true);

    Promise.all([
      this.keeperApi.getServerBenchmarkMeta(),
      this.keeperApi.getBenchmarkConfigs(),
    ])
      .then(([benchmarkMetaResponse, benchmarkConfigResponse]) => {
        const benchmarkMeta = benchmarkMetaResponse?.body || [];
        const benchmarkConfigs = benchmarkConfigResponse?.body || [];

        const options = benchmarkConfigs.map(
          (config: any): SearchBarBenchmarkConfigOption => {
            const benchmarkTemplate =
              benchmarkMeta.find(
                (benchmark: any) =>
                  benchmark.benchmark_id === config.benchmark_id,
              ) || null;

            const configTitle = (config.config || "").replaceAll(/[{}"]/g, "");
            const displayName = benchmarkTemplate?.name || config.benchmark_id;

            return {
              ...config,
              benchmarkTemplate,
              configTitle,
              displayName,
              framework:
                benchmarkTemplate?.framework ||
                config.category ||
                config.benchmark_id,
            };
          },
        );

        this.benchmarkConfigOptions.set(options);

        const defaultOption = this.getDefaultBenchmarkConfig(options);

        if (defaultOption && !this.selectedBenchmarkConfig()) {
          this.selectedBenchmarkConfig.set(defaultOption);
          this.benchmarkConfigInput.set(defaultOption.displayName);
        }
      })
      .catch((error) => {
        console.error("Failed to preload advisor benchmark configs", error);
        this.benchmarkConfigOptions.set([]);
      })
      .finally(() => {
        this.isLoadingBenchmarkConfigs.set(false);
      });
  }

  private async loadBaselineBenchmarkScores(
    server: AdvisorBaselineServer,
  ): Promise<void> {
    this.isLoadingBaselineBenchmarkScores.set(true);

    try {
      const response = await this.keeperApi.getServerBenchmark(
        server.vendor_id,
        server.api_reference,
      );

      this.baselineBenchmarkScores.set(response?.body || []);
    } catch (error) {
      console.error("Failed to load advisor baseline benchmark scores", error);
      this.baselineBenchmarkScores.set([]);
    } finally {
      this.isLoadingBaselineBenchmarkScores.set(false);
    }
  }

  private async requestRecommendations(
    requestKey: string,
    recommendationQuery: SearchServersServersGetParams,
  ): Promise<void> {
    const cachedResult = this.getCachedRecommendation(requestKey);

    if (cachedResult) {
      this.applyRecommendationResult(cachedResult);
      return;
    }

    if (
      this.isLoadingRecommendations() &&
      this.activeRecommendationRequestKey === requestKey
    ) {
      return;
    }

    const requestVersion = ++this.recommendationRequestVersion;
    this.activeRecommendationRequestKey = requestKey;
    this.isLoadingRecommendations.set(true);

    try {
      const response = await this.keeperApi.searchServers(recommendationQuery);
      if (
        requestVersion !== this.recommendationRequestVersion ||
        this.activeRecommendationRequestKey !== requestKey
      ) {
        return;
      }

      const totalCount = parseInt(
        response?.headers?.get("x-total-count") || "0",
        10,
      );
      const totalPages = Math.ceil(totalCount / this.limit());

      const nextResult: RecommendationCacheEntry = {
        recommendations: response?.body || [],
        totalCount,
        totalPages,
        cachedAt: Date.now(),
      };

      if (totalPages > 0 && this.page() > totalPages) {
        this.totalRecommendationCount.set(totalCount);
        this.totalPages.set(totalPages);
        this.page.set(totalPages);
        return;
      }

      this.recommendationCache.set(requestKey, nextResult);
      this.applyRecommendationResult(nextResult);
    } catch (error) {
      if (
        requestVersion !== this.recommendationRequestVersion ||
        this.activeRecommendationRequestKey !== requestKey
      ) {
        return;
      }

      console.error("Failed to load advisor recommendations", error);
      this.resetRecommendationState();
    } finally {
      if (
        requestVersion === this.recommendationRequestVersion &&
        this.activeRecommendationRequestKey === requestKey
      ) {
        this.isLoadingRecommendations.set(false);
      }
    }
  }

  private syncCompareSelection(): void {
    this.compareSelectionKeys.set(
      this.serverCompare.selectedForCompare.map((server) => {
        return `${server.vendor}::${server.server}`;
      }),
    );
  }

  private restoreStateFromRoute(): void {
    this.compareSubscription.add(
      this.route.queryParams.subscribe((params: Params) => {
        const queryParams = JSON.parse(JSON.stringify(params || {}));
        const customParamNames = new Set([
          "page",
          "limit",
          "order_by",
          "order_dir",
          "baseline_vendor",
          "baseline_server",
          "workload_id",
          "workload_config",
          "optimization_goal",
          "avg_cpu_utilization",
          "minimum_memory",
          "peak_gpu_memory",
        ]);

        const baseQuery = Object.fromEntries(
          Object.entries(queryParams).filter(
            ([key]) => !customParamNames.has(key),
          ),
        );

        this.query.set(baseQuery);
        this.page.set(
          queryParams.page ? parseInt(String(queryParams.page), 10) || 1 : 1,
        );
        this.limit.set(
          queryParams.limit
            ? parseInt(String(queryParams.limit), 10) || 25
            : 25,
        );
        this.manualOrderBy.set(
          queryParams.order_by ? String(queryParams.order_by) : undefined,
        );

        const orderDir = queryParams.order_dir;
        this.manualOrderDir.set(
          orderDir === OrderDir.Asc || orderDir === OrderDir.Desc
            ? orderDir
            : undefined,
        );

        this.pendingBaselineVendorId.set(
          queryParams.baseline_vendor
            ? String(queryParams.baseline_vendor)
            : null,
        );
        this.pendingBaselineApiReference.set(
          queryParams.baseline_server
            ? String(queryParams.baseline_server)
            : null,
        );

        if (!queryParams.baseline_vendor || !queryParams.baseline_server) {
          this.selectedBaselineServer.set(null);
          this.baselineServerInput.set("");
        }

        this.pendingWorkloadId.set(
          queryParams.workload_id ? String(queryParams.workload_id) : null,
        );
        this.pendingWorkloadConfig.set(
          queryParams.workload_config
            ? String(queryParams.workload_config)
            : null,
        );

        if (!queryParams.workload_id) {
          this.selectedBenchmarkConfig.set(null);
          this.benchmarkConfigInput.set("");
        }

        const optimizationGoal = queryParams.optimization_goal;
        if (
          optimizationGoal === "performance" ||
          optimizationGoal === "cost" ||
          optimizationGoal === "cost-efficiency"
        ) {
          this.optimizationGoal.set(optimizationGoal);
        } else {
          this.optimizationGoal.set("cost");
        }

        this.averageCpuUtilization.set(
          queryParams.avg_cpu_utilization !== undefined
            ? Number(queryParams.avg_cpu_utilization)
            : null,
        );
        this.minimumMemoryGiB.set(
          queryParams.minimum_memory !== undefined
            ? Number(queryParams.minimum_memory)
            : 0.5,
        );
        this.peakGpuMemoryGiB.set(
          queryParams.peak_gpu_memory !== undefined
            ? Number(queryParams.peak_gpu_memory)
            : 0,
        );

        this.lastEncodedQuery = encodeQueryParams(
          this.getUrlStateQueryParams(),
        );
        this.hasRestoredRouteState.set(true);
      }),
    );
  }

  private getUrlStateQueryParams(): Record<string, unknown> {
    const queryParams: Record<string, unknown> = { ...this.query() };
    const selectedBaselineServer = this.selectedBaselineServer();
    const selectedBenchmarkConfig = this.selectedBenchmarkConfig();

    const baselineVendorId =
      selectedBaselineServer?.vendor_id || this.pendingBaselineVendorId();
    const baselineApiReference =
      selectedBaselineServer?.api_reference ||
      this.pendingBaselineApiReference();

    if (baselineVendorId && baselineApiReference) {
      queryParams.baseline_vendor = baselineVendorId;
      queryParams.baseline_server = baselineApiReference;
    }

    const workloadId =
      selectedBenchmarkConfig?.benchmark_id || this.pendingWorkloadId();
    const workloadConfig =
      selectedBenchmarkConfig?.config || this.pendingWorkloadConfig();

    if (workloadId) {
      queryParams.workload_id = workloadId;
      queryParams.workload_config = workloadConfig || "{}";
    }

    if (this.optimizationGoal() !== "cost") {
      queryParams.optimization_goal = this.optimizationGoal();
    }

    if (this.averageCpuUtilization() !== null) {
      queryParams.avg_cpu_utilization = this.averageCpuUtilization();
    }

    if (this.minimumMemoryGiB() !== null) {
      queryParams.minimum_memory = this.minimumMemoryGiB();
    }

    if (this.peakGpuMemoryGiB() > 0) {
      queryParams.peak_gpu_memory = this.peakGpuMemoryGiB();
    }

    if (this.page() > 1) {
      queryParams.page = this.page();
    }

    if (this.limit() !== 25) {
      queryParams.limit = this.limit();
    }

    if (this.manualOrderBy() && this.manualOrderDir()) {
      queryParams.order_by = this.manualOrderBy();
      queryParams.order_dir = this.manualOrderDir();
    }

    return queryParams;
  }

  private getCompareKey(
    server: Pick<ServerPKs, "vendor_id" | "api_reference">,
  ): string {
    return `${server.vendor_id}::${server.api_reference}`;
  }

  private getRecommendationQueryKey(
    recommendationQuery: SearchServersServersGetParams,
  ): string {
    return stableStringify(recommendationQuery);
  }

  private getCachedRecommendation(
    requestKey: string,
  ): RecommendationCacheEntry | null {
    const cachedResult = this.recommendationCache.get(requestKey);

    if (!cachedResult) {
      return null;
    }

    if (
      Date.now() - cachedResult.cachedAt >
      ADVISOR_RECOMMENDATION_CACHE_TTL_MS
    ) {
      this.recommendationCache.delete(requestKey);
      return null;
    }

    return cachedResult;
  }

  private applyRecommendationResult(result: RecommendationCacheEntry): void {
    this.totalRecommendationCount.set(result.totalCount);
    this.totalPages.set(result.totalPages);
    this.recommendations.set(result.recommendations);
    this.isLoadingRecommendations.set(false);
  }

  private resetRecommendationState(): void {
    this.recommendations.set([]);
    this.totalRecommendationCount.set(0);
    this.totalPages.set(0);
    this.isLoadingRecommendations.set(false);
  }

  private getDefaultBenchmarkConfig(
    options: SearchBarBenchmarkConfigOption[] = this.benchmarkConfigOptions(),
  ): SearchBarBenchmarkConfigOption | null {
    return (
      options.find(
        (option) =>
          option.benchmark_id === "stress_ng:bestn" && option.config === "{}",
      ) || null
    );
  }
}
