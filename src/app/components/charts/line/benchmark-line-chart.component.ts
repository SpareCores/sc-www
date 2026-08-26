import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import {
  LucideDynamicIcon,
  LucideCircleArrowUp,
  LucideInfo,
  LucideTriangleAlert,
} from "@lucide/angular";
import { BaseChartDirective } from "ng2-charts";
import { Button } from "../../../components/button/button";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import {
  barChartOptionsSSL,
  barChartOptionsSSLCompare,
  lineChartOptionsPgbench,
  lineChartOptionsStressNG,
  lineChartOptionsStressNGPercent,
} from "../../../pages/server-details/chartOptions";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import {
  injectCompareLegendVisibility,
  syncCompareLegendData,
  syncCompareLegendOptions,
} from "../shared/compare-chart-legend.bind";
import { FlowbiteDropdownDirective } from "../../../directives/flowbite-dropdown.directive";
import { BenchmarkLineChartBuilderService } from "./benchmark-line-chart-builder.service";
import {
  BenchmarkBarChartData,
  BenchmarkBarChartOptions,
  BenchmarkLineChartData,
  BenchmarkLineChartKind,
  BenchmarkLineChartOptions,
  BenchmarkLineChartSource,
  BenchmarkLineOnlyChartData,
  BenchmarkLineOnlyChartOptions,
  BenchmarkLineSelectorOption,
  CompareSslOption,
  DEFAULT_COMPARE_SSL_OPTIONS,
  PGBENCH_HEAVY_READ_ONLY_ID,
  LineBenchmarkGroup,
  LineBenchmarkMeta,
  LineChartDetailsServer,
  LineChartServer,
} from "./benchmark-line-chart.types";

@Component({
  selector: "sc-benchmark-line-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Button,
    LucideDynamicIcon,
    LucideCircleArrowUp,
    LucideInfo,
    LucideTriangleAlert,
    BaseChartDirective,
    FlowbiteDropdownDirective,
    BenchmarkIconPipe,
  ],
  templateUrl: "./benchmark-line-chart.component.html",
})
export class BenchmarkLineChartComponent {
  private static nextId = 0;
  private static readonly defaultSslOptionName = "sha256";

  private platformId = inject(PLATFORM_ID);
  private tooltipService = inject(ChartTooltipService);
  private builder = inject(BenchmarkLineChartBuilderService);
  private legendVisibility = injectCompareLegendVisibility();

  selectorDropdown = viewChild<FlowbiteDropdownDirective>("selectorDropdown");
  tooltip = viewChild<ElementRef<HTMLElement>>("tooltipDefault");

  chartData = input<BenchmarkLineChartData | undefined>(undefined);
  chartOptions = input<BenchmarkLineChartOptions>(undefined);
  chartSource = input<BenchmarkLineChartSource>("direct");
  chartType = input<BenchmarkLineChartKind>("line");
  layout = input<"details" | "compare">("details");
  benchmarkKey = input("");
  title = input("");
  orderTooltip = input("");
  infoTooltip = input("");
  noteTooltip = input("");
  blockClass = input("block_half");
  elementId = input("");
  canvasId = input("");
  detailsServer = input<LineChartDetailsServer | undefined>(undefined);
  benchmarksByCategory = input<LineBenchmarkGroup[]>([]);
  benchmarkMeta = input<LineBenchmarkMeta[]>([]);
  servers = input<LineChartServer[]>([]);
  selectorOptions = input<BenchmarkLineSelectorOption[]>([]);
  selectedOptionName = input("");

  selectorSelected = output<number>();

