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
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { MemoryChartBuilderService } from "./memory-chart-builder.service";
import { ServerDetailsMemoryChartOption } from "../shared/memory-chart.types";
import { FlowbiteDropdownDirective } from "../../../directives/flowbite-dropdown.directive";
import {
  MemoryBenchmarkGroup,
  MemoryBenchmarkMeta,
  MemoryDetailsServer,
} from "./memory-chart.types";

@Component({
  selector: "app-server-memory-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    BaseChartDirective,
    FlowbiteDropdownDirective,
    BenchmarkIconPipe,
  ],
  templateUrl: "./server-memory-chart.component.html",
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class ServerMemoryChartComponent {
  private static nextDropdownId = 0;

  private platformId = inject(PLATFORM_ID);
  private builder = inject(MemoryChartBuilderService);
  private tooltipService = inject(ChartTooltipService);

  memoryChartDropdown = viewChild(FlowbiteDropdownDirective);
  tooltip = viewChild<ElementRef<HTMLElement>>("tooltipDefault");

  serverDetails = input<MemoryDetailsServer | undefined>(undefined);
  benchmarksByCategory = input<MemoryBenchmarkGroup[]>([]);
  benchmarkMeta = input<MemoryBenchmarkMeta[]>([]);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly lineChartType = "line" as const;
  readonly buttonId = `bw_mem_button_details_${ServerMemoryChartComponent.nextDropdownId++}`;
  readonly optionsId = this.buttonId.replace("button", "options");

  tooltipContent = signal("");
  readonly availableMemoryChartOptions = computed<
    ServerDetailsMemoryChartOption[]
  >(() => this.builder.getAvailableDetailsOptions(this.benchmarksByCategory()));
  readonly selectedMemoryChartOptionId = signal<string>("membench-bandwidth");
  readonly currentMemoryChartOption = computed(
    () =>
      this.availableMemoryChartOptions().find(
        (option) => option.id === this.selectedMemoryChartOptionId(),
      ) || this.availableMemoryChartOptions()[0],
  );
  readonly chart = computed(() => {
    const option = this.currentMemoryChartOption();
    const serverDetails = this.serverDetails();

    if (!option || !serverDetails) {
      return undefined;
    }

    return this.builder.buildServerDetailsChart({
      option,
      serverDetails,
      benchmarksByCategory: this.benchmarksByCategory(),
      benchmarkMeta: this.benchmarkMeta(),
    });
  });
  readonly chartData = computed(() => this.chart()?.data);
  readonly chartOptions = computed(() => this.chart()?.options);
  readonly currentMemoryChartInfo = computed(() =>
    this.builder.getDetailsDescription(
      this.currentMemoryChartOption(),
      this.benchmarkMeta(),
    ),
  );
  readonly currentMemoryChartIcon = computed(() =>
    this.builder.getDirectionIcon(
      this.currentMemoryChartOption(),
      this.benchmarkMeta(),
    ),
  );
  readonly currentMemoryChartOrderTooltip = computed(() =>
    this.builder.getOrderTooltip(
      this.currentMemoryChartOption(),
      this.benchmarkMeta(),
    ),
  );

  constructor() {
    effect(() => {
      const options = this.availableMemoryChartOptions();
      const selectedStillValid = options.some(
        (option) => option.id === this.selectedMemoryChartOptionId(),
      );

      if (!options.length) {
        if (this.selectedMemoryChartOptionId() !== "") {
          this.selectedMemoryChartOptionId.set("");
        }
        return;
      }

      if (!selectedStillValid) {
        this.selectedMemoryChartOptionId.set(options[0].id);
      }
    });
  }

  selectMemoryChartOption(option: ServerDetailsMemoryChartOption): void {
    this.selectedMemoryChartOptionId.set(option.id);
    this.memoryChartDropdown()?.hide();
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
