import {
  ChartConfiguration,
  ChartData,
  TooltipItem,
  TooltipModel,
} from "chart.js";
import { chartLegendLabels } from "../../components/charts/shared/chart-legend.utils";
import { formatStaticWebFileSizeTooltipContext } from "../../components/charts/shared/chart-tooltip.utils";

import {
  chartColors,
  chartColor,
} from "../../components/charts/shared/chart-colors.constants";

export const barChartOptions: ChartConfiguration<"bar">["options"] = {
  scales: {
    x: {
      ticks: {
        color: chartColors.white,
      },
    },
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "USD/h",
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      labels: chartLegendLabels,
    },
  },
};

export const barChartOptionsSSL: ChartConfiguration<"bar">["options"] = {
  maintainAspectRatio: false,
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "byte/s",
      },
    },
  },
  plugins: {
    ...barChartOptions.plugins,
    title: {
      display: true,
      text: "Block size (byte)",
      color: chartColors.white,
    },
  },
};

export const barChartOptionsStaticWeb: ChartConfiguration<"bar">["options"] = {
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Request per second",
      },
    },
    x: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Connections per vCPU(s)",
      },
    },
  },
  plugins: {
    ...barChartOptions.plugins,
    title: {
      display: true,
      text: "File size (KiB)",
      color: chartColors.white,
    },
    tooltip: {
      callbacks: {
        label: function (
          this: TooltipModel<"bar">,
          tooltipItem: TooltipItem<"bar">,
        ) {
          return `${tooltipItem.formattedValue} ${(tooltipItem as any).raw.unit}; Note: ${(tooltipItem as any).raw.note}`;
        },
        title: function (
          this: TooltipModel<"bar">,
          tooltipItems: TooltipItem<"bar">[],
        ) {
          return formatStaticWebFileSizeTooltipContext(tooltipItems[0].label);
        },
      },
    },
  },
  parsing: {
    xAxisKey: "label",
    yAxisKey: "data",
  },
};

export const barChartOptionsTemplate: ChartConfiguration<"bar">["options"] = {
  maintainAspectRatio: false,
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Benchmark Score",
      },
    },
    x: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "scaleField values",
      },
    },
  },
  plugins: {
    ...barChartOptions.plugins,
    title: {
      display: true,
      text: "labelsField description",
      color: chartColors.white,
    },
    // NOTE: Add customized tooltip callbacks
    tooltip: {
      callbacks: {
        label: function (
          this: TooltipModel<"bar">,
          tooltipItem: TooltipItem<"bar">,
        ) {
          return `${tooltipItem.formattedValue} ${(tooltipItem as any).raw.unit}; Note: ${(tooltipItem as any).raw.note}`;
        },
        title: function (
          this: TooltipModel<"bar">,
          tooltipItems: TooltipItem<"bar">[],
        ) {
          return tooltipItems[0].label + " concurrent pipelined requests";
        },
      },
    },
  },
  parsing: {
    xAxisKey: "label",
    yAxisKey: "data",
  },
};

export const barChartOptionsRedis: ChartConfiguration<"bar">["options"] = {
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Request per second",
      },
    },
    x: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Number of concurrent pipelined requests",
      },
    },
  },
  plugins: {
    ...barChartOptions.plugins,
    title: {
      display: true,
      text: "Operation",
      color: chartColors.white,
    },
    tooltip: {
      callbacks: {
        label: function (
          this: TooltipModel<"bar">,
          tooltipItem: TooltipItem<"bar">,
        ) {
          return `${tooltipItem.formattedValue} ${(tooltipItem as any).raw.unit}; Note: ${(tooltipItem as any).raw.note}`;
        },
        title: function (
          this: TooltipModel<"bar">,
          tooltipItems: TooltipItem<"bar">[],
        ) {
          return tooltipItems[0].label + " concurrent pipelined requests";
        },
      },
    },
  },
  parsing: {
    xAxisKey: "label",
    yAxisKey: "data",
  },
};

