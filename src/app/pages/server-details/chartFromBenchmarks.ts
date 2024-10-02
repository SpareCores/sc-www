import { ChartData, TooltipItem, TooltipModel } from "chart.js";
import { barChartOptionsTemplate } from "./chartOptions";

export type ChartFromBenchmarkTemplateOptions = {
  benchmark_id: string;
  labelsField: string;
  scaleField: string;

  // filled when the benchmark is fetched
  name?: string;
  higher_is_better?: boolean;
  icon?: string;
  tooltip?: string;
  unit?: string | null | undefined;
  XLabel?: string | null | undefined;
  YLabel?: string | null | undefined;
  title?: string | undefined;
}

export type ChartFromBenchmarkTemplate = {
  id: string;
  name: string;
  options: ChartFromBenchmarkTemplateOptions[];
  selectedOption: number;

  chartOptions: any;
  chartType: any;

  chartData?: any;
};


// REDIS
export const redisChartTemplateOptions: ChartFromBenchmarkTemplateOptions[] = [
  {benchmark_id: 'redis:rps', scaleField: 'pipeline', labelsField: 'operation'},
  {benchmark_id: 'redis:rps-extrapolated', scaleField: 'pipeline', labelsField: 'operation'},
  {benchmark_id: 'redis:latency', scaleField: 'pipeline', labelsField: 'operation'},
];

export const redisChartTemplate: ChartFromBenchmarkTemplate = {
  id: 'redis',
  name: 'Redis',
  options: redisChartTemplateOptions,
  selectedOption: 0,
  chartOptions: barChartOptionsTemplate,
  chartType: 'bar',
};

export const redisChartTemplateCallbacks = {
  label: function(this: TooltipModel<"bar">, tooltipItem: TooltipItem<"bar">) {
    return `${tooltipItem.formattedValue} ${(tooltipItem as any).raw.unit}; Note: ${(tooltipItem as any).raw.note}`;
  },
  title: function(this: TooltipModel<"bar">, tooltipItems: TooltipItem<"bar">[]) {
    return tooltipItems[0].label + ' concurrent pipelined requests';
  },
}

// STATIC WEB
export const staticWebChartTemplateOptions: ChartFromBenchmarkTemplateOptions[] = [
  {benchmark_id: 'static_web:rps', scaleField: 'connections_per_vcpus', labelsField: 'size'},
  {benchmark_id: 'static_web:rps-extrapolated', scaleField: 'connections_per_vcpus', labelsField: 'size'},
  {benchmark_id: 'static_web:throughput',scaleField: 'connections_per_vcpus', labelsField: 'size'},
  {benchmark_id: 'static_web:throughput-extrapolated', scaleField: 'connections_per_vcpus', labelsField: 'size'},
  {benchmark_id: 'static_web:latency', scaleField: 'connections_per_vcpus', labelsField: 'size'},
];

export const staticWebChartTemplate: ChartFromBenchmarkTemplate = {
  id: 'static_web',
  name: 'Static Web',
  options: staticWebChartTemplateOptions,
  selectedOption: 0,
  chartOptions: barChartOptionsTemplate,
  chartType: 'bar',
};

export const staticWebChartTemplateCallbacks = {
  label: function(this: TooltipModel<"bar">, tooltipItem: TooltipItem<"bar">) {
    return `${tooltipItem.formattedValue} ${(tooltipItem as any).raw.unit}; Note: ${(tooltipItem as any).raw.note}`;
  },
  title: function(this: TooltipModel<"bar">, tooltipItems: TooltipItem<"bar">[]) {
    return tooltipItems[0].label + 'Kb file size';
  }
}
