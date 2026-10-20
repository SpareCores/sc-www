import { Benchmark, BenchmarkScore } from "../../../../../sdk/data-contracts";

export const STRESS_NG_BENCHMARK_PREFIX = "stress_ng:";
export const STRESS_NG_TITLE = "Stress-ng Stressors";

const STRESS_NG_SUBCATEGORY_ORDER = [
  "CPU integer",
  "CPU float/SIMD",
  "Algorithms",
  "Memory",
  "Cryptography",
  "Compression",
  "Hypervisor",
];

const SECTION_HEADER_WEIGHT = 2;

export interface StressNgValue {
  text: string;
  exact: string;
}

export interface StressNgRow {
  benchmark: Benchmark;
  name: string;
  single: StressNgValue;
  multi: StressNgValue;
  scaling: string;
}

export interface StressNgSection {
  name: string;
  rows: StressNgRow[];
}

export type StressNgMetric = "single" | "multi" | "scaling";

export const STRESS_NG_METRIC_OPTIONS: { id: StressNgMetric; name: string }[] =
  [
    { id: "single", name: "Single-core" },
    { id: "multi", name: "Multi-core" },
    { id: "scaling", name: "Scaling (multi/single)" },
  ];

export type StressNgCompareBenchmark = Benchmark & {
  configs?: {
    config?: Record<string, unknown>;
    values?: (number | string)[];
  }[];
};

export interface StressNgCompareRow {
  benchmark: StressNgCompareBenchmark;
  name: string;
  values: (number | string)[];
}

export interface StressNgCompareSection {
  name: string;
  rows: StressNgCompareRow[];
}

export function isStressNgStressor(benchmark: Benchmark): boolean {
  return (
    !!benchmark.benchmark_id?.startsWith(STRESS_NG_BENCHMARK_PREFIX) &&
    !!benchmark.subcategory
  );
}

export function formatStressNgScore(
  score: number | null | undefined,
): StressNgValue {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return { text: "-", exact: "" };
  }
  const exact = score.toLocaleString("en-US", { maximumFractionDigits: 20 });
  const text =
    Math.abs(score) >= 1000
      ? Math.round(score).toLocaleString("en-US")
      : score.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return { text, exact: text === exact ? "" : exact };
}

export function formatStressNgScaling(
  single: number | string | null | undefined,
  multi: number | string | null | undefined,
): string {
  const scaling = stressNgScalingValue(single, multi);
  return typeof scaling === "number" ? `${scaling.toFixed(2)}×` : "-";
}

export function buildStressNgSections(
  benchmarkMeta: Benchmark[] | null | undefined,
  benchmarkScores: BenchmarkScore[] | null | undefined,
): StressNgSection[] {
  const scoreFor = (benchmarkId: string, cores: string) =>
    (benchmarkScores ?? []).find(
      (score) =>
        score.benchmark_id === benchmarkId && score.config?.["cores"] === cores,
    )?.score;

  return groupStressNgSections(benchmarkMeta, (benchmark) => {
    const single = scoreFor(benchmark.benchmark_id, "single");
    const multi = scoreFor(benchmark.benchmark_id, "multi");
    if (single == null && multi == null) {
      return null;
    }
    return {
      benchmark,
      name: stressNgRowName(benchmark),
      single: formatStressNgScore(single),
      multi: formatStressNgScore(multi),
      scaling: formatStressNgScaling(single, multi),
    };
  });
}

export function buildStressNgCompareSections(
  benchmarkMeta: StressNgCompareBenchmark[] | null | undefined,
  metric: StressNgMetric,
): StressNgCompareSection[] {
  return groupStressNgSections(benchmarkMeta, (benchmark) => {
    const single = compareValuesFor(benchmark, "single");
    const multi = compareValuesFor(benchmark, "multi");
    const values =
      metric === "single"
        ? single
        : metric === "multi"
          ? multi
          : multi.map((value, index) =>
              stressNgScalingValue(single[index], value),
            );
    if (!values.some((value) => typeof value === "number")) {
      return null;
    }
    return { benchmark, name: stressNgRowName(benchmark), values };
  });
}

export function stressNgScalingValue(
  single: number | string | null | undefined,
  multi: number | string | null | undefined,
): number | string {
  if (
    typeof single !== "number" ||
    typeof multi !== "number" ||
    !Number.isFinite(single) ||
    !Number.isFinite(multi) ||
    single <= 0
  ) {
    return "-";
  }
  return multi / single;
}

function compareValuesFor(
  benchmark: StressNgCompareBenchmark,
  cores: string,
): (number | string)[] {
  return (
    benchmark.configs?.find((config) => config.config?.["cores"] === cores)
      ?.values ?? []
  );
}

function stressNgRowName(benchmark: Benchmark): string {
  return benchmark.name.replace(/^stress-ng\s+/i, "");
}

function groupStressNgSections<
  R extends { benchmark: Benchmark },
  B extends Benchmark,
>(
  benchmarkMeta: B[] | null | undefined,
  rowFor: (benchmark: B) => R | null,
): { name: string; rows: R[] }[] {
  const sections: { name: string; rows: R[] }[] = [];
  (benchmarkMeta ?? [])
    .filter(isStressNgStressor)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((benchmark) => {
      const row = rowFor(benchmark);
      if (!row) {
        return;
      }
      const name = benchmark.subcategory ?? "";
      let section = sections.find((s) => s.name === name);
      if (!section) {
        section = { name, rows: [] };
        sections.push(section);
      }
      section.rows.push(row);
    });

  return sections.sort((a, b) => sectionRank(a) - sectionRank(b));
}

export function splitStressNgColumns(
  sections: StressNgSection[],
): [StressNgSection[], StressNgSection[]] {
  const weight = (section: StressNgSection) =>
    section.rows.length + SECTION_HEADER_WEIGHT;
  const columns: [StressNgSection[], StressNgSection[]] = [[], []];
  const heights = [0, 0];
  [...sections]
    .sort((a, b) => weight(b) - weight(a))
    .forEach((section) => {
      const target = heights[0] <= heights[1] ? 0 : 1;
      columns[target].push(section);
      heights[target] += weight(section);
    });
  columns.forEach((column) =>
    column.sort((a, b) => sectionRank(a) - sectionRank(b)),
  );
  return columns;
}

function sectionRank(section: { name: string }): number {
  const rank = STRESS_NG_SUBCATEGORY_ORDER.indexOf(section.name);
  return rank === -1 ? STRESS_NG_SUBCATEGORY_ORDER.length : rank;
}