export const barChartOptionsSSLCompare: ChartConfiguration<"bar">["options"] = {
  maintainAspectRatio: false,
  scales: {
    ...barChartOptions.scales,
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "byte/s",
      },
    },
    x: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Block Size (byte)",
      },
    },
  },
  plugins: {
    ...barChartOptions.plugins,
    tooltip: {
      callbacks: {
        label: function (
          this: TooltipModel<"bar">,
          tooltipItem: TooltipItem<"bar">,
        ) {
          return tooltipItem.formattedValue + " byte/s";
        },
        title: function (
          this: TooltipModel<"bar">,
          tooltipItems: TooltipItem<"bar">[],
        ) {
          return tooltipItems[0].label + "-byte block size";
        },
      },
    },
  },
};

export const barChartOptionsStaticWebCompare: ChartConfiguration<"bar">["options"] =
  {
    scales: {
      ...barChartOptions.scales,
      y: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartColors["gray-600"],
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "Request per second",
        },
      },
      x: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartColors["gray-600"],
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "File Size",
        },
      },
    },
    plugins: {
      ...barChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function (
            this: TooltipModel<"bar">,
            tooltipItem: TooltipItem<"bar">,
          ) {
            return `${tooltipItem.formattedValue} ${(tooltipItem as any).raw.unit}; Note: ${(tooltipItem as any).raw.note}`;
          },
          title: function (
            this: TooltipModel<"bar">,
            tooltipItems: TooltipItem<"bar">[],
          ) {
            return tooltipItems[0].label;
          },
        },
      },
    },
    parsing: {
      xAxisKey: "label",
      yAxisKey: "data",
    },
  };

export const barChartOptionsRedisCompare: ChartConfiguration<"bar">["options"] =
  {
    scales: {
      ...barChartOptions.scales,
      y: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartColors["gray-600"],
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "Request per second",
        },
      },
      x: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartColors["gray-600"],
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "Number of concurrent pipelined requests",
        },
      },
    },
    plugins: {
      ...barChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function (
            this: TooltipModel<"bar">,
            tooltipItem: TooltipItem<"bar">,
          ) {
            return `${tooltipItem.formattedValue} ${(tooltipItem as any).raw.unit}; Note: ${(tooltipItem as any).raw.note}`;
          },
          title: function (
            this: TooltipModel<"bar">,
            tooltipItems: TooltipItem<"bar">[],
          ) {
            return tooltipItems[0].label;
          },
        },
      },
    },
    parsing: {
      xAxisKey: "label",
      yAxisKey: "data",
    },
  };

export const barChartDataEmpty: ChartData<"bar"> = {
  labels: [],
  datasets: [
    { data: [], label: "Spot", backgroundColor: chartColors["emerald-400"] },
    { data: [], label: "Ondemand", backgroundColor: chartColors["gray-200"] },
  ],
};

export const radarChartOptions: ChartConfiguration<"radar">["options"] = {
  scales: {
    r: {
      ticks: {
        color: chartColors["gray-600"],
        backdropColor: chartColors["sky-975"],
      },
      grid: {
        color: chartColors["gray-600"],
      },
      pointLabels: {
        color: chartColors["gray-200"],
      },
      angleLines: {
        color: chartColors["gray-600"],
        display: true,
      },
      min: 0,
    },
  },
  parsing: {
    key: "value",
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (
          this: TooltipModel<"radar">,
          tooltipItem: TooltipItem<"radar">,
        ) {
          return (
            (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).value +
            "; " +
            (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).tooltip
          );
        },
      },
    },
    legend: {
      display: false,
      labels: chartLegendLabels,
    },
  },
};

