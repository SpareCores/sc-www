import { ChartConfiguration, ChartTypeRegistry } from "chart.js";
import { Benchmark, BenchmarkScore } from "../../../../../sdk/data-contracts";

export type BenchmarkConfigValue = number | string;

export type BenchmarkScaleValue = BenchmarkConfigValue;

export type BenchmarkConfigShape<TValue = BenchmarkConfigValue> = {
  [key: string]: TValue | undefined;
};

export type BenchmarkScoreBase = {
  benchmark_id: string;
  score: number;
  note?: string | null;
  vendor_id?: string;
  server_id?: string;
  status?: BenchmarkScore["status"];
  observed_at?: BenchmarkScore["observed_at"];
};

export type BenchmarkScoreWithConfig<
  TConfig extends object,
  TBase extends object = BenchmarkScoreBase,
> = Omit<TBase, "config"> & {
  config: TConfig;
};

export type BenchmarkGroup<TScore> = {
  benchmark_id: string;
  benchmarks?: TScore[];
};

export type BenchmarkMetaBase = Pick<Benchmark, "benchmark_id"> &
  Partial<
    Pick<
      Benchmark,
      | "name"
      | "description"
      | "framework"
      | "config_fields"
      | "measurement"
      | "unit"
      | "higher_is_better"
    >
  >;

export type BenchmarkMetaConfig<
  TConfig extends object,
  TValue = BenchmarkScaleValue | null,
> = {
  config: TConfig;
  values?: TValue[];
};

export type BenchmarkMetaWithConfigs<
  TConfig extends object,
  TExtra extends object = Record<never, never>,
  TValue = BenchmarkScaleValue | null,
> = BenchmarkMetaBase &
  TExtra & {
    configs?: Array<BenchmarkMetaConfig<TConfig, TValue>>;
  };

export type BenchmarkChartServer<TScore> = {
  display_name: string;
  benchmark_scores: TScore[];
};

export type OptionalBenchmarkChartServer<TScore> = {
  display_name: string;
  benchmark_scores?: TScore[];
};

export type ChartOptionsFor<TType extends keyof ChartTypeRegistry> =
  ChartConfiguration<TType>["options"];

export type MutableChartOptions<TType extends keyof ChartTypeRegistry> =
  NonNullable<ChartOptionsFor<TType>>;

export type ChartResult<TData, TOptions> = {
  data: TData;
  options: TOptions;
};
