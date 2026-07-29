import type {
  Benchmark,
  BenchmarkConfig,
  Server,
} from "../../../../sdk/data-contracts";

export type SearchBarParameter = {
  name: string;
  modelValue: unknown;
  schema: {
    category_id?: string;
    description?: string;
    default?: unknown;
    null_value?: unknown;
    filter_mode?: string;
    enum?: BenchmarkFilterOption[];
    type?: string;
    anyOf?: Array<{ type?: string }>;
    title?: string;
    unit?: string;
    step?: number;
    range_min?: number;
    range_max?: number;
    [key: string]: unknown;
  };
};

export type SearchBarCustomControl = {
  name: string;
  category_id: string;
  type:
    | "serverAutocomplete"
    | "benchmarkConfigSelect"
    | "singleSelect"
    | "rangeSlider"
    | "powerOfTwoStepper"
    | "checkbox"
    | "checkboxGroup";
  title: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  descriptionDisplay?: "inline" | "tooltip";
  hideTitle?: boolean;
  minCharacters?: number;
  inputValue?: string;
  selectedServer?: SearchBarServerOption | null;
  options?: SearchBarServerOption[];
  emptyMessage?: string;
  selectedBenchmarkConfig?: SearchBarBenchmarkConfigOption | null;
  benchmarkOptions?: SearchBarBenchmarkConfigOption[];
  benchmarkGroups?: SearchBarBenchmarkConfigGroup[];
  selectedValue?: string | null;
  selectOptions?: SearchBarCustomSelectOption[];
  numericValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  numericFormat?: "binaryMemory";
  tickValues?: number[];
  allowZero?: boolean;
  defaultNumericValue?: number | null;
  valueSummary?: string | null;
  showUnitInTicks?: boolean;
  nested?: boolean;
  checked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  sectionHeader?: string;
  checkboxOptions?: {
    name: string;
    title: string;
    checked?: boolean;
    disabled?: boolean;
    description?: string;
  }[];
};

export type SearchBarCustomSelectOption = {
  value: string;
  label: string;
};

export type SearchBarCustomControlChange = {
  name: string;
  value: unknown;
};

export type SearchBarTooltipEvent = {
  event: MouseEvent | FocusEvent;
  content: string;
};

export type SearchBarParameterTemplateContext = {
  parameter: SearchBarParameter;
  filterCategoryId: string;
};

export type SearchBarFilterCategory = {
  category_id: string;
  name: string;
  icon: string;
  collapsed: boolean;
  alwaysExpanded?: boolean;
  hideHeader?: boolean;
};

export type SearchBarParameterPlacement = {
  parameterName: string;
  categoryId?: string;
  afterControlName?: string;
};

export type SearchBarBenchmarkConfigOption = BenchmarkConfig & {
  benchmarkTemplate?: Benchmark | null;
  groupLabel?: string;
  configTitle: string;
  displayName: string;
  framework: string;
};

export type SearchBarServerOption = Pick<
  Server,
  "vendor_id" | "api_reference"
> &
  Partial<
    Pick<
      Server,
      | "server_id"
      | "display_name"
      | "description"
      | "vcpus"
      | "memory_amount"
      | "gpu_count"
      | "gpu_memory_min"
      | "storage_size"
      | "gpu_memory_total"
      | "cpu_architecture"
      | "cpu_allocation"
      | "cpu_l1d_cache"
      | "cpu_l2_cache"
      | "cpu_l3_cache"
    >
  >;

export type SearchBarBenchmarkConfigGroup = {
  name: string;
  options: SearchBarBenchmarkConfigOption[];
};

export type SearchBarParameterType =
  | "text"
  | "country"
  | "vendor_regions"
  | "compliance_framework"
  | "vendor"
  | "storage_id"
  | "singleRadio"
  | "benchmarkTriState"
  | "range"
  | "cpuCacheRange"
  | "price"
  | "number"
  | "checkbox"
  | "enumArray";

export type BenchmarkFilterOption =
  | string
  | number
  | { key?: string; value?: string };

export type SearchBarQuery = Record<string, unknown>;

export type SearchBarCurrency = {
  slug?: string;
  name?: string;
  symbol?: string;
} | null;

export type CountryMetadata = {
  continent: string;
  country_id: string;
  selected?: boolean;
};

export type ContinentMetadata = {
  continent: string;
  selected?: boolean;
  collapsed?: boolean;
};

export type RegionMetadata = {
  region_id: string;
  vendor_id: string;
  name: string;
  api_reference: string;
  green_energy: boolean;
};

export type ComplianceFrameworkMetadata = {
  compliance_framework_id: string;
  abbreviation?: string;
  [key: string]: unknown;
};

export type VendorMetadata = {
  vendor_id: string;
  name?: string;
  [key: string]: unknown;
};

export type StorageMetadata = {
  storage_id: string;
  name?: string;
  [key: string]: unknown;
};
