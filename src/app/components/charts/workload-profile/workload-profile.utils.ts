import { Status } from "../../../../../sdk/data-contracts";

export type WorkloadProfileBenchmarkRef = {
  benchmark_id?: string;
  name?: string;
  status?: Status;
};

const WORKLOAD_PROFILE_NAME_PREFIX = "workload profile";

export const WORKLOAD_PROFILE_INFO_TOOLTIP =
  "Augmentic workload profiles combine raw benchmark measurements into compound scores to describe the expected performance of common server workloads with a few easy-to-interpret numbers, using expert-weighted aggregation algorithms.";

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

export function formatWorkloadProfileLabel(name: string): string {
  return name.replace(/^Workload profile:\s*/i, "").trim();
}
