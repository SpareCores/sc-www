import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { ActivatedRoute, Params, Router, RouterLink } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { Subject, Subscription, debounceTime } from "rxjs";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import {
  SearchBarComponent,
  SearchBarBenchmarkConfigGroup,
  SearchBarBenchmarkConfigOption,
  SearchBarCustomControl,
  SearchBarParameter,
} from "../../components/search-bar/search-bar.component";
import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";
import {
  BenchmarkScore,
  OrderDir,
  SearchServersServersGetData,
  SearchServersServersGetParams,
  ServerPrice,
  ServerPKs,
} from "../../../../sdk/data-contracts";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ServerCompareService } from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import { encodeQueryParams } from "../../tools/queryParamFunctions";
import {
  availableCurrencies as AVAILABLE_CURRENCIES,
  bestPriceAllocationTypes as BEST_PRICE_ALLOCATION_TYPES,
  BestPriceAllocationType,
  CurrencyOption,
} from "../../tools/shared_data";
import openApiSpec from "../../../../sdk/openapi.json";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { CpuCacheSizePipe } from "../../pipes/cpu-cache-size.pipe";
import { GpuCountPipe } from "../../pipes/gpu-count.pipe";
import {
  ADVISOR_BREADCRUMBS,
  ADVISOR_BASELINE_REGION_TOOLTIP,
  ADVISOR_CUSTOM_QUERY_PARAM_NAMES,
  ADVISOR_DEFAULT_CURRENCY,
  ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
  ADVISOR_DEFAULT_OPTIMIZATION_GOAL,
  ADVISOR_DEFAULT_PAGE_LIMIT,
  ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
  ADVISOR_DEFAULT_PRICE_ALLOCATION,
  ADVISOR_DEFAULT_SERVER_COLUMNS,
  ADVISOR_FILTER_CATEGORIES,
  ADVISOR_OPTIMIZATION_GOAL_OPTIONS,
  ADVISOR_PAGE_DESCRIPTION,
  ADVISOR_PAGE_LIMITS,
  ADVISOR_PRICE_ALLOCATION_TOOLTIP,
  ADVISOR_PAGE_TITLE,
  ADVISOR_REQUIRED_INPUT_LABELS,
  ADVISOR_SEO,
} from "./advisor.constants";
import { AdvisorUiService } from "./advisor-ui.service";
import {
  AdvisorBaselineServer,
  AdvisorOptimizationGoal,
  AdvisorRegionMetadata,
  AdvisorTableColumn,
} from "./advisor.types";
import {
  buildAdvisorRegionSelectOptions,
  cloneAdvisorTableColumns,
  encodeAdvisorColumnState,
  findAdvisorBenchmarkConfigOption,
  findAdvisorBenchmarkScore,
  getAdvisorCompareKey,
  getDefaultAdvisorBenchmarkConfig,
  hasCustomAdvisorColumns,
  isAdvisorOptimizationGoal,
  normalizeAdvisorQueryStringArray,
  restoreAdvisorColumnsFromQuery,
  stableStringify,
} from "./advisor.utils";

const ADVISOR_RECOMMENDATION_DEBOUNCE_MS = 350;

const [
  ADVISOR_BASELINE_SERVER_LABEL,
  ADVISOR_SERVER_WORKLOAD_LABEL,
  ADVISOR_OPTIMIZATION_GOAL_LABEL,
  ADVISOR_AVERAGE_UTILIZATION_LABEL,
  ADVISOR_MINIMUM_MEMORY_LABEL,
] = ADVISOR_REQUIRED_INPUT_LABELS;

const ADVISOR_CUSTOM_QUERY_PARAM_NAMES_SET = new Set<string>(
  ADVISOR_CUSTOM_QUERY_PARAM_NAMES,
);

type RecommendationRequest = {
  key: string;
  query: SearchServersServersGetParams;
};

type RecommendationResult = {
  recommendations: SearchServersServersGetData;
  totalCount: number;
  totalPages: number;
};

