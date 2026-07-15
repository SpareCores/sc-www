import { Injectable } from "@angular/core";
import { TooltipItem, TooltipModel } from "chart.js";
import { lineChartOptionsBWM } from "../../../pages/server-details/chartOptions";
import {
  legacyBWMemOperationLabels,
  membenchSeriesLabels,
} from "../shared/benchmark-labels.constants";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import {
  buildCompareTooltipTitle,
  getDatasetTooltipIdentity,
  withServerTooltipIdentity,
} from "../shared/chart-tooltip.utils";
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

const COMPARE_CACHE_TICK_PADDING = 10;
const MEMORY_BLOCK_SIZE_AXIS_TITLE = "Block sizes and CPU cache amounts";
const BYTES_PER_MB = 1_000_000;
const BYTES_PER_KIB = 1024;
const MB_TO_KIB = BYTES_PER_MB / BYTES_PER_KIB;
const MB_TO_MIB = BYTES_PER_MB / BYTES_PER_KIB / BYTES_PER_KIB;
const COMPARE_CACHE_MARKER_RADIUS = 8;
const COMPARE_CACHE_MARKER_BORDER_WIDTH = 2.5;

const COMPARE_CACHE_LEVELS = [
  { label: "L1D", cacheKey: "cpu_l1d_cache" },
  { label: "L2", cacheKey: "cpu_l2_cache" },
  { label: "L3", cacheKey: "cpu_l3_cache" },
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

        return withServerTooltipIdentity(
          {
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
          },
          server,
        );
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

    const bwMemScale = this.isBwMemChart(option);
    this.configureXAxis(optionView, labels, true, bwMemScale);
    this.setBlockSizeTooltipTitle(
      optionView,
      (blockSizeLabel) => `${blockSizeLabel} block size`,
      bwMemScale,
    );

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

    const bwMemScale = this.isBwMemChart(option);
    this.configureXAxis(optionView, scales, false, bwMemScale);
    this.configureCompareCacheAnnotations(optionView, servers);
    this.setBlockSizeTooltipTitle(
      optionView,
      (blockSizeLabel) => `${option.name} with ${blockSizeLabel} block size`,
      bwMemScale,
      true,
    );

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
    const groups = new Map<number, CompareCacheMarkerEntry[]>();

    servers.forEach((server, datasetIndex) => {
      const serverColor =
        radarDatasetColors[datasetIndex % radarDatasetColors.length]
          .borderColor;
      for (const { label: cacheTypeLabel, cacheKey } of COMPARE_CACHE_LEVELS) {
        const value = server[cacheKey];
        if (!value) {
          continue;
        }

        const entry: CompareCacheMarkerEntry = {
          serverName: server.display_name || "Server",
          datasetIndex,
          serverColor,
          cacheTypeLabel,
          cacheKiB: value,
        };
        const group = groups.get(value) ?? [];
        group.push(entry);
        groups.set(value, group);
      }
    });

    groups.forEach((entries, cacheKiB) => {
      const markerKey = `cache-${cacheKiB}`;
      const { point, label, caret } = this.createCompareCacheMarkers({
        cacheKiB,
        entries,
      });

      annotations[markerKey] = point;
      annotations[`${markerKey}-label`] = label;
      annotations[`${markerKey}-caret`] = caret;
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

  private getVisibleCompareCacheEntries(
    chart: CompareCacheChartContext,
    entries: CompareCacheMarkerEntry[],
  ) {
    return entries.filter(
      (entry) =>
        chart.isDatasetVisible?.(entry.datasetIndex) ??
        !chart.data.datasets[entry.datasetIndex]?.hidden,
    );
  }

  private buildCompareCacheTooltip(entries: CompareCacheMarkerEntry[]): {
    content: string[];
    font: CompareCacheTooltipFont[];
  } {
    const content: string[] = [];
    const font: CompareCacheTooltipFont[] = [];

    entries.forEach((entry, index) => {
      if (index > 0) {
        content.push("");
        font.push(COMPARE_CACHE_TOOLTIP_STYLE.bodyFont);
      }
      content.push(entry.serverName);
      font.push(COMPARE_CACHE_TOOLTIP_STYLE.titleFont);
      content.push(
        `${entry.cacheTypeLabel} Cache: ${this.formatBlockSize(entry.cacheKiB / 1024)}`,
      );
      font.push(COMPARE_CACHE_TOOLTIP_STYLE.bodyFont);
    });

    return { content, font };
  }

  private createCompareCacheGradient(
    chart: CompareCacheChartContext,
    xValue: number,
    colors: string[],
    radius: number,
  ) {
    const xScale = chart.scales.x;
    const pixel = xScale.getPixelForValue(xValue);
    const gradient = chart.ctx.createLinearGradient(
      pixel - radius,
      0,
      pixel + radius,
      0,
    );

    colors.forEach((color, index) => {
      gradient.addColorStop(index / Math.max(colors.length - 1, 1), color);
    });

    return gradient;
  }

  private getCompareCachePointStyle(
    chart: CompareCacheChartContext,
    entries: CompareCacheMarkerEntry[],
    xValue: number,
    fallbackEntry: CompareCacheMarkerEntry,
  ): {
    backgroundColor: string | CanvasGradient;
    borderColor?: string;
    borderWidth: number;
    radius: number;
  } {
    const visibleEntries = this.getVisibleCompareCacheEntries(chart, entries);

    if (visibleEntries.length <= 1) {
      const entry = visibleEntries[0] ?? fallbackEntry;
      return {
        backgroundColor: `${entry.serverColor}20`,
        borderColor: entry.serverColor,
        borderWidth: COMPARE_CACHE_MARKER_BORDER_WIDTH,
        radius: COMPARE_CACHE_MARKER_RADIUS,
      };
    }

    const filledRadius =
      COMPARE_CACHE_MARKER_RADIUS + COMPARE_CACHE_MARKER_BORDER_WIDTH;

    return {
      backgroundColor: this.createCompareCacheGradient(
        chart,
        xValue,
        visibleEntries.map((entry) => entry.serverColor),
        filledRadius,
      ),
      borderWidth: 0,
      radius: filledRadius,
    };
  }

  private createCompareCacheMarkers(params: {
    cacheKiB: number;
    entries: CompareCacheMarkerEntry[];
  }): {
    point: CompareCachePointAnnotation;
    label: CompareCacheLabelAnnotation;
    caret: CompareCacheCaretAnnotation;
  } {
    const { cacheKiB, entries } = params;
    const fallbackEntry = entries[0];
    const xValue = cacheKiB / 1024;
    const yAtAxisMin = (ctx: { chart: CompareCacheChartContext }) =>
      ctx.chart.scales.y.min;
    const getVisibleEntries = (chart: CompareCacheChartContext) =>
      this.getVisibleCompareCacheEntries(chart, entries);
    const isAnyEntryVisible = (ctx: { chart: CompareCacheChartContext }) =>
      getVisibleEntries(ctx.chart).length > 0;
    let tooltipHovered = false;
    const toggleTooltip =
      (visible: boolean) => (ctx: { chart: CompareCacheChartContext }) => {
        tooltipHovered = visible;
        ctx.chart.update();
      };
    const isTooltipVisible = (ctx: { chart: CompareCacheChartContext }) =>
      tooltipHovered && isAnyEntryVisible(ctx);
    const getTooltip = (chart: CompareCacheChartContext) => {
      const visibleEntries = getVisibleEntries(chart);
      return this.buildCompareCacheTooltip(
        visibleEntries.length ? visibleEntries : [fallbackEntry],
      );
    };
    const getPointStyle = (chart: CompareCacheChartContext) =>
      this.getCompareCachePointStyle(chart, entries, xValue, fallbackEntry);

    return {
      point: {
        type: "point",
        xValue,
        xScaleID: "x",
        yScaleID: "y",
        yValue: yAtAxisMin,
        yAdjust: 8,
        pointStyle: "triangle",
        radius: (ctx) => getPointStyle(ctx.chart).radius,
        backgroundColor: (ctx) => getPointStyle(ctx.chart).backgroundColor,
        borderColor: (ctx) => getPointStyle(ctx.chart).borderColor,
        borderWidth: (ctx) => getPointStyle(ctx.chart).borderWidth,
        enter: toggleTooltip(true),
        leave: toggleTooltip(false),
        display: isAnyEntryVisible,
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
        content: (ctx) => getTooltip(ctx.chart).content,
        color: COMPARE_CACHE_TOOLTIP_STYLE.color,
        backgroundColor: COMPARE_CACHE_TOOLTIP_STYLE.backgroundColor,
        borderWidth: COMPARE_CACHE_TOOLTIP_STYLE.borderWidth,
        borderRadius: COMPARE_CACHE_TOOLTIP_STYLE.borderRadius,
        padding: COMPARE_CACHE_TOOLTIP_STYLE.padding,
        font: (ctx) => getTooltip(ctx.chart).font,
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

  private isBwMemChart(
    option: ServerDetailsMemoryChartOption | CompareMemoryChartOption,
  ): boolean {
    if ("benchmarkIds" in option) {
      return option.benchmarkIds.includes("bw_mem");
    }
    return option.benchmarkId === "bw_mem";
  }

  private formatBwMemBlockSize(value: number, compact = false): string {
    if (value < 1) {
      const rounded = Math.round(value * MB_TO_KIB);
      return compact ? `${rounded}k` : `${rounded} KiB`;
    }
    const mib = value * MB_TO_MIB;
    const label = Number.isInteger(value) ? value : mib;
    return compact ? `${label}M` : `${label} MiB`;
  }

  private setBlockSizeTooltipTitle(
    optionView: MemoryLineChartOptionsView,
    getTitle: (blockSizeLabel: string) => string,
    bwMemScale = false,
    includeServerIdentity = false,
  ) {
    optionView.plugins.tooltip.callbacks.title = (
      tooltipItems: TooltipItem<"line">[],
    ) => {
      const blockSizeLabel = this.formatBlockSize(
        tooltipItems[0].parsed.x as number,
        false,
        bwMemScale,
      );
      const identity = includeServerIdentity
        ? getDatasetTooltipIdentity(tooltipItems[0]?.dataset)
        : "";

      return buildCompareTooltipTitle(identity, getTitle(blockSizeLabel));
    };
  }

  private formatBlockSize(
    value: number,
    compact = false,
    bwMemScale = false,
  ): string {
    if (bwMemScale) {
      return this.formatBwMemBlockSize(value, compact);
    }

    if (value < 1) {
      const rounded = Math.round(value * BYTES_PER_KIB);
      return compact ? `${rounded}k` : `${rounded} KiB`;
    }
    return compact ? `${value}M` : `${value} MiB`;
  }

  private buildBlockSizeTicks(
    labels: number[],
    compactLabels = false,
    bwMemScale = false,
  ) {
    return labels.map((value) => ({
      value,
      label: this.formatBlockSize(value, compactLabels, bwMemScale),
      major: true,
    }));
  }

  private configureXAxis(
    options: MemoryLineChartOptionsView,
    labels: number[],
    compactBlockSizeLabels = false,
    bwMemScale = false,
  ) {
    const xAxis = options.scales?.x;

    if (!xAxis) {
      return;
    }

    xAxis.title ??= {};
    xAxis.title.text = MEMORY_BLOCK_SIZE_AXIS_TITLE;
    xAxis.min = labels[0];
    const buildTicks = (scale: MemoryTickScale) => {
      scale.ticks = this.buildBlockSizeTicks(
        labels,
        compactBlockSizeLabels,
        bwMemScale,
      );
    };
    xAxis.afterBuildTicks = buildTicks;
    xAxis.afterTickToLabelConversion = buildTicks;
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

type MemoryTick = ReturnType<
  MemoryChartBuilderService["buildBlockSizeTicks"]
>[number];

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
        display?: boolean;
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
        ) => string | string[];
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

type CompareCacheMarkerEntry = {
  serverName: string;
  datasetIndex: number;
  serverColor: string;
  cacheTypeLabel: string;
  cacheKiB: number;
};

type CompareCacheTooltipFont = {
  weight?: "bold";
  size: number;
};

type CompareCacheChartContext = {
  ctx: CanvasRenderingContext2D;
  scales: {
    x: { getPixelForValue: (value: number) => number };
    y: { min: number };
  };
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
  content: string[] | ((ctx: { chart: CompareCacheChartContext }) => string[]);
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
  font:
    | CompareCacheTooltipFont[]
    | ((ctx: { chart: CompareCacheChartContext }) => CompareCacheTooltipFont[]);
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
  radius: number | ((ctx: { chart: CompareCacheChartContext }) => number);
  backgroundColor:
    | string
    | ((ctx: { chart: CompareCacheChartContext }) => string | CanvasGradient);
  borderColor?:
    | string
    | ((ctx: { chart: CompareCacheChartContext }) => string | undefined);
  borderWidth: number | ((ctx: { chart: CompareCacheChartContext }) => number);
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
