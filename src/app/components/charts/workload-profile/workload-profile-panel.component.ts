import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
  output,
} from "@angular/core";
import {
  LucideDynamicIcon,
  LucideCircleArrowUp,
  LucideInfo,
} from "@lucide/angular";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import { FaqComponent } from "../../faq/faq.component";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { WorkloadProfileRadarChartComponent } from "./workload-profile-radar-chart.component";
import {
  WorkloadProfileBenchmarkMeta,
  WorkloadProfileCompareServer,
  WorkloadProfileDetailsServer,
} from "./workload-profile-radar-chart.types";
import { filterWorkloadProfileBenchmarks } from "./workload-profile.utils";

@Component({
  selector: "app-workload-profile-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideDynamicIcon,
    LucideCircleArrowUp,
    LucideInfo,
    BenchmarkIconPipe,
    FaqComponent,
    WorkloadProfileRadarChartComponent,
  ],
  templateUrl: "./workload-profile-panel.component.html",
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class WorkloadProfilePanelComponent {
  private tooltipService = inject(ChartTooltipService);

  tooltip = viewChild<ElementRef<HTMLElement>>("tooltipDefault");

  layout = input<"details" | "compare">("compare");
  benchmarkMeta = input<WorkloadProfileBenchmarkMeta[]>([]);
  servers = input<WorkloadProfileCompareServer[]>([]);
  serverDetails = input<WorkloadProfileDetailsServer | undefined>(undefined);
  showHeader = input(true);

  readonly layoutChanged = output<void>();
  readonly activeFaq = signal(-1);

  readonly workloadProfileBenchmarks = computed(() =>
    filterWorkloadProfileBenchmarks(this.benchmarkMeta()),
  );

  readonly hasWorkloadProfiles = computed(
    () => this.workloadProfileBenchmarks().length > 0,
  );

  readonly faqQuestions = computed(() =>
    this.workloadProfileBenchmarks()
      .filter((benchmark) => benchmark.description?.trim())
      .map((benchmark) => ({
        question: benchmark.name,
        answer: benchmark.description ?? "",
      })),
  );

  tooltipContent = "";

  showTooltip(el: MouseEvent, content?: string): void {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event: el,
      content,
      onShow: (text) => {
        this.tooltipContent = text;
      },
    });
  }

  hideTooltip(): void {
    this.tooltipService.hide(this.tooltip()?.nativeElement);
    this.tooltipContent = "";
  }

  onFaqChanged(index: number): void {
    this.activeFaq.set(index);
    this.layoutChanged.emit();
  }
}
