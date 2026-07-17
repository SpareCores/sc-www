import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { BaseChartDirective } from "ng2-charts";
import { ActiveElement, ChartEvent } from "chart.js";
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
  styleUrls: ["./workload-profile-radar-chart.component.scss"],
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

  readonly profileSelected = output<string>();

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

  readonly resolvedChartOptions = computed(() => {
    const options =
      this.chartOptions() ??
      (this.layout() === "details"
        ? this.detailsCharts()?.options
        : this.compareCharts()?.options);

    if (this.layout() !== "details" || !options) {
      return options;
    }

    return {
      ...options,
      onHover: (_event: ChartEvent, elements: ActiveElement[], chart) => {
        chart.canvas.style.cursor = elements.length > 0 ? "pointer" : "default";
      },
      onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
        const index = elements[0]?.index;

        if (index == null) {
          return;
        }

        const benchmarkId = this.detailsCharts()?.benchmarkIds[index];

        if (benchmarkId) {
          this.profileSelected.emit(benchmarkId);
        }
      },
    };
  });

  readonly hasChart = computed(() => !!this.resolvedChartData());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.destroyRef.onDestroy(() => {
        this.chartDirective()?.chart?.destroy();
      });
    }
  }
}
