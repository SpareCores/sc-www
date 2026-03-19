import { Injectable } from "@angular/core";
import { ChartConfiguration, TooltipItem, TooltipModel } from "chart.js";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import {
  AnnotationLine,
  CompareSslOption,
  LineBenchmarkConfig,
  LineBenchmarkGroup,
  LineBenchmarkMeta,
  LineBenchmarkScore,
  LineChartServer,
  MutableBarChartOptions,
  MutableLineChartOptions,
  SslChartResult,
  StressNgChartData,
  StressNgChartResult,
} from "./benchmark-line-chart.types";

type StressNgServerDetails = {
  display_name: string;
  cpu_cores?: number;
};

type BenchmarkConfigContainer = {
  config?: LineBenchmarkConfig;
};

type AnnotationPluginState = {
  annotation?: {
    annotations?: {
      line1?: AnnotationLine;
    };
  };
};

@Injectable({
  providedIn: "root",
})
export class BenchmarkLineChartBuilderService {
  buildDetailsStressNgChart(params: {
    serverDetails: StressNgServerDetails;
    benchmarksByCategory: LineBenchmarkGroup[];
    rawOptionsBase: ChartConfiguration<"line">["options"];
    percentOptionsBase: ChartConfiguration<"line">["options"];
  }): StressNgChartResult | undefined {
    const {
      serverDetails,
      benchmarksByCategory,
      rawOptionsBase,
      percentOptionsBase,
    } = params;
    const dataSet = benchmarksByCategory.find(
      (benchmark) => benchmark.benchmark_id === "stress_ng:div16",
    );

    if (!dataSet?.benchmarks?.length) {
      return undefined;
    }

    const scales = this.collectNumericScales(dataSet.benchmarks, "cores");
    if (scales.length <= 1) {
      return undefined;
    }

    const score1 =
      dataSet.benchmarks.find((item) => item.config.cores === 1)?.score ||
      dataSet.benchmarks[0].score;

    const data: StressNgChartData = {
      labels: scales,
      datasets: [
        {
          data: scales.map((size) => {
            const item = dataSet.benchmarks?.find(
              (benchmark) => benchmark.config.cores === size,
            );

            return item
              ? {
                  cores: size,
                  score: item.score,
                  percent: (item.score / (size * score1)) * 100,
                }
              : null;
          }),
          label: serverDetails.display_name,
          spanGaps: true,
          borderColor: radarDatasetColors[0].borderColor,
          backgroundColor: radarDatasetColors[0].backgroundColor,
        },
      ],
    };

    const rawOptions = cloneChartOptions(
      rawOptionsBase ?? {},
    ) as MutableLineChartOptions;
    const percentOptions = cloneChartOptions(
      percentOptionsBase ?? {},
    ) as MutableLineChartOptions;

    this.configureStressNgOptions(rawOptions, percentOptions);
    this.applyStressNgAnnotation(
      rawOptions,
      percentOptions,
      scales,
      serverDetails.cpu_cores,
    );

    return { data, rawOptions, percentOptions };
  }

