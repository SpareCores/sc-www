export type ServerAssessmentKind =
  | "fully_evaluated"
  | "in_progress"
  | "cannot_evaluate"
  | "unavailable";

export type ServerAssessment = {
  kind: ServerAssessmentKind;
  icon: string;
  tooltip: string;
};

export type MissingBenchmarkServerRow = {
  serverKey: string;
  vendor_id: string;
  api_reference: string;
  has_price: boolean;
  is_active: boolean;
  has_hw_info: boolean;
  has_any_benchmark: boolean;
  benchmarkFlags: Record<string, boolean>;
  assessment: ServerAssessment;
};

export type FilterCategory = {
  category_id: "vendor" | "status" | "benchmark";
  name: string;
  icon: string;
  collapsed: boolean;
};

export type PageLimitOption = number;

export type BenchmarkFamilyFilterValue = "all" | "yes" | "no";

export type ServerStatusFilter = "all" | "active" | "inactive";

export type SearchParameterEnumOption = { key: string; value: string };

export type SearchParameterSchema = {
  title: string;
  category_id: string;
  type: string;
  filter_mode?: string;
  enum?: SearchParameterEnumOption[];
};

export type SearchParameter = {
  name: string;
  schema: SearchParameterSchema;
  modelValue: string | string[] | Record<string, BenchmarkFamilyFilterValue>;
};

export type SearchQuery = {
  search: string;
  vendor_ids: string[];
  server_status: ServerStatusFilter;
  status_bool: Record<string, BenchmarkFamilyFilterValue>;
  benchmark_families: Record<string, BenchmarkFamilyFilterValue>;
};

export type SearchBarFilters = {
  search?: unknown;
  vendor_ids?: unknown;
  server_status?: unknown;
  status_bool?: unknown;
  benchmark_families?: unknown;
};
