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
  { name: "VENDOR", key: "vendor_id" },
  { name: "API REFERENCE", key: "api_reference", orderField: "api_reference" },
  { name: "STATUS", key: "status", orderField: "status" },
  { name: "VCPUs", key: "vcpus", orderField: "vcpus" },
  { name: "MEMORY", key: "memory_amount", orderField: "memory_amount" },
  {
    name: "GPU MEMORY",
    key: "gpu_memory_total",
    orderField: "gpu_memory_total",
  },
  { name: "STORAGE", key: "storage_size", orderField: "storage_size" },
  { name: "", key: "details" },
];

export const ADVISOR_PAGE_LIMITS = [10, 25, 50, 100];

export const ADVISOR_REQUIRED_INPUT_LABELS = [
  "Baseline server",
  "Server workload",
  "Optimization goal",
  "Average CPU utilization",
  "Minimum memory",
] as const;
