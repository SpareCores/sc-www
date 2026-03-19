import { Injectable } from "@angular/core";
import {
  ChartFromBenchmarkTemplate,
  ChartFromBenchmarkTemplateOptions,
} from "../../../pages/server-details/chartFromBenchmarks";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import {
  MultiBarBenchmarkGroup,
  MultiBarBenchmarkMeta,
  MultiBarChartData,
  MultiBarScaleValue,
  MultiBarServer,
} from "./benchmark-multi-bar-chart.types";

@Injectable({
  providedIn: "root",
})
export class BenchmarkMultiBarChartBuilderService {
  initializeDetailsTemplate(
    chartTemplate: ChartFromBenchmarkTemplate,
    benchmarkMeta: MultiBarBenchmarkMeta[],
  ): void {
    chartTemplate.options.forEach(
      (option: ChartFromBenchmarkTemplateOptions) => {
        const benchmark = benchmarkMeta.find(
          (b) => b.benchmark_id === option.benchmark_id,
        );
        if (!benchmark) {
          return;
        }

        option.name = benchmark.name;
        option.unit = benchmark.unit;
        option.higher_is_better = benchmark.higher_is_better;
        option.icon = benchmark.higher_is_better
          ? "circle-arrow-up"
          : "circle-arrow-down";
        option.tooltip = benchmark.higher_is_better
          ? "Higher is better"
          : "Lower is better";
        option.title = benchmark.config_fields
          ? ((benchmark.config_fields as Record<string, string | undefined>)[
              option.labelsField
            ] ?? "")
          : "";
        option.XLabel = benchmark.config_fields
          ? ((benchmark.config_fields as Record<string, string | undefined>)[
              option.scaleField
            ] ?? "")
          : "";
        option.YLabel = benchmark.unit;
      },
    );
  }

  initializeCompareTemplate(
    chartTemplate: ChartFromBenchmarkTemplate,
    benchmarkMeta: MultiBarBenchmarkMeta[],
  ): void {
    chartTemplate.options.forEach(
      (option: ChartFromBenchmarkTemplateOptions) => {
        const benchmark = benchmarkMeta.find(
          (b) => b.benchmark_id === option.benchmark_id,
        );
        if (!benchmark) {
          return;
        }

        option.name = benchmark.name;
        option.unit = benchmark.unit;
        option.higher_is_better = benchmark.higher_is_better;
        option.icon = benchmark.higher_is_better
          ? "circle-arrow-up"
          : "circle-arrow-down";
        option.tooltip = benchmark.higher_is_better
          ? "Higher is better"
          : "Lower is better";
        option.title = " ";
        option.XLabel = benchmark.config_fields
          ? ((benchmark.config_fields as Record<string, string | undefined>)[
              option.scaleField
            ] ?? "")
          : "";
        option.YLabel = benchmark.unit;
      },
    );
  }

  syncDetailsChart(
    chartTemplate: ChartFromBenchmarkTemplate,
    benchmarksByCategory: MultiBarBenchmarkGroup[],
  ): void {
    this.applyChartState(
      chartTemplate,
      this.buildDetailsChart(chartTemplate, benchmarksByCategory),
    );
  }

  syncCompareChart(
    chartTemplate: ChartFromBenchmarkTemplate,
    benchmarkMeta: MultiBarBenchmarkMeta[],
    servers: MultiBarServer[],
  ): void {
    this.applyChartState(
      chartTemplate,
      this.buildCompareChart(chartTemplate, benchmarkMeta, servers),
    );
  }

