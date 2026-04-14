import { Injectable } from "@angular/core";
import { TooltipItem, TooltipModel } from "chart.js";
import { formatBytes } from "../../../pipes/pipe-utils";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import {
  CompareCompressionOption,
  CompressionBenchmarkGroup,
  CompressionBenchmarkMeta,
  CompressionChartOptions,
  CompressionCompareChartData,
  CompressionCompareChartResult,
  CompressionCompareChartType,
  CompressionConfig,
  CompressionDataPoint,
  CompressionDetailsChartData,
  CompressionDetailsChartResult,
  CompressionMutableChartOptions,
  CompressionServer,
} from "./compression-chart.types";

export type DetailsCompressionMode = {
  name: string;
  key:
    | "compress"
    | "decompress"
    | "ratio"
    | "ratio_compress"
    | "ratio_decompress";
  order: string;
  icon: "circle-arrow-down" | "circle-arrow-up";
};

const detailsCompressionModes: DetailsCompressionMode[] = [
  {
    name: "Compression speed",
    key: "compress",
    order: "Higher is better.",
    icon: "circle-arrow-up",
  },
  {
    name: "Decompression speed",
    key: "decompress",
    order: "Higher is better.",
    icon: "circle-arrow-up",
  },
  {
    name: "Compression ratio",
    key: "ratio",
    order: "Lower is better.",
    icon: "circle-arrow-down",
  },
  {
    name: "Compression speed/ratio",
    key: "ratio_compress",
    order: "Higher is better.",
    icon: "circle-arrow-up",
  },
  {
    name: "Decompression speed/ratio",
    key: "ratio_decompress",
    order: "Higher is better.",
    icon: "circle-arrow-up",
  },
];

const DETAILS_SERIES_IGNORED_KEYS = new Set(["algo", "compression_level", "cores"]);
const COMPRESSION_LEVEL_NOT_AVAILABLE_LABEL = "N/A";
const LEGACY_LZ4_BLOCK_SIZE_BYTES: Record<number, number> = {
  0: 64 * 1024,
  4: 1024 * 1024,
  6: 4 * 1024 * 1024,
};

@Injectable({
  providedIn: "root",
})
export class CompressionChartBuilderService {
  readonly infoTooltip =
    "Measuring the compression ratio and speed while compressing and decompressing the dickens.txt of the Silesia corpus (10 MB uncompressed) using various algorithms, compressions levels and other extra arguments.";

  getDetailsModes(): DetailsCompressionMode[] {
    return detailsCompressionModes;
  }

  getCompareOptions(
    benchmarkMeta: CompressionBenchmarkMeta[] | undefined,
  ): CompareCompressionOption[] {
    const dataSet = benchmarkMeta?.find(
      (benchmark) => benchmark.benchmark_id === "compression_text:ratio",
    );
    const options: CompressionConfig[] = [];

    dataSet?.configs?.forEach((config) => {
      const temp: CompressionConfig = { ...config.config };
      delete temp.compression_level;

      const found = options.find((item) => this.matchesConfig(temp, item));

      if (!found) {
        options.push(temp);
      }
    });

    return options
      .sort((a, b) => {
        const algoCompare = (a.algo || "").localeCompare(b.algo || "");
        if (algoCompare !== 0) return algoCompare;

        const extraKeys = new Set<string>();
        for (const key of [...Object.keys(a), ...Object.keys(b)]) {
          if (key !== "algo" && key !== "cores") extraKeys.add(key);
        }
        for (const key of [...extraKeys].sort()) {
          const aValue = String(a[key] ?? "");
          const bValue = String(b[key] ?? "");
          const compareValues = aValue.localeCompare(bValue, undefined, {
            numeric: true,
          });
          if (compareValues !== 0) return compareValues;
        }

        if (a.cores === "single" && b.cores !== "single") return -1;
        if (a.cores !== "single" && b.cores === "single") return 1;
        return (a.cores || "").localeCompare(b.cores || "");
      })
      .map((item) => ({
        options: item,
        name: Object.keys(item)
          .map(
            (key) =>
              `${key.replace(/_/g, " ")}: ${this.formatConfigValue(key, item[key])}`,
          )
          .join(", "),
      }));
  }