export const radarDatasetColors = [
  {
    borderColor: chartColors["emerald-400"],
    backgroundColor: chartColor("emerald-400", 0.2),
  },
  {
    borderColor: chartColors["gray-200"],
    backgroundColor: chartColor("gray-200", 0.2),
  },
  {
    borderColor: chartColors["sky-400"],
    backgroundColor: chartColor("sky-400", 0.2),
  },
  {
    borderColor: chartColors["yellow-500"],
    backgroundColor: chartColor("yellow-500", 0.2),
  },
  {
    borderColor: chartColors["red-400"],
    backgroundColor: chartColor("red-400", 0.2),
  },
  {
    borderColor: chartColors["lime-400"],
    backgroundColor: chartColor("lime-400", 0.2),
  },
  {
    borderColor: chartColors["indigo-400"],
    backgroundColor: chartColor("indigo-400", 0.2),
  },
  {
    borderColor: chartColors["slate-400"],
    backgroundColor: chartColor("slate-400", 0.2),
  },
];

export const chartAxisGridColor = chartColors["gray-600"];

export const lineChartLegendLabels = chartLegendLabels;

export const lineChartOptionsBWM: ChartConfiguration<"line">["options"] = {
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        color: chartColors.white,
        autoSkip: false,
        major: {
          enabled: true,
        },
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "MB",
      },
      grid: {
        color: chartColors["gray-600"],
      },
      type: "logarithmic",
      min: 0,
      afterBuildTicks: function (scale: any) {
        scale.ticks = [
          0.016384, 0.262144, 1, 2, 4, 8, 16, 32, 64, 256, 512,
        ].map((v) => ({ value: v, label: v, major: true }));
      },
      afterTickToLabelConversion: function (scale: any) {
        scale.ticks = [
          0.016384, 0.262144, 1, 2, 4, 8, 16, 32, 64, 256, 512,
        ].map((v) => ({ value: v, label: v, major: true }));
      },
    },
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartColors["gray-600"],
      },
      type: "logarithmic",
      title: {
        display: true,
        color: chartColors.white,
        text: "MB/sec",
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        title: function (
          this: TooltipModel<"line">,
          tooltipItems: TooltipItem<"line">[],
        ) {
          return tooltipItems[0].label + " MB block size";
        },
        label: function (
          this: TooltipModel<"line">,
          tooltipItem: TooltipItem<"line">,
        ) {
          return tooltipItem.formattedValue + " MB/s";
        },
      },
    },
    annotation: {},
    legend: {
      display: true,
      labels: lineChartLegendLabels,
    },
  },
};

export const lineChartOptionsComp: ChartConfiguration<"line">["options"] = {
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        color: chartColors.white,
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Compression Level",
      },
      grid: {
        color: chartAxisGridColor,
      },
    },
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartAxisGridColor,
      },
      type: "logarithmic",
      title: {
        display: true,
        color: chartColors.white,
        text: "byte/s",
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (
          this: TooltipModel<"line">,
          tooltipItem: TooltipItem<"line">,
        ) {
          return (
            (tooltipItem.parsed as any).y.toFixed(0) +
            " (" +
            (tooltipItem.dataset.data[tooltipItem.dataIndex] as any).tooltip +
            ")"
          );
        },
      },
    },
    legend: {
      display: true,
      labels: lineChartLegendLabels,
    },
  },
  parsing: {
    xAxisKey: "compression_level",
    yAxisKey: "compress",
  },
};

export const lineChartOptionsCompRatio: ChartConfiguration<"line">["options"] =
  {
    scales: {
      x: {
        ticks: {
          color: chartColors.white,
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "Compression Level",
        },
        grid: {
          color: chartAxisGridColor,
        },
      },
      y: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartAxisGridColor,
        },
        type: "linear",
        title: {
          display: true,
          color: chartColors.white,
          text: "Compression Ratio",
        },
        min: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: lineChartLegendLabels,
      },
    },
  };