  buildCompareStressNgChart(params: {
    servers: LineChartServer[];
    benchmarkMeta: LineBenchmarkMeta[];
    rawOptionsBase: ChartConfiguration<"line">["options"];
    percentOptionsBase: ChartConfiguration<"line">["options"];
  }): StressNgChartResult | undefined {
    const { servers, benchmarkMeta, rawOptionsBase, percentOptionsBase } =
      params;
    const dataSet = benchmarkMeta.find(
      (benchmark) => benchmark.benchmark_id === "stress_ng:div16",
    );

    if (!dataSet?.configs?.length) {
      return undefined;
    }

    const scales = this.collectNumericScales(dataSet.configs, "cores");
    if (scales.length <= 1) {
      return undefined;
    }

    const data: StressNgChartData = {
      labels: scales,
      datasets: servers.map((server, index) => {
        const score1 =
          server.benchmark_scores.find(
            (score) =>
              score.benchmark_id === "stress_ng:div16" &&
              score.config.cores === 1,
          )?.score || 1;

        return {
          data: scales.map((size) => {
            const item = server.benchmark_scores.find(
              (score) =>
                score.benchmark_id === "stress_ng:div16" &&
                score.config.cores === size,
            );

            return item
              ? {
                  cores: size,
                  score: item.score,
                  percent: (item.score / (size * score1)) * 100,
                }
              : null;
          }),
          label: server.display_name,
          spanGaps: true,
          borderColor:
            radarDatasetColors[index % radarDatasetColors.length].borderColor,
          backgroundColor:
            radarDatasetColors[index % radarDatasetColors.length]
              .backgroundColor,
        };
      }),
    };

    const rawOptions = cloneChartOptions(
      rawOptionsBase ?? {},
    ) as MutableLineChartOptions;
    const percentOptions = cloneChartOptions(
      percentOptionsBase ?? {},
    ) as MutableLineChartOptions;
    this.configureStressNgOptions(rawOptions, percentOptions);

    return { data, rawOptions, percentOptions };
  }

  buildDetailsSslChart(params: {
    benchmarksByCategory: LineBenchmarkGroup[];
    baseOptions: ChartConfiguration<"bar">["options"];
  }): SslChartResult | undefined {
    const { benchmarksByCategory, baseOptions } = params;
    const dataSet = benchmarksByCategory.find(
      (benchmark) => benchmark.benchmark_id === "openssl",
    );

    if (!dataSet?.benchmarks?.length) {
      return undefined;
    }

    const labels = this.collectOrderedLabels(dataSet.benchmarks, "algo");
    const scales = this.collectNumericScales(dataSet.benchmarks, "block_size");

    const data: ChartConfiguration<"bar">["data"] = {
      labels: scales,
      datasets: labels.map((label, index) => ({
        data: scales.map((size) => {
          const item = dataSet.benchmarks?.find(
            (benchmark) =>
              benchmark.config.algo === label &&
              benchmark.config.block_size === size,
          );
          return item?.score ?? null;
        }),
        label,
        spanGaps: false,
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
      })),
    };

    return {
      data,
      options: cloneChartOptions(baseOptions ?? {}) as MutableBarChartOptions,
    };
  }

  buildCompareSslChart(params: {
    servers: LineChartServer[];
    benchmarkMeta: LineBenchmarkMeta[];
    selectedAlgo: CompareSslOption;
    baseOptions: ChartConfiguration<"bar">["options"];
  }): SslChartResult | undefined {
    const { servers, benchmarkMeta, selectedAlgo, baseOptions } = params;
    const dataSet = benchmarkMeta.find(
      (benchmark) => benchmark.benchmark_id === "openssl",
    );

    if (!dataSet?.configs?.length) {
      return undefined;
    }

    const scales = this.collectNumericScales(
      dataSet.configs.filter(
        (config) => config.config.algo === selectedAlgo.value,
      ),
      "block_size",
    );

    const data: ChartConfiguration<"bar">["data"] = {
      labels: scales,
      datasets: servers.map((server, index) => ({
        data: scales.map((size) => {
          const item = server.benchmark_scores.find(
            (score) =>
              score.benchmark_id === "openssl" &&
              score.config.algo === selectedAlgo.value &&
              score.config.block_size === size,
          );
          return item?.score ?? null;
        }),
        label: server.display_name,
        spanGaps: true,
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
      })),
    };

    const options = cloneChartOptions(
      baseOptions ?? {},
    ) as MutableBarChartOptions;
    options.plugins = {
      ...options.plugins,
      tooltip: {
        ...options.plugins?.tooltip,
        callbacks: {
          ...options.plugins?.tooltip?.callbacks,
          title: function (
            this: TooltipModel<"bar">,
            tooltipItems: TooltipItem<"bar">[],
          ) {
            return (
              selectedAlgo.name +
              " with " +
              tooltipItems[0].label +
              "-byte block size"
            );
          },
        },
      },
    };

    return { data, options };
  }

