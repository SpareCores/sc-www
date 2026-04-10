import { BreadcrumbSegment } from "../../components/breadcrumbs/breadcrumbs.component";
import { SearchBarCustomSelectOption } from "../../components/search-bar/search-bar.component";
import {
  AdvisorOptimizationGoal,
  AdvisorSeoMetadata,
  AdvisorTableColumn,
} from "./advisor.types";

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
  "gpu_memory_total",
  "storage_size",
  "cpu_architecture",
  "cpu_allocation",
] as const;

export const ADVISOR_FILTER_CATEGORIES = [
  { category_id: "advisor", name: "Advisor", icon: "bot", collapsed: false },
  { category_id: "vendor", name: "Vendor", icon: "home", collapsed: true },
  { category_id: "region", name: "Region", icon: "hotel", collapsed: true },
];

export const ADVISOR_OPTIMIZATION_GOAL_OPTIONS: SearchBarCustomSelectOption[] =
  [
    { value: "performance", label: "Performance" },
    { value: "cost", label: "Cost" },
    { value: "cost-efficiency", label: "Cost-efficiency" },
  ];

export const ADVISOR_DEFAULT_OPTIMIZATION_GOAL: AdvisorOptimizationGoal =
  "cost";

export const ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB = 0.5;

export const ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB = 0;

export const ADVISOR_DEFAULT_PAGE_LIMIT = 25;

export const ADVISOR_DEFAULT_CURRENCY = "USD";

export const ADVISOR_DEFAULT_PRICE_ALLOCATION = "ANY";

export const ADVISOR_PRICE_ALLOCATION_TOOLTIP =
  "Choose which pricing model the advisor should compare against. Leave this disabled to rank recommendations by the overall best available price across ondemand, monthly, and spot offers.";

export const ADVISOR_BASELINE_REGION_TOOLTIP =
  "Uses the baseline server's known regional availability to narrow recommendations to a single region where that server is sold. This control is disabled when Vendor and region id filters are in use, because those filters support broader multi-region choices.";

export const ADVISOR_DEFAULT_WORKLOAD_ID = "stress_ng:bestn";

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

export const ADVISOR_SEO: AdvisorSeoMetadata = {
  title: "Cloud Server Advisor - Spare Cores",
  description:
    "Transform your high-level server utilization telemetry data into ranked, explainable cloud resource allocation recommendations. Compare your baseline choice against workload-aware alternatives to reduce costs and improve performance or cost efficiency of your workloads.",
  keywords:
    "cloud server advisor, cloud servers, workload recommendations, cost efficiency, performance, spare cores",
};

export const ADVISOR_DEFAULT_EMPTY_RESULTS_MESSAGE =
  "No recommended servers available.";

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
  },
  {
    name: "$CORE",
    type: "score_per_price",
    key: "score_per_price",
    show: false,
    orderField: "score_per_price",
  },
  {
    name: "BENCHMARK",
    type: "benchmark",
    key: "selected_benchmark_score",
    show: true,
    orderField: "selected_benchmark_score",
  },
  {
    name: "$ EFFICIENCY",
    type: "benchmark_score_per_price",
    key: "selected_benchmark_score_per_price",
    show: true,
    orderField: "selected_benchmark_score_per_price",
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
    key: "network_speed",
    show: false,
    orderField: "network_speed",
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
  "Baseline server",
  "Server workload",
  "Optimization goal",
  "Average utilization",
  "Minimum memory",
] as const;
