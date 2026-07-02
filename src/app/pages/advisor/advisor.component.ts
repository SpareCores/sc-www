import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
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

import { Modal, ModalOptions } from "flowbite";
import { Subject, Subscription, debounceTime } from "rxjs";
import {
  Benchmark,
  BenchmarkConfig,
  BenchmarkScore,
  BenchmarkScoreStatsItem,
  OrderDir,
  SearchServerPricesServerPricesGetParams,
  SearchServersServersGetData,
  SearchServersServersGetParams,
  ServerPKs,
  ServerPrice,
  ServerPriceWithPKs,
} from "../../../../sdk/data-contracts";
import openApiSpec from "../../../../sdk/openapi.json";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import {
  SearchBarBenchmarkConfigGroup,
  SearchBarBenchmarkConfigOption,
  SearchBarComponent,
  SearchBarCustomControl,
  SearchBarParameter,
  SearchBarParameterPlacement,
} from "../../components/search-bar/search-bar.component";
import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";
import { CpuCacheSizePipe } from "../../pipes/cpu-cache-size.pipe";
import { GpuCountPipe } from "../../pipes/gpu-count.pipe";
import { Ipv4CountPipe } from "../../pipes/ipv4-count.pipe";
import { MonthlyTrafficPipe } from "../../pipes/monthly-traffic.pipe";
import { NetworkSpeedPipe } from "../../pipes/network-speed.pipe";
import { StoragePipe } from "../../pipes/storage.pipe";
import { GpuMemoryPipe } from "../../pipes/gpu-memory.pipe";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { NeetoCalService } from "../../services/neeto-cal.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ServerCompareService } from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { encodeQueryParams } from "../../tools/queryParamFunctions";
import {
  availableCurrencies as AVAILABLE_CURRENCIES,
  bestPriceAllocationTypes as BEST_PRICE_ALLOCATION_TYPES,
  BestPriceAllocationType,
  CurrencyOption,
} from "../../tools/shared_data";
import { TableColumn, buildAdvisorColumns } from "../../tools/table-columns";
import { AdvisorUiService } from "./advisor-ui.service";
import {
  ADVISOR_AVERAGE_UTILIZATION_TITLE,
  ADVISOR_AVERAGE_UTILIZATION_TOOLTIP,
  ADVISOR_BASELINE_REGION_TOOLTIP,
  ADVISOR_BASELINE_SERVER_TITLE,
  ADVISOR_BASELINE_SERVER_TOOLTIP,
  ADVISOR_BASELINE_WORKLOAD_TITLE,
  ADVISOR_BASELINE_WORKLOAD_TOOLTIP,
  ADVISOR_BREADCRUMBS,
  ADVISOR_CUSTOM_QUERY_PARAM_NAMES,
  ADVISOR_DEFAULT_CURRENCY,
  ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
  ADVISOR_DEFAULT_OPTIMIZATION_GOAL,
  ADVISOR_DEFAULT_PAGE_LIMIT,
  ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
  ADVISOR_DEFAULT_PRICE_ALLOCATION,
  ADVISOR_DEFAULT_SERVER_COLUMNS,
  ADVISOR_DEFAULT_WORKLOAD_CONFIG,
  ADVISOR_DISABLED_BASELINE_WORKLOAD_MESSAGE,
  ADVISOR_EMPTY_BASELINE_WORKLOAD_ACTION_MESSAGE,
  ADVISOR_EMPTY_BASELINE_WORKLOAD_MESSAGE,
  ADVISOR_EMPTY_BASELINE_WORKLOAD_RESULTS_MESSAGE,
  ADVISOR_EXAMPLE_QUERY_PARAMS,
  ADVISOR_FILTER_CATEGORIES,
  ADVISOR_LOADING_BASELINE_WORKLOAD_MESSAGE,
  ADVISOR_MINIMUM_MEMORY_MIN_GIB,
  ADVISOR_OPTIMIZATION_GOAL_OPTIONS,
  ADVISOR_OPTIMIZATION_GOAL_TITLE,
  ADVISOR_PAGE_DESCRIPTION,
  ADVISOR_PAGE_LIMITS,
  ADVISOR_PAGE_TITLE,
  ADVISOR_PARAMETER_PLACEMENTS,
  ADVISOR_PRICE_ALLOCATION_TOOLTIP,
  ADVISOR_REQUIRED_GPU_MEMORY_TITLE,
  ADVISOR_REQUIRED_INPUT_LABELS,
  ADVISOR_REQUIRED_MEMORY_TITLE,
  ADVISOR_SEO,
  ADVISOR_WORKLOAD_SCORE_TOOLTIP,
} from "./advisor.constants";
import {
  AdvisorBaselinePriceAggregate,
  AdvisorBaselineServer,
  AdvisorMetricDelta,
  AdvisorOptimizationGoal,
  AdvisorPriceColumnKey,
  AdvisorRegionMetadata,
} from "./advisor.types";
import { Icon } from "../../components/icon/icon.js";
import {
  buildAdvisorRegionSelectOptions,
  encodeAdvisorColumnState,
  findAdvisorBenchmarkConfigOption,
  findAdvisorBenchmarkScore,
  getAdvisorBenchmarkConfigKey,
  getAdvisorCompareKey,
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
] = ADVISOR_REQUIRED_INPUT_LABELS;

const ADVISOR_MAX_PAGE_LIMIT = Math.max(...ADVISOR_PAGE_LIMITS);

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

const advisorIntroductionModalOptions: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

const ADVISOR_BASELINE_SERVER_CONTROL_NAME = "baseline_server";
const ADVISOR_BASELINE_WORKLOAD_CONTROL_NAME = "server_workload";
const ADVISOR_CUSTOM_CONTROL_FOCUS_ATTEMPT_LIMIT = 20;
const ADVISOR_WORKLOAD_PROFILE_GROUP_PREFIX = "Workload profile";

function toAdvisorTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z0-9]{2,}$/.test(word)) {
        return word;
      }

      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function formatAdvisorWorkloadProfileLabel(
  value: string | null | undefined,
): string | null {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  if (!normalizedValue.toLowerCase().startsWith("workload_profile")) {
    return null;
  }

  const [...segments] = normalizedValue.split(":");

  if (!segments.length) {
    return ADVISOR_WORKLOAD_PROFILE_GROUP_PREFIX;
  }

  return `${ADVISOR_WORKLOAD_PROFILE_GROUP_PREFIX}: ${segments
    .map((segment) => {
      return toAdvisorTitleCase(segment.replace(/[_-]+/g, " ").trim());
    })
    .filter(Boolean)
    .join(": ")}`;
}

