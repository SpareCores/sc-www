import { BreadcrumbSegment } from "../../components/breadcrumbs/breadcrumbs.component";
import {
  SearchBarCustomSelectOption,
  SearchBarFilterCategory,
  SearchBarParameterPlacement,
} from "../../components/search-bar/search-bar.component";
import {
  AdvisorOptimizationGoal,
  AdvisorSeoMetadata,
  AdvisorTableColumn,
} from "./advisor.types";
import {
  SERVER_TABLE_BENCHMARK_EFFICIENCY_TOOLTIP,
  SERVER_TABLE_SCORE_PER_PRICE_TOOLTIP,
  SERVER_TABLE_SCORE_TOOLTIP,
} from "../../tools/server-table-tooltips";

export const ADVISOR_BREADCRUMBS: BreadcrumbSegment[] = [
  { name: "Home", url: "/" },
  { name: "Advisor", url: "/advisor" },
];

export const ADVISOR_DEFAULT_SERVER_COLUMNS = [
  "vendor_id",
  "api_reference",
  "status",
  "vcpus",
  "memory_amount",
  "gpu_count",
  "gpu_memory_min",
  "gpu_memory_total",
  "storage_size",
  "cpu_l1d_cache",
  "cpu_l2_cache",
  "cpu_l3_cache",
  "cpu_architecture",
  "cpu_allocation",
  "network_speed_baseline",
  "network_speed_max",
  "network_storage_speed_baseline",
  "network_storage_speed_max",
  "inbound_traffic",
  "outbound_traffic",
] as const;

export const ADVISOR_FILTER_CATEGORIES: SearchBarFilterCategory[] = [
  {
    category_id: "advisor",
    name: "Advisor",
    icon: "bot",
    collapsed: false,
    alwaysExpanded: true,
    hideHeader: true,
  },
  { category_id: "vendor", name: "Vendor", icon: "home", collapsed: true },
  { category_id: "region", name: "Region", icon: "hotel", collapsed: true },
];

export const ADVISOR_PARAMETER_PLACEMENTS: SearchBarParameterPlacement[] = [
  {
    parameterName: "extra_storage_size",
    categoryId: "advisor",
    afterControlName: "peak_gpu_memory",
  },
  {
    parameterName: "extra_storage_type",
    categoryId: "advisor",
    afterControlName: "peak_gpu_memory",
  },
  {
    parameterName: "monthly_inbound_traffic",
    categoryId: "advisor",
    afterControlName: "peak_gpu_memory",
  },
  {
    parameterName: "monthly_outbound_traffic",
    categoryId: "advisor",
    afterControlName: "peak_gpu_memory",
  },
];

export const ADVISOR_OPTIMIZATION_GOAL_OPTIONS: SearchBarCustomSelectOption[] =
  [
    { value: "performance", label: "Performance" },
    { value: "cost", label: "Cost" },
    { value: "cost-efficiency", label: "Cost-efficiency" },
  ];

export const ADVISOR_DEFAULT_OPTIMIZATION_GOAL: AdvisorOptimizationGoal =
  "cost";

export const ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB = null;

export const ADVISOR_MINIMUM_MEMORY_MIN_GIB = 0.5;

export const ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB = 0;

export const ADVISOR_DEFAULT_PAGE_LIMIT = 25;

export const ADVISOR_DEFAULT_CURRENCY = "USD";

export const ADVISOR_DEFAULT_PRICE_ALLOCATION = "ANY";

export const ADVISOR_PRICE_ALLOCATION_TOOLTIP =
  "Choose which pricing model the advisor should compare against. Leave this disabled to rank recommendations by the overall best available price across ondemand, monthly, and spot offers.";

export const ADVISOR_BASELINE_REGION_TOOLTIP =
  "Uses the baseline server's known regional availability to narrow recommendations to a single region where that server is sold. This control is disabled when Vendor and region id filters are in use, because those filters support broader multi-region choices.";

export const ADVISOR_DEFAULT_WORKLOAD_CONFIG = "{}";

export const ADVISOR_CUSTOM_QUERY_PARAM_NAMES = [
  "page",
  "limit",
  "columns",
  "currency",
  "best_price_allocation",
  "order_by",
  "order_dir",
  "baseline_vendor",
  "baseline_server",
  "limit_architecture",
  "limit_cpu_allocation",
  "workload_id",
  "workload_config",
  "optimization_goal",
  "avg_cpu_utilization",
  "minimum_memory",
  "peak_gpu_memory",
  "price_allocation_enabled",
  "baseline_region_enabled",
  "baseline_vendor_region",
] as const;

