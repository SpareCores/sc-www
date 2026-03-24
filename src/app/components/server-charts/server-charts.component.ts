import { isPlatformBrowser } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  PLATFORM_ID,
  ViewChild,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";
import { LucideAngularModule } from "lucide-angular";
import { Benchmark } from "../../../../sdk/data-contracts";
import {
  staticWebChartTemplate,
  staticWebChartTemplateCallbacks,
  redisChartTemplate,
  redisChartTemplateCallbacks,
} from "../../pages/server-details/chartFromBenchmarks";
import { BenchmarkLineChartComponent } from "../charts/line/benchmark-line-chart.component";
import { CompressionChartComponent } from "../charts/compression/compression-chart.component";
import { GeekbenchRadarChartComponent } from "../charts/geekbench/geekbench-radar-chart.component";
import { LlmInferenceChartComponent } from "../charts/llm/llm-inference-chart.component";
import { GeekbenchBenchmarkMeta } from "../charts/geekbench/geekbench-radar-chart.types";
import { ServerMemoryChartComponent } from "../charts/memory/server-memory-chart.component";
import { MemoryBenchmarkMeta } from "../charts/memory/memory-chart.types";
import {
  LineBenchmarkGroup,
  LineChartDetailsServer,
} from "../charts/line/benchmark-line-chart.types";
import { BenchmarkMultiBarChartComponent } from "../charts/multi-bar/benchmark-multi-bar-chart.component";
import { BenchmarkMultiBarChartItem } from "../charts/multi-bar/benchmark-multi-bar-chart.types";
import { ChartTooltipService } from "../charts/shared/chart-tooltip.service";

@Component({
  selector: "app-server-charts",
  imports: [
    LucideAngularModule,
    FormsModule,
    RouterModule,
    BenchmarkIconPipe,
    BenchmarkLineChartComponent,
    CompressionChartComponent,
    GeekbenchRadarChartComponent,
    LlmInferenceChartComponent,
    ServerMemoryChartComponent,
    BenchmarkMultiBarChartComponent,
  ],
  templateUrl: "./server-charts.component.html",
  styleUrl: "./server-charts.component.scss",
})
export class ServerChartsComponent implements OnChanges {
  private platformId = inject(PLATFORM_ID);
  private tooltipService = inject(ChartTooltipService);

  @ViewChild("tooltipDefault") tooltip!: ElementRef<HTMLElement>;

  @Input() serverDetails: any;
  @Input() benchmarksByCategory: any[] = [];
  @Input() benchmarkMeta!: Benchmark[];
  @Input() showChart: string = "all";
  @Input() isEmbedded: boolean = false;

  multiBarCharts: Array<BenchmarkMultiBarChartItem & { callbacks: unknown }> = [
    {
      chart: JSON.parse(JSON.stringify(staticWebChartTemplate)),
      callbacks: staticWebChartTemplateCallbacks,
    },
    {
      chart: JSON.parse(JSON.stringify(redisChartTemplate)),
      callbacks: redisChartTemplateCallbacks,
    },
  ];

  tooltipContent = "";

  passmarkCPUData: any[] | null = null;
  passmarkOTHERData: any[] | null = null;

  ngOnChanges() {
    if (this.serverDetails && this.benchmarksByCategory) {
      if (this.isBrowser()) {
        this.initializeBenchmarkCharts();
      }

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

  initializeBenchmarkCharts() {
    this.multiBarCharts.forEach((chartItem) => {
      chartItem.chart.chartOptions.plugins.tooltip.callbacks =
        chartItem.callbacks;
    });
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

  showTooltipChart(el: MouseEvent, type: string) {
    const content = this.benchmarkMeta.find(
      (b: any) => b.benchmark_id === type,
    )?.description;

    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip?.nativeElement,
      event: el,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent = tooltipContent;
      },
    });
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

  benchmarkDescription(benchmarkId: string): string {
    return (
      this.benchmarkMeta.find(
        (benchmark) => benchmark.benchmark_id === benchmarkId,
      )?.description || ""
    );
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
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