export const lineChartOptionsCompareCompress: ChartConfiguration<"line">["options"] =
  {
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartColors["gray-600"],
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "Compression Level",
        },
      },
      y: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartColors["gray-600"],
        },
        type: "logarithmic",
        title: {
          display: true,
          color: chartColors.white,
          text: "byte/s",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            const point = tooltipItem.raw as { tooltip?: string } | undefined;
            const tooltip = point?.tooltip;
            return (
              tooltipItem.formattedValue +
              " byte/s" +
              (tooltip ? " (" + tooltip + ")" : "")
            );
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            return "Compression level: " + tooltipItems[0].label;
          },
        },
      },
      legend: {
        display: true,
        labels: lineChartLegendLabels,
      },
      title: {
        display: true,
        text: "Compression Speed",
        color: chartColors.white,
      },
    },
    parsing: {
      xAxisKey: "compression_level",
      yAxisKey: "compress",
    },
  };

export const lineChartOptionsCompareDecompress: ChartConfiguration<"line">["options"] =
  {
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartColors["gray-600"],
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "Compression Level",
        },
      },
      y: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartColors["gray-600"],
        },
        type: "logarithmic",
        title: {
          display: true,
          color: chartColors.white,
          text: "byte/s",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            const point = tooltipItem.raw as { tooltip?: string } | undefined;
            const tooltip = point?.tooltip;
            return (
              tooltipItem.formattedValue +
              " byte/s" +
              (tooltip ? " (" + tooltip + ")" : "")
            );
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            return "Compression level: " + tooltipItems[0].label;
          },
        },
      },
      legend: {
        display: true,
        labels: lineChartLegendLabels,
      },
      title: {
        display: true,
        text: "Decompression Speed",
        color: chartColors.white,
      },
    },
    parsing: {
      xAxisKey: "compression_level",
      yAxisKey: "decompress",
    },
  };

export const lineChartOptionsStressNG: ChartConfiguration<"line">["options"] = {
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        color: chartColors.white,
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "vCPUs",
      },
      grid: {
        color: chartAxisGridColor,
      },
    },
    y: {
      ticks: {
        color: chartColors.white,
      },
      grid: {
        color: chartAxisGridColor,
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Score",
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      labels: lineChartLegendLabels,
    },
    title: {
      display: true,
      text: "stress-ng div16 raw scores per vCPU",
      color: chartColors.white,
    },
  },
  parsing: {
    xAxisKey: "cores",
    yAxisKey: "score",
  },
};

export const lineChartOptionsStressNGPercent: ChartConfiguration<"line">["options"] =
  {
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: chartColors.white,
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "vCPUs",
        },
        grid: {
          color: chartAxisGridColor,
        },
      },
      y: {
        ticks: {
          color: chartColors.white,
        },
        grid: {
          color: chartAxisGridColor,
        },
        title: {
          display: true,
          color: chartColors.white,
          text: "Relative performance (%)",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: lineChartLegendLabels,
      },
      title: {
        display: true,
        text: "stress-ng relative multicore performance per vCPU",
        color: chartColors.white,
      },
    },
    parsing: {
      xAxisKey: "cores",
      yAxisKey: "percent",
    },
  };

export const lineChartOptionsPgbench: ChartConfiguration<"line">["options"] = {
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: true,
  },
  scales: {
    x: {
      type: "linear",
      ticks: {
        color: chartColors.white,
      },
      title: {
        display: true,
        color: chartColors.white,
        text: "Concurrency",
      },
      grid: {
        color: chartAxisGridColor,
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      ticks: {
        color: chartColors["emerald-400"],
      },
      grid: {
        color: chartAxisGridColor,
      },
      title: {
        display: true,
        color: chartColors["emerald-400"],
        text: "Score",
      },
    },
    y1: {
      type: "linear",
      display: true,
      position: "right",
      ticks: {
        color: chartColors["yellow-500"],
      },
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        color: chartColors["yellow-500"],
        text: "Avg latency (ms)",
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      labels: lineChartLegendLabels,
    },
    title: {
      display: false,
    },
  },
};
