import { ChartData } from "chart.js";
import {
  BenchmarkConfigShape,
  BenchmarkGroup,
  BenchmarkMetaWithConfigs,
  BenchmarkScoreWithConfig,
  ChartOptionsFor,
  ChartResult,
  OptionalBenchmarkChartServer,
} from "../shared/benchmark-data.types";

export type MemoryBenchmarkConfig = BenchmarkConfigShape & {
  operation?: string;
  size?: number;
  size_kb?: number;
};

export type MemoryBenchmarkScore =
  BenchmarkScoreWithConfig<MemoryBenchmarkConfig>;

export type MemoryBenchmarkMeta =
  BenchmarkMetaWithConfigs<MemoryBenchmarkConfig>;

export type MemoryBenchmarkGroup = BenchmarkGroup<MemoryBenchmarkScore>;

export type MemoryChartServer =
  OptionalBenchmarkChartServer<MemoryBenchmarkScore>;

export type MemoryDetailsServer = {
  cores?: number | string | null;
  cpu_cores?: number | string | null;
  vcpus?: number | string | null;
  cpu_l1d_cache?: number | null;
  cpu_l2_cache?: number | null;
  cpu_l3_cache?: number | null;
};

export type MemoryLineChartData = ChartData<
  "line",
  Array<number | null>,
  number
>;

export type MemoryLineChartOptions = ChartOptionsFor<"line">;

export type MemoryChartResult = ChartResult<
  MemoryLineChartData,
  MemoryLineChartOptions
>;
