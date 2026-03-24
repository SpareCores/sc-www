import { Injectable } from "@angular/core";
import { TooltipItem, TooltipModel } from "chart.js";
import {
  legacyBWMemOperationLabels,
  membenchSeriesLabels,
} from "../shared/benchmark-labels.constants";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import {
  buildMajorTicks,
  legacyMemoryBlockSizeTicks,
} from "../shared/benchmark-scale.utils";
import {
  MemoryChartOption,
  CompareMemoryChartOption,
  ServerDetailsMemoryChartOption,
  compareMemoryChartOptions,
  serverDetailsMemoryChartOptions,
} from "../shared/memory-chart.types";
import {
  MemoryBenchmarkGroup,
  MemoryBenchmarkMeta,
  MemoryBenchmarkScore,
  MemoryChartResult,
  MemoryChartServer,
  MemoryDetailsServer,
  MemoryLineChartData,
  MemoryLineChartOptions,
} from "./memory-chart.types";
import {
  collectMemoryBenchmarkScales,
  getMemoryBenchmarkScaleValue,
  normalizeMemoryBenchmarkScore,
} from "../shared/memory-scale.utils";
import { lineChartOptionsBWM } from "../../../pages/server-details/chartOptions";
import { cloneChartOptions } from "../shared/chart-options.utils";

@Injectable({
  providedIn: "root",
})
export class MemoryChartBuilderService {
  private readonly detailsDescriptions: Record<string, string> = {
    "membench-bandwidth":
      "Memory bandwidth measured with sc-membench across read, write, and copy scenarios.",
    "membench-bandwidth-per-core":
      "Memory bandwidth measured with sc-membench across read, write, and copy scenarios, normalized by the server core count.",
  };

  getAvailableDetailsOptions(
    benchmarksByCategory: MemoryBenchmarkGroup[] | undefined,
  ): ServerDetailsMemoryChartOption[] {
    return serverDetailsMemoryChartOptions.filter((option) =>
      option.benchmarkIds.some((benchmarkId) =>
        benchmarksByCategory?.some(
          (group) =>
            group.benchmark_id === benchmarkId && group.benchmarks?.length,
        ),
      ),
    );
  }

  getAvailableCompareOptions(
    servers: MemoryChartServer[] | undefined,
  ): CompareMemoryChartOption[] {
    return compareMemoryChartOptions.filter((option) =>
      servers?.some((server) =>
        server.benchmark_scores?.some(
          (score) =>
            score.benchmark_id === option.benchmarkId &&
            (!option.legacyOperation ||
              score.config.operation === option.legacyOperation),
        ),
      ),
    );
  }

  getPreferredCompareOption(
    options: CompareMemoryChartOption[],
  ): CompareMemoryChartOption | undefined {
    const preferredOptionIds = [
      "membench-copy",
      "membench-read",
      "membench-write",
      "membench-latency",
      "bw-mem-rdwr",
      "bw-mem-rd",
      "bw-mem-wr",
    ];

    return (
      preferredOptionIds
        .map((optionId) => options.find((option) => option.id === optionId))
        .find((option): option is CompareMemoryChartOption => !!option) ||
      options[0]
    );
  }

  buildServerDetailsChart(params: {
    option: ServerDetailsMemoryChartOption;
    serverDetails: MemoryDetailsServer;
    benchmarksByCategory: MemoryBenchmarkGroup[];
    benchmarkMeta: MemoryBenchmarkMeta[];
  }): MemoryChartResult | undefined {
    const { option, benchmarksByCategory, benchmarkMeta, serverDetails } =
      params;
    const data = option.legacyOperations?.length
      ? this.buildLegacyDetailsChart(option, benchmarksByCategory)
      : this.buildMembenchDetailsChart(
          option,
          benchmarksByCategory,
          benchmarkMeta,
          serverDetails,
        );

    if (!data) {
      return undefined;
    }

    const options = this.createLineChartOptions();
    this.configureDetailsOptions(
      options,
      data.labels ?? [],
      option,
      benchmarkMeta,
      serverDetails,
    );

    return { data, options };
  }

