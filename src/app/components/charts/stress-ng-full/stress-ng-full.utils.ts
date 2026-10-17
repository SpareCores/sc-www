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
  single: number | null | undefined,
  multi: number | null | undefined,
): string {
  if (
    typeof single !== "number" ||
    typeof multi !== "number" ||
    !Number.isFinite(single) ||
    !Number.isFinite(multi) ||
    single <= 0
  ) {
    return "-";
  }
  return `${(multi / single).toFixed(2)}×`;
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

  const sections: StressNgSection[] = [];
  (benchmarkMeta ?? [])
    .filter(isStressNgStressor)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((benchmark) => {
      const single = scoreFor(benchmark.benchmark_id, "single");
      const multi = scoreFor(benchmark.benchmark_id, "multi");
      if (single == null && multi == null) {
        return;
      }
      const name = benchmark.subcategory ?? "";
      let section = sections.find((s) => s.name === name);
      if (!section) {
        section = { name, rows: [] };
        sections.push(section);
      }
      section.rows.push({
        benchmark,
        name: benchmark.name.replace(/^stress-ng\s+/i, ""),
        single: formatStressNgScore(single),
        multi: formatStressNgScore(multi),
        scaling: formatStressNgScaling(single, multi),
      });
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

function sectionRank(section: StressNgSection): number {
  const rank = STRESS_NG_SUBCATEGORY_ORDER.indexOf(section.name);
  return rank === -1 ? STRESS_NG_SUBCATEGORY_ORDER.length : rank;
}
