import { Injectable } from "@angular/core";
import { radarChartOptions } from "../../../pages/server-details/chartOptions";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import { formatNumberWithCommas } from "../shared/server-compare-table.utils";
import {
  GeekbenchBenchmarkGroup,
  GeekbenchBenchmarkMeta,
  GeekbenchCompareChartsResult,
  GeekbenchCompareServer,
  GeekbenchDetailsChartsResult,
  GeekbenchRadarChartData,
  GeekbenchRadarChartOptions,
} from "./geekbench-radar-chart.types";

@Injectable({
  providedIn: "root",
})
export class GeekbenchRadarChartBuilderService {
  private readonly detailsDatasetColors = {
    single: radarDatasetColors[1],
    multi: radarDatasetColors[0],
  };

  buildDetailsCharts(params: {
    benchmarksByCategory: GeekbenchBenchmarkGroup[];
    benchmarkMeta: GeekbenchBenchmarkMeta[];
  }): GeekbenchDetailsChartsResult | undefined {
    const geekbenchGroups = params.benchmarksByCategory.filter((group) =>
      group.benchmark_id.includes("geekbench"),
    );
    const geekbenchMeta = params.benchmarkMeta.filter((benchmark) =>
      benchmark.benchmark_id.includes("geekbench"),
    );
    const infoTooltipHtml = this.buildInfoTooltipHtml(geekbenchMeta);

    if (!geekbenchGroups.length) {
      return {
        options: this.createDetailsOptions(),
        singleScore: "0",
        multiScore: "0",
        infoTooltipHtml,
      };
    }

    const geekbenchScoreGroup = geekbenchGroups.find(
      (group) => group.benchmark_id === "geekbench:score",
    );
    const singleScore = formatNumberWithCommas(
      this.findScoreForCore(geekbenchScoreGroup, "single") ?? 0,
    );
    const multiScore = formatNumberWithCommas(
      this.findScoreForCore(geekbenchScoreGroup, "multi") ?? 0,
    );

    const benchmarkIds = geekbenchGroups
      .filter((group) => group.benchmark_id !== "geekbench:score")
      .map((group) => group.benchmark_id);
    const coreLabels = this.collectCoreLabels(geekbenchGroups);
    const singleCoreLabel = this.pickCoreLabel(coreLabels, "single");
    const multiCoreLabel = this.pickCoreLabel(coreLabels, "multi");

    if (!benchmarkIds.length || !singleCoreLabel || !multiCoreLabel) {
      return {
        options: this.createDetailsOptions(),
        singleScore,
        multiScore,
        infoTooltipHtml,
      };
    }

    const labels = this.createChartLabels(benchmarkIds, params.benchmarkMeta);

    return {
      singleData: this.createDetailsData(
        geekbenchGroups,
        benchmarkIds,
        labels,
        singleCoreLabel,
      ),
      multiData: this.createDetailsData(
        geekbenchGroups,
        benchmarkIds,
        labels,
        multiCoreLabel,
      ),
      options: this.createDetailsOptions(),
      singleScore,
      multiScore,
      infoTooltipHtml,
    };
  }

  buildCompareCharts(params: {
    servers: GeekbenchCompareServer[];
    benchmarkMeta: GeekbenchBenchmarkMeta[];
  }): GeekbenchCompareChartsResult | undefined {
    const geekbenchScores = params.benchmarkMeta
      .filter(
        (benchmark) =>
          benchmark.benchmark_id.includes("geekbench") &&
          benchmark.benchmark_id !== "geekbench:score",
      )
      .sort((left, right) => left.name.localeCompare(right.name));
    const geekbenchTotalScore = params.benchmarkMeta.find(
      (benchmark) => benchmark.benchmark_id === "geekbench:score",
    );
    const orderedGeekbenchScores = geekbenchTotalScore
      ? [geekbenchTotalScore, ...geekbenchScores]
      : geekbenchScores;

    if (!orderedGeekbenchScores.length) {
      return undefined;
    }

    const benchmarkIds = orderedGeekbenchScores.map(
      (benchmark) => benchmark.benchmark_id,
    );
    const labels = this.createChartLabels(benchmarkIds, params.benchmarkMeta);

    return {
      singleData: this.createCompareData(
        params.servers,
        benchmarkIds,
        labels,
        "single",
      ),
      multiData: this.createCompareData(
        params.servers,
        benchmarkIds,
        labels,
        "multi",
      ),
      singleOptions: this.createCompareOptions("Single-core performance"),
      multiOptions: this.createCompareOptions("Multi-core performance"),
    };
  }

  private createDetailsOptions(): GeekbenchRadarChartOptions {
    return cloneChartOptions(radarChartOptions ?? {});
  }

