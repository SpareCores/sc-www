import { BreadcrumbSegment } from "../../components/breadcrumbs/breadcrumbs.component";
import { SearchBarCustomSelectOption } from "../../components/search-bar/search-bar.component";
import { AdvisorTableColumn } from "./advisor.types";

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
