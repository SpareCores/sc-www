import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
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
  selectorDropdown = viewChild<FlowbiteDropdownDirective>("selectorDropdown");
  coresDropdown = viewChild<FlowbiteDropdownDirective>("coresDropdown");

  layout = input<"details" | "compare">("details");
  benchmarksByCategory = input<CompressionBenchmarkGroup[]>([]);
  benchmarkMeta = input<CompressionBenchmarkMeta[]>([]);
  servers = input<CompressionServer[]>([]);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly lineChartType = "line" as const;
  readonly idBase = `compression_chart_${CompressionChartComponent.nextId++}`;
  readonly buttonId = `${this.idBase}_button`;
  readonly optionsId = `${this.idBase}_options`;
  readonly coresButtonId = `${this.idBase}_cores_button`;
  readonly coresOptionsId = `${this.idBase}_cores_options`;

  tooltipContent = signal("");
  readonly infoTooltip = this.builder.infoTooltip;
  readonly detailsModes = this.builder.getDetailsModes();
  selectedDetailsModeId = signal(this.detailsModes[0]?.key || "compress");
  selectedCompareIndex = signal(0);
  selectedCoresMode = signal<"single" | "multi">("multi");

  readonly availableCoresOptions = computed<Array<"single" | "multi">>(() => {
    const ratioGroup = this.benchmarksByCategory().find(
      (benchmarkGroup) =>
        benchmarkGroup.benchmark_id === "compression_text:ratio",
    );
    if (!ratioGroup) {
      return [];
    }
    const coresSet = new Set<"single" | "multi">();
    for (const benchmark of ratioGroup.benchmarks ?? []) {
      const cores = benchmark.config.cores;
      if (cores === "single" || cores === "multi") {
        coresSet.add(cores);
      } else if (!cores) {
        coresSet.add("single");
      }
    }
    const result: Array<"single" | "multi"> = [];
    if (coresSet.has("single")) result.push("single");
    if (coresSet.has("multi")) result.push("multi");
    return result;
  });
  readonly hasCoresSelector = computed(
    () => this.availableCoresOptions().length > 1,
  );
  readonly coresLabel = computed(() => `cores: ${this.selectedCoresMode()}`);

  constructor() {
    effect(() => {
      const options = this.availableCoresOptions();
      if (options.length > 0 && !options.includes(this.selectedCoresMode())) {
        this.selectedCoresMode.set(options[0]);
      }
    });
  }

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
        coresMode: this.selectedCoresMode(),
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
    this.selectorDropdown()?.hide();
  }

  selectCompareOption(index: number): void {
    if (!this.compareOptions()[index]) {
      return;
    }

    this.selectedCompareIndex.set(index);
    this.selectorDropdown()?.hide();
  }

  selectCoresMode(mode: "single" | "multi"): void {
    this.selectedCoresMode.set(mode);
    this.coresDropdown()?.hide();
  }

  showTooltip(el: MouseEvent, content?: string): void {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event: el,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent.set(tooltipContent);
      },
    });
  }

  hideTooltip(): void {
    this.tooltipService.hide(this.tooltip()?.nativeElement);
  }
}
