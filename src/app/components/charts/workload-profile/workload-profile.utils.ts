import { Status } from "../../../../../sdk/data-contracts";

export type WorkloadProfileBenchmarkRef = {
  benchmark_id?: string;
  name?: string;
  status?: Status;
};

type WorkloadProfileBenchmarkScoreRef = {
  benchmark_id?: string;
  score?: number | null;
};

type WorkloadProfileChartServerRef = {
  benchmark_scores?: WorkloadProfileBenchmarkScoreRef[];
};

const WORKLOAD_PROFILE_NAME_PREFIX = "workload profile";

export const WORKLOAD_PROFILE_INFO_TOOLTIP =
  "Augmented workload profiles combine raw benchmark measurements into compound scores to describe the expected performance of common server workloads with a few easy-to-interpret numbers, using expert-weighted aggregation algorithms.";

export function isWorkloadProfileBenchmark(
  benchmark: WorkloadProfileBenchmarkRef,
): boolean {
  const benchmarkId = benchmark.benchmark_id?.toLowerCase() ?? "";

  if (
    benchmarkId.startsWith("workload_profile:") ||
    benchmarkId.startsWith("workload:")
  ) {
    return true;
  }

  return (benchmark.name ?? "")
    .toLowerCase()
    .startsWith(WORKLOAD_PROFILE_NAME_PREFIX);
}

export function filterWorkloadProfileBenchmarks<
  T extends WorkloadProfileBenchmarkRef,
>(benchmarkMeta: T[]): T[] {
  return benchmarkMeta
    .filter(
      (benchmark) =>
        isWorkloadProfileBenchmark(benchmark) &&
        benchmark.status === Status.Active,
    )
    .sort((left, right) => (left.name ?? "").localeCompare(right.name ?? ""));
}

export function hasWorkloadProfileChartData(params: {
  benchmarkMeta: WorkloadProfileBenchmarkRef[];
  benchmarkScores?: WorkloadProfileBenchmarkScoreRef[];
  servers?: WorkloadProfileChartServerRef[];
}): boolean {
  const benchmarkIds = new Set(
    filterWorkloadProfileBenchmarks(params.benchmarkMeta)
      .map((benchmark) => benchmark.benchmark_id)
      .filter((benchmarkId): benchmarkId is string => !!benchmarkId),
  );
  const benchmarkScores =
    params.servers?.flatMap((server) => server.benchmark_scores ?? []) ??
    params.benchmarkScores ??
    [];

  return benchmarkScores.some(
    (score) =>
      benchmarkIds.has(score.benchmark_id ?? "") && score.score != null,
  );
}

export function hasWorkloadProfileScore(
  score: number | null | undefined,
): score is number {
  return score != null && Number.isFinite(score);
}

export function resolveWorkloadProfileBenchmarksWithData<
  T extends WorkloadProfileBenchmarkRef,
>(params: {
  benchmarkMeta: T[];
  layout: "details" | "compare";
  serverDetails?: { benchmark_scores?: WorkloadProfileBenchmarkScoreRef[] };
  servers?: WorkloadProfileChartServerRef[];
}): T[] {
  const benchmarks = filterWorkloadProfileBenchmarks(params.benchmarkMeta);

  if (params.layout === "details") {
    const scores = params.serverDetails?.benchmark_scores ?? [];

    return benchmarks.filter((benchmark) => {
      const benchmarkId = benchmark.benchmark_id;

      if (!benchmarkId) {
        return false;
      }

      const score = scores.find(
        (item) => item.benchmark_id === benchmarkId,
      )?.score;

      return hasWorkloadProfileScore(score);
    });
  }

  const servers = params.servers ?? [];

  return benchmarks.filter((benchmark) => {
    const benchmarkId = benchmark.benchmark_id;

    if (!benchmarkId) {
      return false;
    }

    return servers.some((server) => {
      const score = server.benchmark_scores?.find(
        (item) => item.benchmark_id === benchmarkId,
      )?.score;

      return hasWorkloadProfileScore(score);
    });
  });
}

export function formatWorkloadProfileLabel(name: string): string {
  return name.replace(/^Workload profile:\s*/i, "").trim();
}
