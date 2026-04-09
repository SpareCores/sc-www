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
  output,
  signal,
  viewChild,
} from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { BaseChartDirective } from "ng2-charts";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import {
  barChartOptionsSSL,
  barChartOptionsSSLCompare,
  lineChartOptionsStressNG,
  lineChartOptionsStressNGPercent,
} from "../../../pages/server-details/chartOptions";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
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
  LineBenchmarkGroup,
  LineBenchmarkMeta,
  LineChartDetailsServer,
  LineChartServer,
} from "./benchmark-line-chart.types";

@Component({
  selector: "app-benchmark-line-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    BaseChartDirective,
    FlowbiteDropdownDirective,
    BenchmarkIconPipe,
  ],
  templateUrl: "./benchmark-line-chart.component.html",
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class BenchmarkLineChartComponent {
  private static nextId = 0;
  private static readonly defaultSslOptionName = "sha256";

  private platformId = inject(PLATFORM_ID);
  private tooltipService = inject(ChartTooltipService);
  private builder = inject(BenchmarkLineChartBuilderService);

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
  chartAvailabilityChange = output<boolean>();

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
      if (directChartData) {
        return directChartData;
      }

      switch (this.chartSource()) {
        case "details-ssl":
          return this.detailsSslChart()?.data;
        case "details-stress-raw":
        case "details-stress-percent":
          return this.detailsStressNgChart()?.data;
        case "compare-ssl":
          return this.compareSslChart()?.data;
        case "compare-stress-raw":
        case "compare-stress-percent":
          return this.compareStressNgChart()?.data;
        default:
          return undefined;
      }
    },
  );
  readonly resolvedChartOptions = computed<BenchmarkLineChartOptions>(() => {
    const directChartOptions = this.chartOptions();
    if (directChartOptions) {
      return directChartOptions;
    }

    switch (this.chartSource()) {
      case "details-ssl":
        return this.detailsSslChart()?.options;
      case "details-stress-raw":
        return this.detailsStressNgChart()?.rawOptions;
      case "details-stress-percent":
        return this.detailsStressNgChart()?.percentOptions;
      case "compare-ssl":
        return this.compareSslChart()?.options;
      case "compare-stress-raw":
        return this.compareStressNgChart()?.rawOptions;
      case "compare-stress-percent":
        return this.compareStressNgChart()?.percentOptions;
      default:
        return undefined;
    }
  });
  readonly hasSelector = computed(
    () => this.resolvedSelectorOptions().length > 0,
  );
  readonly hasChartData = computed(() => !!this.resolvedChartData());
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
  private readonly availabilityEffect = effect(() => {
    this.chartAvailabilityChange.emit(this.hasChartData());
  });

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

  hideTooltip(): void {
    this.tooltipService.hide(this.tooltip()?.nativeElement);
  }
}
