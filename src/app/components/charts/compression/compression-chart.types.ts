import { ChartDataset } from "chart.js";
import {
  BenchmarkChartServer,
  BenchmarkConfigShape,
  BenchmarkConfigValue,
  BenchmarkGroup,
  BenchmarkMetaConfig,
  BenchmarkMetaWithConfigs,
  BenchmarkScoreWithConfig,
  ChartOptionsFor,
  ChartResult,
  MutableChartOptions,
} from "../shared/benchmark-data.types";

export type CompressionConfigValue = BenchmarkConfigValue;

export type CompressionConfig = BenchmarkConfigShape<CompressionConfigValue> & {
  algo: string;
  compression_level?: number;
  cores?: "single" | "multi";
};

export type CompressionBenchmarkScore =
  BenchmarkScoreWithConfig<CompressionConfig>;

export type CompressionBenchmarkMetaConfig =
  BenchmarkMetaConfig<CompressionConfig>;

export type CompressionBenchmarkMeta = BenchmarkMetaWithConfigs<
  CompressionConfig,
  { collapsed?: boolean }
>;

export type CompressionBenchmarkGroup =
  BenchmarkGroup<CompressionBenchmarkScore>;

export type CompressionServer = BenchmarkChartServer<CompressionBenchmarkScore>;

export type CompareCompressionOption = {
  options: CompressionConfig;
  name: string;
};

export type CompressionDataPoint = {
  config: CompressionConfig;
  ratio: number;
  algo: string;
  compression_level?: number;
  tooltip: string;
  compress?: number;
  decompress?: number;
};

type CompressionDetailsDataset = ChartDataset<
  "line",
  CompressionDataPoint[]
> & {
  data: CompressionDataPoint[];
  label: string;
  spanGaps: boolean;
  config: CompressionConfig;
  borderColor: string;
  backgroundColor: string;
};

type CompressionCompareDataset = ChartDataset<
  "line",
  Array<CompressionDataPoint | null>
> & {
  data: Array<CompressionDataPoint | null>;
  label: string;
  spanGaps: boolean;
  borderColor: string;
  backgroundColor: string;
};

export type CompressionDetailsChartData = {
  labels: number[];
  datasets: CompressionDetailsDataset[];
};

export type CompressionCompareChartData = {
  labels: number[];
  datasets: CompressionCompareDataset[];
};

export type CompressionChartOptions = ChartOptionsFor<"line">;

export type CompressionMutableChartOptions = MutableChartOptions<"line">;

export type CompressionDetailsChartResult = ChartResult<
  CompressionDetailsChartData,
  CompressionMutableChartOptions
>;

export type CompressionCompareChartResult = {
  compressData: CompressionCompareChartData;
  decompressData: CompressionCompareChartData;
  compressOptions: CompressionMutableChartOptions;
  decompressOptions: CompressionMutableChartOptions;
};