  private configureStressNgOptions(
    rawOptions: MutableLineChartOptions,
    percentOptions: MutableLineChartOptions,
  ): void {
    rawOptions.plugins = {
      ...rawOptions.plugins,
      legend: {
        ...rawOptions.plugins?.legend,
        display: false,
      },
      tooltip: {
        ...rawOptions.plugins?.tooltip,
        callbacks: {
          ...rawOptions.plugins?.tooltip?.callbacks,
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            return `Performance: ${tooltipItem.formattedValue} (${tooltipItem.dataset.label})`;
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            return `${tooltipItems[0].label} vCPUs`;
          },
        },
      },
    };

    percentOptions.plugins = {
      ...percentOptions.plugins,
      legend: {
        ...percentOptions.plugins?.legend,
        display: false,
      },
      tooltip: {
        ...percentOptions.plugins?.tooltip,
        callbacks: {
          ...percentOptions.plugins?.tooltip?.callbacks,
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            return `Performance: ${tooltipItem.formattedValue}% (${tooltipItem.dataset.label})`;
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            return `${tooltipItems[0].label} vCPUs`;
          },
        },
      },
    };
  }

  private applyStressNgAnnotation(
    rawOptions: MutableLineChartOptions,
    percentOptions: MutableLineChartOptions,
    scales: number[],
    cpuCores?: number,
  ): void {
    if (!cpuCores) {
      return;
    }

    const idx = scales.findIndex((scale) => scale === cpuCores);
    if (idx === -1) {
      return;
    }

    const annotationLine: AnnotationLine = {
      type: "line",
      borderWidth: 3,
      borderColor: "#EF4444",
      xMin: idx,
      xMax: idx,
      label: {
        rotation: "auto",
        position: "start",
        content: "CPU cores",
        backgroundColor: "#EF4444",
        display: true,
      },
    };

    const rawPlugins = (rawOptions.plugins ?? {}) as NonNullable<
      MutableLineChartOptions["plugins"]
    > &
      AnnotationPluginState;
    rawPlugins.annotation = {
      ...rawPlugins.annotation,
      annotations: {
        ...rawPlugins.annotation?.annotations,
        line1: annotationLine,
      },
    };
    rawOptions.plugins = rawPlugins;

    const percentPlugins = (percentOptions.plugins ?? {}) as NonNullable<
      MutableLineChartOptions["plugins"]
    > &
      AnnotationPluginState;
    percentPlugins.annotation = {
      ...percentPlugins.annotation,
      annotations: {
        ...percentPlugins.annotation?.annotations,
        line1: annotationLine,
      },
    };
    percentOptions.plugins = percentPlugins;
  }

  private collectNumericScales(
    items: BenchmarkConfigContainer[],
    field: keyof LineBenchmarkConfig,
  ): number[] {
    const values: number[] = [];

    items.forEach((item) => {
      const value = item.config?.[field];
      if (typeof value === "number" && !values.includes(value)) {
        values.push(value);
      }
    });

    return values.sort((a, b) => a - b);
  }

  private collectOrderedLabels(
    items: LineBenchmarkScore[],
    field: keyof LineBenchmarkConfig,
  ): string[] {
    const values: string[] = [];

    items.forEach((item) => {
      const value = item.config?.[field];
      if (typeof value === "string" && !values.includes(value)) {
        values.push(value);
      }
    });

    return values.sort((a, b) => this.compareMixedValues(a, b));
  }

  private compareMixedValues(a: string, b: string): number {
    if (!isNaN(Number(a)) && !isNaN(Number(b))) {
      return Number(a) - Number(b);
    }

    const valueA = parseInt(a.replace(/\D/g, ""), 10);
    const valueB = parseInt(b.replace(/\D/g, ""), 10);
    if (valueA && valueB) {
      return valueA - valueB;
    }

    return a.localeCompare(b);
  }
}
