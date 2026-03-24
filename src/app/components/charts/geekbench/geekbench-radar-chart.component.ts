import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  viewChild,
} from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { BaseChartDirective } from "ng2-charts";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { GeekbenchRadarChartBuilderService } from "./geekbench-radar-chart-builder.service";
import {
  GeekbenchBenchmarkGroup,
  GeekbenchBenchmarkMeta,
  GeekbenchCompareServer,
  GeekbenchRadarChartData,
  GeekbenchRadarChartOptions,
  GeekbenchTooltipHtml,
} from "./geekbench-radar-chart.types";

@Component({
  selector: "app-geekbench-radar-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    BaseChartDirective,
    BenchmarkIconPipe,
  ],
  templateUrl: "./geekbench-radar-chart.component.html",
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class GeekbenchRadarChartComponent {
  private platformId = inject(PLATFORM_ID);
  private tooltipService = inject(ChartTooltipService);
  private builder = inject(GeekbenchRadarChartBuilderService);

  tooltip = viewChild<ElementRef<HTMLElement>>("tooltipDefault");

  layout = input<"details" | "compare">("details");

  title = input("");
  score = input("");
  chartData = input<GeekbenchRadarChartData | undefined>(undefined);
  chartOptions = input<GeekbenchRadarChartOptions>(undefined);
  chartType = input<"radar">("radar");
  blockClass = input("block_half_taller");
  elementId = input("");
  canvasId = input("");
  detailsChartMode = input<"single" | "multi">("single");
  benchmarksByCategory = input<GeekbenchBenchmarkGroup[]>([]);
  benchmarkMeta = input<GeekbenchBenchmarkMeta[]>([]);
  servers = input<GeekbenchCompareServer[]>([]);

  singleChartData = input<GeekbenchRadarChartData | undefined>(undefined);
  singleChartOptions = input<GeekbenchRadarChartOptions>(undefined);
  multiChartData = input<GeekbenchRadarChartData | undefined>(undefined);
  multiChartOptions = input<GeekbenchRadarChartOptions>(undefined);
  showSingle = input(true);
  showMulti = input(true);

  orderTooltip = input("Higher is better.");
  infoTooltipHtml = input<GeekbenchTooltipHtml>(null);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly detailsCharts = computed(() => {
    if (this.layout() !== "details") return undefined;
    return this.builder.buildDetailsCharts({
      benchmarksByCategory: this.benchmarksByCategory(),
      benchmarkMeta: this.benchmarkMeta(),
    });
  });
  readonly compareCharts = computed(() => {
    if (this.layout() !== "compare") return undefined;
    return this.builder.buildCompareCharts({
      servers: this.servers(),
      benchmarkMeta: this.benchmarkMeta(),
    });
  });
  readonly resolvedDetailsChartData = computed(() => {
    const directChartData = this.chartData();
    if (directChartData) {
      return directChartData;
    }

    return this.detailsChartMode() === "single"
      ? this.detailsCharts()?.singleData
      : this.detailsCharts()?.multiData;
  });
  readonly resolvedDetailsChartOptions = computed(
    () => this.chartOptions() ?? this.detailsCharts()?.options,
  );
  readonly resolvedScore = computed(() => {
    if (this.score()) {
      return this.score();
    }

    return this.detailsChartMode() === "single"
      ? this.detailsCharts()?.singleScore || "0"
      : this.detailsCharts()?.multiScore || "0";
  });
  readonly resolvedInfoTooltipHtml = computed(
    () =>
      this.infoTooltipHtml() ??
      (this.layout() === "compare"
        ? this.compareCharts()?.infoTooltipHtml
        : this.detailsCharts()?.infoTooltipHtml),
  );
  readonly resolvedSingleChartData = computed(
    () => this.singleChartData() ?? this.compareCharts()?.singleData,
  );
  readonly resolvedSingleChartOptions = computed(
    () => this.singleChartOptions() ?? this.compareCharts()?.singleOptions,
  );
  readonly resolvedMultiChartData = computed(
    () => this.multiChartData() ?? this.compareCharts()?.multiData,
  );
  readonly resolvedMultiChartOptions = computed(
    () => this.multiChartOptions() ?? this.compareCharts()?.multiOptions,
  );
  readonly hasDetailsChart = computed(() => !!this.resolvedDetailsChartData());
  readonly hasCompareCharts = computed(
    () => !!this.resolvedSingleChartData() || !!this.resolvedMultiChartData(),
  );

  tooltipContent = "";
  tooltipHtml: GeekbenchTooltipHtml = null;

  showTextTooltip(el: MouseEvent, content?: string): void {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event: el,
      content,
      onShow: (text) => {
        this.tooltipContent = text;
        this.tooltipHtml = null;
      },
    });
  }

  showHtmlTooltip(el: MouseEvent, content?: GeekbenchTooltipHtml): void {
    const tooltipElement = this.tooltip()?.nativeElement;
    if (!content || !tooltipElement) {
      return;
    }
    this.tooltipHtml = content;
    this.tooltipContent = "";
    this.tooltipService.show(tooltipElement, el);
  }

  hideTooltip(): void {
    this.tooltipService.hide(this.tooltip()?.nativeElement);
    this.tooltipContent = "";
    this.tooltipHtml = null;
  }
}
