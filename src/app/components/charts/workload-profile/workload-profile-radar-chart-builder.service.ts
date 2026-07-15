import { Injectable } from "@angular/core";
import { TooltipItem } from "chart.js";
import { radarChartOptions } from "../../../pages/server-details/chartOptions";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import {
  wrapTextAtWordBoundaries,
  CHART_TOOLTIP_MAX_LINE_LENGTH,
} from "../shared/chart-tooltip.utils";
import {
  formatWorkloadProfileLabel,
  resolveWorkloadProfileBenchmarksWithData,
} from "./workload-profile.utils";
import {
  WorkloadProfileBenchmarkMeta,
  WorkloadProfileChartsResult,
  WorkloadProfileCompareServer,
  WorkloadProfileDetailsServer,
  WorkloadProfileRadarChartData,
  WorkloadProfileRadarChartOptions,
  WorkloadProfileRadarPoint,
} from "./workload-profile-radar-chart.types";

@Injectable({
  providedIn: "root",
})
export class WorkloadProfileRadarChartBuilderService {
  buildDetailsCharts(params: {
    serverDetails: WorkloadProfileDetailsServer;
    benchmarkMeta: WorkloadProfileBenchmarkMeta[];
  }): WorkloadProfileChartsResult | undefined {
    const workloadMeta = resolveWorkloadProfileBenchmarksWithData({
      benchmarkMeta: params.benchmarkMeta,
      layout: "details",
      serverDetails: params.serverDetails,
    });

    if (!workloadMeta.length) {
      return undefined;
    }

    const benchmarkIds = workloadMeta.map(
      (benchmark) => benchmark.benchmark_id,
    );
    const labels = this.createChartLabels(workloadMeta);

    return {
      benchmarkIds,
      chartData: this.createDetailsData(
        params.serverDetails,
        benchmarkIds,
        labels,
      ),
      options: this.createDetailsOptions(workloadMeta),
    };
  }

  buildCompareCharts(params: {
    servers: WorkloadProfileCompareServer[];
    benchmarkMeta: WorkloadProfileBenchmarkMeta[];
  }): WorkloadProfileChartsResult | undefined {
    const workloadMeta = resolveWorkloadProfileBenchmarksWithData({
      benchmarkMeta: params.benchmarkMeta,
      layout: "compare",
      servers: params.servers,
    });

    if (!workloadMeta.length) {
      return undefined;
    }

    const benchmarkIds = workloadMeta.map(
      (benchmark) => benchmark.benchmark_id,
    );
    const labels = this.createChartLabels(workloadMeta);

    return {
      benchmarkIds,
      chartData: this.createCompareData(params.servers, benchmarkIds, labels),
      options: this.createCompareOptions(workloadMeta),
    };
  }

  private createDetailsOptions(
    workloadMeta: WorkloadProfileBenchmarkMeta[],
  ): WorkloadProfileRadarChartOptions {
    return this.withWorkloadRadarLayout(
      cloneChartOptions(radarChartOptions ?? {}),
      workloadMeta,
    );
  }

  private createCompareOptions(
    workloadMeta: WorkloadProfileBenchmarkMeta[],
  ): WorkloadProfileRadarChartOptions {
    const baseOptions = cloneChartOptions(radarChartOptions ?? {});

    return this.withWorkloadRadarLayout(
      {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...(typeof baseOptions.plugins?.legend === "object"
              ? baseOptions.plugins.legend
              : {}),
            display: true,
          },
        },
      },
      workloadMeta,
    );
  }

  private withWorkloadRadarLayout(
    options: WorkloadProfileRadarChartOptions,
    workloadMeta: WorkloadProfileBenchmarkMeta[],
  ): WorkloadProfileRadarChartOptions {
    const resolvedOptions = options ?? {};
    const baseLayout =
      typeof resolvedOptions.layout === "object" &&
      resolvedOptions.layout !== null
        ? resolvedOptions.layout
        : {};
    const basePlugins =
      typeof resolvedOptions.plugins === "object" &&
      resolvedOptions.plugins !== null
        ? resolvedOptions.plugins
        : {};
    const baseTooltip =
      typeof basePlugins.tooltip === "object" && basePlugins.tooltip !== null
        ? basePlugins.tooltip
        : {};
    const baseCallbacks =
      typeof baseTooltip.callbacks === "object" &&
      baseTooltip.callbacks !== null
        ? baseTooltip.callbacks
        : {};

    return {
      ...resolvedOptions,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        ...baseLayout,
        padding: 0,
      },
      plugins: {
        ...basePlugins,
        tooltip: {
          ...baseTooltip,
          callbacks: {
            ...baseCallbacks,
            title: (items: TooltipItem<"radar">[]) => {
              const index = items[0]?.dataIndex;
              const benchmark = index == null ? undefined : workloadMeta[index];

              return benchmark?.name ?? items[0]?.label ?? "";
            },
            label: (tooltipItem: TooltipItem<"radar">) =>
              this.formatRadarTooltipLabel(
                tooltipItem.raw as WorkloadProfileRadarPoint,
              ),
          },
        },
      },
    };
  }

  private formatRadarTooltipLabel(point: WorkloadProfileRadarPoint): string[] {
    const note = point.tooltip?.trim();
    const value = point.value;
    const lines: string[] = [];

    if (value != null) {
      lines.push(String(value));
    }

    if (note) {
      lines.push(
        ...wrapTextAtWordBoundaries(note, CHART_TOOLTIP_MAX_LINE_LENGTH),
      );
    }

    return lines;
  }

  private createDetailsData(
    serverDetails: WorkloadProfileDetailsServer,
    benchmarkIds: string[],
    labels: string[],
  ): WorkloadProfileRadarChartData {
    const colors = radarDatasetColors[0];

    return {
      labels,
      datasets: [
        {
          data: benchmarkIds.map((benchmarkId) => {
            const score = serverDetails.benchmark_scores?.find(
              (item) => item.benchmark_id === benchmarkId,
            );

            return {
              value: score?.score ?? null,
              tooltip: score?.note || undefined,
            };
          }),
          label: "Workload profiles",
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
        },
      ],
    };
  }

  private createCompareData(
    servers: WorkloadProfileCompareServer[],
    benchmarkIds: string[],
    labels: string[],
  ): WorkloadProfileRadarChartData {
    return {
      labels,
      datasets: servers.map((server, index) => ({
        data: benchmarkIds.map((benchmarkId) => {
          const score = server.benchmark_scores?.find(
            (item) => item.benchmark_id === benchmarkId,
          );

          return {
            value: score?.score ?? null,
            tooltip: score?.note || undefined,
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
    benchmarkMeta: WorkloadProfileBenchmarkMeta[],
  ): string[] {
    return benchmarkMeta.map((benchmark) =>
      formatWorkloadProfileLabel(benchmark.name || benchmark.benchmark_id),
    );
  }
}
