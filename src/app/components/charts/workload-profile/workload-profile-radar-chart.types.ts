import { Status } from "./../../../../../sdk/data-contracts";
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

export type WorkloadProfileBenchmarkScore = {
  benchmark_id: string;
  score: number;
  note?: string | null;
  config?: Record<string, unknown>;
};

export type WorkloadProfileBenchmarkMeta = {
  benchmark_id: string;
  name: string;
  description?: string | null;
  status?: Status;
};

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
  chartData: WorkloadProfileRadarChartData;
  options: WorkloadProfileRadarChartOptions;
};
