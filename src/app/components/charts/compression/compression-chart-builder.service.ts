import { Injectable } from "@angular/core";
import { TooltipItem, TooltipModel } from "chart.js";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import {
  CompareCompressionOption,
  CompressionBenchmarkGroup,
  CompressionBenchmarkMeta,
  CompressionChartOptions,
  CompressionCompareChartData,
  CompressionCompareChartResult,
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
          .map((key) => `${key.replace(/_/g, " ")}: ${item[key]}`)
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

    ratioScores.forEach((item) => {
      const found = data.datasets.find(
        (dataset) => dataset.config.algo === item.config.algo,
      );

      const entry: CompressionDataPoint = {
        config: item.config,
        ratio: this.roundRatio(item.score),
        algo: item.config.algo,
        compression_level: item.config.compression_level,
        tooltip: this.buildConfigTooltip(item.config, (key) => key !== "algo"),
      };

      if (!found) {
        const colors =
          radarDatasetColors[data.datasets.length % radarDatasetColors.length];
        data.datasets.push({
          data: [entry],
          label: item.config.algo,
          spanGaps: true,
          config: item.config,
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
        });
      } else {
        found.data.push(entry);
      }
    });

    data.datasets.forEach((dataset) => {
      dataset.data.forEach((item) => {
        const compressItem = compressScores.find((dataItem) =>
          this.matchesConfig(item.config, dataItem.config),
        );
        const decompressItem = decompressScores.find((dataItem) =>
          this.matchesConfig(item.config, dataItem.config),
        );
        if (compressItem && decompressItem) {
          item.compress = compressItem.score;
          item.decompress = decompressItem.score;
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

    const chartData: CompressionCompareChartData = {
      labels: [],
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

    const labels: number[] = [];

    params.servers.forEach((server) => {
      const items = server.benchmark_scores.filter(
        (benchmark) =>
          benchmark.benchmark_id === "compression_text:ratio" &&
          this.matchesConfig(selectedConfig, benchmark.config),
      );

      items.forEach((item) => {
        if (item.score && labels.indexOf(item.score) === -1) {
          labels.push(item.score);
        }
      });
    });

    chartData.labels = labels
      .sort((a, b) => a - b)
      .map((label) => this.roundRatio(label));

    params.servers.forEach((server, i) => {
      labels.forEach((size: number) => {
        const item = server.benchmark_scores.find(
          (benchmark) =>
            benchmark.benchmark_id === "compression_text:ratio" &&
            this.matchesConfig(selectedConfig, benchmark.config) &&
            benchmark.score === size,
        );

        if (item) {
          const compressItem = server.benchmark_scores.find((benchmark) => {
            return (
              benchmark.benchmark_id === "compression_text:compress" &&
              this.matchesConfig(item.config, benchmark.config)
            );
          });
          const decompressItem = server.benchmark_scores.find((benchmark) => {
            return (
              benchmark.benchmark_id === "compression_text:decompress" &&
              this.matchesConfig(item.config, benchmark.config)
            );
          });

          chartData.datasets[i].data.push({
            config: item.config,
            ratio: this.roundRatio(item.score),
            algo: item.config.algo,
            compression_level: item.config.compression_level,
            tooltip: this.buildConfigTooltip(
              item.config,
              (key) => key === "compression_level",
            ),
            compress: compressItem?.score,
            decompress: decompressItem?.score,
          });
        } else {
          chartData.datasets[i].data.push(null);
        }
      });
    });

    const compressOptions = cloneChartOptions(params.compressOptionsBase ?? {});
    const decompressOptions = cloneChartOptions(
      params.decompressOptionsBase ?? {},
    );

    this.setCompareTooltipTitle(compressOptions, selectedName ?? "");
    this.setCompareTooltipTitle(decompressOptions, selectedName ?? "");

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
    };
  }

  private configureDetailsData(
    data: CompressionDetailsChartData,
    mode: DetailsCompressionMode,
    options: CompressionMutableChartOptions,
  ): void {
    switch (mode.key) {
      case "compress":
      case "decompress":
      case "ratio": {
        const labels: number[] = [];
        data.datasets.forEach((dataset) => {
          dataset.data = dataset.data.sort(
            (a, b) => (a.compression_level ?? 0) - (b.compression_level ?? 0),
          );
          dataset.data.forEach((item) => {
            if (
              (item.compression_level || item.compression_level === 0) &&
              labels.indexOf(item.compression_level) === -1
            ) {
              labels.push(item.compression_level);
            }
          });
        });

        data.labels = labels.sort((a, b) => a - b);
        options.parsing = {
          yAxisKey: mode.key,
          xAxisKey: "compression_level",
        };
        this.setAxisTitles(
          options,
          "Compression Level",
          mode.key === "ratio" ? "Percentage" : "byte/s",
        );
        break;
      }
      case "ratio_compress":
      case "ratio_decompress": {
        const labels: number[] = [];
        data.datasets.forEach((dataset) => {
          dataset.data.forEach((item) => {
            if (item.ratio && labels.indexOf(item.ratio) === -1) {
              labels.push(item.ratio);
            }
          });
          dataset.data = dataset.data.sort((a, b) => a.ratio - b.ratio);
        });

        data.labels = labels.sort((a, b) => a - b);
        options.parsing = {
          yAxisKey: mode.key === "ratio_compress" ? "compress" : "decompress",
          xAxisKey: "ratio",
        };
        this.setAxisTitles(options, "Compression Ratio", "byte/s");
        break;
      }
    }
  }

  private buildConfigTooltip(
    config: CompressionConfig,
    includeKey: (key: string) => boolean,
  ): string {
    return Object.keys(config)
      .filter(includeKey)
      .map((key) => `${key.replace(/_/g, " ")}: ${config[key]}`)
      .join(", ");
  }

  private roundRatio(value: number): number {
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
  ): void {
    const callbacks = options.plugins?.tooltip?.callbacks;

    if (!callbacks) {
      return;
    }

    callbacks.title = function (
      this: TooltipModel<"line">,
      tooltipItems: TooltipItem<"line">[],
    ) {
      return (
        tooltipItems[0].label + "% compression ratio (" + selectedName + ")"
      );
    };
  }
}
