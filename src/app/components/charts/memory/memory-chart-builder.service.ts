import { Injectable } from "@angular/core";
import { TooltipItem, TooltipModel } from "chart.js";
import { lineChartOptionsBWM } from "../../../pages/server-details/chartOptions";
import {
  legacyBWMemOperationLabels,
  membenchSeriesLabels,
} from "../shared/benchmark-labels.constants";
import {
  buildMajorTicks,
  legacyMemoryBlockSizeTicks,
} from "../shared/benchmark-scale.utils";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import {
  CompareMemoryChartOption,
  MemoryChartOption,
  ServerDetailsMemoryChartOption,
  compareMemoryChartOptions,
  serverDetailsMemoryChartOptions,
} from "../shared/memory-chart.types";
import {
  collectMemoryBenchmarkScales,
  getMemoryBenchmarkScaleValue,
  normalizeMemoryBenchmarkScore,
} from "../shared/memory-scale.utils";
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

const COMPARE_CACHE_TICK_PADDING = 20;

const COMPARE_CACHE_LEVELS = [
  { key: "l1", label: "L1D", cacheKey: "cpu_l1d_cache" },
  { key: "l2", label: "L2", cacheKey: "cpu_l2_cache" },
  { key: "l3", label: "L3", cacheKey: "cpu_l3_cache" },
] as const;

const COMPARE_CACHE_TOOLTIP_STYLE = {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  borderWidth: 0,
  borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
  padding: 6,
  color: "#fff",
  titleFont: { weight: "bold" as const, size: 12 },
  bodyFont: { size: 12 },
  labelYAdjust: -8,
  caretRadius: 5,
};

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
    this.configureCompareOptions(
      options,
      scales,
      option,
      benchmarkMeta,
      servers,
    );

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
    servers: MemoryChartServer[],
  ) {
    const benchmark = this.getOptionBenchmarkMeta(option, benchmarkMeta);
    const unit = benchmark?.unit || "MB/s";
    const optionView = this.getOptionsView(options);

    if (optionView.scales?.y?.title) {
      optionView.scales.y.title.text = unit;
    }

    const scaleUnit = option.benchmarkId.startsWith("membench:") ? "MiB" : "MB";
    this.configureXAxis(optionView, scales, scaleUnit);
    this.configureCompareCacheAnnotations(optionView, servers);

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

  private configureCompareCacheAnnotations(
    optionView: MemoryLineChartOptionsView,
    servers: MemoryChartServer[],
  ) {
    const annotations: Record<string, CompareCacheMarkerAnnotation> = {};

    servers.forEach((server, datasetIndex) => {
      const serverColor =
        radarDatasetColors[datasetIndex % radarDatasetColors.length]
          .borderColor;
      for (const {
        key,
        label: cacheTypeLabel,
        cacheKey,
      } of COMPARE_CACHE_LEVELS) {
        const value = server[cacheKey];
        if (!value) {
          continue;
        }

        const markerKey = `server${datasetIndex}-${key}`;
        const { point, label, caret } = this.createCompareCacheMarkers({
          cacheKiB: value,
          serverColor,
          datasetIndex,
          markerKey,
          serverName: server.display_name || "Server",
          cacheLabel: `${cacheTypeLabel} Cache: ${value} KiB`,
        });

        annotations[markerKey] = point;
        annotations[`${markerKey}-label`] = label;
        annotations[`${markerKey}-caret`] = caret;
      }
    });

    if (!Object.keys(annotations).length) {
      optionView.plugins.annotation = {};
      return;
    }

    optionView.scales!.x!.ticks!.padding = COMPARE_CACHE_TICK_PADDING;
    optionView.plugins.annotation = {
      clip: false,
      common: { drawTime: "afterDraw" },
      annotations,
    };
  }

  private createCompareCacheMarkers(params: {
    cacheKiB: number;
    serverColor: string;
    datasetIndex: number;
    markerKey: string;
    serverName: string;
    cacheLabel: string;
  }): {
    point: CompareCachePointAnnotation;
    label: CompareCacheLabelAnnotation;
    caret: CompareCacheCaretAnnotation;
  } {
    const { cacheKiB, serverColor, datasetIndex, serverName, cacheLabel } =
      params;
    const xValue = cacheKiB / 1024;
    const yAtAxisMin = (ctx: { chart: CompareCacheChartContext }) =>
      ctx.chart.scales.y.min;
    const isDatasetVisible = (ctx: { chart: CompareCacheChartContext }) =>
      ctx.chart.isDatasetVisible?.(datasetIndex) ??
      !ctx.chart.data.datasets[datasetIndex]?.hidden;
    let tooltipHovered = false;
    const toggleTooltip =
      (visible: boolean) => (ctx: { chart: CompareCacheChartContext }) => {
        tooltipHovered = visible;
        ctx.chart.update();
      };
    const isTooltipVisible = (ctx: { chart: CompareCacheChartContext }) =>
      tooltipHovered && isDatasetVisible(ctx);

    return {
      point: {
        type: "point",
        xValue,
        xScaleID: "x",
        yScaleID: "y",
        yValue: yAtAxisMin,
        yAdjust: 8,
        pointStyle: "triangle",
        radius: 8,
        backgroundColor: `${serverColor}20`,
        borderColor: serverColor,
        borderWidth: 2.5,
        enter: toggleTooltip(true),
        leave: toggleTooltip(false),
        display: isDatasetVisible,
      },
      label: {
        type: "label",
        display: isTooltipVisible,
        adjustScaleRange: false,
        xScaleID: "x",
        yScaleID: "y",
        xValue,
        yValue: yAtAxisMin,
        yAdjust: COMPARE_CACHE_TOOLTIP_STYLE.labelYAdjust,
        position: { x: "center", y: "end" },
        content: [serverName, cacheLabel],
        color: COMPARE_CACHE_TOOLTIP_STYLE.color,
        backgroundColor: COMPARE_CACHE_TOOLTIP_STYLE.backgroundColor,
        borderWidth: COMPARE_CACHE_TOOLTIP_STYLE.borderWidth,
        borderRadius: COMPARE_CACHE_TOOLTIP_STYLE.borderRadius,
        padding: COMPARE_CACHE_TOOLTIP_STYLE.padding,
        font: [
          COMPARE_CACHE_TOOLTIP_STYLE.titleFont,
          COMPARE_CACHE_TOOLTIP_STYLE.bodyFont,
        ],
        textAlign: "left",
        drawTime: "afterDraw",
      },
      caret: {
        type: "point",
        display: isTooltipVisible,
        adjustScaleRange: false,
        xScaleID: "x",
        yScaleID: "y",
        xValue,
        yValue: yAtAxisMin,
        yAdjust: COMPARE_CACHE_TOOLTIP_STYLE.labelYAdjust,
        pointStyle: "triangle",
        rotation: 180,
        radius: COMPARE_CACHE_TOOLTIP_STYLE.caretRadius,
        backgroundColor: COMPARE_CACHE_TOOLTIP_STYLE.backgroundColor,
        borderWidth: 0,
        drawTime: "afterDraw",
      },
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
      ticks?: {
        padding?: number;
      };
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
          clip?: boolean;
          common?: { drawTime?: string };
          annotations?: Record<
            string,
            MemoryCacheAnnotation | CompareCacheMarkerAnnotation
          >;
        }
      | undefined;
  };
};

