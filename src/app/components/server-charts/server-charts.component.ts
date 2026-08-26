import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  LucideDynamicIcon,
  LucideInfo,
  LucideTriangleAlert,
} from "@lucide/angular";
import { Benchmark } from "../../../../sdk/data-contracts";
import {
  redisChartTemplate,
  staticWebChartTemplate,
} from "../../pages/server-details/chartFromBenchmarks";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";
import { Button } from "../button/button";
import { CompressionChartComponent } from "../charts/compression/compression-chart.component";
import { GeekbenchRadarChartComponent } from "../charts/geekbench/geekbench-radar-chart.component";
import { GeekbenchBenchmarkMeta } from "../charts/geekbench/geekbench-radar-chart.types";
import { BenchmarkLineChartComponent } from "../charts/line/benchmark-line-chart.component";
import {
  LineBenchmarkGroup,
  LineChartDetailsServer,
  PGBENCH_HEAVY_READ_ONLY_ID,
} from "../charts/line/benchmark-line-chart.types";
import { LlmInferenceChartComponent } from "../charts/llm/llm-inference-chart.component";
import { MemoryBenchmarkMeta } from "../charts/memory/memory-chart.types";
import { ServerMemoryChartComponent } from "../charts/memory/server-memory-chart.component";
import { BenchmarkMultiBarChartBuilderService } from "../charts/multi-bar/benchmark-multi-bar-chart-builder.service";
import { BenchmarkMultiBarChartComponent } from "../charts/multi-bar/benchmark-multi-bar-chart.component";
import {
  BenchmarkMultiBarChartItem,
  MultiBarBenchmarkGroup,
} from "../charts/multi-bar/benchmark-multi-bar-chart.types";
import { ChartTooltipService } from "../charts/shared/chart-tooltip.service";
import { getBenchmarkMetaNote } from "../charts/shared/chart-tooltip.utils";
import { WorkloadProfilePanelComponent } from "../charts/workload-profile/workload-profile-panel.component";
import { hasWorkloadProfileChartData } from "../charts/workload-profile/workload-profile.utils";

@Component({
  selector: "sc-server-charts",
  imports: [
    Button,
    LucideDynamicIcon,
    LucideInfo,
    LucideTriangleAlert,
    FormsModule,
    RouterModule,
    BenchmarkIconPipe,
    BenchmarkLineChartComponent,
    CompressionChartComponent,
    GeekbenchRadarChartComponent,
    LlmInferenceChartComponent,
    ServerMemoryChartComponent,
    BenchmarkMultiBarChartComponent,
    WorkloadProfilePanelComponent,
  ],
  templateUrl: "./server-charts.component.html",
  styleUrl: "./server-charts.component.scss",
})
export class ServerChartsComponent implements OnChanges {
  private tooltipService = inject(ChartTooltipService);
  private multiBarBuilder = inject(BenchmarkMultiBarChartBuilderService);

  @ViewChild("tooltipDefault") tooltip!: ElementRef<HTMLElement>;

  @Input() serverDetails: any;
  @Input() benchmarksByCategory: any[] = [];
  @Input() benchmarkMeta!: Benchmark[];
  @Input() showChart: string = "all";
  @Input() isEmbedded: boolean = false;

  multiBarCharts: BenchmarkMultiBarChartItem[] = [
    {
      chart: JSON.parse(JSON.stringify(staticWebChartTemplate)),
    },
    {
      chart: JSON.parse(JSON.stringify(redisChartTemplate)),
    },
  ];

  tooltipContent = "";

  passmarkCPUData: any[] | null = null;
  passmarkOTHERData: any[] | null = null;

  ngOnChanges() {
    if (this.serverDetails && this.benchmarksByCategory) {
      this.passmarkCPUData = this.getBenchmarkCategory("passmark:cpu");
      this.passmarkOTHERData = this.getBenchmarkCategory("passmark:other");
    }
  }

  isChartShown(id: string): boolean {
    if (!this.showChart || this.showChart === "all") {
      return true;
    }
    return this.showChart === id;
  }

  hasWorkloadProfileBenchmarks(): boolean {
    return hasWorkloadProfileChartData({
      benchmarkMeta: this.benchmarkMeta ?? [],
      benchmarkScores: this.serverDetails?.benchmark_scores,
    });
  }

  hasSslChart(): boolean {
    return !!(this.benchmarksByCategory ?? []).find(
      (group) => group.benchmark_id === "openssl",
    )?.benchmarks?.length;
  }

