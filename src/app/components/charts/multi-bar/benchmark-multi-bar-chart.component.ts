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
import {
  ChartFromBenchmarkSecondaryOptions,
  ChartFromBenchmarkTemplate,
  ChartFromBenchmarkTemplateOptions,
} from "../../../pages/server-details/chartFromBenchmarks";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import { cloneChartOptions } from "../shared/chart-options.utils";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { FlowbiteDropdownDirective } from "../../../directives/flowbite-dropdown.directive";
import { BenchmarkMultiBarChartBuilderService } from "./benchmark-multi-bar-chart-builder.service";
import {
  BenchmarkMultiBarChartItem,
  MultiBarBenchmarkGroup,
  MultiBarBenchmarkMeta,
  MultiBarServer,
} from "./benchmark-multi-bar-chart.types";

@Component({
  selector: "app-benchmark-multi-bar-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    BaseChartDirective,
    FlowbiteDropdownDirective,
    BenchmarkIconPipe,
  ],
  templateUrl: "./benchmark-multi-bar-chart.component.html",
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class BenchmarkMultiBarChartComponent {
  private static nextId = 0;

  private platformId = inject(PLATFORM_ID);
  private tooltipService = inject(ChartTooltipService);
  private builder = inject(BenchmarkMultiBarChartBuilderService);

  primaryDropdown = viewChild<FlowbiteDropdownDirective>("primaryDropdown");
  secondaryDropdown = viewChild<FlowbiteDropdownDirective>("secondaryDropdown");
  tooltip = viewChild<ElementRef<HTMLElement>>("tooltipDefault");

  chartItem = input.required<BenchmarkMultiBarChartItem>();
  benchmarkMeta = input<MultiBarBenchmarkMeta[]>([]);
  detailsBenchmarks = input<MultiBarBenchmarkGroup[]>([]);
  servers = input<MultiBarServer[]>([]);
  layout = input<"details" | "compare">("details");
  serverCount = input(0);
  isEmbedded = input(false);

  optionSelected = output<number>();
  secondaryOptionSelected = output<number>();
  detailsToggled = output<void>();

  tooltipContent = signal("");
  private readonly selectedOptionIndex = signal(0);
  private readonly selectedSecondaryOptionIndex = signal<number | undefined>(
    undefined,
  );
  private readonly localChart = signal<ChartFromBenchmarkTemplate | undefined>(
    undefined,
  );

  readonly idBase = `multi_bar_${BenchmarkMultiBarChartComponent.nextId++}`;
  readonly buttonId = `${this.idBase}_button`;
  readonly optionsId = `${this.idBase}_options`;
  readonly secondaryButtonId = `${this.idBase}_button2`;
  readonly secondaryOptionsId = `${this.idBase}_options2`;
  readonly chart = computed(() => this.localChart() || this.chartItem().chart);
  readonly chartData = computed(() => this.chart().chartData);
  readonly currentOption = computed(
    () => this.chart().options[this.chart().selectedOption],
  );
  readonly currentSecondaryOption = computed(() => {
    const selectedSecondaryOption = this.chart().selectedSecondaryOption;
    if (selectedSecondaryOption === undefined) {
      return undefined;
    }

    return this.chart().secondaryOptions?.[selectedSecondaryOption];
  });
  readonly currentBenchmarkDescription = computed(
    () =>
      this.benchmarkMeta().find(
        (benchmark) =>
          benchmark.benchmark_id === this.currentOption()?.benchmark_id,
      )?.description || "",
  );
  readonly hasSecondaryOptions = computed(
    () => (this.chart().secondaryOptions?.length || 0) > 1,
  );

  constructor() {
    effect(() => {
      const chart = this.chartItem().chart;
      const selectedOption = this.selectedOptionIndex();

      if (!chart.options[selectedOption]) {
        this.selectedOptionIndex.set(chart.selectedOption);
      }

      const secondaryOptions = chart.secondaryOptions || [];
      const selectedSecondaryOption = this.selectedSecondaryOptionIndex();

      if (!secondaryOptions.length) {
        if (selectedSecondaryOption !== undefined) {
          this.selectedSecondaryOptionIndex.set(undefined);
        }
        return;
      }

      if (
        selectedSecondaryOption === undefined ||
        !secondaryOptions[selectedSecondaryOption]
      ) {
        this.selectedSecondaryOptionIndex.set(
          chart.selectedSecondaryOption ?? 0,
        );
      }
    });

    effect(() => {
      const chart = this.chartItem().chart;
      const benchmarkMeta = this.benchmarkMeta();
      const detailsBenchmarks = this.detailsBenchmarks();
      const servers = this.servers();
      const layout = this.layout();
      const selectedOption = this.selectedOptionIndex();
      const selectedSecondaryOption = this.selectedSecondaryOptionIndex();

      if (!chart.options[selectedOption]) {
        this.localChart.set(undefined);
        return;
      }

      const viewModel = this.cloneChart(chart);
      viewModel.selectedOption = selectedOption;
      viewModel.selectedSecondaryOption = selectedSecondaryOption;

      if (layout === "details") {
        this.builder.initializeDetailsTemplate(viewModel, benchmarkMeta);
        this.builder.syncDetailsChart(viewModel, detailsBenchmarks);
      } else {
        this.builder.initializeCompareTemplate(viewModel, benchmarkMeta);
        this.builder.syncCompareChart(viewModel, benchmarkMeta, servers);
      }

      this.localChart.set(viewModel);
    });
  }

  isBrowserEnvironment(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  selectOption(index: number): void {
    if (!this.chart().options[index]) {
      return;
    }

    this.selectedOptionIndex.set(index);
    this.optionSelected.emit(index);
    this.primaryDropdown()?.hide();
  }

  selectSecondaryOption(index: number): void {
    if (!this.chart().secondaryOptions?.[index]) {
      return;
    }

    this.selectedSecondaryOptionIndex.set(index);
    this.secondaryOptionSelected.emit(index);
    this.secondaryDropdown()?.hide();
  }

  toggleDetails(): void {
    this.detailsToggled.emit();
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

  private cloneChart(
    chart: ChartFromBenchmarkTemplate,
  ): ChartFromBenchmarkTemplate {
    return {
      ...chart,
      options: chart.options.map(
        (option: ChartFromBenchmarkTemplateOptions) => ({
          ...option,
        }),
      ),
      secondaryOptions: chart.secondaryOptions?.map(
        (option: ChartFromBenchmarkSecondaryOptions) => ({ ...option }),
      ),
      chartOptions: cloneChartOptions(chart.chartOptions),
      chartData: undefined,
    };
  }
}
