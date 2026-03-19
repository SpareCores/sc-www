import { SafeHtml } from "@angular/platform-browser";
import { ChartConfiguration, ChartData } from "chart.js";

export type GeekbenchRadarPoint = {
  value: number | null;
  tooltip?: string;
};

export type GeekbenchRadarChartData = ChartData<
  "radar",
  GeekbenchRadarPoint[],
  string
>;

export type GeekbenchRadarChartOptions = ChartConfiguration<"radar">["options"];

export type GeekbenchTooltipHtml = SafeHtml | string | null;

export type GeekbenchBenchmarkScore = {
  benchmark_id: string;
  score: number;
  note?: string | null;
  config: {
    cores?: string;
  };
};

export type GeekbenchBenchmarkGroup = {
  benchmark_id: string;
  benchmarks: GeekbenchBenchmarkScore[];
};

export type GeekbenchBenchmarkMeta = {
  benchmark_id: string;
  name: string;
  description?: string | null;
};

export type GeekbenchCompareServer = {
  display_name: string;
  benchmark_scores: GeekbenchBenchmarkScore[];
};

export type GeekbenchDetailsChartsResult = {
  singleData?: GeekbenchRadarChartData;
  multiData?: GeekbenchRadarChartData;
  options: GeekbenchRadarChartOptions;
  singleScore: string;
  multiScore: string;
  infoTooltipHtml: string | null;
};

export type GeekbenchCompareChartsResult = {
  singleData?: GeekbenchRadarChartData;
  multiData?: GeekbenchRadarChartData;
  singleOptions: GeekbenchRadarChartOptions;
  multiOptions: GeekbenchRadarChartOptions;
};
