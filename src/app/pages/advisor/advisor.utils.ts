import { BenchmarkScore, ServerPKs } from "../../../../sdk/data-contracts";
import { SearchBarBenchmarkConfigOption } from "../../components/search-bar/search-bar.component";
import {
  ADVISOR_DEFAULT_WORKLOAD_CONFIG,
  ADVISOR_DEFAULT_WORKLOAD_ID,
  ADVISOR_TABLE_COLUMNS,
} from "./advisor.constants";
import {
  AdvisorBaselineServer,
  AdvisorOptimizationGoal,
  AdvisorTableColumn,
} from "./advisor.types";

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([left], [right]) => left.localeCompare(right),
    );

    return `{${entries
      .map(
        ([key, entryValue]) =>
          `${JSON.stringify(key)}:${stableStringify(entryValue)}`,
      )
      .join(",")}}`;
  }

  return JSON.stringify(value ?? null);
}

export function normalizeBenchmarkConfig(config: unknown): string {
  if (typeof config === "string") {
    const trimmed = config.trim();

    if (!trimmed) {
      return stableStringify({});
    }

    try {
      return stableStringify(JSON.parse(trimmed));
    } catch {
      return trimmed;
    }
  }

  return stableStringify(config ?? {});
}

export function tokenizeAdvisorSearch(value: string): string[] {
  return value.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesAdvisorBaselineServer(
  server: Pick<AdvisorBaselineServer, "vendor_id" | "api_reference">,
  searchValue: string,
): boolean {
  const tokens = tokenizeAdvisorSearch(searchValue);

  if (!tokens.length) {
    return false;
  }

  const searchable =
    `${server.vendor_id} ${server.api_reference}`.toLowerCase();
  return tokens.every((token) => searchable.includes(token));
}

export function isAdvisorOptimizationGoal(
  value: unknown,
): value is AdvisorOptimizationGoal {
  return (
    value === "performance" || value === "cost" || value === "cost-efficiency"
  );
}

export function findAdvisorBenchmarkConfigOption(
  options: SearchBarBenchmarkConfigOption[],
  benchmarkId: unknown,
  config: unknown = ADVISOR_DEFAULT_WORKLOAD_CONFIG,
): SearchBarBenchmarkConfigOption | null {
  if (typeof benchmarkId !== "string" || !benchmarkId.length) {
    return null;
  }

  const expectedConfig =
    typeof config === "string" && config.length
      ? config
      : ADVISOR_DEFAULT_WORKLOAD_CONFIG;

  return (
    options.find((option) => {
      return (
        option.benchmark_id === benchmarkId && option.config === expectedConfig
      );
    }) || null
  );
}

export function getDefaultAdvisorBenchmarkConfig(
  options: SearchBarBenchmarkConfigOption[],
): SearchBarBenchmarkConfigOption | null {
  return findAdvisorBenchmarkConfigOption(
    options,
    ADVISOR_DEFAULT_WORKLOAD_ID,
    ADVISOR_DEFAULT_WORKLOAD_CONFIG,
  );
}

export function findAdvisorBenchmarkScore(
  scores: BenchmarkScore[],
  selectedBenchmarkConfig: Pick<
    SearchBarBenchmarkConfigOption,
    "benchmark_id" | "config"
  > | null,
): BenchmarkScore | null {
  if (!selectedBenchmarkConfig) {
    return null;
  }

  const selectedConfigKey = normalizeBenchmarkConfig(
    selectedBenchmarkConfig.config,
  );

  return (
    scores.find((benchmarkScore) => {
      return (
        benchmarkScore.benchmark_id === selectedBenchmarkConfig.benchmark_id &&
        normalizeBenchmarkConfig(benchmarkScore.config) === selectedConfigKey
      );
    }) || null
  );
}

export function cloneAdvisorTableColumns(): AdvisorTableColumn[] {
  return ADVISOR_TABLE_COLUMNS.map((column) => ({ ...column }));
}

export function hasCustomAdvisorColumns(
  columns: AdvisorTableColumn[],
): boolean {
  return !columns.every((column, index) => {
    return column.show === ADVISOR_TABLE_COLUMNS[index]?.show;
  });
}

export function encodeAdvisorColumnState(
  columns: AdvisorTableColumn[],
): number {
  return columns
    .map((column) => (column.show ? 1 : 0))
    .reduce<number>((accumulator, bit) => (accumulator << 1) | bit, 0);
}

export function restoreAdvisorColumnsFromQuery(
  encodedColumns: unknown,
  orderBy?: string,
): AdvisorTableColumn[] {
  let columns = cloneAdvisorTableColumns();

  if (
    encodedColumns !== undefined &&
    encodedColumns !== null &&
    String(encodedColumns).length
  ) {
    const parsedColumns = Number(encodedColumns);

    if (Number.isInteger(parsedColumns) && parsedColumns >= 0) {
      const bits = parsedColumns
        .toString(2)
        .padStart(columns.length, "0")
        .slice(-columns.length)
        .split("")
        .map(Number);

      columns = columns.map((column, index) => {
        return { ...column, show: bits[index] === 1 };
      });
    }
  }

  if (!orderBy) {
    return columns;
  }

  return columns.map((column) => {
    return column.orderField === orderBy ? { ...column, show: true } : column;
  });
}

export function getAdvisorCompareKey(
  server: Pick<ServerPKs, "vendor_id" | "api_reference">,
): string {
  return `${server.vendor_id}::${server.api_reference}`;
}
