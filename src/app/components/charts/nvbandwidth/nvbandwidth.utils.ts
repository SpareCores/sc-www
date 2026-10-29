import { Benchmark, BenchmarkScore } from "../../../../../sdk/data-contracts";

export const NVBANDWIDTH_BENCHMARK_PREFIX = "nvbandwidth:";
export const NVBANDWIDTH_TITLE = "GPU Bandwidth and Latency";

const NVBANDWIDTH_GROUP_ORDER = ["all", "p2p", "slot", "efficiency"];

const NVBANDWIDTH_GROUP_LABELS: Record<string, string> = {
  all: "Node (all GPUs)",
  p2p: "Peer-to-peer",
  slot: "Single GPU slot",
  efficiency: "Efficiency",
};

// `legacyKey` is read when `key` is missing, e.g. on scores recorded by an
// older crawler release before the field was renamed
const NVBANDWIDTH_ENVIRONMENT_FIELDS: {
  key: string;
  name: string;
  legacyKey?: string;
}[] = [
  { key: "driver_version", name: "Driver Version" },
  {
    key: "cuda_version",
    name: "CUDA Version (driver)",
    legacyKey: "cuda_runtime_version",
  },
  { key: "nvbandwidth_version", name: "nvbandwidth Version" },
  { key: "gpu_count", name: "GPU Count" },
  { key: "p2p_supported", name: "P2P Supported" },
];

export type NvbandwidthCompareBenchmark = Benchmark & {
  configs?: { values?: (number | string)[] }[];
};

export interface NvbandwidthMetricRow<
  T = number | string,
  B extends Benchmark = Benchmark,
> {
  benchmark: B;
  name: string;
  values: T[];
}

export interface NvbandwidthSection<
  T = number | string,
  B extends Benchmark = Benchmark,
> {
  name: string;
  rows: NvbandwidthMetricRow<T, B>[];
}

export interface NvbandwidthEnvironmentRow {
  key: string;
  name: string;
  description: string;
  values: string[];
}

export function nvbandwidthGroupId(benchmarkId: string | undefined): string {
  return benchmarkId?.split(":")[1] ?? "";
}

export function isNvbandwidthBenchmark(benchmarkId: string | undefined) {
  return !!benchmarkId?.startsWith(NVBANDWIDTH_BENCHMARK_PREFIX);
}

export function formatNvbandwidthScore(
  score: number | string | null | undefined,
  unit: string | null | undefined,
): string {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return "-";
  }
  if (unit === "ratio") {
    return score.toFixed(2);
  }
  if (unit === "ns") {
    return `${Math.round(score).toLocaleString("en-US")} ns`;
  }
  return `${score.toFixed(1)}${unit ? " " + unit : ""}`;
}

export function buildNvbandwidthSections<T, B extends Benchmark = Benchmark>(
  benchmarkMeta: B[] | null | undefined,
  valuesFor: (benchmark: B) => T[] | null,
): NvbandwidthSection<T, B>[] {
  const benchmarks = (benchmarkMeta ?? [])
    .filter((benchmark) => isNvbandwidthBenchmark(benchmark.benchmark_id))
    .sort((a, b) => groupRank(a) - groupRank(b));

  const sections: NvbandwidthSection<T, B>[] = [];
  benchmarks.forEach((benchmark) => {
    const values = valuesFor(benchmark);
    if (!values?.length) {
      return;
    }
    const group = groupId(benchmark);
    const name =
      benchmark.subcategory || NVBANDWIDTH_GROUP_LABELS[group] || group;
    let section = sections.find((s) => s.name === name);
    if (!section) {
      section = { name, rows: [] };
      sections.push(section);
    }
    section.rows.push({
      benchmark,
      name: benchmark.name.replace(/\s*\(nvbandwidth\)$/, ""),
      values,
    });
  });
  return sections;
}

export function buildNvbandwidthEnvironmentRows(
  benchmarkMeta: Benchmark[] | null | undefined,
  scoresPerServer: (BenchmarkScore[] | null | undefined)[],
): NvbandwidthEnvironmentRow[] {
  const fieldDescriptions =
    (benchmarkMeta ?? []).find((benchmark) =>
      isNvbandwidthBenchmark(benchmark.benchmark_id),
    )?.environment_fields ?? {};
  const environments = scoresPerServer.map(
    (scores) =>
      scores?.find(
        (score) =>
          isNvbandwidthBenchmark(score.benchmark_id) && !!score.environment,
      )?.environment ?? null,
  );

  return NVBANDWIDTH_ENVIRONMENT_FIELDS.map((field) => ({
    key: field.key,
    name: field.name,
    description: String(
      fieldDescriptions[field.key] ??
        (field.legacyKey ? fieldDescriptions[field.legacyKey] : undefined) ??
        "",
    ),
    values: environments.map((environment) =>
      formatEnvironmentValue(
        field.key,
        environment?.[field.key] ??
          (field.legacyKey ? environment?.[field.legacyKey] : undefined),
      ),
    ),
  })).filter((row) => row.values.some((value) => value !== "-"));
}

function formatEnvironmentValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "check" : "x";
  }
  if (key === "cuda_version" && typeof value === "number") {
    return `${Math.floor(value / 1000)}.${Math.floor((value % 1000) / 10)}`;
  }
  return String(value);
}

function groupId(benchmark: Benchmark): string {
  return nvbandwidthGroupId(benchmark.benchmark_id);
}

function groupRank(benchmark: Benchmark): number {
  const rank = NVBANDWIDTH_GROUP_ORDER.indexOf(groupId(benchmark));
  return rank === -1 ? NVBANDWIDTH_GROUP_ORDER.length : rank;
}