  buildDetailsChart(
    chartTemplate: ChartFromBenchmarkTemplate,
    benchmarksByCategory: MultiBarBenchmarkGroup[],
  ): MultiBarChartData | undefined {
    const chartConf = chartTemplate.options[chartTemplate.selectedOption];
    const labelsField = chartConf.labelsField;
    const scaleField = chartConf.scaleField;
    const dataSet = benchmarksByCategory?.find(
      (x) => x.benchmark_id === chartConf.benchmark_id,
    );

    if (!dataSet?.benchmarks?.length) {
      return undefined;
    }

    const benchmarks = dataSet.benchmarks;

    const labels: MultiBarScaleValue[] = [];
    const scales: MultiBarScaleValue[] = [];
    benchmarks.forEach((item) => {
      const labelValue = item.config[labelsField];
      const scaleValue = item.config[scaleField];

      if (labelValue && labels.indexOf(labelValue) === -1) {
        labels.push(labelValue);
      }

      if (
        (scaleValue || scaleValue === 0) &&
        scales.indexOf(scaleValue) === -1
      ) {
        scales.push(scaleValue);
      }
    });

    this.sortScaleValues(labels);
    this.sortScaleValues(scales);

    return {
      labels: scales,
      datasets: labels.map((label, index: number) => ({
        data: scales.map((size) => {
          const item = benchmarks.find(
            (b) =>
              b.config[labelsField] === label && b.config[scaleField] === size,
          );
          if (!item) {
            return null;
          }
          return {
            data: item.score,
            label: size,
            unit: chartConf.YLabel,
            note: item.note,
          };
        }),
        label: String(label),
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
      })),
    };
  }

  buildCompareChart(
    chartTemplate: ChartFromBenchmarkTemplate,
    benchmarkMeta: MultiBarBenchmarkMeta[],
    servers: MultiBarServer[],
  ): MultiBarChartData | undefined {
    const option: ChartFromBenchmarkTemplateOptions =
      chartTemplate.options[chartTemplate.selectedOption];

    if (
      !chartTemplate.secondaryOptions ||
      chartTemplate.selectedSecondaryOption === undefined
    ) {
      return undefined;
    }

    const secondaryOption =
      chartTemplate.secondaryOptions[chartTemplate.selectedSecondaryOption];
    const dataSet = benchmarkMeta?.find(
      (x) => x.benchmark_id === option.benchmark_id,
    );

    if (!dataSet?.configs?.length) {
      return undefined;
    }

    const scales: MultiBarScaleValue[] = [];
    dataSet.configs
      .filter((x) => x.config[option.labelsField] === secondaryOption.value)
      .forEach((item) => {
        const scaleValue = item.config[option.scaleField];

        if (
          (scaleValue || scaleValue === 0) &&
          scales.indexOf(scaleValue) === -1
        ) {
          scales.push(scaleValue);
        }
      });

    if (!scales.length) {
      return undefined;
    }

    this.sortScaleValues(scales);

    return {
      labels: scales,
      datasets: servers.map((server, index: number) => ({
        data: scales.map((size) => {
          const item = server.benchmark_scores.find(
            (b) =>
              b.benchmark_id === option.benchmark_id &&
              b.config[option.labelsField] === secondaryOption.value &&
              b.config[option.scaleField] === size,
          );
          if (!item) {
            return null;
          }
          return {
            data: item.score,
            label: size,
            unit: option.YLabel,
            note: item.note,
          };
        }),
        label: server.display_name,
        spanGaps: true,
        borderColor: radarDatasetColors[index % 8].borderColor,
        backgroundColor: radarDatasetColors[index % 8].borderColor,
      })),
    };
  }

  private applyChartState(
    chartTemplate: ChartFromBenchmarkTemplate,
    chartData: MultiBarChartData | undefined,
  ): void {
    chartTemplate.chartData = chartData;

    const selectedOption = chartTemplate.options[chartTemplate.selectedOption];
    chartTemplate.chartOptions.scales.y.title.text = selectedOption.YLabel;
    chartTemplate.chartOptions.scales.x.title.text = selectedOption.XLabel;
    chartTemplate.chartOptions.plugins.title.text = selectedOption.title;
  }

  private sortScaleValues(values: MultiBarScaleValue[]): void {
    values.sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a - b;
      }

      const stringA = String(a);
      const stringB = String(b);
      const numericA = Number(stringA);
      const numericB = Number(stringB);
      if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) {
        return numericA - numericB;
      }

      const valueA = parseInt(stringA.replace(/\D/g, ""), 10);
      const valueB = parseInt(stringB.replace(/\D/g, ""), 10);
      if (!Number.isNaN(valueA) && !Number.isNaN(valueB)) {
        return valueA - valueB;
      }

      return stringA.localeCompare(stringB);
    });
  }
}
