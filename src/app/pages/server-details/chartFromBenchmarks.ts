import { TooltipItem, TooltipModel } from "chart.js";
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

export type ChartFromBenchmarkSecondaryOptions = {
  name: string;
  value: number | string;
}

export type ChartFromBenchmarkTemplate = {
  id: string;
  name: string;
  options: ChartFromBenchmarkTemplateOptions[];
  secondaryOptions?: ChartFromBenchmarkSecondaryOptions[];
  selectedOption: number;
  selectedSecondaryOption?: number;

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

export const redisCompareChartSecondaryOptions: ChartFromBenchmarkSecondaryOptions[] = [
  { name: 'SET', value: "SET" }
];

export const redisChartTemplate: ChartFromBenchmarkTemplate = {
  id: 'redis',
  name: 'Redis',
  options: redisChartTemplateOptions,
  secondaryOptions: redisCompareChartSecondaryOptions,
  selectedOption: 0,
  selectedSecondaryOption: 0,
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

export const staticWebChartTemplateOptions2: ChartFromBenchmarkTemplateOptions[] = [
  {benchmark_id: 'static_web:rps', labelsField: 'connections_per_vcpus', scaleField: 'size'},
  {benchmark_id: 'static_web:rps-extrapolated', labelsField: 'connections_per_vcpus', scaleField: 'size'},
  {benchmark_id: 'static_web:throughput',labelsField: 'connections_per_vcpus', scaleField: 'size'},
  {benchmark_id: 'static_web:throughput-extrapolated', labelsField: 'connections_per_vcpus', scaleField: 'size'},
  {benchmark_id: 'static_web:latency', labelsField: 'connections_per_vcpus', scaleField: 'size'},
];

export const staticWebSecondaryOptions = [
  { name: 'Connection per vCPU(s): 1', value: 1 },
  { name: 'Connections per vCPU(s): 2', value: 2 },
  { name: 'Connections per vCPU(s): 4', value: 4 },
  { name: 'Connections per vCPU(s): 8', value: 8 },
  { name: 'Connections per vCPU(s): 16', value: 16 },
  { name: 'Connections per vCPU(s): 32', value: 32 },
];


export const staticWebChartTemplate: ChartFromBenchmarkTemplate = {
  id: 'static_web',
  name: 'Static Web Server',
  options: staticWebChartTemplateOptions,
  secondaryOptions: staticWebSecondaryOptions,
  selectedOption: 0,
  selectedSecondaryOption: 0,
  chartOptions: barChartOptionsTemplate,
  chartType: 'bar',
};

export const staticWebChartCompareTemplate: ChartFromBenchmarkTemplate = {
  id: 'static_web',
  name: 'Static Web Server',
  options: staticWebChartTemplateOptions2,
  secondaryOptions: staticWebSecondaryOptions,
  selectedOption: 0,
  selectedSecondaryOption: 0,
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
