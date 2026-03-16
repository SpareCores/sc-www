import {
  BenchmarkScoreStatsItem,
  Status,
} from "../../../../sdk/data-contracts";

export type BenchmarkWorkloadExample = boolean | number | string;

export interface BenchmarkWorkloadConfig {
  description: string;
  examples: BenchmarkWorkloadExample[];
}

export type BenchmarkWorkloadConfigs = Record<string, BenchmarkWorkloadConfig>;

export interface BenchmarkWorkloadItem extends Omit<
  BenchmarkScoreStatsItem,
  "configs" | "status"
> {
  configs?: BenchmarkWorkloadConfigs;
  status: Status;
}

export interface BenchmarkFamily {
  framework: string;
  benchmarks: BenchmarkWorkloadItem[];
}
