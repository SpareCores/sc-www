import {
  type MemoryBenchmarkConfig,
  type MemoryBenchmarkMeta,
} from "../../components/charts/memory/memory-chart.types";
import { type CompareMemoryChartOption } from "../../components/charts/shared/memory-chart.types";

export type CompareTableBenchmarkConfig = {
  config: MemoryBenchmarkConfig;
  values: Array<number | "-">;
};

export type CompareTableBenchmarkMeta = Omit<
  MemoryBenchmarkMeta,
  "configs" | "name"
> & {
  name: string;
  collapsed: boolean;
  configs: CompareTableBenchmarkConfig[];
  benchmark_key?: string;
  legacyOperation?: CompareMemoryChartOption["legacyOperation"];
};
