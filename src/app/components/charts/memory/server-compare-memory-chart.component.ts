import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { BaseChartDirective } from "ng2-charts";
import { Button } from "../../../components/button/button";
import { CompareMemoryChartOption } from "../shared/memory-chart.types";
import { MemoryChartBuilderService } from "./memory-chart-builder.service";
import { FlowbiteDropdownDirective } from "../../../directives/flowbite-dropdown.directive";
import {
  bindCompareLegendChart,
  injectCompareLegendVisibility,
} from "../shared/compare-chart-legend.bind";
import { MemoryBenchmarkMeta, MemoryChartServer } from "./memory-chart.types";

@Component({
  selector: "sc-server-compare-memory-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Button,
    BaseChartDirective,
    FlowbiteDropdownDirective,
  ],
  templateUrl: "./server-compare-memory-chart.component.html",
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ServerCompareMemoryChartComponent {
  private static nextDropdownId = 0;

  private platformId = inject(PLATFORM_ID);
  private builder = inject(MemoryChartBuilderService);
  private legendVisibility = injectCompareLegendVisibility();

  dropdownBWmem = viewChild(FlowbiteDropdownDirective);

  servers = input<MemoryChartServer[]>([]);
  benchmarkMeta = input<MemoryBenchmarkMeta[]>([]);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly lineChartType = "line" as const;
  readonly buttonId = `bw_mem_button_compare_${ServerCompareMemoryChartComponent.nextDropdownId++}`;
  readonly optionsId = this.buttonId.replace("button", "options");

  readonly availableOptions = computed<CompareMemoryChartOption[]>(() =>
    this.builder.getAvailableCompareOptions(this.servers()),
  );
  readonly selectedOptionId = signal("");
  readonly selectedOption = computed(
    () =>
      this.availableOptions().find(
        (option) => option.id === this.selectedOptionId(),
      ) || this.availableOptions()[0],
  );
  readonly chart = computed(() => {
    const option = this.selectedOption();

    if (!option) {
      return undefined;
    }

    const built = this.builder.buildServerCompareChart({
      option,
      servers: this.servers(),
      benchmarkMeta: this.benchmarkMeta(),
    });
    if (!built) {
      return undefined;
    }

    return bindCompareLegendChart(built, this.legendVisibility);
  });
  readonly chartData = computed(() => this.chart()?.data);
  readonly chartOptions = computed(() => this.chart()?.options);
  readonly hasCacheAnnotations = computed(() => {
    const annotations = (
      this.chartOptions() as
        | { plugins?: { annotation?: { annotations?: object } } }
        | undefined
    )?.plugins?.annotation?.annotations;

    return !!annotations && Object.keys(annotations).length > 0;
  });
  readonly currentOptionName = computed(
    () => this.selectedOption()?.name || "",
  );

  constructor() {
    effect(() => {
      const options = this.availableOptions();
      const selectedStillValid = options.some(
        (option) => option.id === this.selectedOptionId(),
      );

      if (!options.length) {
        if (this.selectedOptionId() !== "") {
          this.selectedOptionId.set("");
        }
        return;
      }

      if (!selectedStillValid) {
        this.selectedOptionId.set(
          this.builder.getPreferredCompareOption(options)?.id || options[0].id,
        );
      }
    });
  }

  selectMemoryChartOption(index: number): void {
    const option = this.availableOptions()[index];
    if (!option) {
      return;
    }

    this.selectedOptionId.set(option.id);
    this.dropdownBWmem()?.hide();
  }
}