  hasMultiBarChart(chartItem: BenchmarkMultiBarChartItem): boolean {
    return !!this.multiBarBuilder.buildDetailsChart(
      chartItem.chart,
      this.benchmarksByCategory as MultiBarBenchmarkGroup[],
    );
  }

  hasPgbenchChart(): boolean {
    return (this.benchmarksByCategory ?? []).some((group) =>
      (group.benchmarks ?? []).some(
        (score: { benchmark_id?: string; score?: number | null }) =>
          score.benchmark_id === PGBENCH_HEAVY_READ_ONLY_ID &&
          score.score != null,
      ),
    );
  }

  hasStressNgChart(): boolean {
    const dataSet = (this.benchmarksByCategory ?? []).find(
      (group) => group.benchmark_id === "stress_ng:div16",
    );
    if (!dataSet?.benchmarks?.length) {
      return false;
    }

    const scales: number[] = [];
    for (const item of dataSet.benchmarks) {
      const cores = item.config?.cores;
      if (typeof cores === "number" && !scales.includes(cores)) {
        scales.push(cores);
      }
    }
    return scales.length > 1;
  }

  getBenchmarkCategory(category: string) {
    return (
      this.benchmarksByCategory?.find((x) => x.benchmark_id === category)
        ?.benchmarks || []
    ).map((e: any) => {
      return {
        ...e,
        score: Math.round(e.score),
        name:
          this.benchmarkMeta
            .find((b: any) => b.benchmark_id === e.benchmark_id)
            ?.name?.replace(
              /PassMark: CPU (.*?) Test|PassMark: CPU (.*?)/,
              "$1$2",
            )
            .replace(/PassMark: (.*?) Test|PassMark: (.*?)/, "$1$2") ||
          e.benchmark_id,
      };
    });
  }

  showTooltip(el: MouseEvent, content: string | undefined) {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip?.nativeElement,
      event: el,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent = tooltipContent;
      },
    });
  }

  showWarningTooltip(el: MouseEvent, content: string | undefined) {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip?.nativeElement,
      event: el,
      content,
      variant: "warning",
      onShow: (tooltipContent) => {
        this.tooltipContent = tooltipContent;
      },
    });
  }

  showTooltipChart(el: MouseEvent, type: string) {
    this.showTooltip(el, this.benchmarkDescription(type) || undefined);
  }

  hideTooltip() {
    this.tooltipService.hide(this.tooltip?.nativeElement);
  }

  get memoryBenchmarkMeta(): MemoryBenchmarkMeta[] {
    return this.benchmarkMeta as unknown as MemoryBenchmarkMeta[];
  }

  get geekbenchBenchmarkMeta(): GeekbenchBenchmarkMeta[] {
    return this.benchmarkMeta as unknown as GeekbenchBenchmarkMeta[];
  }

  get lineBenchmarkGroups(): LineBenchmarkGroup[] {
    return this.benchmarksByCategory as LineBenchmarkGroup[];
  }

  get lineChartDetailsServer(): LineChartDetailsServer {
    return this.serverDetails as LineChartDetailsServer;
  }

  get pgbenchTitle(): string {
    return (
      this.benchmarkMeta?.find(
        (benchmark) => benchmark.benchmark_id === "pgbench:heavy_read_only",
      )?.name || "pgbench Heavy Read-Only"
    );
  }

  benchmarkDescription(benchmarkId: string): string {
    return (
      this.benchmarkMeta.find(
        (benchmark) => benchmark.benchmark_id === benchmarkId,
      )?.description || ""
    );
  }

  benchmarkNote(benchmarkId: string, includeBenchmarkName = true): string {
    return (
      getBenchmarkMetaNote(this.benchmarkMeta, benchmarkId, {
        includeBenchmarkName,
      }) || ""
    );
  }

  benchmarkRowNote(benchmarkId: string): string {
    return this.benchmarkNote(benchmarkId, false);
  }

  openBox(boxId: string) {
    const el = document.getElementById(boxId);
    if (el) {
      el.classList.toggle("open");
    }
    const el2 = document.getElementById(boxId + "_more");
    if (el2) {
      el2.classList.toggle("hidden");
    }
    const el3 = document.getElementById(boxId + "_less");
    if (el3) {
      el3.classList.toggle("hidden");
    }
  }
}