export const ADVISOR_PAGE_TITLE = "Cloud Server Advisor";

export const ADVISOR_PAGE_DESCRIPTION =
  "Transform your high-level server utilization telemetry data into ranked, explainable cloud resource allocation recommendations. Compare your baseline choice against workload-aware alternatives to reduce costs and improve performance or cost efficiency of your workloads.";

export const ADVISOR_EXAMPLE_QUERY_PARAMS = {
  baseline_vendor: "aws",
  baseline_server: "m5ad.large",
  limit_architecture: "true",
  workload_id: "workload_profile:web",
  workload_config: "{}",
  avg_cpu_utilization: "60",
  minimum_memory: "6",
} as const;

export const ADVISOR_SEO: AdvisorSeoMetadata = {
  title: "Cloud Server Advisor - Spare Cores",
  description:
    "Transform your high-level server utilization telemetry data into ranked, explainable cloud resource allocation recommendations. Compare your baseline choice against workload-aware alternatives to reduce costs and improve performance or cost efficiency of your workloads.",
  keywords:
    "cloud server advisor, cloud servers, workload recommendations, cost efficiency, performance, spare cores",
};

export const ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE =
  "No recommended servers available.";

export const ADVISOR_EMPTY_BASELINE_WORKLOAD_MESSAGE =
  "The selected baseline server has no benchmark workloads available.";

export const ADVISOR_EMPTY_BASELINE_WORKLOAD_ACTION_MESSAGE =
  "Choose another baseline server to get started.";

export const ADVISOR_EMPTY_BASELINE_WORKLOAD_RESULTS_MESSAGE = `${ADVISOR_EMPTY_BASELINE_WORKLOAD_MESSAGE} ${ADVISOR_EMPTY_BASELINE_WORKLOAD_ACTION_MESSAGE}`;

export const ADVISOR_DISABLED_BASELINE_WORKLOAD_MESSAGE =
  "Choose a baseline server first to load its available workloads.";

export const ADVISOR_LOADING_BASELINE_WORKLOAD_MESSAGE =
  "Loading workloads for the selected baseline server...";

export const ADVISOR_BASELINE_SERVER_TITLE = "Baseline server";

export const ADVISOR_BASELINE_SERVER_TOOLTIP =
  "Select the instance type of the cloud server you consider right-sizing. We will look up this server's specs, performance and pricing data, and use all that as the baseline when comparing to other cloud server options.";

export const ADVISOR_BASELINE_WORKLOAD_TITLE = "Baseline workload";

export const ADVISOR_BASELINE_WORKLOAD_TOOLTIP =
  "Select a workload that matches (or closest to) what your existing server is doing. We will look up the related benchmark score(s) we measured on that exact instance type, and find candidates matching the threshold based on your optimization goal.";

export const ADVISOR_AVERAGE_UTILIZATION_TITLE = "Average utilization";

export const ADVISOR_AVERAGE_UTILIZATION_TOOLTIP =
  "Provide a high-level utilization percentage of your server, e.g. the average CPU or GPU usage. You will be able to fine-tune this setting below with the peak memory utilization as well if needed. We will use this number to see how low we can scale the candidate servers' performance for cost savings.";

export const ADVISOR_REQUIRED_MEMORY_TITLE = "Required memory (RAM)";

export const ADVISOR_REQUIRED_GPU_MEMORY_TITLE = "Required GPU memory (VRAM)";

export const ADVISOR_OPTIMIZATION_GOAL_TITLE = "Optimization goal";

export const ADVISOR_WORKLOAD_SCORE_TOOLTIP = "Selected workload score.";