type CompareCacheMarkerAnnotation =
  | CompareCachePointAnnotation
  | CompareCacheLabelAnnotation
  | CompareCacheCaretAnnotation;

type CompareCacheChartContext = {
  options?: {
    plugins?: {
      annotation?: {
        annotations?: Record<string, { display?: boolean }>;
      };
    };
  };
  scales: { y: { min: number } };
  isDatasetVisible?: (index: number) => boolean;
  data: { datasets: Array<{ hidden?: boolean }> };
  update: () => void;
};

type CompareCacheLabelAnnotation = {
  type: "label";
  display: (ctx: { chart: CompareCacheChartContext }) => boolean;
  adjustScaleRange: false;
  xScaleID: "x";
  yScaleID: "y";
  xValue: number;
  yValue: (ctx: { chart: CompareCacheChartContext }) => number;
  yAdjust: number;
  position: { x: "center"; y: "end" };
  content: [string, string];
  color: string;
  backgroundColor: string;
  borderWidth: number;
  borderRadius:
    | number
    | {
        topLeft: number;
        topRight: number;
        bottomLeft: number;
        bottomRight: number;
      };
  padding: number;
  font: [{ weight: "bold"; size: number }, { size: number }];
  textAlign: "left";
  drawTime: "afterDraw";
};

type CompareCacheCaretAnnotation = {
  type: "point";
  display: (ctx: { chart: CompareCacheChartContext }) => boolean;
  adjustScaleRange: false;
  xScaleID: "x";
  yScaleID: "y";
  xValue: number;
  yValue: (ctx: { chart: CompareCacheChartContext }) => number;
  yAdjust: number;
  pointStyle: "triangle";
  rotation: number;
  radius: number;
  backgroundColor: string;
  borderWidth: number;
  drawTime: "afterDraw";
};

type CompareCachePointAnnotation = {
  type: "point";
  xValue: number;
  xScaleID: "x";
  yScaleID: "y";
  yValue: (ctx: { chart: CompareCacheChartContext }) => number;
  yAdjust: number;
  pointStyle: "triangle";
  radius: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  display: (ctx: { chart: CompareCacheChartContext }) => boolean;
  enter: (ctx: { chart: CompareCacheChartContext }) => void;
  leave: (ctx: { chart: CompareCacheChartContext }) => void;
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
