import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { BaseChartDirective } from "ng2-charts";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import { CompressionChartBuilderService } from "./compression-chart-builder.service";
import {
  CompareCompressionOption,
  CompressionBenchmarkGroup,
  CompressionBenchmarkMeta,
  CompressionCompareChartResult,
  CompressionDetailsChartResult,
  CompressionServer,
} from "./compression-chart.types";
import {
  lineChartOptionsComp,
  lineChartOptionsCompareCompress,
  lineChartOptionsCompareDecompress,
} from "../../../pages/server-details/chartOptions";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { FlowbiteDropdownDirective } from "../shared/flowbite-dropdown.directive";

@Component({
  selector: "app-compression-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    BaseChartDirective,
    FlowbiteDropdownDirective,
    BenchmarkIconPipe,
  ],
  templateUrl: "./compression-chart.component.html",
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class CompressionChartComponent {
  private static nextId = 0;

  private platformId = inject(PLATFORM_ID);
  private builder = inject(CompressionChartBuilderService);
  private tooltipService = inject(ChartTooltipService);

  tooltip = viewChild<ElementRef<HTMLElement>>("tooltipDefault");

  layout = input<"details" | "compare">("details");
  benchmarksByCategory = input<CompressionBenchmarkGroup[]>([]);
  benchmarkMeta = input<CompressionBenchmarkMeta[]>([]);
  servers = input<CompressionServer[]>([]);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly lineChartType = "line" as const;
  readonly idBase = `compression_chart_${CompressionChartComponent.nextId++}`;
  readonly buttonId = `${this.idBase}_button`;
  readonly optionsId = `${this.idBase}_options`;

  tooltipContent = "";
  readonly infoTooltip = this.builder.infoTooltip;
  readonly detailsModes = this.builder.getDetailsModes();
  selectedDetailsModeId = signal(this.detailsModes[0]?.key || "compress");
  selectedCompareIndex = signal(0);

  readonly currentDetailsMode = computed(
    () =>
      this.detailsModes.find(
        (mode) => mode.key === this.selectedDetailsModeId(),
      ) || this.detailsModes[0],
  );
  readonly compareOptions = computed<CompareCompressionOption[]>(() =>
    this.builder.getCompareOptions(this.benchmarkMeta()),
  );
  readonly currentCompareOption = computed(
    () =>
      this.compareOptions()[this.selectedCompareIndex()] ||
      this.compareOptions()[0],
  );
  readonly detailsChart = computed<CompressionDetailsChartResult | undefined>(
    () => {
      if (this.layout() !== "details") {
        return undefined;
      }

      return this.builder.buildDetailsChart({
        benchmarksByCategory: this.benchmarksByCategory(),
        mode: this.currentDetailsMode(),
        baseOptions: lineChartOptionsComp,
      });
    },
  );
  readonly compareCharts = computed<CompressionCompareChartResult | undefined>(
    () => {
      if (this.layout() !== "compare") {
        return undefined;
      }

      return this.builder.buildCompareCharts({
        servers: this.servers(),
        selectedOption: this.currentCompareOption(),
        compressOptionsBase: lineChartOptionsCompareCompress,
        decompressOptionsBase: lineChartOptionsCompareDecompress,
      });
    },
  );
  readonly detailsChartData = computed(() => this.detailsChart()?.data);
  readonly detailsChartOptions = computed(() => this.detailsChart()?.options);
  readonly compareCompressData = computed(
    () => this.compareCharts()?.compressData,
  );
  readonly compareCompressOptions = computed(
    () => this.compareCharts()?.compressOptions,
  );
  readonly compareDecompressData = computed(
    () => this.compareCharts()?.decompressData,
  );
  readonly compareDecompressOptions = computed(
    () => this.compareCharts()?.decompressOptions,
  );
  readonly hasOptions = computed(() =>
    this.layout() === "details"
      ? this.detailsModes.length > 0
      : this.compareOptions().length > 0,
  );
  readonly currentCompareOptionName = computed(
    () => this.currentCompareOption()?.name || "",
  );

  selectDetailsMode(index: number): void {
    const selectedMode = this.detailsModes[index];
    if (!selectedMode) {
      return;
    }

    this.selectedDetailsModeId.set(selectedMode.key);
  }

  selectCompareOption(index: number): void {
    if (!this.compareOptions()[index]) {
      return;
    }

    this.selectedCompareIndex.set(index);
  }

  showTooltip(el: MouseEvent, content?: string): void {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event: el,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent = tooltipContent;
      },
    });
  }

  hideTooltip(): void {
    this.tooltipService.hide(this.tooltip()?.nativeElement);
  }
}