export const ADVISOR_TABLE_COLUMNS: AdvisorTableColumn[] = [
  { name: "NAME & PROVIDER", type: "name", show: true },
  { name: "VENDOR", type: "vendor", key: "vendor_id", show: false },
  {
    name: "ARCHITECTURE",
    type: "text",
    key: "cpu_architecture",
    show: false,
  },
  {
    name: "PROCESSOR",
    type: "processor",
    show: true,
    orderField: "vcpus",
  },
  {
    name: "CPU MODEL",
    type: "cpu_model",
    key: "cpu_model",
    show: false,
  },
  {
    name: "CPU CACHE",
    type: "cpu_cache",
    show: false,
  },
  {
    name: "CPU ALLOCATION",
    type: "text",
    key: "cpu_allocation",
    show: false,
  },
  {
    name: "SCORE",
    type: "score",
    key: "score",
    show: false,
    orderField: "score",
    info: SERVER_TABLE_SCORE_TOOLTIP,
  },
  {
    name: "$CORE",
    type: "score_per_price",
    key: "score_per_price",
    show: false,
    orderField: "score_per_price",
    info: SERVER_TABLE_SCORE_PER_PRICE_TOOLTIP,
  },
  {
    name: "WORKLOAD",
    type: "benchmark",
    key: "selected_benchmark_score",
    show: true,
    orderField: "selected_benchmark_score",
    info: ADVISOR_WORKLOAD_SCORE_TOOLTIP,
  },
  {
    name: "$ EFFICIENCY",
    type: "benchmark_score_per_price",
    key: "selected_benchmark_score_per_price",
    show: true,
    orderField: "selected_benchmark_score_per_price",
    info: SERVER_TABLE_BENCHMARK_EFFICIENCY_TOOLTIP,
  },
  {
    name: "MEMORY",
    type: "memory",
    key: "memory_amount",
    show: true,
    orderField: "memory_amount",
  },
  {
    name: "GPUs",
    type: "gpu",
    key: "gpu_count",
    show: true,
    orderField: "gpu_count",
  },
  {
    name: "GPU MIN MEMORY",
    type: "gpu_memory_min",
    key: "gpu_memory_min",
    show: false,
    orderField: "gpu_memory_min",
  },
  {
    name: "GPU TOTAL MEMORY",
    type: "gpu_memory_total",
    key: "gpu_memory_total",
    show: false,
    orderField: "gpu_memory_total",
  },
  {
    name: "GPU MODEL",
    type: "gpu_model",
    key: "gpu_model",
    show: false,
  },
  {
    name: "STORAGE",
    type: "storage",
    key: "storage_size",
    show: true,
    orderField: "storage_size",
  },
  {
    name: "STORAGE TYPE",
    type: "text",
    key: "storage_type",
    show: false,
  },
  {
    name: "NETWORK SPEED",
    type: "network_speed",
    key: "network_speed_baseline",
    show: false,
    orderField: "network_speed_baseline",
  },
  {
    name: "STORAGE SPEED",
    type: "network_speed",
    key: "network_storage_speed_baseline",
    show: false,
    orderField: "network_storage_speed_baseline",
  },
  {
    name: "INBOUND TRAFFIC",
    type: "inbound_traffic",
    key: "inbound_traffic",
    show: false,
    orderField: "inbound_traffic",
  },
  {
    name: "OUTBOUND TRAFFIC",
    type: "outbound_traffic",
    key: "outbound_traffic",
    show: false,
    orderField: "outbound_traffic",
  },
  {
    name: "IPV4",
    type: "ipv4",
    key: "ipv4",
    show: false,
    orderField: "ipv4",
  },
  {
    name: "BEST PRICE",
    type: "price",
    key: "min_price",
    show: true,
    orderField: "min_price",
  },
  {
    name: "BEST ONDEMAND PRICE",
    type: "price",
    key: "min_price_ondemand",
    show: false,
    orderField: "min_price_ondemand",
  },
  {
    name: "BEST ONDEMAND MONTHLY PRICE",
    type: "price",
    key: "min_price_ondemand_monthly",
    show: false,
    orderField: "min_price_ondemand_monthly",
  },
  {
    name: "BEST SPOT PRICE",
    type: "price",
    key: "min_price_spot",
    show: false,
    orderField: "min_price_spot",
  },
  {
    name: "STATUS",
    type: "text",
    key: "status",
    show: false,
    orderField: "status",
  },
];

export const ADVISOR_PAGE_LIMITS = [10, 25, 50, 100, 250];

export const ADVISOR_REQUIRED_INPUT_LABELS = [
  ADVISOR_BASELINE_SERVER_TITLE,
  ADVISOR_BASELINE_WORKLOAD_TITLE,
  ADVISOR_OPTIMIZATION_GOAL_TITLE,
  ADVISOR_AVERAGE_UTILIZATION_TITLE,
] as const;
