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
  LucideTriangleAlert,
} from "@lucide/angular";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import { AccordionComponent } from "../../accordion/accordion.component";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { getBenchmarkMetaNotes } from "../shared/chart-tooltip.utils";
import { WorkloadProfileRadarChartComponent } from "./workload-profile-radar-chart.component";
import {
  WorkloadProfileBenchmarkMeta,
  WorkloadProfileCompareServer,
  WorkloadProfileDetailsServer,
} from "./workload-profile-radar-chart.types";
import {
  WORKLOAD_PROFILE_INFO_TOOLTIP,
  filterWorkloadProfileBenchmarks,
  hasWorkloadProfileChartData,
} from "./workload-profile.utils";

@Component({
  selector: "app-workload-profile-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideDynamicIcon,
    LucideCircleArrowUp,
    LucideInfo,
    LucideTriangleAlert,
    BenchmarkIconPipe,
    AccordionComponent,
    WorkloadProfileRadarChartComponent,
  ],
  templateUrl: "./workload-profile-panel.component.html",
  styleUrls: ["./workload-profile-panel.component.scss"],
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
  readonly activeAccordionIndex = signal(-1);

  readonly workloadProfileBenchmarks = computed(() =>
    filterWorkloadProfileBenchmarks(this.benchmarkMeta()),
  );

  readonly hasWorkloadProfiles = computed(() => {
    if (this.layout() === "details") {
      return hasWorkloadProfileChartData({
        benchmarkMeta: this.benchmarkMeta(),
        benchmarkScores: this.serverDetails()?.benchmark_scores,
      });
    }

    return hasWorkloadProfileChartData({
      benchmarkMeta: this.benchmarkMeta(),
      servers: this.servers(),
    });
  });

  readonly accordionItems = computed(() =>
    this.workloadProfileBenchmarks()
      .filter((benchmark) => benchmark.description?.trim())
      .map((benchmark) => ({
        title: benchmark.name.split(": ").pop() ?? benchmark.name,
        content: benchmark.description ?? "",
        note: this.getBenchmarkNote(benchmark.benchmark_id),
      })),
  );

  readonly workloadProfileInfoTooltip = WORKLOAD_PROFILE_INFO_TOOLTIP;

  readonly workloadProfileMetaNote = computed(() =>
    getBenchmarkMetaNotes(
      this.benchmarkMeta(),
      this.workloadProfileBenchmarks().map(
        (benchmark) => benchmark.benchmark_id,
      ),
    ),
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

  showWarningTooltip(el: MouseEvent, content?: string): void {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event: el,
      content,
      variant: "warning-wide",
      onShow: (text) => {
        this.tooltipContent = text;
      },
    });
  }

  hideTooltip(): void {
    this.tooltipService.hide(this.tooltip()?.nativeElement);
    this.tooltipContent = "";
  }

  onAccordionChanged(index: number): void {
    this.activeAccordionIndex.set(index);
    this.layoutChanged.emit();
  }

  private getBenchmarkNote(benchmarkId: string): string | undefined {
    if (this.layout() === "details") {
      const note = this.serverDetails()
        ?.benchmark_scores?.find((score) => score.benchmark_id === benchmarkId)
        ?.note?.trim();

      return note || undefined;
    }

    const notes = new Set<string>();

    for (const server of this.servers()) {
      const note = server.benchmark_scores
        ?.find((score) => score.benchmark_id === benchmarkId)
        ?.note?.trim();

      if (note) {
        notes.add(note);
      }
    }

    return notes.size ? [...notes].join("\n") : undefined;
  }
}