function humanizeAdvisorIdentifier(value: string | null | undefined): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue
    .split(":")
    .map((segment) => {
      return toAdvisorTitleCase(segment.replace(/[_-]+/g, " ").trim());
    })
    .filter(Boolean)
    .join(": ");
}

function formatAdvisorBenchmarkConfigValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value ?? "");
}

function buildAdvisorConfigTitle(config: unknown): string {
  if (typeof config !== "string") {
    return "";
  }

  const trimmedConfig = config.trim();

  if (!trimmedConfig.length || trimmedConfig === "{}") {
    return "";
  }

  try {
    const parsedConfig = JSON.parse(trimmedConfig) as unknown;

    if (
      !parsedConfig ||
      typeof parsedConfig !== "object" ||
      Array.isArray(parsedConfig)
    ) {
      return formatAdvisorBenchmarkConfigValue(parsedConfig);
    }

    return Object.entries(parsedConfig as Record<string, unknown>)
      .map(([key, value]) => {
        return `${humanizeAdvisorIdentifier(key)}: ${formatAdvisorBenchmarkConfigValue(value)}`;
      })
      .join(", ");
  } catch {
    return trimmedConfig.replaceAll(/[{}"]/g, "");
  }
}

function buildAdvisorBenchmarkGroupLabel(
  config: Pick<BenchmarkConfig, "benchmark_id" | "category">,
  benchmarkTemplate: Benchmark | null,
): string {
  return (
    formatAdvisorWorkloadProfileLabel(config.category) ||
    humanizeAdvisorIdentifier(config.category) ||
    humanizeAdvisorIdentifier(benchmarkTemplate?.framework) ||
    formatAdvisorWorkloadProfileLabel(config.benchmark_id) ||
    humanizeAdvisorIdentifier(config.benchmark_id) ||
    "Other"
  );
}

function buildAdvisorBenchmarkDisplayName(
  config: Pick<BenchmarkConfig, "benchmark_id" | "category">,
  benchmarkTemplate: Benchmark | null,
): string {
  const benchmarkName = benchmarkTemplate?.name?.trim();

  if (benchmarkName && benchmarkName !== config.benchmark_id) {
    return benchmarkName;
  }

  return (
    formatAdvisorWorkloadProfileLabel(config.benchmark_id) ||
    humanizeAdvisorIdentifier(config.benchmark_id) ||
    buildAdvisorBenchmarkGroupLabel(config, benchmarkTemplate)
  );
}

function compareAdvisorBenchmarkGroups(left: string, right: string): number {
  const leftIsWorkloadProfile = left
    .toLowerCase()
    .startsWith(ADVISOR_WORKLOAD_PROFILE_GROUP_PREFIX.toLowerCase());
  const rightIsWorkloadProfile = right
    .toLowerCase()
    .startsWith(ADVISOR_WORKLOAD_PROFILE_GROUP_PREFIX.toLowerCase());

  if (leftIsWorkloadProfile !== rightIsWorkloadProfile) {
    return leftIsWorkloadProfile ? -1 : 1;
  }

  return left.localeCompare(right);
}

function isAdvisorPriceColumnKey(
  value: TableColumn["key"] | undefined,
): value is AdvisorPriceColumnKey {
  return (
    value === "min_price" ||
    value === "min_price_spot" ||
    value === "min_price_ondemand" ||
    value === "min_price_ondemand_monthly"
  );
}

function invertAdvisorDeltaTone(
  tone: AdvisorMetricDelta["tone"],
): AdvisorMetricDelta["tone"] {
  if (tone === "positive") {
    return "negative";
  }

  if (tone === "negative") {
    return "positive";
  }

  return "neutral";
}

type AdvisorComparableResourceKey =
  | "memory_amount"
  | "gpu_count"
  | "gpu_memory_min"
  | "gpu_memory_total"
  | "storage_size"
  | "cpu_l1d_cache"
  | "cpu_l2_cache"
  | "cpu_l3_cache"
  | "network_speed_baseline"
  | "network_speed_max"
  | "network_storage_speed_baseline"
  | "network_storage_speed_max"
  | "inbound_traffic"
  | "outbound_traffic";

@Component({
  selector: "app-advisor",
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    FlowbiteDropdownDirective,
    LoadingSpinnerComponent,
    PaginationComponent,
    GpuCountPipe,
    CpuCacheSizePipe,
    Ipv4CountPipe,
    MonthlyTrafficPipe,
    NetworkSpeedPipe,
    StoragePipe,
    GpuMemoryPipe,
    RouterLink,
    SearchBarComponent,
    Icon,
  ],
  templateUrl: "./advisor.component.html",
  styleUrl: "./advisor.component.scss",
})
export class AdvisorComponent implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private seoHandler = inject(SeoHandlerService);
  private keeperApi = inject(KeeperAPIService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serverCompare = inject(ServerCompareService);
  private toastService = inject(ToastService);
  private neetoCalService = inject(NeetoCalService);
  private uiTooltip = inject(UiTooltipService);
  readonly advisorUi = inject(AdvisorUiService);
  readonly currencyDropdown =
    viewChild<FlowbiteDropdownDirective>("currencyDropdown");
  readonly pageDropdown = viewChild<FlowbiteDropdownDirective>("pageDropdown");
  readonly searchBar = viewChild(SearchBarComponent);
  readonly introductionModalRef =
    viewChild<ElementRef<HTMLElement>>("introductionModal");
  readonly tooltipDefault =
    viewChild<ElementRef<HTMLElement>>("tooltipDefault");
  private compareSubscription = new Subscription();
  private lastEncodedQuery: string | null = null;
  private clipboardResetTimeout: ReturnType<typeof setTimeout> | null = null;
  private recommendationRequests = new Subject<RecommendationRequest | null>();
  private recommendationRequestVersion = 0;
  private activeRecommendationRequestKey: string | null = null;
  private baselineBenchmarkRequestVersion = 0;
  private baselineRegionRequestVersion = 0;
  private baselinePriceComparisonRequestVersion = 0;
  private baselineAddonPricingRequestVersion = 0;
  private baselineScoreComparisonRequestVersion = 0;
  private introductionModal: Modal | null = null;
  showIntroductionVideo = false;
  private hasViewInitialized = signal(false);
  private pendingCustomControlFocus = signal<string | null>(null);
  private customControlFocusFrame: number | null = null;
  private customControlFocusAttemptCount = 0;
  private lastPendingCustomControlFocus: string | null = null;

  readonly title = ADVISOR_PAGE_TITLE;
  readonly description = ADVISOR_PAGE_DESCRIPTION;
  readonly advisorExampleQueryParams = ADVISOR_EXAMPLE_QUERY_PARAMS;
  readonly emptyBaselineWorkloadMessage =
    ADVISOR_EMPTY_BASELINE_WORKLOAD_MESSAGE;
  readonly emptyBaselineWorkloadActionMessage =
    ADVISOR_EMPTY_BASELINE_WORKLOAD_ACTION_MESSAGE;

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
  readonly isLoadingBaselineBenchmarkScores = signal(false);
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
  readonly tooltipContent = signal("");
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
  readonly baselineAddonPricingRow = signal<ServerPKs | null>(null);
  readonly baselinePriceComparisonRows = signal<ServerPriceWithPKs[]>([]);
  readonly baselineScoreComparisonRow = signal<Pick<
    ServerPKs,
    "score" | "score_per_price"
  > | null>(null);
  readonly regionMetadata = signal<AdvisorRegionMetadata[]>([]);
  readonly isLoadingBaselineRegions = signal(false);
  readonly possibleColumns = signal<TableColumn[]>(
    buildAdvisorColumns(ADVISOR_WORKLOAD_SCORE_TOOLTIP),
  );
  readonly tableColumns = computed(() =>
    this.possibleColumns().filter((column) => column.show),
  );
  readonly hasBaselineScoreComparisonColumns = computed(() => {
    return this.tableColumns().some((column) => {
      return column.type === "score" || column.type === "score_per_price";
    });
  });
  readonly hasCustomColumns = computed(() =>
    hasCustomAdvisorColumns(this.possibleColumns()),
  );

  readonly advisorFilterCategories = ADVISOR_FILTER_CATEGORIES;
  readonly advisorParameterPlacements: SearchBarParameterPlacement[] =
    ADVISOR_PARAMETER_PLACEMENTS;

  searchParameters: SearchBarParameter[] = [];
  readonly optimizationGoalOptions = ADVISOR_OPTIMIZATION_GOAL_OPTIONS;

  readonly filteredBaselineServers = computed(() => {
    return this.advisorUi.filterBaselineServers(
      this.serverTableRows(),
      this.baselineServerInput(),
    );
  });

  readonly baselineBenchmarkConfigOptions = computed(() => {
    if (!this.selectedBaselineServer()) {
      return [];
    }

    const baselineBenchmarkConfigKeys = new Set(
      this.baselineBenchmarkScores().map((score) =>
        getAdvisorBenchmarkConfigKey(score),
      ),
    );

    if (!baselineBenchmarkConfigKeys.size) {
      return [];
    }

    return this.benchmarkConfigOptions().filter((option) =>
      baselineBenchmarkConfigKeys.has(getAdvisorBenchmarkConfigKey(option)),
    );
  });

  readonly isBaselineWorkloadControlDisabled = computed(() => {
    return (
      !this.selectedBaselineServer() ||
      this.isLoadingBaselineBenchmarkScores() ||
      this.baselineBenchmarkConfigOptions().length === 0
    );
  });

  readonly baselineWorkloadEmptyMessage = computed(() => {
    if (!this.selectedBaselineServer()) {
      return ADVISOR_DISABLED_BASELINE_WORKLOAD_MESSAGE;
    }

    if (this.isLoadingBaselineBenchmarkScores()) {
      return ADVISOR_LOADING_BASELINE_WORKLOAD_MESSAGE;
    }

    if (this.baselineBenchmarkConfigOptions().length === 0) {
      return ADVISOR_EMPTY_BASELINE_WORKLOAD_MESSAGE;
    }

    return "No matching workloads found.";
  });

  readonly hasEmptyBaselineWorkloadWarning = computed(() => {
    return (
      !!this.selectedBaselineServer() &&
      !this.isLoadingBaselineBenchmarkScores() &&
      this.baselineBenchmarkConfigOptions().length === 0
    );
  });

  readonly visibleBenchmarkConfigOptions = computed(() => {
    const searchTerm = this.benchmarkConfigInput().trim().toLowerCase();
    const options = this.baselineBenchmarkConfigOptions();

    if (searchTerm.length < 3) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = [
        option.groupLabel,
        option.category,
        option.framework,
        option.displayName,
        option.configTitle,
        option.config,
        option.benchmark_id,
        option.benchmarkTemplate?.description || "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  });

  readonly benchmarkGroups = computed<SearchBarBenchmarkConfigGroup[]>(() => {
    const grouped = new Map<string, SearchBarBenchmarkConfigOption[]>();

    for (const option of this.visibleBenchmarkConfigOptions()) {
      const groupName = option.groupLabel || option.framework || "Other";
      if (!grouped.has(groupName)) {
        grouped.set(groupName, []);
      }
      grouped.get(groupName)!.push(option);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => compareAdvisorBenchmarkGroups(left, right))
      .map(([name, options]) => ({
        name,
        options: options.sort((left, right) => {
          const displayNameComparison = left.displayName.localeCompare(
            right.displayName,
          );

          if (displayNameComparison !== 0) {
            return displayNameComparison;
          }

          return left.configTitle.localeCompare(right.configTitle);
        }),
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

  readonly averageCpuUtilizationSummary = computed(() => {
    return this.advisorUi.buildUtilizationSummaryContext(
      this.matchedBaselineBenchmarkScore()?.score,
      this.benchmarkScoreMinimum(),
    );
  });

  readonly baselinePriceAggregate = computed<AdvisorBaselinePriceAggregate>(
    () => {
      const addonRow = this.baselineAddonPricingRow();
      if (this.hasTrafficStorageRequirements() && addonRow) {
        return {
          min_price: addonRow.min_price ?? null,
          min_price_spot: addonRow.min_price_spot ?? null,
          min_price_ondemand: addonRow.min_price_ondemand ?? null,
          min_price_ondemand_monthly:
            addonRow.min_price_ondemand_monthly ?? null,
        };
      }

      const selectedBaselineVendorRegion = this.selectedBaselineVendorRegion();
      const baselinePriceAggregate = this.advisorUi.buildBaselinePriceAggregate(
        this.baselineServerPrices(),
        {
          bestPriceAllocation: this.isPriceAllocationEnabled()
            ? this.bestPriceAllocation().slug
            : "ANY",
          currency: this.selectedCurrency().slug,
          regionId:
            this.isBaselineRegionEnabled() && selectedBaselineVendorRegion
              ? selectedBaselineVendorRegion.split("~")[1] || null
              : null,
        },
      );

      if (baselinePriceAggregate.min_price_ondemand_monthly !== null) {
        return baselinePriceAggregate;
      }

      const fallbackMonthlyPrice =
        this.getBaselineMonthlyPriceFallback() ??
        this.recommendations().find((recommendation) =>
          this.isSelectedBaselineRecommendation(recommendation),
        )?.min_price_ondemand_monthly;

      if (
        typeof fallbackMonthlyPrice !== "number" ||
        !Number.isFinite(fallbackMonthlyPrice) ||
        fallbackMonthlyPrice <= 0
      ) {
        return baselinePriceAggregate;
      }

      return {
        ...baselinePriceAggregate,
        min_price:
          this.isPriceAllocationEnabled() &&
          this.bestPriceAllocation().slug === "MONTHLY" &&
          baselinePriceAggregate.min_price === null
            ? fallbackMonthlyPrice
            : baselinePriceAggregate.min_price,
        min_price_ondemand_monthly: fallbackMonthlyPrice,
      };
    },
  );

  readonly derivedMinimumMemoryGiB = computed<number | null>(() => {
    const selectedBaselineServer = this.selectedBaselineServer();
    const cpuUtilization = this.averageCpuUtilization();

    if (!selectedBaselineServer || cpuUtilization === null) {
      return null;
    }

    if (!selectedBaselineServer.memory_amount) {
      return null;
    }

    return this.normalizeMinimumMemoryGiB(
      (selectedBaselineServer.memory_amount / 1024) * (cpuUtilization / 100),
    );
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
  readonly recommendationEmptyStateMessage = computed(() => {
    if (this.hasEmptyBaselineWorkloadWarning()) {
      return ADVISOR_EMPTY_BASELINE_WORKLOAD_RESULTS_MESSAGE;
    }

    return this.advisorUi.buildMissingInputsMessage(
      this.missingRequiredInputs(),
    );
  });
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
      const minimumMemoryGiB =
        this.minimumMemoryGiB() ?? this.derivedMinimumMemoryGiB();

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
        title: ADVISOR_BASELINE_SERVER_TITLE,
        placeholder: "Search for server...",
        required: true,
        description: ADVISOR_BASELINE_SERVER_TOOLTIP,
        descriptionDisplay: "tooltip",
        minCharacters: 2,
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
        title: ADVISOR_BASELINE_WORKLOAD_TITLE,
        placeholder: "Search benchmark or browse categories...",
        required: true,
        description: ADVISOR_BASELINE_WORKLOAD_TOOLTIP,
        descriptionDisplay: "tooltip",
        minCharacters: 3,
        inputValue: this.benchmarkConfigInput(),
        selectedBenchmarkConfig: this.selectedBenchmarkConfig(),
        benchmarkOptions: this.visibleBenchmarkConfigOptions(),
        benchmarkGroups: this.benchmarkGroups(),
        disabled: this.isBaselineWorkloadControlDisabled(),
        loading: this.isLoadingBaselineBenchmarkScores(),
        emptyMessage: this.isLoadingBenchmarkConfigs()
          ? "Loading benchmark workloads..."
          : this.baselineWorkloadEmptyMessage(),
      },
      {
        name: "optimization_goal",
        category_id: "advisor",
        type: "singleSelect",
        title: ADVISOR_OPTIMIZATION_GOAL_TITLE,
        required: true,
        description:
          "Optimizing for cost searches for the cheapest servers matching the minimum requested performance, performance-mode ranks servers with the highest measured speed for the selected workload, and cost-efficiency target will find the servers with the highest performance at a fixed unit cost.",
        selectedValue: this.optimizationGoal(),
        selectOptions: this.optimizationGoalOptions,
      },
      {
        name: "average_cpu_utilization",
        category_id: "advisor",
        type: "rangeSlider",
        title: ADVISOR_AVERAGE_UTILIZATION_TITLE,
        required: true,
        description: ADVISOR_AVERAGE_UTILIZATION_TOOLTIP,
        descriptionDisplay: "tooltip",
        numericValue: this.averageCpuUtilization(),
        valueSummary: this.averageCpuUtilizationSummary(),
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
        title: ADVISOR_REQUIRED_MEMORY_TITLE,
        description:
          "Memory requirement in GiB. Leave this empty to auto-fill from the selected baseline server memory and average utilization, or type any value and use the stepper to snap through powers of two starting at 0.5 GiB.",
        numericValue: this.minimumMemoryGiB(),
        numericFormat: "binaryMemory",
        min: ADVISOR_MINIMUM_MEMORY_MIN_GIB,
        unit: "GiB",
      },
      {
        name: "peak_gpu_memory",
        category_id: "advisor",
        type: "powerOfTwoStepper",
        title: ADVISOR_REQUIRED_GPU_MEMORY_TITLE,
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
        title: this.selectedBaselineServer()?.cpu_allocation
          ? `CPU allocation (${this.selectedBaselineServer()?.cpu_allocation})`
          : "CPU allocation",
        checked: this.limitToSameCpuAllocation(),
        disabled: !this.selectedBaselineServer()?.cpu_allocation,
      },
      {
        name: "limit_architecture",
        category_id: "advisor",
        type: "checkbox",
        title: this.selectedBaselineServer()?.cpu_architecture
          ? `CPU architecture (${this.selectedBaselineServer()?.cpu_architecture})`
          : "CPU architecture",
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
        this.isLoadingBaselineBenchmarkScores.set(false);
        return;
      }

      void this.loadBaselineBenchmarkScores(selectedBaselineServer);
    });

    effect(() => {
      const selectedBaselineServer = this.selectedBaselineServer();
      const selectedBenchmarkConfig = this.selectedBenchmarkConfig();

      if (!selectedBaselineServer) {
        if (selectedBenchmarkConfig) {
          this.selectedBenchmarkConfig.set(null);
          this.benchmarkConfigInput.set("");
        }

        return;
      }

      if (this.isLoadingBaselineBenchmarkScores()) {
        return;
      }

      const baselineBenchmarkConfigOptions =
        this.baselineBenchmarkConfigOptions();

      if (baselineBenchmarkConfigOptions.length === 0) {
        if (selectedBenchmarkConfig) {
          this.selectedBenchmarkConfig.set(null);
          this.benchmarkConfigInput.set("");
        }

        return;
      }

      if (
        selectedBenchmarkConfig &&
        !baselineBenchmarkConfigOptions.some(
          (option) =>
            getAdvisorBenchmarkConfigKey(option) ===
            getAdvisorBenchmarkConfigKey(selectedBenchmarkConfig),
        )
      ) {
        this.selectedBenchmarkConfig.set(null);
        this.benchmarkConfigInput.set("");
      }
    });

    effect(() => {
      const selectedBaselineServer = this.selectedBaselineServer();
      const selectedCurrency = this.selectedCurrency().slug;
      const query = this.query();
      const extraStorageSize = query["extra_storage_size"];
      const extraStorageType = query["extra_storage_type"];
      const monthlyInboundTraffic = query["monthly_inbound_traffic"];
      const monthlyOutboundTraffic = query["monthly_outbound_traffic"];
      void this.isPriceAllocationEnabled();
      void this.bestPriceAllocation();
      void this.isBaselineRegionEnabled();
      void this.selectedBaselineVendorRegion();

      if (!selectedBaselineServer) {
        this.baselineServerPrices.set([]);
        this.baselinePriceComparisonRows.set([]);
        this.baselineScoreComparisonRow.set(null);
        this.baselineAddonPricingRow.set(null);
        this.isLoadingBaselineRegions.set(false);
        this.isBaselineRegionEnabled.set(false);
        this.selectedBaselineVendorRegion.set(null);
        return;
      }

      void extraStorageSize;
      void extraStorageType;
      void monthlyInboundTraffic;
      void monthlyOutboundTraffic;

      void this.loadBaselineRegionPrices(
        selectedBaselineServer,
        selectedCurrency,
      );
      void this.loadBaselinePriceComparisonRows(
        selectedBaselineServer,
        selectedCurrency,
      );

      if (this.hasTrafficStorageRequirements()) {
        void this.loadBaselineAddonPricing(
          selectedBaselineServer,
          selectedCurrency,
        );
      } else {
        this.baselineAddonPricingRow.set(null);
      }
    });

    effect(() => {
      const selectedBaselineServer = this.selectedBaselineServer();
      const hasBaselineScoreComparisonColumns =
        this.hasBaselineScoreComparisonColumns();
      const baselineRecommendation = selectedBaselineServer
        ? this.recommendations().find((recommendation) => {
            return this.isSelectedBaselineRecommendation(recommendation);
          })
        : null;

      if (!selectedBaselineServer || !hasBaselineScoreComparisonColumns) {
        this.baselineScoreComparisonRow.set(null);
        return;
      }

      if (
        baselineRecommendation?.score != null &&
        baselineRecommendation?.score_per_price != null
      ) {
        this.baselineScoreComparisonRow.set(null);
        return;
      }

      void this.loadBaselineScoreComparisonRow(selectedBaselineServer);
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
      if (this.minimumMemoryGiB() !== null) {
        return;
      }

      const derivedMinimumMemoryGiB = this.derivedMinimumMemoryGiB();

      if (derivedMinimumMemoryGiB === null) {
        return;
      }

      this.minimumMemoryGiB.set(derivedMinimumMemoryGiB);
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

    effect(() => {
      const focusTarget = this.pendingCustomControlFocus();
      const searchBar = this.searchBar();
      const hasViewInitialized = this.hasViewInitialized();

      if (
        !focusTarget ||
        !searchBar ||
        !hasViewInitialized ||
        !isPlatformBrowser(this.platformId)
      ) {
        return;
      }

      if (focusTarget === ADVISOR_BASELINE_WORKLOAD_CONTROL_NAME) {
        this.selectedBaselineServer();
        this.isLoadingBaselineBenchmarkScores();
        this.baselineBenchmarkConfigOptions();
        this.isBaselineWorkloadControlDisabled();
      }

      this.queuePendingCustomControlFocusAttempt();
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

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.neetoCalService.initialize();
    this.hasViewInitialized.set(true);
  }

  ngOnDestroy(): void {
    this.compareSubscription.unsubscribe();

    if (
      this.customControlFocusFrame !== null &&
      isPlatformBrowser(this.platformId)
    ) {
      cancelAnimationFrame(this.customControlFocusFrame);
      this.customControlFocusFrame = null;
    }

    if (this.clipboardResetTimeout) {
      clearTimeout(this.clipboardResetTimeout);
      this.clipboardResetTimeout = null;
    }

    this.introductionModal?.hide();
    this.introductionModal = null;
  }

  toggleOrdering(column: TableColumn): void {
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

  getOrderingIcon(column: TableColumn): string | null {
    if (!column.orderField || this.activeOrderBy() !== column.orderField) {
      return null;
    }

    return this.activeOrderDir() === OrderDir.Desc
      ? "arrow-down-wide-narrow"
      : "arrow-down-narrow-wide";
  }

  showTooltip(event: Event, content: string): void {
    const tooltipElement = this.tooltipDefault()?.nativeElement;

    if (!tooltipElement) {
      return;
    }

    this.tooltipContent.set(content);
    this.uiTooltip.show(tooltipElement, event, {
      left: "anchor-right",
      top: "anchor-above",
    });
  }

  hideTooltip(): void {
    this.uiTooltip.hide(this.tooltipDefault()?.nativeElement);
  }

  getBenchmarkDelta(recommendation: ServerPKs): AdvisorMetricDelta | null {
    if (this.isSelectedBaselineRecommendation(recommendation)) {
      return null;
    }

    const delta = this.advisorUi.buildBenchmarkScoreDelta(
      recommendation.selected_benchmark_score,
      this.matchedBaselineBenchmarkScore()?.score,
    );

    if (this.selectedBenchmarkConfig()?.benchmarkTemplate?.higher_is_better) {
      return delta;
    }

    return {
      ...delta,
      tone: invertAdvisorDeltaTone(delta.tone),
    };
  }

  getBenchmarkDisplayScore(recommendation: ServerPKs): number | null {
    if (recommendation.selected_benchmark_score != null) {
      return recommendation.selected_benchmark_score ?? null;
    }

    return this.matchedBaselineBenchmarkScore()?.score ?? null;
  }

  getBenchmarkScorePerPriceDisplayValue(
    recommendation: ServerPKs,
  ): number | null {
    if (recommendation.selected_benchmark_score_per_price != null) {
      return recommendation.selected_benchmark_score_per_price ?? null;
    }

    const baselineScore = this.matchedBaselineBenchmarkScore()?.score;
    const baselinePrice = this.baselinePriceAggregate().min_price;

    if (
      baselineScore === null ||
      baselineScore === undefined ||
      baselinePrice === null ||
      baselinePrice <= 0
    ) {
      return null;
    }

    return this.advisorUi.buildBenchmarkScorePerPrice(
      baselineScore,
      baselinePrice,
    );
  }

  getBenchmarkScorePerPriceDelta(
    recommendation: ServerPKs,
  ): AdvisorMetricDelta | null {
    if (this.isSelectedBaselineRecommendation(recommendation)) {
      return null;
    }

    return this.advisorUi.buildBenchmarkScorePerPriceDelta(
      recommendation.selected_benchmark_score_per_price,
      this.matchedBaselineBenchmarkScore()?.score,
      this.baselinePriceAggregate().min_price,
    );
  }

  getScoreDelta(recommendation: ServerPKs): AdvisorMetricDelta | null {
    if (this.isSelectedBaselineRecommendation(recommendation)) {
      return null;
    }

    return this.advisorUi.buildComparableResourceDelta(
      recommendation.score,
      this.getBaselineScoreComparisonValue("score"),
    );
  }

  getScorePerPriceDelta(recommendation: ServerPKs): AdvisorMetricDelta | null {
    if (this.isSelectedBaselineRecommendation(recommendation)) {
      return null;
    }

    return this.advisorUi.buildComparableResourceDelta(
      recommendation.score_per_price,
      this.getBaselineScoreComparisonValue("score_per_price"),
    );
  }

  getPriceDelta(
    recommendation: ServerPKs,
    columnKey: TableColumn["key"] | undefined,
  ): AdvisorMetricDelta | null {
    if (this.isSelectedBaselineRecommendation(recommendation)) {
      return null;
    }

    if (!isAdvisorPriceColumnKey(columnKey)) {
      return {
        baselineValue: null,
        candidateValue: null,
        percentageDelta: null,
        tone: "neutral",
      };
    }

    return this.advisorUi.buildPriceDelta(
      recommendation[columnKey],
      this.baselinePriceAggregate()[columnKey],
    );
  }

  getComparableResourceDelta(
    recommendation: ServerPKs,
    resourceKey: AdvisorComparableResourceKey,
  ): AdvisorMetricDelta | null {
    if (this.isSelectedBaselineRecommendation(recommendation)) {
      return null;
    }

    if (!this.selectedBaselineServer()) {
      return null;
    }

    return this.advisorUi.buildComparableResourceDelta(
      resourceKey === "storage_size"
        ? (recommendation[resourceKey] ?? 0)
        : recommendation[resourceKey],
      this.getBaselineComparisonValue(resourceKey),
    );
  }

  private getBaselineComparisonValue(
    resourceKey: AdvisorComparableResourceKey,
  ): number | null | undefined {
    const baselineRecommendation = this.recommendations().find(
      (recommendation) => {
        return this.isSelectedBaselineRecommendation(recommendation);
      },
    );

    if (baselineRecommendation) {
      const value = baselineRecommendation[resourceKey];
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }

    const baselineServerValue = this.selectedBaselineServer()?.[resourceKey];
    if (
      typeof baselineServerValue === "number" &&
      Number.isFinite(baselineServerValue)
    ) {
      return baselineServerValue;
    }

    return resourceKey === "storage_size" ? 0 : undefined;
  }

  getDeltaLabel(delta: AdvisorMetricDelta): string | null {
    if (delta.candidateValue === null) {
      return null;
    }

    if (delta.percentageDelta === null) {
      return "";
    }

    const roundedPercentage = Math.round(Math.abs(delta.percentageDelta));
    if (roundedPercentage === 0) {
      return "0%";
    }

    return delta.tone === "negative"
      ? `-${roundedPercentage}%`
      : `+${roundedPercentage}%`;
  }

  getParenthesizedDeltaLabel(delta: AdvisorMetricDelta): string | null {
    const deltaLabel = this.getDeltaLabel(delta);

    if (!deltaLabel || deltaLabel === "0%") {
      return deltaLabel === "0%" ? null : deltaLabel;
    }

    return `(${deltaLabel})`;
  }

  getPriceDeltaLabel(delta: AdvisorMetricDelta): string | null {
    if (delta.candidateValue === null) {
      return null;
    }

    if (delta.percentageDelta === null) {
      return "";
    }

    const roundedPercentage = Math.round(Math.abs(delta.percentageDelta));

    if (roundedPercentage === 0) {
      return "0%";
    }

    return delta.percentageDelta < 0
      ? `-${roundedPercentage}%`
      : `+${roundedPercentage}%`;
  }

  private getBaselineScoreComparisonValue(
    key: "score" | "score_per_price",
  ): number | null | undefined {
    const baselineRecommendation = this.recommendations().find(
      (recommendation) => {
        return this.isSelectedBaselineRecommendation(recommendation);
      },
    );

    if (baselineRecommendation?.[key] != null) {
      return baselineRecommendation[key];
    }

    return this.baselineScoreComparisonRow()?.[key] ?? null;
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

  openIntroductionModal(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.introductionModal) {
      const modalElement = this.introductionModalRef()?.nativeElement;

      if (modalElement) {
        this.introductionModal = new Modal(modalElement, {
          ...advisorIntroductionModalOptions,
          onHide: () => {
            this.showIntroductionVideo = false;
          },
        });
      }
    }

    this.showIntroductionVideo = true;
    this.introductionModal?.show();
  }

  closeIntroductionModal(): void {
    this.introductionModal?.hide();
  }

  toggleCollapse(): void {
    this.isCollapsed.update((value) => !value);
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
        if (this.applyBaselineServerControlValue(event.value)) {
          this.pendingCustomControlFocus.set(
            ADVISOR_BASELINE_WORKLOAD_CONTROL_NAME,
          );
        }
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
    this.query.set({});
    this.selectedBaselineServer.set(null);
    this.limitToSameArchitecture.set(false);
    this.limitToSameCpuAllocation.set(false);
    this.baselineServerInput.set("");
    this.pendingBaselineVendorId.set(null);
    this.pendingBaselineApiReference.set(null);
    this.selectedBenchmarkConfig.set(null);
    this.benchmarkConfigInput.set("");
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
    this.possibleColumns.set(
      buildAdvisorColumns(ADVISOR_WORKLOAD_SCORE_TOOLTIP),
    );
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
      this.keeperApi.getBenchmarkWorkloads(),
    ])
      .then(
        ([
          benchmarkMetaResponse,
          benchmarkConfigResponse,
          benchmarkWorkloadsResponse,
        ]) => {
          const benchmarkMeta = (benchmarkMetaResponse?.body ||
            []) as Benchmark[];
          const benchmarkConfigs = (benchmarkConfigResponse?.body ||
            []) as BenchmarkConfig[];
          const benchmarkWorkloads = (benchmarkWorkloadsResponse?.body ||
            []) as BenchmarkScoreStatsItem[];
          const benchmarkPolarityById = new Map<string, boolean>(
            benchmarkWorkloads.map((workload) => [
              workload.benchmark_id,
              workload.higher_is_better,
            ]),
          );

          const options = benchmarkConfigs.map(
            (config): SearchBarBenchmarkConfigOption => {
              const benchmarkTemplateFromMeta =
                benchmarkMeta.find(
                  (benchmark) => benchmark.benchmark_id === config.benchmark_id,
                ) || null;
              const benchmarkTemplate = benchmarkTemplateFromMeta
                ? {
                    ...benchmarkTemplateFromMeta,
                    higher_is_better:
                      benchmarkPolarityById.get(config.benchmark_id) ??
                      benchmarkTemplateFromMeta.higher_is_better,
                  }
                : null;
              const groupLabel = buildAdvisorBenchmarkGroupLabel(
                config,
                benchmarkTemplate,
              );
              const configTitle = buildAdvisorConfigTitle(config.config);
              const displayName = buildAdvisorBenchmarkDisplayName(
                config,
                benchmarkTemplate,
              );

              return {
                ...config,
                benchmarkTemplate,
                groupLabel,
                configTitle,
                displayName,
                framework:
                  benchmarkTemplate?.framework ||
                  groupLabel ||
                  config.benchmark_id,
              };
            },
          );

          this.benchmarkConfigOptions.set(options);
        },
      )
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
    const requestVersion = ++this.baselineBenchmarkRequestVersion;
    this.isLoadingBaselineBenchmarkScores.set(true);
    this.baselineBenchmarkScores.set([]);

    try {
      const response = await this.keeperApi.getServerBenchmark(
        server.vendor_id,
        server.api_reference,
      );

      if (
        requestVersion !== this.baselineBenchmarkRequestVersion ||
        this.selectedBaselineServer()?.vendor_id !== server.vendor_id ||
        this.selectedBaselineServer()?.api_reference !== server.api_reference
      ) {
        return;
      }

      this.baselineBenchmarkScores.set(response?.body || []);
    } catch (error) {
      if (
        requestVersion !== this.baselineBenchmarkRequestVersion ||
        this.selectedBaselineServer()?.vendor_id !== server.vendor_id ||
        this.selectedBaselineServer()?.api_reference !== server.api_reference
      ) {
        return;
      }

      console.error("Failed to load advisor baseline benchmark scores", error);
      this.baselineBenchmarkScores.set([]);
    } finally {
      if (requestVersion === this.baselineBenchmarkRequestVersion) {
        this.isLoadingBaselineBenchmarkScores.set(false);
      }
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
    currency: string,
  ): Promise<void> {
    const requestVersion = ++this.baselineRegionRequestVersion;
    this.isLoadingBaselineRegions.set(true);

    try {
      const response = await this.keeperApi.getServerPrices(
        server.vendor_id,
        server.api_reference,
        currency,
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

  private getPositiveQueryNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);

      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }

  private hasTrafficStorageRequirements(): boolean {
    const query = this.query() as Record<string, unknown>;

    return [
      query["extra_storage_size"],
      query["monthly_inbound_traffic"],
      query["monthly_outbound_traffic"],
    ].some((value) => this.getPositiveQueryNumber(value) !== null);
  }

  private async loadBaselineAddonPricing(
    server: AdvisorBaselineServer,
    currency: string,
  ): Promise<void> {
    const requestVersion = ++this.baselineAddonPricingRequestVersion;
    const sharedQuery = this.query() as SearchServersServersGetParams;
    const query: SearchServersServersGetParams = {
      partial_name_or_id: server.api_reference,
      vendor: server.vendor_id as SearchServersServersGetParams["vendor"],
      only_active: true,
      limit: 100,
    };

    for (const key of [
      "extra_storage_size",
      "monthly_inbound_traffic",
      "monthly_outbound_traffic",
    ] as const) {
      const value = this.getPositiveQueryNumber(sharedQuery[key]);

      if (value !== null) {
        query[key] = value;
      }
    }

    if (sharedQuery.extra_storage_type) {
      query.extra_storage_type = sharedQuery.extra_storage_type;
    }

    if (currency !== "USD") {
      query.currency = currency;
    }

    if (
      this.isPriceAllocationEnabled() &&
      this.bestPriceAllocation().slug !== "ANY"
    ) {
      query.best_price_allocation = this.bestPriceAllocation().slug;
    }

    const baselineRegion = this.selectedBaselineVendorRegion();

    if (this.isBaselineRegionEnabled() && baselineRegion) {
      query.vendor_regions =
        baselineRegion as SearchServersServersGetParams["vendor_regions"];
    }

    try {
      const response = await this.keeperApi.searchServers(query);

      if (requestVersion !== this.baselineAddonPricingRequestVersion) {
        return;
      }

      this.baselineAddonPricingRow.set(
        (response?.body ?? []).find(
          (row: ServerPKs) =>
            row.vendor_id === server.vendor_id &&
            row.api_reference === server.api_reference,
        ) ?? null,
      );
    } catch {
      if (requestVersion !== this.baselineAddonPricingRequestVersion) {
        return;
      }

      this.baselineAddonPricingRow.set(null);
    }
  }

  private async loadBaselinePriceComparisonRows(
    server: AdvisorBaselineServer,
    currency: string,
  ): Promise<void> {
    const requestVersion = ++this.baselinePriceComparisonRequestVersion;
    const query: SearchServerPricesServerPricesGetParams = {
      partial_name_or_id: server.api_reference,
      vendor:
        server.vendor_id as SearchServerPricesServerPricesGetParams["vendor"],
      currency,
    };

    try {
      const response = await this.keeperApi.searchServerPrices(query);

      if (
        requestVersion !== this.baselinePriceComparisonRequestVersion ||
        this.selectedBaselineServer()?.vendor_id !== server.vendor_id ||
        this.selectedBaselineServer()?.api_reference !== server.api_reference ||
        this.selectedCurrency().slug !== currency
      ) {
        return;
      }

      this.baselinePriceComparisonRows.set(
        (response?.body || []).filter((price: ServerPriceWithPKs) => {
          return (
            price.vendor_id === server.vendor_id &&
            (price.server?.api_reference === server.api_reference ||
              price.server_id === server.api_reference)
          );
        }),
      );
    } catch (error) {
      if (
        requestVersion !== this.baselinePriceComparisonRequestVersion ||
        this.selectedBaselineServer()?.vendor_id !== server.vendor_id ||
        this.selectedBaselineServer()?.api_reference !== server.api_reference ||
        this.selectedCurrency().slug !== currency
      ) {
        return;
      }

      console.error("Failed to load advisor baseline comparison prices", error);
      this.baselinePriceComparisonRows.set([]);
    }
  }

  private async loadBaselineScoreComparisonRow(
    server: AdvisorBaselineServer,
  ): Promise<void> {
    const requestVersion = ++this.baselineScoreComparisonRequestVersion;
    const query: SearchServersServersGetParams = {
      partial_name_or_id: server.api_reference,
      vendor: server.vendor_id as SearchServersServersGetParams["vendor"],
      only_active: true,
    };

    try {
      const response = await this.keeperApi.searchServers(query);

      if (
        requestVersion !== this.baselineScoreComparisonRequestVersion ||
        this.selectedBaselineServer()?.vendor_id !== server.vendor_id ||
        this.selectedBaselineServer()?.api_reference !== server.api_reference ||
        !this.hasBaselineScoreComparisonColumns()
      ) {
        return;
      }

      const baselineComparisonRow = (response?.body || []).find(
        (candidate: ServerPKs) => {
          return (
            candidate.vendor_id === server.vendor_id &&
            candidate.api_reference === server.api_reference
          );
        },
      );

      this.baselineScoreComparisonRow.set(
        baselineComparisonRow
          ? {
              score: baselineComparisonRow.score ?? null,
              score_per_price: baselineComparisonRow.score_per_price ?? null,
            }
          : null,
      );
    } catch (error) {
      if (requestVersion !== this.baselineScoreComparisonRequestVersion) {
        return;
      }

      console.error(
        "Failed to load advisor baseline score comparison row",
        error,
      );
      this.baselineScoreComparisonRow.set(null);
    }
  }

  private getBaselineMonthlyPriceFallback(): number | null {
    const selectedBaselineVendorRegion = this.selectedBaselineVendorRegion();
    const scopedRegionId =
      this.isBaselineRegionEnabled() && selectedBaselineVendorRegion
        ? selectedBaselineVendorRegion.split("~")[1] || null
        : null;

    return (
      this.baselinePriceComparisonRows()
        .filter((price) => {
          return !scopedRegionId || price.region_id === scopedRegionId;
        })
        .map((price) => this.advisorUi.getOndemandMonthlyPrice(price))
        .filter((price): price is number => price !== null)
        .sort((left, right) => left - right)[0] ?? null
    );
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
        const restoredPage = this.parsePositiveIntParam(queryParams.page, 1);
        const restoredLimit = this.parsePositiveIntParam(
          queryParams.limit,
          ADVISOR_DEFAULT_PAGE_LIMIT,
          ADVISOR_MAX_PAGE_LIMIT,
        );
        const restoredAverageCpuUtilization = this.parseNumberInRange(
          queryParams.avg_cpu_utilization,
          null,
          0,
          100,
        );
        const restoredMinimumMemoryGiB = this.parseNumberInRange(
          queryParams.minimum_memory,
          ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
          ADVISOR_MINIMUM_MEMORY_MIN_GIB,
        );
        const restoredPeakGpuMemoryGiB =
          this.parseNumberInRange(
            queryParams.peak_gpu_memory,
            ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
            0,
          ) ?? ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB;

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
        this.page.set(restoredPage);
        this.limit.set(restoredLimit);

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
          this.pendingCustomControlFocus.set(
            ADVISOR_BASELINE_SERVER_CONTROL_NAME,
          );
        } else {
          this.limitToSameArchitecture.set(
            queryParams.limit_architecture === "true",
          );
          this.limitToSameCpuAllocation.set(
            queryParams.limit_cpu_allocation === "true",
          );
          this.pendingCustomControlFocus.set(
            queryParams.workload_id
              ? null
              : ADVISOR_BASELINE_WORKLOAD_CONTROL_NAME,
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

        this.averageCpuUtilization.set(restoredAverageCpuUtilization);
        this.minimumMemoryGiB.set(restoredMinimumMemoryGiB);
        this.peakGpuMemoryGiB.set(restoredPeakGpuMemoryGiB);
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
      queryParams.workload_config =
        workloadConfig || ADVISOR_DEFAULT_WORKLOAD_CONFIG;
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

  private applyBaselineServerControlValue(value: unknown): boolean {
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

    return Boolean(nextValue.selectedServer);
  }

  private queuePendingCustomControlFocusAttempt(): void {
    if (
      this.customControlFocusFrame !== null ||
      !isPlatformBrowser(this.platformId)
    ) {
      return;
    }

    this.customControlFocusFrame = requestAnimationFrame(() => {
      this.customControlFocusFrame = null;
      this.focusPendingCustomControl();
    });
  }

  private focusPendingCustomControl(): void {
    const focusTarget = this.pendingCustomControlFocus();

    if (!focusTarget) {
      this.customControlFocusAttemptCount = 0;
      this.lastPendingCustomControlFocus = null;
      return;
    }

    if (this.lastPendingCustomControlFocus !== focusTarget) {
      this.customControlFocusAttemptCount = 0;
      this.lastPendingCustomControlFocus = focusTarget;
    }

    if (this.searchBar()?.focusCustomControl(focusTarget)) {
      this.customControlFocusAttemptCount = 0;
      this.lastPendingCustomControlFocus = null;
      this.pendingCustomControlFocus.set(null);
      return;
    }

    this.customControlFocusAttemptCount += 1;

    if (
      this.customControlFocusAttemptCount <
      ADVISOR_CUSTOM_CONTROL_FOCUS_ATTEMPT_LIMIT
    ) {
      this.queuePendingCustomControlFocusAttempt();
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

  private parsePositiveIntParam(
    value: unknown,
    fallback: number,
    max?: number,
  ): number {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
      return fallback;
    }

    const clampedValue = Math.max(parsed, 1);

    return max !== undefined ? Math.min(clampedValue, max) : clampedValue;
  }

  private parseNumberInRange(
    value: unknown,
    fallback: number | null,
    min: number,
    max?: number,
  ): number | null {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    const clampedValue = Math.max(parsed, min);

    return max !== undefined ? Math.min(clampedValue, max) : clampedValue;
  }

  private normalizeMinimumMemoryGiB(value: number): number {
    return Number(Math.max(value, ADVISOR_MINIMUM_MEMORY_MIN_GIB).toFixed(2));
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
