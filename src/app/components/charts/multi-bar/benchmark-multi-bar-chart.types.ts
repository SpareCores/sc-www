import { ChartData } from "chart.js";
import { ChartFromBenchmarkTemplate } from "../../../pages/server-details/chartFromBenchmarks";
import {
  BenchmarkChartServer,
  BenchmarkConfigShape,
  BenchmarkGroup,
  BenchmarkMetaConfig,
  BenchmarkMetaWithConfigs,
  BenchmarkScaleValue,
  BenchmarkScoreWithConfig,
} from "../shared/benchmark-data.types";

export type MultiBarScaleValue = BenchmarkScaleValue;

export type MultiBarBenchmarkConfig = BenchmarkConfigShape<MultiBarScaleValue>;

export type MultiBarBenchmarkScore =
  BenchmarkScoreWithConfig<MultiBarBenchmarkConfig>;

export type MultiBarBenchmarkGroup = BenchmarkGroup<MultiBarBenchmarkScore>;

export type MultiBarBenchmarkMeta =
  BenchmarkMetaWithConfigs<MultiBarBenchmarkConfig>;

export type MultiBarCompareConfig =
  BenchmarkMetaConfig<MultiBarBenchmarkConfig>;

export type MultiBarCompareDetail = Omit<MultiBarBenchmarkMeta, "configs"> & {
  collapsed?: boolean;
  configs?: MultiBarCompareConfig[];
};

export type MultiBarServer = BenchmarkChartServer<MultiBarBenchmarkScore>;

export type MultiBarChartPoint = {
  data: number;
  label: MultiBarScaleValue;
  unit?: string | null;
  note?: string | null;
};

export type MultiBarChartData = ChartData<
  "bar",
  Array<MultiBarChartPoint | null>,
  MultiBarScaleValue
>;

export type BenchmarkMultiBarChartItem = {
  chart: ChartFromBenchmarkTemplate;
  show_more?: boolean;
  hidden?: boolean;
  data?: MultiBarCompareDetail[];
};
