import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  viewChild,
} from "@angular/core";
import { BaseChartDirective } from "ng2-charts";
import { WorkloadProfileRadarChartBuilderService } from "./workload-profile-radar-chart-builder.service";
import {
  WorkloadProfileBenchmarkMeta,
  WorkloadProfileCompareServer,
  WorkloadProfileDetailsServer,
  WorkloadProfileRadarChartData,
  WorkloadProfileRadarChartOptions,
} from "./workload-profile-radar-chart.types";

@Component({
  selector: "app-workload-profile-radar-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./workload-profile-radar-chart.component.html",
  styles: [
    `
      :host {
        display: contents;
      }

      .workload-profile-radar-chart__canvas {
        min-height: 0;
        width: 100%;
        max-width: 100%;
        display: flex;
        justify-content: center;
      }

      .workload-profile-radar-chart__canvas--compare {
        height: 460px;
      }

      .workload-profile-radar-chart__canvas--details {
        height: 530px;
        max-height: 530px;
      }

      @media screen and (max-width: 1024px) {
        .workload-profile-radar-chart__canvas--compare {
          width: 100%;
        }
      }

      .workload-profile-radar-chart__canvas-element {
        display: block;
        width: 100% !important;
        max-width: 100%;
        height: 100% !important;
      }
    `,
  ],
})
export class WorkloadProfileRadarChartComponent {
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private builder = inject(WorkloadProfileRadarChartBuilderService);

  chartDirective = viewChild(BaseChartDirective);

  layout = input<"details" | "compare">("compare");
  chartType = input<"radar">("radar");
  benchmarkMeta = input<WorkloadProfileBenchmarkMeta[]>([]);
  servers = input<WorkloadProfileCompareServer[]>([]);
  serverDetails = input<WorkloadProfileDetailsServer | undefined>(undefined);
  chartData = input<WorkloadProfileRadarChartData | undefined>(undefined);
  chartOptions = input<WorkloadProfileRadarChartOptions>(undefined);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly detailsCharts = computed(() => {
    if (this.layout() !== "details") {
      return undefined;
    }

    const serverDetails = this.serverDetails();

    if (!serverDetails) {
      return undefined;
    }

    return this.builder.buildDetailsCharts({
      serverDetails,
      benchmarkMeta: this.benchmarkMeta(),
    });
  });

  readonly compareCharts = computed(() => {
    if (this.layout() !== "compare") {
      return undefined;
    }

    return this.builder.buildCompareCharts({
      servers: this.servers(),
      benchmarkMeta: this.benchmarkMeta(),
    });
  });

  readonly resolvedChartData = computed(
    () =>
      this.chartData() ??
      (this.layout() === "details"
        ? this.detailsCharts()?.chartData
        : this.compareCharts()?.chartData),
  );

  readonly resolvedChartOptions = computed(
    () =>
      this.chartOptions() ??
      (this.layout() === "details"
        ? this.detailsCharts()?.options
        : this.compareCharts()?.options),
  );

  readonly hasChart = computed(() => !!this.resolvedChartData());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.destroyRef.onDestroy(() => {
        this.chartDirective()?.chart?.destroy();
      });
    }
  }
}
