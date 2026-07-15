import type {
  Benchmark,
  BenchmarkScore,
} from "./../../../../../sdk/data-contracts";
import { ChartConfiguration, ChartData } from "chart.js";

export type WorkloadProfileRadarPoint = {
  value: number | null;
  tooltip?: string;
};

export type WorkloadProfileRadarChartData = ChartData<
  "radar",
  WorkloadProfileRadarPoint[],
  string
>;

export type WorkloadProfileRadarChartOptions =
  ChartConfiguration<"radar">["options"];

export type WorkloadProfileBenchmarkScore = Pick<
  BenchmarkScore,
  "benchmark_id" | "score" | "note" | "config" | "score_breakdown"
>;

export type WorkloadProfileBenchmarkMeta = Pick<
  Benchmark,
  "benchmark_id" | "name" | "status" | "source" | "unit"
> &
  Partial<Pick<Benchmark, "description">>;

export type WorkloadProfileCompareBenchmark = WorkloadProfileBenchmarkMeta & {
  benchmark_key?: string;
  collapsed?: boolean;
  higher_is_better?: boolean | null;
  configs?: Array<{
    config: Record<string, unknown>;
    values: Array<number | string | null>;
  }>;
};

export type WorkloadProfileDetailsServer = {
  benchmark_scores: WorkloadProfileBenchmarkScore[];
};

export type WorkloadProfileCompareServer = {
  display_name: string;
  benchmark_scores: WorkloadProfileBenchmarkScore[];
};

export type WorkloadProfileChartsResult = {
  benchmarkIds: string[];
  chartData: WorkloadProfileRadarChartData;
  options: WorkloadProfileRadarChartOptions;
};
