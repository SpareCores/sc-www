import {
  Benchmark,
  BenchmarkScore,
  IdNameAndDescriptionAndCategory,
} from "../../../sdk/data-contracts";
import type { ExtendedServerDetails } from "../pages/server-details/server-details.types";

export interface CompareEmbedBenchmarkConfig {
  config: BenchmarkScore["config"];
  values: (number | "-")[];
}

export interface CompareEmbedBenchmarkMeta extends Benchmark {
  collapsed: boolean;
  configs: CompareEmbedBenchmarkConfig[];
}

export interface CompareEmbedBenchmarkCategory {
  id: string;
  name: string;
  benchmarks: string[];
  data: CompareEmbedBenchmarkMeta[];
  show_more: boolean;
  hidden?: boolean;
}

export interface InstancePropertyCategory {
  name: string;
  category: string;
  properties: IdNameAndDescriptionAndCategory[];
}

export interface ServerCompareEmbedDetails {
  servers: ExtendedServerDetails[];
  instanceProperties: IdNameAndDescriptionAndCategory[];
  benchmarkMeta: CompareEmbedBenchmarkMeta[];
  benchmarkCategories: CompareEmbedBenchmarkCategory[];
  instancePropertyCategories: InstancePropertyCategory[];
}