  private createCompareOptions(title: string): GeekbenchRadarChartOptions {
    const baseOptions = cloneChartOptions(radarChartOptions ?? {});

    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...(typeof baseOptions.plugins?.legend === "object"
            ? baseOptions.plugins.legend
            : {}),
          display: true,
        },
        title: {
          ...(typeof baseOptions.plugins?.title === "object"
            ? baseOptions.plugins.title
            : {}),
          display: true,
          text: title,
          color: "#FFF",
        },
      },
    };
  }

  private buildInfoTooltipHtml(
    benchmarkMeta: GeekbenchBenchmarkMeta[],
  ): string | null {
    if (!benchmarkMeta.length) {
      return null;
    }

    return [
      "<div> The following benchmark scenarios were run using Geekbench 6: </div>",
      "<ul>",
      ...benchmarkMeta
        .slice()
        .sort((left, right) => {
          if (left.benchmark_id === "geekbench:score") {
            return -1;
          }
          if (right.benchmark_id === "geekbench:score") {
            return 1;
          }
          return left.name.localeCompare(right.name);
        })
        .map((benchmark) => {
          const description =
            benchmark.description?.replace(
              "The score is calibrated against a baseline score of 2,500 (Dell Precision 3460 with a Core i7-12700 processor) as per the Geekbench 6 Benchmark Internals.",
              "",
            ) || "";
          return `<li> - ${benchmark.name.replace("Geekbench:", "")}: ${description} </li>`;
        }),
      "</ul>",
    ].join(" ");
  }

  private createDetailsData(
    groups: GeekbenchBenchmarkGroup[],
    benchmarkIds: string[],
    labels: string[],
    coreLabel: string,
  ): GeekbenchRadarChartData {
    const datasetColors = this.getDetailsDatasetColors(coreLabel);

    return {
      labels,
      datasets: [
        {
          data: benchmarkIds.map((benchmarkId) => {
            const score = groups
              .find((group) => group.benchmark_id === benchmarkId)
              ?.benchmarks.find(
                (benchmark) => benchmark.config.cores === coreLabel,
              );

            return score
              ? { value: score.score, tooltip: score.note || undefined }
              : { value: 0 };
          }),
          label: coreLabel,
          borderColor: datasetColors.borderColor,
          backgroundColor: datasetColors.backgroundColor,
        },
      ],
    };
  }

  private getDetailsDatasetColors(coreLabel: string) {
    return coreLabel.toLowerCase().includes("single")
      ? this.detailsDatasetColors.single
      : this.detailsDatasetColors.multi;
  }

  private createCompareData(
    servers: GeekbenchCompareServer[],
    benchmarkIds: string[],
    labels: string[],
    coreKind: "single" | "multi",
  ): GeekbenchRadarChartData {
    return {
      labels,
      datasets: servers.map((server, index) => ({
        data: benchmarkIds.map((benchmarkId) => {
          const score = server.benchmark_scores.find(
            (item) =>
              item.benchmark_id === benchmarkId &&
              (item.config.cores || "").toLowerCase().includes(coreKind),
          );

          return {
            value: score?.score ?? null,
            tooltip: score?.note || "",
          };
        }),
        label: server.display_name,
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].backgroundColor,
      })),
    };
  }

  private createChartLabels(
    benchmarkIds: string[],
    benchmarkMeta: GeekbenchBenchmarkMeta[],
  ): string[] {
    return benchmarkIds.map((benchmarkId) =>
      (
        benchmarkMeta.find(
          (benchmark) => benchmark.benchmark_id === benchmarkId,
        )?.name || benchmarkId
      )
        .replace("geekbench:", "")
        .replace("Geekbench: ", ""),
    );
  }

  private collectCoreLabels(groups: GeekbenchBenchmarkGroup[]): string[] {
    return Array.from(
      new Set(
        groups.flatMap((group) =>
          group.benchmarks
            .map((benchmark) => benchmark.config.cores)
            .filter((core): core is string => typeof core === "string"),
        ),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }

  private pickCoreLabel(
    coreLabels: string[],
    kind: "single" | "multi",
  ): string | undefined {
    return (
      coreLabels.find((core) => core.toLowerCase().includes(kind)) ||
      (kind === "multi" ? coreLabels[0] : coreLabels[1]) ||
      coreLabels[0]
    );
  }

  private findScoreForCore(
    group: GeekbenchBenchmarkGroup | undefined,
    kind: "single" | "multi",
  ): number | undefined {
    return group?.benchmarks.find((benchmark) =>
      (benchmark.config.cores || "").toLowerCase().includes(kind),
    )?.score;
  }
}
