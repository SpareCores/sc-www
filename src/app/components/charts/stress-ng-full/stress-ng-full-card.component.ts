import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import {
  LucideCircleArrowDown,
  LucideDynamicIcon,
  LucideInfo,
  LucideTriangleAlert,
} from "@lucide/angular";
import { Benchmark, BenchmarkScore } from "../../../../../sdk/data-contracts";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import { Button } from "../../button/button";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { getBenchmarkMetaNote } from "../shared/chart-tooltip.utils";
import {
  STRESS_NG_TITLE,
  buildStressNgSections,
  splitStressNgColumns,
} from "./stress-ng-full.utils";

@Component({
  selector: "sc-stress-ng-full-card",
  imports: [
    NgTemplateOutlet,
    LucideCircleArrowDown,
    LucideDynamicIcon,
    LucideInfo,
    LucideTriangleAlert,
    BenchmarkIconPipe,
    Button,
  ],
  templateUrl: "./stress-ng-full-card.component.html",
  styleUrl: "./stress-ng-full-card.component.scss",
})
export class StressNgFullCardComponent {
  private tooltipService = inject(ChartTooltipService);

  benchmarkMeta = input<Benchmark[] | null>([]);
  benchmarkScores = input<BenchmarkScore[] | null>([]);
  collapsible = input(true);

  tooltip = viewChild<ElementRef<HTMLElement>>("tooltip");
  tooltipContent = signal("");
  expanded = signal(false);

  readonly title = STRESS_NG_TITLE;

  sections = computed(() =>
    buildStressNgSections(this.benchmarkMeta(), this.benchmarkScores()),
  );

  columns = computed(() => splitStressNgColumns(this.sections()));

  collapsed = computed(() => this.collapsible() && !this.expanded());

  toggleExpanded() {
    this.expanded.update((expanded) => !expanded);
  }

  showTooltip(
    event: MouseEvent,
    content: string | null | undefined,
    variant?: "warning",
  ) {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event,
      content: content ?? undefined,
      variant,
      onShow: (tooltipContent) => {
        this.tooltipContent.set(tooltipContent);
      },
    });
  }

  rowNote(benchmarkId: string): string {
    return (
      getBenchmarkMetaNote(this.benchmarkMeta() ?? undefined, benchmarkId, {
        includeBenchmarkName: false,
      }) || ""
    );
  }

  hideTooltip() {
    this.tooltipService.hide(this.tooltip()?.nativeElement);
  }
}
