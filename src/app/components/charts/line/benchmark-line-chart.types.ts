import { ChartData } from "chart.js";
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

export type BenchmarkLineChartKind = "bar" | "line";

export type BenchmarkLineChartSource =
  | "direct"
  | "details-ssl"
  | "details-stress-raw"
  | "details-stress-percent"
  | "compare-ssl"
  | "compare-stress-raw"
  | "compare-stress-percent";

export type BenchmarkLineChartData = BenchmarkBarChartData | StressNgChartData;

export type BenchmarkBarChartData = ChartData<"bar">;

export type BenchmarkLineOnlyChartData = ChartData<"line">;

export type BenchmarkLineChartOptions =
  | ChartOptionsFor<"bar">
  | ChartOptionsFor<"line">;

export type BenchmarkBarChartOptions = ChartOptionsFor<"bar">;

export type BenchmarkLineOnlyChartOptions = ChartOptionsFor<"line">;

export type BenchmarkLineSelectorOption = {
  name: string;
  value?: string;
};

export type LineBenchmarkConfigValue = BenchmarkConfigValue;

export type LineBenchmarkConfig = BenchmarkConfigShape & {
  algo?: string;
  block_size?: number;
  cores?: number;
};

export type LineBenchmarkScore = BenchmarkScoreWithConfig<LineBenchmarkConfig>;

export type LineBenchmarkGroup = BenchmarkGroup<LineBenchmarkScore>;

export type LineBenchmarkMetaConfig = BenchmarkMetaConfig<LineBenchmarkConfig>;

export type LineBenchmarkMeta = BenchmarkMetaWithConfigs<LineBenchmarkConfig>;

export type LineChartServer = BenchmarkChartServer<LineBenchmarkScore>;

export type LineChartDetailsServer = {
  display_name: string;
  cpu_cores?: number;
};

export type StressNgDataPoint = {
  cores: number;
  score: number;
  percent: number;
};

export type StressNgChartData = ChartData<
  "line",
  Array<StressNgDataPoint | null>,
  number
>;

export type AnnotationLine = {
  type: "line";
  borderWidth: number;
  borderColor: string;
  xMin: number;
  xMax: number;
  label: {
    rotation: "auto";
    position: "start";
    content: string;
    backgroundColor: string;
    display: true;
  };
};

export type MutableLineChartOptions = MutableChartOptions<"line">;

export type MutableBarChartOptions = MutableChartOptions<"bar">;

export type StressNgChartResult = {
  data: StressNgChartData;
  rawOptions: MutableLineChartOptions;
  percentOptions: MutableLineChartOptions;
};

export type SslChartResult = ChartResult<
  BenchmarkBarChartData,
  MutableBarChartOptions
>;

export type CompareSslOption = {
  name: string;
  value: string;
};

export const DEFAULT_COMPARE_SSL_OPTIONS: CompareSslOption[] = [
  { name: "AES-256-CBC", value: "AES-256-CBC" },
  { name: "ARIA-256-CBC", value: "ARIA-256-CBC" },
  { name: "CAMELLIA-256-CBC", value: "CAMELLIA-256-CBC" },
  { name: "SM4-CBC", value: "SM4-CBC" },
  { name: "blake2b512", value: "blake2b512" },
  { name: "sha256", value: "sha256" },
  { name: "sha3-256", value: "sha3-256" },
  { name: "sha3-512", value: "sha3-512" },
  { name: "sha512", value: "sha512" },
  { name: "shake128", value: "shake128" },
  { name: "shake256", value: "shake256" },
];
