import { ChartData } from "chart.js";
import {
  BenchmarkChartServer,
  BenchmarkConfigShape,
  BenchmarkGroup,
  BenchmarkMetaWithConfigs,
  BenchmarkScoreWithConfig,
  ChartOptionsFor,
  MutableChartOptions,
} from "../shared/benchmark-data.types";

export type LlmModelOption = {
  name: string;
  value: string;
};

export type LlmBenchmarkConfig = BenchmarkConfigShape & {
  model?: string;
  tokens?: number;
};

export type LlmBenchmarkScore = BenchmarkScoreWithConfig<LlmBenchmarkConfig>;

export type LlmBenchmarkMeta = BenchmarkMetaWithConfigs<LlmBenchmarkConfig>;

export type LlmBenchmarkGroup = BenchmarkGroup<LlmBenchmarkScore>;

export type LlmChartServer = BenchmarkChartServer<LlmBenchmarkScore>;

export type LlmBarChartData = ChartData<"bar", Array<number | null>, number>;

export type LlmBarChartOptions = ChartOptionsFor<"bar">;

export type MutableLlmBarChartOptions = MutableChartOptions<"bar">;

export type LlmCompareChartsResult = {
  promptData: LlmBarChartData;
  generationData: LlmBarChartData;
  promptOptions: MutableLlmBarChartOptions;
  generationOptions: MutableLlmBarChartOptions;
};
