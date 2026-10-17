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
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { getBenchmarkMetaNote } from "../shared/chart-tooltip.utils";
import {
  NVBANDWIDTH_TITLE,
  NvbandwidthSection,
  buildNvbandwidthEnvironmentRows,
  buildNvbandwidthSections,
  formatNvbandwidthScore,
  nvbandwidthGroupId,
} from "./nvbandwidth.utils";

const RIGHT_COLUMN_GROUPS = ["efficiency"];

function isRightColumnSection(section: NvbandwidthSection<string>): boolean {
  return RIGHT_COLUMN_GROUPS.includes(
    nvbandwidthGroupId(section.rows[0]?.benchmark.benchmark_id),
  );
}

@Component({
  selector: "sc-nvbandwidth-card",
  imports: [
    NgTemplateOutlet,
    LucideCircleArrowDown,
    LucideDynamicIcon,
    LucideInfo,
    LucideTriangleAlert,
    BenchmarkIconPipe,
  ],
  templateUrl: "./nvbandwidth-card.component.html",
  styleUrl: "./nvbandwidth-card.component.scss",
})
export class NvbandwidthCardComponent {
  private tooltipService = inject(ChartTooltipService);

  benchmarkMeta = input<Benchmark[] | null>([]);
  benchmarkScores = input<BenchmarkScore[] | null>([]);

  tooltip = viewChild<ElementRef<HTMLElement>>("tooltip");
  tooltipContent = signal("");

  readonly title = NVBANDWIDTH_TITLE;

  sections = computed(() =>
    buildNvbandwidthSections(this.benchmarkMeta(), (benchmark) => {
      const score = this.benchmarkScores()?.find(
        (s) => s.benchmark_id === benchmark.benchmark_id,
      )?.score;
      return score == null
        ? null
        : [formatNvbandwidthScore(score, benchmark.unit)];
    }),
  );

  leftSections = computed(() =>
    this.sections().filter((section) => !isRightColumnSection(section)),
  );

  rightSections = computed(() =>
    this.sections().filter((section) => isRightColumnSection(section)),
  );

  environmentRows = computed(() =>
    buildNvbandwidthEnvironmentRows(this.benchmarkMeta(), [
      this.benchmarkScores(),
    ]),
  );

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
