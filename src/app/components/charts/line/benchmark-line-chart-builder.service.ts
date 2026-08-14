import { Injectable } from "@angular/core";
import { ChartConfiguration, TooltipItem, TooltipModel } from "chart.js";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import {
  buildCompareTooltipTitle,
  getDatasetTooltipIdentity,
  withServerTooltipIdentity,
} from "../shared/chart-tooltip.utils";
import {
  AnnotationLine,
  CompareSslOption,
  DEFAULT_COMPARE_SSL_OPTIONS,
  LineBenchmarkConfig,
  LineBenchmarkGroup,
  LineBenchmarkMeta,
  LineBenchmarkScore,
  LineChartServer,
  MutableBarChartOptions,
  MutableLineChartOptions,
  PgbenchChartData,
  PgbenchChartResult,
  PgbenchDataPoint,
  PgbenchScore,
  SslChartResult,
  StressNgChartData,
  StressNgChartResult,
} from "./benchmark-line-chart.types";

const PGBENCH_HEAVY_READ_ONLY_ID = "pgbench:heavy_read_only";
const PGBENCH_SCORE_COLOR = radarDatasetColors[0].borderColor;
const PGBENCH_LATENCY_COLOR = "#F97316";

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

  buildDetailsPgbenchChart(params: {
    scores: PgbenchScore[];
    vcpus?: number | null;
    optionsBase: ChartConfiguration<"line">["options"];
    scoreUnit?: string | null;
  }): PgbenchChartResult | undefined {
    const { scores, vcpus, optionsBase, scoreUnit } = params;

    const points: Array<{
      concurrency: number;
      score: number;
      latency: number | undefined;
      note?: string | null;
    }> = [];

    for (const score of scores) {
      if (score.benchmark_id !== PGBENCH_HEAVY_READ_ONLY_ID) {
        continue;
      }

      const concurrency = this.getConcurrency(score.config);
      if (concurrency === undefined) {
        continue;
      }

      points.push({
        concurrency,
        score: score.score,
        latency: this.getLatencyMs(score.environment),
        note: score.note,
      });
    }

    points.sort((a, b) => a.concurrency - b.concurrency);

    if (!points.length) {
      return undefined;
    }

    const unit = scoreUnit?.trim() || undefined;
    const scoreData: Array<PgbenchDataPoint | null> = points.map((point) => ({
      x: point.concurrency,
      y: point.score,
      note: point.note,
      unit,
    }));
    const latencyData: Array<PgbenchDataPoint | null> = points.map((point) =>
      point.latency === undefined
        ? null
        : {
            x: point.concurrency,
            y: point.latency,
          },
    );

    const data: PgbenchChartData = {
      datasets: [
        {
          data: scoreData,
          label: "Score",
          yAxisID: "y",
          spanGaps: true,
          borderColor: PGBENCH_SCORE_COLOR,
          backgroundColor: PGBENCH_SCORE_COLOR,
        },
        {
          data: latencyData,
          label: "Avg latency",
          yAxisID: "y1",
          spanGaps: true,
          borderColor: PGBENCH_LATENCY_COLOR,
          backgroundColor: PGBENCH_LATENCY_COLOR,
        },
      ],
    };

    const options = cloneChartOptions(
      optionsBase ?? {},
    ) as MutableLineChartOptions;
    this.configurePgbenchOptions(options, unit);
    this.applyPgbenchAnnotation(
      options,
      points.map((point) => point.concurrency),
      vcpus,
    );

    return { data, options };
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

        return withServerTooltipIdentity(
          {
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
          },
          server,
        );
      }),
    };

    const rawOptions = cloneChartOptions(
      rawOptionsBase ?? {},
    ) as MutableLineChartOptions;
    const percentOptions = cloneChartOptions(
      percentOptionsBase ?? {},
    ) as MutableLineChartOptions;
    this.configureStressNgOptions(rawOptions, percentOptions, true);

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

    const labels = this.collectSslAlgorithmLabels(dataSet.benchmarks);
    const scales = this.collectNumericScales(dataSet.benchmarks, "block_size");

    const data: ChartConfiguration<"bar">["data"] = {
      labels,
      datasets: scales.map((size, index) => ({
        data: labels.map((label) => {
          const item = dataSet.benchmarks?.find(
            (benchmark) =>
              benchmark.config.algo === label &&
              benchmark.config.block_size === size,
          );
          return item?.score ?? null;
        }),
        label: String(size),
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
      datasets: servers.map((server, index) =>
        withServerTooltipIdentity(
          {
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
          },
          server,
        ),
      ),
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
            const identity = getDatasetTooltipIdentity(
              tooltipItems[0]?.dataset,
            );
            const context =
              selectedAlgo.name +
              " with " +
              tooltipItems[0].label +
              "-byte block size";

            return buildCompareTooltipTitle(identity, context);
          },
          label: function (
            this: TooltipModel<"bar">,
            tooltipItem: TooltipItem<"bar">,
          ) {
            return `${tooltipItem.formattedValue} byte/s`;
          },
        },
      },
    };

    return { data, options };
  }

  private configureStressNgOptions(
    rawOptions: MutableLineChartOptions,
    percentOptions: MutableLineChartOptions,
    showLegend = false,
  ): void {
    const buildTitle = (tooltipItems: TooltipItem<"line">[]) => {
      const context = `${tooltipItems[0].label} vCPUs`;
      const identity = showLegend
        ? getDatasetTooltipIdentity(tooltipItems[0]?.dataset)
        : "";
      return buildCompareTooltipTitle(identity, context);
    };

    rawOptions.plugins = {
      ...rawOptions.plugins,
      legend: {
        ...rawOptions.plugins?.legend,
        display: showLegend,
      },
      tooltip: {
        ...rawOptions.plugins?.tooltip,
        callbacks: {
          ...rawOptions.plugins?.tooltip?.callbacks,
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            return `Performance: ${tooltipItem.formattedValue}`;
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            return buildTitle(tooltipItems);
          },
        },
      },
    };

    percentOptions.plugins = {
      ...percentOptions.plugins,
      legend: {
        ...percentOptions.plugins?.legend,
        display: showLegend,
      },
      tooltip: {
        ...percentOptions.plugins?.tooltip,
        callbacks: {
          ...percentOptions.plugins?.tooltip?.callbacks,
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            return `Performance: ${tooltipItem.formattedValue}%`;
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            return buildTitle(tooltipItems);
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

  private collectSslAlgorithmLabels(items: LineBenchmarkScore[]): string[] {
    const availableLabels = this.collectOrderedLabels(items, "algo");
    const orderedDefaultLabels = DEFAULT_COMPARE_SSL_OPTIONS.map(
      (option) => option.value,
    ).filter((label) => availableLabels.includes(label));
    const additionalLabels = availableLabels.filter(
      (label) => !orderedDefaultLabels.includes(label),
    );

    return [...orderedDefaultLabels, ...additionalLabels];
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

  private configurePgbenchOptions(
    options: MutableLineChartOptions,
    unit?: string,
  ): void {
    if (unit) {
      options.scales = {
        ...options.scales,
        y: {
          ...options.scales?.y,
          title: {
            ...options.scales?.y?.title,
            display: true,
            text: unit,
          },
        },
      };
    }

    options.plugins = {
      ...options.plugins,
      tooltip: {
        ...options.plugins?.tooltip,
        callbacks: {
          ...options.plugins?.tooltip?.callbacks,
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            const raw = tooltipItem.raw as PgbenchDataPoint | null;
            if (tooltipItem.dataset.yAxisID === "y1") {
              return `Avg latency: ${tooltipItem.formattedValue} ms`;
            }

            const unit = raw?.unit?.trim();
            const scoreLabel = unit
              ? `Performance: ${tooltipItem.formattedValue} ${unit}`
              : `Performance: ${tooltipItem.formattedValue}`;
            const note = raw?.note?.trim();
            return note ? `${scoreLabel}; Note: ${note}` : scoreLabel;
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            const concurrency =
              (tooltipItems[0]?.raw as PgbenchDataPoint | null)?.x ??
              tooltipItems[0]?.parsed?.x;
            return `${concurrency} concurrency`;
          },
        },
      },
    };
  }

  private applyPgbenchAnnotation(
    options: MutableLineChartOptions,
    concurrencies: number[],
    vcpus?: number | null,
  ): void {
    if (!vcpus) {
      return;
    }

    const xValues = [...concurrencies, vcpus];
    const scales = options.scales ?? {};
    const xScale = scales.x ?? {};
    scales.x = {
      ...xScale,
      min: Math.min(...xValues),
      max: Math.max(...xValues),
    };
    options.scales = scales;

    const annotationLine: AnnotationLine = {
      type: "line",
      borderWidth: 3,
      borderColor: "#EF4444",
      xMin: vcpus,
      xMax: vcpus,
      label: {
        rotation: "auto",
        position: "start",
        content: "vCPUs",
        backgroundColor: "#EF4444",
        display: true,
      },
    };

    const plugins = (options.plugins ?? {}) as NonNullable<
      MutableLineChartOptions["plugins"]
    > &
      AnnotationPluginState;
    plugins.annotation = {
      ...plugins.annotation,
      annotations: {
        ...plugins.annotation?.annotations,
        line1: annotationLine,
      },
    };
    options.plugins = plugins;
  }

  private getConcurrency(config: PgbenchScore["config"]): number | undefined {
    let parsed: unknown = config;
    if (typeof config === "string") {
      try {
        parsed = JSON.parse(config);
      } catch {
        return undefined;
      }
    }
    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }

    const value = (parsed as { concurrency?: unknown }).concurrency;
    return typeof value === "number" && Number.isFinite(value)
      ? value
      : undefined;
  }

  private getLatencyMs(
    environment: PgbenchScore["environment"],
  ): number | undefined {
    if (!environment || typeof environment !== "object") {
      return undefined;
    }

    const value = environment["latency_avg_ms"];
    return typeof value === "number" && Number.isFinite(value)
      ? value
      : undefined;
  }
}