  buildServerCompareChart(params: {
    option: CompareMemoryChartOption;
    servers: MemoryChartServer[];
    benchmarkMeta: MemoryBenchmarkMeta[];
  }): MemoryChartResult | undefined {
    const { option, servers, benchmarkMeta } = params;
    const scales = collectMemoryBenchmarkScales(
      servers
        .flatMap((server) => server.benchmark_scores || [])
        .filter(
          (benchmark) =>
            benchmark.benchmark_id === option.benchmarkId &&
            (!option.legacyOperation ||
              benchmark.config.operation === option.legacyOperation),
        ),
      option,
    );

    if (!scales.length) {
      return undefined;
    }

    const data: MemoryLineChartData = {
      labels: scales,
      datasets: servers.map((server, index) => {
        const datasetData = scales.map((size) => {
          const benchmark = server.benchmark_scores?.find(
            (item) =>
              item.benchmark_id === option.benchmarkId &&
              getMemoryBenchmarkScaleValue(item, option) === size &&
              (!option.legacyOperation ||
                item.config.operation === option.legacyOperation),
          );
          return benchmark?.score ?? null;
        });

        return {
          data: datasetData,
          hidden: datasetData.every(
            (value) => value === null || value === undefined,
          ),
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

    const options = this.createLineChartOptions();
    this.configureCompareOptions(options, scales, option, benchmarkMeta);

    return { data, options };
  }

  getDetailsDescription(
    option: ServerDetailsMemoryChartOption | undefined,
    benchmarkMeta: MemoryBenchmarkMeta[] | undefined,
  ) {
    if (!option) {
      return "";
    }

    return (
      this.detailsDescriptions[option.id] ??
      this.getOptionDescription(option, benchmarkMeta)
    );
  }

  getCompareDescription(
    option: CompareMemoryChartOption | undefined,
    benchmarkMeta: MemoryBenchmarkMeta[] | undefined,
  ) {
    if (!option) {
      return "";
    }

    return this.getOptionDescription(option, benchmarkMeta);
  }

  getOrderTooltip(
    option: MemoryChartOption | undefined,
    benchmarkMeta: MemoryBenchmarkMeta[] | undefined,
  ) {
    return this.isHigherBetter(option, benchmarkMeta)
      ? "Higher is better."
      : "Lower is better.";
  }

  getDirectionIcon(
    option: MemoryChartOption | undefined,
    benchmarkMeta: MemoryBenchmarkMeta[] | undefined,
  ) {
    return this.isHigherBetter(option, benchmarkMeta)
      ? "circle-arrow-up"
      : "circle-arrow-down";
  }

  private buildLegacyDetailsChart(
    option: ServerDetailsMemoryChartOption,
    benchmarksByCategory: MemoryBenchmarkGroup[],
  ): MemoryLineChartData | undefined {
    const dataSet = benchmarksByCategory?.find(
      (group) => group.benchmark_id === "bw_mem",
    );

    const benchmarks = dataSet?.benchmarks ?? [];

    if (!benchmarks.length) {
      return undefined;
    }

    const sizes = collectMemoryBenchmarkScales(benchmarks);
    const operations = (option.legacyOperations || []).filter((operation) =>
      benchmarks.some((benchmark) => benchmark.config.operation === operation),
    );

    if (!sizes.length || !operations.length) {
      return undefined;
    }

    return {
      labels: sizes,
      datasets: operations.map((operation, index) => ({
        data: sizes.map((size) => {
          const benchmark = benchmarks.find(
            (item) =>
              item.config.operation === operation && item.config.size === size,
          );
          return benchmark?.score ?? null;
        }),
        label: legacyBWMemOperationLabels[operation] || operation,
        spanGaps: true,
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].backgroundColor,
      })),
    };
  }

  private buildMembenchDetailsChart(
    option: ServerDetailsMemoryChartOption,
    benchmarksByCategory: MemoryBenchmarkGroup[],
    benchmarkMeta: MemoryBenchmarkMeta[],
    serverDetails: MemoryDetailsServer,
  ): MemoryLineChartData | undefined {
    const groups = option.benchmarkIds
      .map((benchmarkId) => ({
        benchmarkId,
        group: benchmarksByCategory?.find(
          (item) => item.benchmark_id === benchmarkId,
        ),
      }))
      .filter(
        (
          item,
        ): item is {
          benchmarkId: string;
          group: MemoryBenchmarkGroup & { benchmarks: MemoryBenchmarkScore[] };
        } => !!item.group?.benchmarks?.length,
      );

    if (!groups.length) {
      return undefined;
    }

    const sizes = collectMemoryBenchmarkScales(
      groups.flatMap((item) => item.group.benchmarks),
      option,
    );

    if (!sizes.length) {
      return undefined;
    }

    const coreCount = this.getServerCoreCount(serverDetails);

    return {
      labels: sizes,
      datasets: groups.map((item, index) => ({
        data: sizes.map((size) => {
          const benchmark = item.group.benchmarks.find(
            (score) => getMemoryBenchmarkScaleValue(score, option) === size,
          );
          return normalizeMemoryBenchmarkScore(
            benchmark?.score ?? null,
            option.perCore,
            coreCount,
          );
        }),
        label:
          membenchSeriesLabels[item.benchmarkId] ||
          this.getBenchmarkMeta(benchmarkMeta, item.benchmarkId)?.name ||
          item.benchmarkId,
        spanGaps: true,
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].backgroundColor,
      })),
    };
  }

  private configureDetailsOptions(
    options: MemoryLineChartOptions,
    labels: number[],
    option: ServerDetailsMemoryChartOption,
    benchmarkMeta: MemoryBenchmarkMeta[],
    serverDetails: MemoryDetailsServer,
  ) {
    const benchmark = this.getOptionBenchmarkMeta(option, benchmarkMeta);
    const unit = benchmark?.unit || (option.singleSeries ? undefined : "MB/s");
    const yAxisLabel = option.perCore
      ? this.getPerCoreUnitLabel(unit)
      : unit || benchmark?.measurement || "Score";
    const labelSuffix = option.perCore
      ? this.getPerCoreUnitLabel(unit)
      : unit || option.unitSuffix || "MB/s";

    const optionView = this.getOptionsView(options);
    if (optionView.scales?.y?.title) {
      optionView.scales.y.title.text = yAxisLabel;
    }

    const scaleUnit = option.benchmarkIds.some((benchmarkId) =>
      benchmarkId.startsWith("membench:"),
    )
      ? "MiB"
      : "MB";

    this.configureXAxis(optionView, labels, scaleUnit);

    optionView.plugins.tooltip.callbacks.title = function (
      this: TooltipModel<"line">,
      tooltipItems: TooltipItem<"line">[],
    ) {
      return `${tooltipItems[0].label} ${scaleUnit} block size`;
    };

    optionView.plugins.tooltip.callbacks.label = function (
      this: TooltipModel<"line">,
      tooltipItem: TooltipItem<"line">,
    ) {
      return `${tooltipItem.formattedValue} ${labelSuffix}`;
    };

    this.configureAnnotations(
      options,
      option.showCacheAnnotations,
      serverDetails,
    );
  }

  private configureCompareOptions(
    options: MemoryLineChartOptions,
    scales: number[],
    option: CompareMemoryChartOption,
    benchmarkMeta: MemoryBenchmarkMeta[],
  ) {
    const benchmark = this.getOptionBenchmarkMeta(option, benchmarkMeta);
    const unit = benchmark?.unit || "MB/s";
    const optionView = this.getOptionsView(options);

    if (optionView.scales?.y?.title) {
      optionView.scales.y.title.text = unit;
    }

    const scaleUnit = option.benchmarkId.startsWith("membench:") ? "MiB" : "MB";
    this.configureXAxis(optionView, scales, scaleUnit);
    optionView.plugins.annotation = {};

    optionView.plugins.tooltip.callbacks.title = function (
      this: TooltipModel<"line">,
      tooltipItems: TooltipItem<"line">[],
    ) {
      return `${option.name} with ${tooltipItems[0].label} ${scaleUnit} block size`;
    };

    optionView.plugins.tooltip.callbacks.label = function (
      this: TooltipModel<"line">,
      tooltipItem: TooltipItem<"line">,
    ) {
      return `${tooltipItem.formattedValue} ${unit}`;
    };
  }

  private configureXAxis(
    options: MemoryLineChartOptionsView,
    labels: number[],
    scaleUnit: "MB" | "MiB",
  ) {
    const xAxis = options.scales?.x;

    if (!xAxis) {
      return;
    }

    xAxis.title ??= {};
    xAxis.title.text = scaleUnit;

    if (scaleUnit === "MiB") {
      xAxis.min = labels[0];
      xAxis.afterBuildTicks = function (scale: MemoryTickScale) {
        scale.ticks = buildMajorTicks(labels);
      };
      xAxis.afterTickToLabelConversion = function (scale: MemoryTickScale) {
        scale.ticks = buildMajorTicks(labels);
      };
      return;
    }

    xAxis.min = 0;
    xAxis.afterBuildTicks = function (scale: MemoryTickScale) {
      scale.ticks = buildMajorTicks(legacyMemoryBlockSizeTicks);
    };
    xAxis.afterTickToLabelConversion = function (scale: MemoryTickScale) {
      scale.ticks = buildMajorTicks(legacyMemoryBlockSizeTicks);
    };
  }

  private configureAnnotations(
    options: MemoryLineChartOptions,
    showAnnotations: boolean,
    serverDetails: MemoryDetailsServer,
  ) {
    const optionView = this.getOptionsView(options);

    if (!optionView.plugins.annotation) {
      return;
    }

    if (
      !showAnnotations ||
      (!serverDetails?.cpu_l1d_cache &&
        !serverDetails?.cpu_l2_cache &&
        !serverDetails?.cpu_l3_cache)
    ) {
      optionView.plugins.annotation = {};
      return;
    }

    const annotations: Record<string, MemoryCacheAnnotation> = {};

    if (serverDetails.cpu_l1d_cache) {
      annotations.line1 = this.createCacheAnnotation(
        serverDetails.cpu_l1d_cache / 1024,
        "L1D Cache",
        "end",
      );
    }

    if (serverDetails.cpu_l2_cache) {
      annotations.line2 = this.createCacheAnnotation(
        serverDetails.cpu_l2_cache / 1024,
        "L2 Cache",
        "start",
      );
    }

    if (serverDetails.cpu_l3_cache) {
      annotations.line3 = this.createCacheAnnotation(
        serverDetails.cpu_l3_cache / 1024,
        "L3 Cache",
        "start",
      );
    }

    optionView.plugins.annotation = { annotations };
  }

  private createCacheAnnotation(
    value: number,
    content: string,
    position: "start" | "end",
  ): MemoryCacheAnnotation {
    return {
      type: "line",
      scaleID: "x",
      borderWidth: 3,
      borderColor: "#EF4444",
      value,
      label: {
        rotation: "auto",
        position,
        content,
        backgroundColor: "#EF4444",
        display: true,
      },
    };
  }

  private createLineChartOptions(): MemoryLineChartOptions {
    return cloneChartOptions(lineChartOptionsBWM);
  }

  private getOptionsView(
    options: MemoryLineChartOptions,
  ): MemoryLineChartOptionsView {
    return options as MemoryLineChartOptionsView;
  }

  private getOptionBenchmarkMeta(
    option: MemoryChartOption | undefined,
    benchmarkMeta: MemoryBenchmarkMeta[] | undefined,
  ) {
    return this.getBenchmarkMeta(benchmarkMeta, option?.infoBenchmarkId);
  }

  private getOptionDescription(
    option: MemoryChartOption | undefined,
    benchmarkMeta: MemoryBenchmarkMeta[] | undefined,
  ) {
    return (
      this.getOptionBenchmarkMeta(option, benchmarkMeta)?.description || ""
    );
  }

  private isHigherBetter(
    option: MemoryChartOption | undefined,
    benchmarkMeta: MemoryBenchmarkMeta[] | undefined,
  ) {
    if (!option) {
      return true;
    }

    const benchmark = this.getOptionBenchmarkMeta(option, benchmarkMeta);
    return option.higherIsBetter ?? benchmark?.higher_is_better ?? true;
  }

  private getBenchmarkMeta(
    benchmarkMeta: MemoryBenchmarkMeta[] | undefined,
    benchmarkId?: string,
  ) {
    return benchmarkMeta?.find(
      (benchmark) => benchmark.benchmark_id === benchmarkId,
    );
  }

  private getPerCoreUnitLabel(unit?: string | null) {
    if (!unit) {
      return "per core";
    }

    return unit.includes("/core") ? unit : `${unit}/core`;
  }

  private getServerCoreCount(serverDetails: MemoryDetailsServer) {
    const coreCount = Number(
      serverDetails?.cores || serverDetails?.cpu_cores || serverDetails?.vcpus,
    );

    return coreCount > 0 ? coreCount : undefined;
  }
}

type MemoryTick = ReturnType<typeof buildMajorTicks>[number];

type MemoryTickScale = {
  ticks: MemoryTick[];
};

type MemoryLineChartOptionsView = {
  scales?: {
    x?: {
      min?: number;
      title?: {
        text?: string;
      };
      afterBuildTicks?: (scale: MemoryTickScale) => void;
      afterTickToLabelConversion?: (scale: MemoryTickScale) => void;
    };
    y?: {
      title?: {
        text?: string;
      };
    };
  };
  plugins: {
    tooltip: {
      callbacks: {
        title?: (
          this: TooltipModel<"line">,
          tooltipItems: TooltipItem<"line">[],
        ) => string;
        label?: (
          this: TooltipModel<"line">,
          tooltipItem: TooltipItem<"line">,
        ) => string;
      };
    };
    annotation?:
      | {
          annotations?: Record<string, MemoryCacheAnnotation>;
        }
      | undefined;
  };
};

type MemoryCacheAnnotation = {
  type: "line";
  scaleID: "x";
  borderWidth: number;
  borderColor: string;
  value: number;
  label: {
    rotation: "auto";
    position: "start" | "end";
    content: string;
    backgroundColor: string;
    display: true;
  };
};