  tooltipContent = signal("");
  private selectedCompareSslIndex = signal(
    DEFAULT_COMPARE_SSL_OPTIONS.findIndex(
      (option) =>
        option.name === BenchmarkLineChartComponent.defaultSslOptionName,
    ),
  );
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly resolvedSelectorOptions = computed<BenchmarkLineSelectorOption[]>(
    () => {
      const options = this.selectorOptions();
      if (options.length > 0) {
        return options;
      }

      return this.chartSource() === "compare-ssl"
        ? DEFAULT_COMPARE_SSL_OPTIONS
        : [];
    },
  );
  readonly selectedCompareSslOption = computed<CompareSslOption | undefined>(
    () => {
      const options = this.resolvedSelectorOptions().map((option) => ({
        name: option.name,
        value: option.value ?? option.name,
      }));

      return (
        options[this.selectedCompareSslIndex()] ??
        options.find(
          (option) =>
            option.value === BenchmarkLineChartComponent.defaultSslOptionName,
        ) ??
        options[0]
      );
    },
  );
  readonly detailsSslChart = computed(() => {
    if (this.chartSource() !== "details-ssl") {
      return undefined;
    }

    return this.builder.buildDetailsSslChart({
      benchmarksByCategory: this.benchmarksByCategory(),
      baseOptions: barChartOptionsSSL,
    });
  });
  readonly detailsPgbenchChart = computed(() => {
    if (this.chartSource() !== "details-pgbench") {
      return undefined;
    }

    const meta = this.benchmarkMeta().find(
      (item) => item.benchmark_id === PGBENCH_HEAVY_READ_ONLY_ID,
    );

    return this.builder.buildDetailsPgbenchChart({
      scores: this.benchmarksByCategory().flatMap(
        (group) => group.benchmarks ?? [],
      ),
      vcpus: this.detailsServer()?.vcpus,
      optionsBase: lineChartOptionsPgbench,
      scoreUnit: meta?.unit,
    });
  });
  readonly detailsStressNgChart = computed(() => {
    if (
      this.chartSource() !== "details-stress-raw" &&
      this.chartSource() !== "details-stress-percent"
    ) {
      return undefined;
    }

    const serverDetails = this.detailsServer();
    if (!serverDetails) {
      return undefined;
    }

    return this.builder.buildDetailsStressNgChart({
      serverDetails,
      benchmarksByCategory: this.benchmarksByCategory(),
      rawOptionsBase: lineChartOptionsStressNG,
      percentOptionsBase: lineChartOptionsStressNGPercent,
    });
  });
  readonly compareSslChart = computed(() => {
    if (this.chartSource() !== "compare-ssl") {
      return undefined;
    }

    const selectedAlgo = this.selectedCompareSslOption();
    if (!selectedAlgo) {
      return undefined;
    }

    return this.builder.buildCompareSslChart({
      servers: this.servers(),
      benchmarkMeta: this.benchmarkMeta(),
      selectedAlgo,
      baseOptions: barChartOptionsSSLCompare,
    });
  });
  readonly comparePgbenchChart = computed(() => {
    if (this.chartSource() !== "compare-pgbench") {
      return undefined;
    }

    const meta = this.benchmarkMeta().find(
      (item) => item.benchmark_id === PGBENCH_HEAVY_READ_ONLY_ID,
    );

    return this.builder.buildComparePgbenchChart({
      servers: this.servers(),
      scoreUnit: meta?.unit,
      optionsBase: lineChartOptionsPgbench,
    });
  });
  readonly compareStressNgChart = computed(() => {
    if (
      this.chartSource() !== "compare-stress-raw" &&
      this.chartSource() !== "compare-stress-percent"
    ) {
      return undefined;
    }

    return this.builder.buildCompareStressNgChart({
      servers: this.servers(),
      benchmarkMeta: this.benchmarkMeta(),
      rawOptionsBase: lineChartOptionsStressNG,
      percentOptionsBase: lineChartOptionsStressNGPercent,
    });
  });
  readonly resolvedChartData = computed<BenchmarkLineChartData | undefined>(
    () => {
      const directChartData = this.chartData();
      let data: BenchmarkLineChartData | undefined;
      if (directChartData) {
        data = directChartData;
      } else {
        switch (this.chartSource()) {
          case "details-ssl":
            data = this.detailsSslChart()?.data;
            break;
          case "details-pgbench":
            data = this.detailsPgbenchChart()?.data;
            break;
          case "details-stress-raw":
          case "details-stress-percent":
            data = this.detailsStressNgChart()?.data;
            break;
          case "compare-ssl":
            data = this.compareSslChart()?.data;
            break;
          case "compare-pgbench":
            data = this.comparePgbenchChart()?.data;
            break;
          case "compare-stress-raw":
          case "compare-stress-percent":
            data = this.compareStressNgChart()?.data;
            break;
          default:
            data = undefined;
        }
      }

      if (!data || !this.shouldSyncCompareLegend()) {
        return data;
      }

      return syncCompareLegendData(data, this.legendVisibility);
    },
  );
  readonly resolvedChartOptions = computed<BenchmarkLineChartOptions>(() => {
    const directChartOptions = this.chartOptions();
    let options: BenchmarkLineChartOptions;
    if (directChartOptions) {
      options = directChartOptions;
    } else {
      switch (this.chartSource()) {
        case "details-ssl":
          options = this.detailsSslChart()?.options;
          break;
        case "details-pgbench":
          options = this.detailsPgbenchChart()?.options;
          break;
        case "details-stress-raw":
          options = this.detailsStressNgChart()?.rawOptions;
          break;
        case "details-stress-percent":
          options = this.detailsStressNgChart()?.percentOptions;
          break;
        case "compare-ssl":
          options = this.compareSslChart()?.options;
          break;
        case "compare-pgbench":
          options = this.comparePgbenchChart()?.options;
          break;
        case "compare-stress-raw":
          options = this.compareStressNgChart()?.rawOptions;
          break;
        case "compare-stress-percent":
          options = this.compareStressNgChart()?.percentOptions;
          break;
        default:
          options = undefined;
      }
    }

    if (!this.shouldSyncCompareLegend()) {
      return options;
    }

    return syncCompareLegendOptions(options, this.legendVisibility);
  });
  readonly hasSelector = computed(
    () => this.resolvedSelectorOptions().length > 0,
  );
  readonly resolvedSelectedOptionName = computed(
    () =>
      this.selectedOptionName() ||
      this.selectedCompareSslOption()?.name ||
      this.resolvedSelectorOptions()[0]?.name ||
      "",
  );
  readonly lineChartData = computed<BenchmarkLineOnlyChartData | undefined>(
    () =>
      this.chartType() === "line"
        ? (this.resolvedChartData() as BenchmarkLineOnlyChartData | undefined)
        : undefined,
  );
  readonly lineChartOptions = computed<
    BenchmarkLineOnlyChartOptions | undefined
  >(() =>
    this.chartType() === "line"
      ? (this.resolvedChartOptions() as
          | BenchmarkLineOnlyChartOptions
          | undefined)
      : undefined,
  );
  readonly barChartData = computed<BenchmarkBarChartData | undefined>(() =>
    this.chartType() === "bar"
      ? (this.resolvedChartData() as BenchmarkBarChartData | undefined)
      : undefined,
  );
  readonly barChartOptions = computed<BenchmarkBarChartOptions | undefined>(
    () =>
      this.chartType() === "bar"
        ? (this.resolvedChartOptions() as BenchmarkBarChartOptions | undefined)
        : undefined,
  );

  readonly idBase = `line_chart_${BenchmarkLineChartComponent.nextId++}`;
  readonly buttonId = `${this.idBase}_button`;
  readonly optionsId = `${this.idBase}_options`;

  private shouldSyncCompareLegend(): boolean {
    return (
      this.layout() === "compare" || this.chartSource().startsWith("compare-")
    );
  }

  selectOption(index: number): void {
    if (!this.resolvedSelectorOptions()[index]) {
      return;
    }

    if (this.chartSource() === "compare-ssl") {
      this.selectedCompareSslIndex.set(index);
    }

    this.selectorSelected.emit(index);
    this.selectorDropdown()?.hide();
  }

  showTooltip(el: MouseEvent, content?: string): void {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event: el,
      content,
      onShow: (tooltipContent) => this.tooltipContent.set(tooltipContent),
    });
  }

  showWarningTooltip(el: MouseEvent, content?: string): void {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event: el,
      content,
      variant: "warning-wide",
      onShow: (tooltipContent) => this.tooltipContent.set(tooltipContent),
    });
  }

  hideTooltip(): void {
    this.tooltipService.hide(this.tooltip()?.nativeElement);
  }
}