  buildDetailsChart(params: {
    benchmarksByCategory: CompressionBenchmarkGroup[];
    mode: DetailsCompressionMode;
    baseOptions: CompressionChartOptions;
    coresMode?: "single" | "multi";
  }): CompressionDetailsChartResult | undefined {
    const {
      benchmarksByCategory,
      mode,
      baseOptions,
      coresMode = "single",
    } = params;
    const matchesCores = (item: { config: CompressionConfig }) =>
      item.config.cores === coresMode ||
      (!item.config.cores && coresMode === "single");

    let ratioScores =
      benchmarksByCategory?.find(
        (benchmark) => benchmark.benchmark_id === "compression_text:ratio",
      )?.benchmarks || [];

    if (!ratioScores.length) {
      return undefined;
    }

    let compressScores =
      benchmarksByCategory?.find(
        (benchmark) => benchmark.benchmark_id === "compression_text:compress",
      )?.benchmarks || [];
    let decompressScores =
      benchmarksByCategory?.find(
        (benchmark) => benchmark.benchmark_id === "compression_text:decompress",
      )?.benchmarks || [];

    ratioScores = ratioScores.filter(matchesCores);
    compressScores = compressScores.filter(matchesCores);
    decompressScores = decompressScores.filter(matchesCores);

    const data: CompressionDetailsChartData = {
      labels: [],
      datasets: [],
    };

    const algoColorIndexes = new Map<string, number>();
    ratioScores.forEach((item) => {
      if (!algoColorIndexes.has(item.config.algo)) {
        algoColorIndexes.set(
          item.config.algo,
          algoColorIndexes.size % radarDatasetColors.length,
        );
      }
    });

    const seriesMap = new Map<
      string,
      {
        config: CompressionConfig;
        label: string;
        data: CompressionDataPoint[];
      }
    >();

    ratioScores.forEach((item) => {
      const seriesKey = this.getDetailsSeriesKey(item.config);
      const found = seriesMap.get(seriesKey);

      const entry: CompressionDataPoint = {
        config: item.config,
        ratio: this.roundRatio(item.score),
        algo: item.config.algo,
        compression_level: item.config.compression_level,
        compression_level_label: this.getCompressionLevelLabel(item.config),
        compression_level_sort_value: this.getCompressionLevelSortValue(
          item.config,
        ),
        tooltip: this.buildDetailsConfigTooltip(item.config),
      };

      if (!found) {
        seriesMap.set(seriesKey, {
          data: [entry],
          config: item.config,
          label: this.buildDetailsSeriesLabel(item.config),
        });
      } else {
        found.data.push(entry);
      }
    });

    data.datasets = [...seriesMap.values()]
      .sort((left, right) =>
        this.compareDetailsSeries(
          left.config,
          right.config,
          algoColorIndexes,
        ),
      )
      .map((series) => {
        const colorIndex = algoColorIndexes.get(series.config.algo) ?? 0;
        const colors = radarDatasetColors[colorIndex];

        return {
          data: series.data,
          label: series.label,
          spanGaps: true,
          config: series.config,
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
        };
      });

    data.datasets.forEach((dataset) => {
      dataset.data.forEach((item) => {
        const compressItem = compressScores.find((dataItem) =>
          this.matchesConfig(item.config, dataItem.config),
        );
        const decompressItem = decompressScores.find((dataItem) =>
          this.matchesConfig(item.config, dataItem.config),
        );
        if (compressItem) {
          item.compress = compressItem.score;
        }
        if (decompressItem) {
          item.decompress = decompressItem.score;
        }
        if (item.ratio !== 0) {
          if (compressItem) {
            item.ratio_compress = this.roundMetric(compressItem.score / item.ratio);
          }
          if (decompressItem) {
            item.ratio_decompress = this.roundMetric(
              decompressItem.score / item.ratio,
            );
          }
        }
      });
    });

    const options = cloneChartOptions(baseOptions ?? {});
    this.configureDetailsData(data, mode, options);

    return { data, options };
  }

