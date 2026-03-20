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
import {
  barChartOptionsSSL,
  barChartOptionsSSLCompare,
} from "../../../pages/server-details/chartOptions";
import { LlmInferenceChartBuilderService } from "./llm-inference-chart-builder.service";
import { FlowbiteDropdownDirective } from "../shared/flowbite-dropdown.directive";
import {
  LlmBarChartData,
  LlmBarChartOptions,
  LlmBenchmarkGroup,
  LlmBenchmarkMeta,
  LlmChartServer,
  LlmCompareChartsResult,
} from "./llm-inference-chart.types";
import { ChartTooltipService } from "../shared/chart-tooltip.service";

@Component({
  selector: "app-llm-inference-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    BaseChartDirective,
    FlowbiteDropdownDirective,
    BenchmarkIconPipe,
  ],
  templateUrl: "./llm-inference-chart.component.html",
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class LlmInferenceChartComponent {
  private static nextId = 0;

  private platformId = inject(PLATFORM_ID);
  private builder = inject(LlmInferenceChartBuilderService);
  private tooltipService = inject(ChartTooltipService);

  tooltip = viewChild<ElementRef<HTMLElement>>("tooltipDefault");

  layout = input<"details" | "compare">("details");
  promptData = input<LlmBarChartData | undefined>(undefined);
  promptOptions = input<LlmBarChartOptions>(undefined);
  generationData = input<LlmBarChartData | undefined>(undefined);
  generationOptions = input<LlmBarChartOptions>(undefined);
  benchmarksByCategory = input<LlmBenchmarkGroup[]>([]);
  benchmarkMeta = input<LlmBenchmarkMeta[]>([]);
  servers = input<LlmChartServer[]>([]);
  showPrompt = input(true);
  showGeneration = input(true);

  readonly barChartType = "bar" as const;
  readonly idBase = `llm_chart_${LlmInferenceChartComponent.nextId++}`;
  readonly buttonId = `${this.idBase}_button`;
  readonly optionsId = `${this.idBase}_options`;
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly detailsPromptData = computed(
    () =>
      this.promptData() ??
      this.builder.buildDetailsBarChart({
        benchmarksByCategory: this.benchmarksByCategory(),
        benchmarkId: "llm_speed:prompt_processing",
        labelsField: "tokens",
        scaleField: "model",
      }),
  );
  readonly detailsPromptOptions = computed(() => {
    const directOptions = this.promptOptions();
    if (directOptions) {
      return directOptions;
    }

    if (!this.detailsPromptData()) {
      return undefined;
    }

    return this.builder.createDetailsOptions(
      barChartOptionsSSL,
      "Prompt's length (tokens).",
    );
  });
  readonly detailsGenerationData = computed(
    () =>
      this.generationData() ??
      this.builder.buildDetailsBarChart({
        benchmarksByCategory: this.benchmarksByCategory(),
        benchmarkId: "llm_speed:text_generation",
        labelsField: "tokens",
        scaleField: "model",
      }),
  );
  readonly detailsGenerationOptions = computed(() => {
    const directOptions = this.generationOptions();
    if (directOptions) {
      return directOptions;
    }

    if (!this.detailsGenerationData()) {
      return undefined;
    }

    return this.builder.createDetailsOptions(
      barChartOptionsSSL,
      "Requested text length (tokens).",
    );
  });

  readonly availableModels = computed(() =>
    this.layout() === "compare"
      ? this.builder.getAvailableModels(this.benchmarkMeta())
      : [],
  );
  readonly selectedModelIndex = signal(0);
  readonly currentModel = computed(
    () =>
      this.availableModels()[this.selectedModelIndex()] ||
      this.availableModels()[0],
  );
  readonly compareCharts = computed<LlmCompareChartsResult | undefined>(() => {
    if (this.layout() !== "compare") {
      return undefined;
    }

    return this.builder.buildCompareCharts({
      servers: this.servers(),
      selectedModel: this.currentModel(),
      promptOptionsBase: barChartOptionsSSLCompare,
      generationOptionsBase: barChartOptionsSSLCompare,
    });
  });
  readonly comparePromptData = computed(() => this.compareCharts()?.promptData);
  readonly comparePromptOptions = computed(
    () => this.compareCharts()?.promptOptions,
  );
  readonly compareGenerationData = computed(
    () => this.compareCharts()?.generationData,
  );
  readonly compareGenerationOptions = computed(
    () => this.compareCharts()?.generationOptions,
  );
  readonly hasCompareData = computed(
    () => !!(this.comparePromptData() || this.compareGenerationData()),
  );
  readonly hasDetailsData = computed(
    () => !!(this.detailsPromptData() || this.detailsGenerationData()),
  );
  readonly currentModelName = computed(
    () => this.currentModel()?.name || "Select Model",
  );
  readonly promptInfoTooltip = computed(
    () =>
      this.benchmarkMeta().find(
        (benchmark) => benchmark.benchmark_id === "llm_speed:prompt_processing",
      )?.description || "",
  );
  readonly generationInfoTooltip = computed(
    () =>
      this.benchmarkMeta().find(
        (benchmark) => benchmark.benchmark_id === "llm_speed:text_generation",
      )?.description || "",
  );
  readonly orderTooltip = "Higher is better.";

  tooltipContent = signal("");

  constructor() {
    effect(() => {
      const models = this.availableModels();
      const selectedIndex = this.selectedModelIndex();

      if (!models.length) {
        if (selectedIndex !== 0) {
          this.selectedModelIndex.set(0);
        }
        return;
      }

      if (selectedIndex >= models.length) {
        this.selectedModelIndex.set(0);
      }
    });
  }

  selectModel(index: number): void {
    if (!this.availableModels()[index]) {
      return;
    }

    this.selectedModelIndex.set(index);
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
