import { MemoryScaleBenchmark, MemoryScaleOption } from "./memory-chart.types";
import { sortUniqueNumbers } from "./benchmark-scale.utils";

function isMembenchOption(option?: MemoryScaleOption) {
  if (!option) {
    return false;
  }

  if ("benchmarkId" in option) {
    return option.benchmarkId.startsWith("membench:");
  }

  return option.benchmarkIds.some((benchmarkId) =>
    benchmarkId.startsWith("membench:"),
  );
}

export function getMemoryBenchmarkScaleValue(
  benchmark: MemoryScaleBenchmark,
  option?: MemoryScaleOption,
) {
  if (isMembenchOption(option)) {
    const sizeKb = benchmark.config?.size_kb;
    return sizeKb || sizeKb === 0 ? sizeKb / 1024 : undefined;
  }

  return benchmark.config?.size;
}

export function collectMemoryBenchmarkScales(
  benchmarks: MemoryScaleBenchmark[],
  option?: MemoryScaleOption,
) {
  return sortUniqueNumbers(
    benchmarks.map((benchmark) =>
      getMemoryBenchmarkScaleValue(benchmark, option),
    ),
  );
}

export function normalizeMemoryBenchmarkScore(
  score: number | null | undefined,
  perCore: boolean | undefined,
  coreCount: number | null | undefined,
) {
  if (score === null || score === undefined) {
    return null;
  }

  if (!perCore) {
    return score;
  }

  return coreCount ? score / coreCount : score;
}