  buildCompareCharts(params: {
    servers: CompressionServer[];
    selectedOption: CompareCompressionOption | undefined;
    compressOptionsBase: CompressionChartOptions;
    decompressOptionsBase: CompressionChartOptions;
  }): CompressionCompareChartResult | undefined {
    const selectedConfig = params.selectedOption?.options;
    const selectedName = params.selectedOption?.name;

    if (!selectedConfig) {
      return undefined;
    }

    const allMatchedItems: { config: CompressionConfig; score: number }[] = [];
    params.servers.forEach((server) => {
      server.benchmark_scores
        .filter(
          (b) =>
            b.benchmark_id === "compression_text:ratio" &&
            this.matchesConfig(selectedConfig, b.config),
        )
        .forEach((b) =>
          allMatchedItems.push({ config: b.config, score: b.score }),
        );
    });

    const hasCompressionLevel = allMatchedItems.some(
      (item) => item.config.compression_level != null,
    );
    const chartType: CompressionCompareChartType = hasCompressionLevel
      ? "line"
      : "bar";

    const labels: (number | string)[] = [];
    let barLabel: string | undefined;
    if (hasCompressionLevel) {
      allMatchedItems.forEach((item) => {
        const level = item.config.compression_level;
        if (level != null && labels.indexOf(level) === -1) {
          labels.push(level);
        }
      });
      (labels as number[]).sort((a, b) => a - b);
    } else {
      barLabel = "";
      labels.push(barLabel);
    }

    const chartData: CompressionCompareChartData = {
      labels: [...labels],
      datasets: params.servers.map((server, index) => ({
        data: [],
        label: server.display_name,
        spanGaps: true,
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
      })),
    };

    params.servers.forEach((server, i) => {
      if (hasCompressionLevel) {
        (labels as number[]).forEach((level) => {
          const item = server.benchmark_scores.find(
            (b) =>
              b.benchmark_id === "compression_text:ratio" &&
              this.matchesConfig(selectedConfig, b.config) &&
              b.config.compression_level === level,
          );

          if (item) {
            chartData.datasets[i].data.push(
              this.buildCompareDataPoint(item, server, selectedConfig),
            );
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      } else {
        const item = server.benchmark_scores.find(
          (b) =>
            b.benchmark_id === "compression_text:ratio" &&
            this.matchesConfig(selectedConfig, b.config),
        );

        if (item) {
          chartData.datasets[i].data.push(
            this.buildCompareDataPoint(item, server, selectedConfig, barLabel),
          );
        } else {
          chartData.datasets[i].data.push(null);
        }
      }
    });

    const compressOptions = cloneChartOptions(params.compressOptionsBase ?? {});
    const decompressOptions = cloneChartOptions(
      params.decompressOptionsBase ?? {},
    );

    this.setCompareTooltipTitle(
      compressOptions,
      selectedName ?? "",
      hasCompressionLevel,
    );
    this.setCompareTooltipTitle(
      decompressOptions,
      selectedName ?? "",
      hasCompressionLevel,
    );

    if (!hasCompressionLevel) {
      this.configureBarChartOptions(compressOptions);
      this.configureBarChartOptions(decompressOptions);
    }

    return {
      compressData: {
        labels: chartData.labels,
        datasets: chartData.datasets.map((dataset) => ({
          ...dataset,
          data: [...dataset.data],
        })),
      },
      decompressData: {
        labels: chartData.labels,
        datasets: chartData.datasets.map((dataset) => ({
          ...dataset,
          data: [...dataset.data],
        })),
      },
      compressOptions,
      decompressOptions,
      chartType,
    };
  }

  private buildCompareDataPoint(
    ratioItem: { score: number; config: CompressionConfig },
    server: CompressionServer,
    selectedConfig: CompressionConfig,
    barLabel?: string,
  ): CompressionDataPoint {
    const compressItem = server.benchmark_scores.find(
      (b) =>
        b.benchmark_id === "compression_text:compress" &&
        this.matchesConfig(ratioItem.config, b.config),
    );
    const decompressItem = server.benchmark_scores.find(
      (b) =>
        b.benchmark_id === "compression_text:decompress" &&
        this.matchesConfig(ratioItem.config, b.config),
    );

    return {
      config: ratioItem.config,
      ratio: this.roundRatio(ratioItem.score),
      algo: ratioItem.config.algo,
      compression_level: ratioItem.config.compression_level,
      tooltip: "ratio: " + this.roundRatio(ratioItem.score) + "%",
      compress: compressItem?.score,
      decompress: decompressItem?.score,
      barLabel,
    };
  }

  private configureBarChartOptions(
    options: CompressionMutableChartOptions,
  ): void {
    const scales = options.scales as
      | { x?: { title?: { display?: boolean }; ticks?: { display?: boolean } } }
      | undefined;
    if (scales?.x?.title) {
      scales.x.title.display = false;
    }
    if (scales?.x?.ticks) {
      scales.x.ticks.display = false;
    }

    const parsing = options.parsing;
    if (parsing) {
      parsing.xAxisKey = "barLabel";
    }
  }

  private configureDetailsData(
    data: CompressionDetailsChartData,
    mode: DetailsCompressionMode,
    options: CompressionMutableChartOptions,
  ): void {
    switch (mode.key) {
      case "compress":
      case "decompress":
      case "ratio":
      case "ratio_compress":
      case "ratio_decompress": {
        data.labels = this.collectCompressionLevelLabels(data);
        options.parsing = {
          yAxisKey: mode.key,
          xAxisKey: "compression_level_label",
        };
        this.setAxisTitles(
          options,
          "Compression Level",
          mode.key === "ratio" ? "Percentage" : "byte/s",
        );
        break;
      }
    }
  }

  private collectCompressionLevelLabels(
    data: CompressionDetailsChartData,
  ): Array<number | string> {
    const labels: number[] = [];
    let hasNotAvailableLevel = false;

    data.datasets.forEach((dataset) => {
      dataset.data = dataset.data.sort(
        (a, b) =>
          (a.compression_level_sort_value ?? Number.NEGATIVE_INFINITY) -
          (b.compression_level_sort_value ?? Number.NEGATIVE_INFINITY),
      );
      dataset.data.forEach((item) => {
        if (item.compression_level == null) {
          hasNotAvailableLevel = true;
        } else if (labels.indexOf(item.compression_level) === -1) {
          labels.push(item.compression_level);
        }
      });
    });

    return [
      ...(hasNotAvailableLevel ? [COMPRESSION_LEVEL_NOT_AVAILABLE_LABEL] : []),
      ...labels.sort((a, b) => a - b).map((value) => String(value)),
    ];
  }

  private buildDetailsConfigTooltip(config: CompressionConfig): string {
    return Object.keys(config)
      .filter((key) => key !== "algo")
      .filter((key) => config[key] != null)
      .map(
        (key) =>
          `${key.replace(/_/g, " ")}: ${this.formatDetailsConfigValue(
            config,
            key,
            config[key],
          )}`,
      )
      .join(", ");
  }

  private buildDetailsSeriesLabel(config: CompressionConfig): string {
    const details = this.getDetailsSeriesConfigKeys(config)
      .map(
        (key) =>
          `${key}: ${this.formatDetailsConfigValue(config, key, config[key])}`,
      )
      .join(", ");

    return details ? `${config.algo} (${details})` : config.algo;
  }

  private getDetailsSeriesKey(config: CompressionConfig): string {
    const suffix = this.getDetailsSeriesConfigKeys(config)
      .map(
        (key) => `${key}:${this.getDetailsSeriesComparableValue(config, key)}`,
      )
      .join("|");

    return suffix ? `${config.algo}|${suffix}` : config.algo;
  }

  private getDetailsSeriesConfigKeys(config: CompressionConfig): string[] {
    return Object.keys(config)
      .filter((key) => !DETAILS_SERIES_IGNORED_KEYS.has(key))
      .filter((key) => config[key] != null)
      .sort();
  }

  private getDetailsSeriesComparableValue(
    config: CompressionConfig,
    key: string,
  ): number | string {
    const value = config[key];

    if (key === "block_size" && typeof value === "number") {
      return this.normalizeBlockSizeForDisplay(config, value);
    }

    return String(value ?? "");
  }

  private compareDetailsSeries(
    left: CompressionConfig,
    right: CompressionConfig,
    algoColorIndexes: Map<string, number>,
  ): number {
    const leftColorIndex = algoColorIndexes.get(left.algo) ?? Number.MAX_SAFE_INTEGER;
    const rightColorIndex =
      algoColorIndexes.get(right.algo) ?? Number.MAX_SAFE_INTEGER;

    if (leftColorIndex !== rightColorIndex) {
      return leftColorIndex - rightColorIndex;
    }

    const keys = [...new Set([
      ...this.getDetailsSeriesConfigKeys(left),
      ...this.getDetailsSeriesConfigKeys(right),
    ])].sort();

    for (const key of keys) {
      const compare = this.compareDetailsSeriesConfigValue(left, right, key);
      if (compare !== 0) {
        return compare;
      }
    }

    return 0;
  }

  private compareDetailsSeriesConfigValue(
    left: CompressionConfig,
    right: CompressionConfig,
    key: string,
  ): number {
    const leftValue = left[key];
    const rightValue = right[key];

    if (key === "block_size") {
      const normalizedLeft =
        typeof leftValue === "number"
          ? this.normalizeBlockSizeForDisplay(left, leftValue)
          : undefined;
      const normalizedRight =
        typeof rightValue === "number"
          ? this.normalizeBlockSizeForDisplay(right, rightValue)
          : undefined;

      if (normalizedLeft == null && normalizedRight == null) {
        return 0;
      }
      if (normalizedLeft == null) {
        return -1;
      }
      if (normalizedRight == null) {
        return 1;
      }

      return normalizedLeft - normalizedRight;
    }

    return String(leftValue ?? "").localeCompare(String(rightValue ?? ""), undefined, {
      numeric: true,
    });
  }

  private getCompressionLevelLabel(config: CompressionConfig): string {
    return config.compression_level == null
      ? COMPRESSION_LEVEL_NOT_AVAILABLE_LABEL
      : String(config.compression_level);
  }

  private getCompressionLevelSortValue(config: CompressionConfig): number {
    return config.compression_level ?? Number.NEGATIVE_INFINITY;
  }

  private formatDetailsConfigValue(
    config: CompressionConfig,
    key: string,
    value: unknown,
  ): string {
    if (key === "block_size" && typeof value === "number") {
      return formatBytes(this.normalizeBlockSizeForDisplay(config, value));
    }

    return String(value);
  }

  private normalizeBlockSizeForDisplay(
    config: CompressionConfig,
    value: number,
  ): number {
    if (config.algo.toLowerCase() !== "lz4") {
      return value;
    }

    return LEGACY_LZ4_BLOCK_SIZE_BYTES[value] ?? value;
  }

  private formatConfigValue(key: string, value: unknown): string {
    if (key === "block_size" && typeof value === "number") {
      return formatBytes(value);
    }
    return String(value);
  }

  private roundRatio(value: number): number {
    return Math.floor(value * 100) / 100;
  }

  private roundMetric(value: number): number {
    return Math.floor(value * 100) / 100;
  }

  private matchesConfig(
    source: CompressionConfig,
    target: CompressionConfig,
  ): boolean {
    return Object.entries(source).every(
      ([key, value]) => target[key] === value,
    );
  }

  private setAxisTitles(
    options: CompressionMutableChartOptions,
    xTitle: string,
    yTitle: string,
  ): void {
    const scales = options.scales as
      | {
          x?: { title?: { text?: string } };
          y?: { title?: { text?: string } };
        }
      | undefined;

    if (scales?.x?.title) {
      scales.x.title.text = xTitle;
    }

    if (scales?.y?.title) {
      scales.y.title.text = yTitle;
    }
  }

  private setCompareTooltipTitle(
    options: CompressionMutableChartOptions,
    selectedName: string,
    hasCompressionLevel: boolean,
  ): void {
    const callbacks = options.plugins?.tooltip?.callbacks;

    if (!callbacks) {
      return;
    }

    callbacks.title = function (
      this: TooltipModel<"line" | "bar">,
      tooltipItems: TooltipItem<"line" | "bar">[],
    ) {
      if (hasCompressionLevel) {
        return (
          "Compression level: " +
          tooltipItems[0].label +
          " (" +
          selectedName +
          ")"
        );
      }
      return selectedName;
    };
  }
}
