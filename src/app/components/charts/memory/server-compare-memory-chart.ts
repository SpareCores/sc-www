import { isPlatformBrowser } from "@angular/common";
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
import { Button } from "../../button/button";
import { CompareMemoryChartOption } from "../shared/memory-chart.types";
import { MemoryChartBuilder } from "./memory-chart-builder";
import { Dropdown } from "../../../directives/dropdown";
import {
  bindCompareLegendChart,
  injectCompareLegendVisibility,
} from "../shared/compare-chart-legend.bind";
import { MemoryBenchmarkMeta, MemoryChartServer } from "./memory-chart.types";

@Component({
  selector: "sc-server-compare-memory-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, BaseChartDirective, Dropdown],
  templateUrl: "./server-compare-memory-chart.html",
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ServerCompareMemoryChart {
  private static nextDropdownId = 0;

  private platformId = inject(PLATFORM_ID);
  private builder = inject(MemoryChartBuilder);
  private legendVisibility = injectCompareLegendVisibility();

  dropdownBWmem = viewChild(Dropdown);

  servers = input<MemoryChartServer[]>([]);
  benchmarkMeta = input<MemoryBenchmarkMeta[]>([]);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly lineChartType = "line" as const;
  readonly buttonId = `bw_mem_button_compare_${ServerCompareMemoryChart.nextDropdownId++}`;
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