@Component({
  selector: "app-advisor",
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    FlowbiteDropdownDirective,
    LucideAngularModule,
    LoadingSpinnerComponent,
    PaginationComponent,
    GpuCountPipe,
    CpuCacheSizePipe,
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
  private router = inject(Router);
  private serverCompare = inject(ServerCompareService);
  private toastService = inject(ToastService);
  readonly advisorUi = inject(AdvisorUiService);
  readonly currencyDropdown =
    viewChild<FlowbiteDropdownDirective>("currencyDropdown");
  readonly pageDropdown = viewChild<FlowbiteDropdownDirective>("pageDropdown");
  private compareSubscription = new Subscription();
  private lastEncodedQuery: string | null = null;
  private clipboardResetTimeout: ReturnType<typeof setTimeout> | null = null;
  private recommendationRequests = new Subject<RecommendationRequest | null>();
  private recommendationRequestVersion = 0;
  private activeRecommendationRequestKey: string | null = null;
  private baselineRegionRequestVersion = 0;

  readonly title = ADVISOR_PAGE_TITLE;
  readonly description = ADVISOR_PAGE_DESCRIPTION;

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
  readonly optimizationGoal = signal<AdvisorOptimizationGoal>(
    ADVISOR_DEFAULT_OPTIMIZATION_GOAL,
  );
  readonly averageCpuUtilization = signal<number | null>(null);
  readonly limitToSameArchitecture = signal(false);
  readonly limitToSameCpuAllocation = signal(false);
  readonly minimumMemoryGiB = signal<number | null>(
    ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
  );
  readonly peakGpuMemoryGiB = signal<number>(
    ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
  );
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
  readonly limit = signal(ADVISOR_DEFAULT_PAGE_LIMIT);
  readonly totalPages = signal(0);
  readonly manualOrderBy = signal<string | undefined>(undefined);
  readonly manualOrderDir = signal<OrderDir | undefined>(undefined);
  readonly pageLimits = ADVISOR_PAGE_LIMITS;
  readonly availableCurrencies = AVAILABLE_CURRENCIES;
  private readonly defaultCurrency =
    this.availableCurrencies.find(
      (currency) => currency.slug === ADVISOR_DEFAULT_CURRENCY,
    ) || this.availableCurrencies[0];
  readonly selectedCurrency = signal<CurrencyOption>(this.defaultCurrency);
  readonly displayedCurrency = signal<CurrencyOption>(this.defaultCurrency);
  readonly bestPriceAllocationTypes = BEST_PRICE_ALLOCATION_TYPES;
  private readonly defaultBestPriceAllocation =
    this.bestPriceAllocationTypes.find(
      (allocation) => allocation.slug === ADVISOR_DEFAULT_PRICE_ALLOCATION,
    ) || this.bestPriceAllocationTypes[0];
  readonly bestPriceAllocation = signal<BestPriceAllocationType>(
    this.defaultBestPriceAllocation,
  );
  readonly isPriceAllocationEnabled = signal(false);
  readonly isBaselineRegionEnabled = signal(false);
  readonly selectedBaselineVendorRegion = signal<string | null>(null);
  readonly baselineServerPrices = signal<ServerPrice[]>([]);
  readonly regionMetadata = signal<AdvisorRegionMetadata[]>([]);
  readonly isLoadingBaselineRegions = signal(false);
  readonly possibleColumns = signal<AdvisorTableColumn[]>(
    cloneAdvisorTableColumns(),
  );
  readonly tableColumns = computed(() =>
    this.possibleColumns().filter((column) => column.show),
  );
  readonly hasCustomColumns = computed(() =>
    hasCustomAdvisorColumns(this.possibleColumns()),
  );

  readonly advisorFilterCategories = ADVISOR_FILTER_CATEGORIES;

  searchParameters: SearchBarParameter[] = [];
  readonly optimizationGoalOptions = ADVISOR_OPTIMIZATION_GOAL_OPTIONS;

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
      return findAdvisorBenchmarkScore(
        this.baselineBenchmarkScores(),
        this.selectedBenchmarkConfig(),
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
      missing.push(ADVISOR_BASELINE_SERVER_LABEL);
    }

    if (!this.selectedBenchmarkConfig()) {
      missing.push(ADVISOR_SERVER_WORKLOAD_LABEL);
    }

    if (!this.optimizationGoal()) {
      missing.push(ADVISOR_OPTIMIZATION_GOAL_LABEL);
    }

    if (this.averageCpuUtilization() === null) {
      missing.push(ADVISOR_AVERAGE_UTILIZATION_LABEL);
    }

    if (this.minimumMemoryGiB() === null) {
      missing.push(ADVISOR_MINIMUM_MEMORY_LABEL);
    }

    return missing;
  });

  readonly canRequestRecommendations = computed(
    () =>
      this.missingRequiredInputs().length === 0 &&
      this.matchedBaselineBenchmarkScore() !== null,
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
      getAdvisorCompareKey(selectedBaselineServer),
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
  readonly activeOrderDir = computed(() => {
    if (this.manualOrderDir()) {
      return this.manualOrderDir();
    }

    return this.optimizationGoal() === "cost" ? OrderDir.Asc : OrderDir.Desc;
  });

  readonly hasVendorRegionQuerySelections = computed(() => {
    return (
      normalizeAdvisorQueryStringArray(this.query().vendor_regions).length > 0
    );
  });

  readonly hasVendorQuerySelections = computed(() => {
    return normalizeAdvisorQueryStringArray(this.query().vendor).length > 0;
  });

  readonly hasScopedVendorSelections = computed(() => {
    return (
      this.hasVendorQuerySelections() || this.hasVendorRegionQuerySelections()
    );
  });

  readonly baselineRegionOptions = computed(() => {
    return buildAdvisorRegionSelectOptions(
      this.selectedBaselineServer()?.vendor_id || null,
      this.baselineServerPrices(),
      this.regionMetadata(),
    );
  });

  readonly isBaselineRegionControlDisabled = computed(() => {
    return !this.selectedBaselineServer() || this.hasScopedVendorSelections();
  });

  readonly advisorSearchBarExtraParameters = computed(() => {
    if (!this.isBaselineRegionEnabled() || this.hasScopedVendorSelections()) {
      return {};
    }

    const selectedBaselineVendorRegion = this.selectedBaselineVendorRegion();
    const selectedVendorId =
      selectedBaselineVendorRegion?.split("~")[0] || null;

    return {
      vendor: selectedVendorId ? [selectedVendorId] : [],
      vendor_regions: selectedBaselineVendorRegion
        ? [selectedBaselineVendorRegion]
        : [],
    };
  });

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
      const selectedBaselineServer = this.selectedBaselineServer();
      const vendorRegions = normalizeAdvisorQueryStringArray(
        sharedQuery.vendor_regions,
      );
      const dedicatedBaselineRegion =
        this.isBaselineRegionEnabled() && !vendorRegions.length
          ? this.selectedBaselineVendorRegion()
          : null;

      const recommendationQuery: SearchServersServersGetParams = {
        ...sharedQuery,
        benchmark_id: selectedBenchmarkConfig.benchmark_id,
        benchmark_config: selectedBenchmarkConfig.config,
        benchmark_score_min: benchmarkScoreMinimum,
        memory_min: minimumMemoryGiB,
        architecture:
          this.limitToSameArchitecture() &&
          selectedBaselineServer?.cpu_architecture
            ? selectedBaselineServer.cpu_architecture
            : sharedQuery.architecture,
        cpu_allocation:
          this.limitToSameCpuAllocation() &&
          selectedBaselineServer?.cpu_allocation
            ? selectedBaselineServer.cpu_allocation
            : sharedQuery.cpu_allocation,
        currency:
          this.selectedCurrency().slug !== "USD"
            ? this.selectedCurrency().slug
            : undefined,
        best_price_allocation:
          this.isPriceAllocationEnabled() &&
          this.bestPriceAllocation().slug !== "ANY"
            ? this.bestPriceAllocation().slug
            : undefined,
        gpu_memory_total:
          this.peakGpuMemoryGiB() > 0 ? this.peakGpuMemoryGiB() : undefined,
        order_by: this.activeOrderBy(),
        order_dir: this.activeOrderDir(),
        limit: this.limit(),
        page: this.page(),
        add_total_count_header: true,
      };

      if (dedicatedBaselineRegion) {
        recommendationQuery.vendor_regions =
          dedicatedBaselineRegion as SearchServersServersGetParams["vendor_regions"];
      }

      return recommendationQuery;
    },
  );

  readonly customControls = computed<SearchBarCustomControl[]>(() => {
    const controls: SearchBarCustomControl[] = [
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
          "The selected workload score threshold is derived from the baseline server score scaled by this expected average utilization.",
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
          "Memory requirement in GiB. You can type any value, or use the stepper to snap through powers of two starting at 0.5 GiB.",
        numericValue: this.minimumMemoryGiB(),
        numericFormat: "binaryMemory",
        min: 0.5,
        unit: "GiB",
        defaultNumericValue: 0.5,
      },
      {
        name: "peak_gpu_memory",
        category_id: "advisor",
        type: "powerOfTwoStepper",
        title: "Peak GPU memory usage",
        description:
          "Total GPU memory requirement in GiB. You can type any value, or use the stepper to snap through powers of two. Leave at 0 to avoid applying GPU filters.",
        numericValue: this.peakGpuMemoryGiB(),
        numericFormat: "binaryMemory",
        min: 0,
        unit: "GiB",
        allowZero: true,
        defaultNumericValue: 0,
      },
      {
        name: "limit_cpu_allocation",
        category_id: "advisor",
        type: "checkbox",
        sectionHeader: "Limit search for matching:",
        title: `CPU allocation (${this.selectedBaselineServer()?.cpu_allocation || "..."})`,
        checked: this.limitToSameCpuAllocation(),
        disabled: !this.selectedBaselineServer()?.cpu_allocation,
      },
      {
        name: "limit_architecture",
        category_id: "advisor",
        type: "checkbox",
        title: `CPU architecture (${this.selectedBaselineServer()?.cpu_architecture || "..."})`,
        checked: this.limitToSameArchitecture(),
        disabled: !this.selectedBaselineServer()?.cpu_architecture,
      },
      {
        name: "price_allocation_enabled",
        category_id: "advisor",
        type: "checkbox",
        title: "Price allocation",
        checked: this.isPriceAllocationEnabled(),
        description: ADVISOR_PRICE_ALLOCATION_TOOLTIP,
        descriptionDisplay: "tooltip",
      },
    ];

    if (this.isPriceAllocationEnabled()) {
      controls.push({
        name: "price_allocation",
        category_id: "advisor",
        type: "singleSelect",
        title: "Price allocation type",
        nested: true,
        hideTitle: true,
        selectedValue: this.bestPriceAllocation().slug,
        selectOptions: this.bestPriceAllocationTypes.map((allocation) => ({
          value: allocation.slug,
          label: allocation.name,
        })),
      });
    }

    controls.push({
      name: "baseline_region_enabled",
      category_id: "advisor",
      type: "checkbox",
      title: "Region",
      checked: this.isBaselineRegionEnabled(),
      disabled: this.isBaselineRegionControlDisabled(),
      description: ADVISOR_BASELINE_REGION_TOOLTIP,
      descriptionDisplay: "tooltip",
    });

    if (this.isBaselineRegionEnabled()) {
      controls.push({
        name: "baseline_region",
        category_id: "advisor",
        type: "singleSelect",
        title: "Available region",
        nested: true,
        hideTitle: true,
        placeholder: this.isLoadingBaselineRegions()
          ? "Loading regions..."
          : this.baselineRegionOptions().length > 0
            ? "Select region"
            : "No baseline regions available",
        selectedValue: this.selectedBaselineVendorRegion(),
        selectOptions: this.baselineRegionOptions(),
        disabled:
          this.isLoadingBaselineRegions() ||
          this.baselineRegionOptions().length === 0,
      });
    }

    return controls;
  });

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

      const matchedWorkload = findAdvisorBenchmarkConfigOption(
        this.benchmarkConfigOptions(),
        pendingWorkloadId,
        pendingWorkloadConfig,
      );

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
      const selectedBaselineServer = this.selectedBaselineServer();

      if (!selectedBaselineServer) {
        this.baselineServerPrices.set([]);
        this.isLoadingBaselineRegions.set(false);
        this.isBaselineRegionEnabled.set(false);
        this.selectedBaselineVendorRegion.set(null);
        return;
      }

      void this.loadBaselineRegionPrices(selectedBaselineServer);
    });

    effect(() => {
      const selectedBaselineServer = this.selectedBaselineServer();

      if (!selectedBaselineServer) {
        return;
      }

      if (this.isBaselineRegionControlDisabled()) {
        this.isBaselineRegionEnabled.set(false);
        this.selectedBaselineVendorRegion.set(null);
        return;
      }

      const selectedBaselineVendorRegion = this.selectedBaselineVendorRegion();

      if (
        !selectedBaselineVendorRegion ||
        this.isLoadingBaselineRegions() ||
        this.baselineRegionOptions().some((option) => {
          return option.value === selectedBaselineVendorRegion;
        })
      ) {
        return;
      }

      this.selectedBaselineVendorRegion.set(null);
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
        key: stableStringify(recommendationQuery),
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
    this.loadRegionMetadata();
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

    this.pageDropdown()?.hide();

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  }

  selectCurrency(currency: CurrencyOption): void {
    this.selectedCurrency.set(currency);
    this.page.set(1);
    this.currencyDropdown()?.hide();
  }

  setColumnVisibility(columnName: string, show: boolean): void {
    this.possibleColumns.update((columns) => {
      return columns.map((column) => {
        return column.name === columnName ? { ...column, show } : column;
      });
    });
  }

  openServerDetails(server: ServerPKs): void {
    const vendorId = this.advisorUi.getVendorLinkId(server);
    this.router.navigateByUrl(`/server/${vendorId}/${server.api_reference}`);
  }

  isSelectedForCompare(
    server: Pick<ServerPKs, "vendor_id" | "api_reference">,
  ): boolean {
    return this.compareSelectionKeys().includes(getAdvisorCompareKey(server));
  }

  isSelectedBaselineRecommendation(server: ServerPKs): boolean {
    const selectedBaselineServer = this.selectedBaselineServer();

    if (!selectedBaselineServer) {
      return false;
    }

    return (
      getAdvisorCompareKey(selectedBaselineServer) ===
      getAdvisorCompareKey(server)
    );
  }

  toggleCompareSelection(event: Event, server: ServerPKs): void {
    event.stopPropagation();
    this.toggleCompare(server);
  }

  toggleBaselineCompare(): void {
    const selectedBaselineServer = this.selectedBaselineServer();

    if (!selectedBaselineServer) {
      return;
    }

    this.serverCompare.toggleCompare(
      !this.isBaselineSelectedForCompare(),
      this.advisorUi.buildCompareTarget(selectedBaselineServer),
    );
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
    if (
      normalizeAdvisorQueryStringArray(query.vendor).length > 0 ||
      normalizeAdvisorQueryStringArray(query.vendor_regions).length > 0
    ) {
      this.isBaselineRegionEnabled.set(false);
      this.selectedBaselineVendorRegion.set(null);
    }

    this.query.set(query);
    this.page.set(1);
  }

  onCustomControlChanged(event: { name: string; value: unknown }): void {
    switch (event.name) {
      case "baseline_server":
        this.applyBaselineServerControlValue(event.value);
        break;
      case "limit_architecture":
        this.applyBooleanControlValue(
          this.limitToSameArchitecture,
          event.value,
        );
        break;
      case "limit_cpu_allocation":
        this.applyBooleanControlValue(
          this.limitToSameCpuAllocation,
          event.value,
        );
        break;
      case "server_workload":
        this.applyWorkloadControlValue(event.value);
        break;
      case "optimization_goal":
        this.applyOptimizationGoalControlValue(event.value);
        break;
      case "average_cpu_utilization":
        this.applyNumericControlValue(
          this.averageCpuUtilization,
          event.value,
          null,
        );
        break;
      case "minimum_memory":
        this.applyNumericControlValue(
          this.minimumMemoryGiB,
          event.value,
          ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
        );
        break;
      case "peak_gpu_memory":
        this.applyNumericControlValue(
          this.peakGpuMemoryGiB,
          event.value,
          ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
        );
        break;
      case "price_allocation_enabled":
        this.applyBooleanControlValue(
          this.isPriceAllocationEnabled,
          event.value,
        );
        break;
      case "price_allocation":
        this.applyPriceAllocationControlValue(event.value);
        break;
      case "baseline_region_enabled":
        this.applyBooleanControlValue(
          this.isBaselineRegionEnabled,
          event.value,
        );
        break;
      case "baseline_region":
        this.applyBaselineRegionControlValue(event.value);
        break;
      default:
        return;
    }

    this.page.set(1);
  }

  clearFilters(): void {
    const defaultBenchmarkConfig = getDefaultAdvisorBenchmarkConfig(
      this.benchmarkConfigOptions(),
    );

    this.query.set({});
    this.selectedBaselineServer.set(null);
    this.limitToSameArchitecture.set(false);
    this.limitToSameCpuAllocation.set(false);
    this.baselineServerInput.set("");
    this.pendingBaselineVendorId.set(null);
    this.pendingBaselineApiReference.set(null);
    this.selectedBenchmarkConfig.set(defaultBenchmarkConfig);
    this.benchmarkConfigInput.set(defaultBenchmarkConfig?.displayName || "");
    this.pendingWorkloadId.set(null);
    this.pendingWorkloadConfig.set(null);
    this.optimizationGoal.set(ADVISOR_DEFAULT_OPTIMIZATION_GOAL);
    this.averageCpuUtilization.set(null);
    this.minimumMemoryGiB.set(ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB);
    this.peakGpuMemoryGiB.set(ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB);
    this.selectedCurrency.set(this.defaultCurrency);
    this.displayedCurrency.set(this.defaultCurrency);
    this.bestPriceAllocation.set(this.defaultBestPriceAllocation);
    this.isPriceAllocationEnabled.set(false);
    this.isBaselineRegionEnabled.set(false);
    this.selectedBaselineVendorRegion.set(null);
    this.baselineServerPrices.set([]);
    this.possibleColumns.set(cloneAdvisorTableColumns());
    this.page.set(1);
    this.limit.set(ADVISOR_DEFAULT_PAGE_LIMIT);
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

        const defaultOption = getDefaultAdvisorBenchmarkConfig(options);

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
    try {
      const response = await this.keeperApi.getServerBenchmark(
        server.vendor_id,
        server.api_reference,
      );

      this.baselineBenchmarkScores.set(response?.body || []);
    } catch (error) {
      console.error("Failed to load advisor baseline benchmark scores", error);
      this.baselineBenchmarkScores.set([]);
    }
  }

  private loadRegionMetadata(): void {
    this.keeperApi
      .getRegions()
      .then((response) => {
        this.regionMetadata.set(response?.body || []);
      })
      .catch((error) => {
        console.error("Failed to preload advisor region metadata", error);
        this.regionMetadata.set([]);
      });
  }

  private async loadBaselineRegionPrices(
    server: AdvisorBaselineServer,
  ): Promise<void> {
    const requestVersion = ++this.baselineRegionRequestVersion;
    this.isLoadingBaselineRegions.set(true);

    try {
      const response = await this.keeperApi.getServerPrices(
        server.vendor_id,
        server.api_reference,
      );

      if (requestVersion !== this.baselineRegionRequestVersion) {
        return;
      }

      this.baselineServerPrices.set(response?.body || []);
    } catch (error) {
      if (requestVersion !== this.baselineRegionRequestVersion) {
        return;
      }

      console.error("Failed to load advisor baseline region options", error);
      this.baselineServerPrices.set([]);
    } finally {
      if (requestVersion === this.baselineRegionRequestVersion) {
        this.isLoadingBaselineRegions.set(false);
      }
    }
  }

  private async requestRecommendations(
    requestKey: string,
    recommendationQuery: SearchServersServersGetParams,
  ): Promise<void> {
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

      const nextResult: RecommendationResult = {
        recommendations: response?.body || [],
        totalCount,
        totalPages,
      };

      if (totalPages > 0 && this.page() > totalPages) {
        this.totalRecommendationCount.set(totalCount);
        this.totalPages.set(totalPages);
        this.page.set(totalPages);
        return;
      }

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

        const baseQuery = Object.fromEntries(
          Object.entries(queryParams).filter(
            ([key]) => !ADVISOR_CUSTOM_QUERY_PARAM_NAMES_SET.has(key),
          ),
        );

        const vendorRegions = normalizeAdvisorQueryStringArray(
          baseQuery.vendor_regions,
        );
        const vendors = normalizeAdvisorQueryStringArray(baseQuery.vendor);

        if (vendorRegions.length > 0) {
          baseQuery.vendor_regions = vendorRegions;
        } else {
          delete baseQuery.vendor_regions;
        }

        if (vendors.length > 0) {
          baseQuery.vendor = vendors;
        } else {
          delete baseQuery.vendor;
        }

        this.query.set(baseQuery);
        this.page.set(
          queryParams.page ? parseInt(String(queryParams.page), 10) || 1 : 1,
        );
        this.limit.set(
          queryParams.limit
            ? parseInt(String(queryParams.limit), 10) ||
                ADVISOR_DEFAULT_PAGE_LIMIT
            : ADVISOR_DEFAULT_PAGE_LIMIT,
        );

        this.selectedCurrency.set(
          queryParams.currency
            ? this.availableCurrencies.find(
                (currency) => currency.slug === String(queryParams.currency),
              ) || this.defaultCurrency
            : this.defaultCurrency,
        );
        this.displayedCurrency.set(this.selectedCurrency());
        this.bestPriceAllocation.set(
          queryParams.best_price_allocation
            ? this.bestPriceAllocationTypes.find((allocation) => {
                return (
                  allocation.slug === String(queryParams.best_price_allocation)
                );
              }) || this.defaultBestPriceAllocation
            : this.defaultBestPriceAllocation,
        );
        this.isPriceAllocationEnabled.set(
          queryParams.price_allocation_enabled === "true" ||
            Boolean(queryParams.best_price_allocation),
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
        this.possibleColumns.set(
          restoreAdvisorColumnsFromQuery(
            queryParams.columns,
            this.manualOrderBy(),
          ),
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
          this.limitToSameArchitecture.set(false);
          this.limitToSameCpuAllocation.set(false);
        } else {
          this.limitToSameArchitecture.set(
            queryParams.limit_architecture === "true",
          );
          this.limitToSameCpuAllocation.set(
            queryParams.limit_cpu_allocation === "true",
          );
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
        if (isAdvisorOptimizationGoal(optimizationGoal)) {
          this.optimizationGoal.set(optimizationGoal);
        } else {
          this.optimizationGoal.set(ADVISOR_DEFAULT_OPTIMIZATION_GOAL);
        }

        this.averageCpuUtilization.set(
          queryParams.avg_cpu_utilization !== undefined
            ? Number(queryParams.avg_cpu_utilization)
            : null,
        );
        this.minimumMemoryGiB.set(
          queryParams.minimum_memory !== undefined
            ? Number(queryParams.minimum_memory)
            : ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
        );
        this.peakGpuMemoryGiB.set(
          queryParams.peak_gpu_memory !== undefined
            ? Number(queryParams.peak_gpu_memory)
            : ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
        );
        this.isBaselineRegionEnabled.set(
          vendorRegions.length === 0 &&
            vendors.length === 0 &&
            (queryParams.baseline_region_enabled === "true" ||
              Boolean(queryParams.baseline_vendor_region)),
        );
        this.selectedBaselineVendorRegion.set(
          vendorRegions.length === 0 &&
            vendors.length === 0 &&
            queryParams.baseline_vendor_region
            ? String(queryParams.baseline_vendor_region)
            : null,
        );

        this.lastEncodedQuery = encodeQueryParams(
          this.getUrlStateQueryParams(),
        );
        this.hasRestoredRouteState.set(true);
      }),
    );
  }

  getUrlStateQueryParams(): Record<string, unknown> {
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

      if (
        this.limitToSameArchitecture() &&
        selectedBaselineServer?.cpu_architecture
      ) {
        queryParams.limit_architecture = "true";
      }

      if (
        this.limitToSameCpuAllocation() &&
        selectedBaselineServer?.cpu_allocation
      ) {
        queryParams.limit_cpu_allocation = "true";
      }
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

    if (this.limit() !== ADVISOR_DEFAULT_PAGE_LIMIT) {
      queryParams.limit = this.limit();
    }

    if (this.selectedCurrency().slug !== this.defaultCurrency.slug) {
      queryParams.currency = this.selectedCurrency().slug;
    }

    if (this.isPriceAllocationEnabled()) {
      queryParams.price_allocation_enabled = "true";

      if (
        this.bestPriceAllocation().slug !== this.defaultBestPriceAllocation.slug
      ) {
        queryParams.best_price_allocation = this.bestPriceAllocation().slug;
      }
    }

    if (
      this.isBaselineRegionEnabled() &&
      !this.hasVendorRegionQuerySelections()
    ) {
      queryParams.baseline_region_enabled = "true";

      if (this.selectedBaselineVendorRegion()) {
        queryParams.baseline_vendor_region =
          this.selectedBaselineVendorRegion();
      }
    }

    if (this.hasCustomColumns()) {
      queryParams.columns = encodeAdvisorColumnState(this.possibleColumns());
    }

    if (this.manualOrderBy() && this.manualOrderDir()) {
      queryParams.order_by = this.manualOrderBy();
      queryParams.order_dir = this.manualOrderDir();
    }

    return queryParams;
  }

  private applyRecommendationResult(result: RecommendationResult): void {
    this.totalRecommendationCount.set(result.totalCount);
    this.totalPages.set(result.totalPages);
    this.recommendations.set(result.recommendations);
    this.displayedCurrency.set(this.selectedCurrency());
    this.isLoadingRecommendations.set(false);
  }

  private resetRecommendationState(): void {
    this.recommendations.set([]);
    this.totalRecommendationCount.set(0);
    this.totalPages.set(0);
    this.isLoadingRecommendations.set(false);
  }

  private toggleCompare(server: {
    api_reference: string;
    vendor_id: string;
    display_name?: string | null;
  }): void {
    this.serverCompare.toggleCompare(
      !this.isSelectedForCompare(server),
      this.advisorUi.buildCompareTarget(server),
    );
  }

  private applyBaselineServerControlValue(value: unknown): void {
    const nextValue =
      value && typeof value === "object"
        ? (value as {
            inputValue?: string;
            selectedServer?: AdvisorBaselineServer | null;
          })
        : {};

    this.baselineServerInput.set(nextValue.inputValue || "");
    this.selectedBaselineServer.set(nextValue.selectedServer || null);
    this.pendingBaselineVendorId.set(null);
    this.pendingBaselineApiReference.set(null);

    if (!this.selectedBaselineServer()) {
      this.limitToSameArchitecture.set(false);
      this.limitToSameCpuAllocation.set(false);
    }
  }

  private applyBooleanControlValue(
    target: WritableSignal<boolean>,
    value: unknown,
  ): void {
    const nextValue =
      value && typeof value === "object"
        ? (value as { checked?: boolean })
        : {};

    target.set(nextValue.checked || false);
  }

  private applyWorkloadControlValue(value: unknown): void {
    const nextValue =
      value && typeof value === "object"
        ? (value as {
            inputValue?: string;
            selectedBenchmarkConfig?: SearchBarBenchmarkConfigOption | null;
          })
        : {};

    this.benchmarkConfigInput.set(nextValue.inputValue || "");
    this.selectedBenchmarkConfig.set(nextValue.selectedBenchmarkConfig || null);
    this.pendingWorkloadId.set(null);
    this.pendingWorkloadConfig.set(null);
  }

  private applyPriceAllocationControlValue(value: unknown): void {
    const selectedValue = this.getSelectedControlValue(value);

    if (!selectedValue) {
      this.bestPriceAllocation.set(this.defaultBestPriceAllocation);
      return;
    }

    this.bestPriceAllocation.set(
      this.bestPriceAllocationTypes.find((allocation) => {
        return allocation.slug === selectedValue;
      }) || this.defaultBestPriceAllocation,
    );
  }

  private applyBaselineRegionControlValue(value: unknown): void {
    this.selectedBaselineVendorRegion.set(this.getSelectedControlValue(value));
  }

  private applyOptimizationGoalControlValue(value: unknown): void {
    const nextValue =
      value && typeof value === "object"
        ? (value as { selectedValue?: unknown })
        : {};

    if (!isAdvisorOptimizationGoal(nextValue.selectedValue)) {
      return;
    }

    this.optimizationGoal.set(nextValue.selectedValue);
    this.manualOrderBy.set(undefined);
    this.manualOrderDir.set(undefined);
  }

  private applyNumericControlValue<T extends number | null>(
    target: WritableSignal<T>,
    value: unknown,
    fallback: T,
  ): void {
    const nextValue =
      value && typeof value === "object" ? (value as { numericValue?: T }) : {};

    target.set((nextValue.numericValue ?? fallback) as T);
  }

  private getSelectedControlValue(value: unknown): string | null {
    const nextValue =
      value && typeof value === "object"
        ? (value as { selectedValue?: unknown })
        : {};

    return typeof nextValue.selectedValue === "string"
      ? nextValue.selectedValue
      : null;
  }
}
