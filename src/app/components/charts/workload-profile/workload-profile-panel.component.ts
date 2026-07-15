import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
  output,
} from "@angular/core";
import {
  LucideDynamicIcon,
  LucideCircleArrowUp,
  LucideChevronDown,
  LucideInfo,
  LucideTriangleAlert,
} from "@lucide/angular";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, Plugin, ArcElement } from "chart.js";
import { BenchmarkIconPipe } from "../../../pipes/benchmark-icon.pipe";
import { AccordionComponent } from "../../accordion/accordion.component";
import { FlowbiteDropdownDirective } from "../../../directives/flowbite-dropdown.directive";
import { ChartTooltipService } from "../shared/chart-tooltip.service";
import { getBenchmarkMetaNotes } from "../shared/chart-tooltip.utils";
import { WorkloadProfileRadarChartComponent } from "./workload-profile-radar-chart.component";
import {
  WorkloadProfileBenchmarkMeta,
  WorkloadProfileCompareServer,
  WorkloadProfileDetailsServer,
} from "./workload-profile-radar-chart.types";
import {
  buildWorkloadProfileBreakdownTable,
  compactBreakdownUnit,
  formatBreakdownNumericValue,
  formatBreakdownPercent,
  formatImpactPercent,
  getImpactColorClass,
} from "./workload-profile-breakdown.utils";
import {
  WORKLOAD_PROFILE_INFO_TOOLTIP,
  formatWorkloadProfileLabel,
  hasWorkloadProfileScore,
  resolveWorkloadProfileBenchmarksWithData,
} from "./workload-profile.utils";

const SCORE_GAUGE_MAX = 2;
const SCORE_GAUGE_TRACK_COLOR = "#0C4A6E";
const SCORE_GAUGE_FILL_COLOR = "#34D399";

const scoreGaugeTickPlugin: Plugin<"doughnut"> = {
  id: "workloadProfileScoreGaugeTicks",
  afterDraw(chart) {
    const { ctx } = chart;
    const datasetMeta = chart.getDatasetMeta(0);

    if (!datasetMeta?.data[0]) {
      return;
    }

    const arc = datasetMeta.data[0] as ArcElement;
    const centerX = arc.x;
    const centerY = arc.y;
    const outerRadius = arc.outerRadius;
    const innerRadius = arc.innerRadius;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const ratio = 1 / SCORE_GAUGE_MAX;
    const angle = startAngle + (endAngle - startAngle) * ratio;
    const tickExtensionInner = 4;
    const tickExtensionOuter = 4;
    const tickOuterX =
      centerX + Math.cos(angle) * (outerRadius + tickExtensionOuter);
    const tickOuterY =
      centerY + Math.sin(angle) * (outerRadius + tickExtensionOuter);
    const tickInnerX =
      centerX + Math.cos(angle) * (innerRadius - tickExtensionInner);
    const tickInnerY =
      centerY + Math.sin(angle) * (innerRadius - tickExtensionInner);
    const labelRadius = outerRadius + tickExtensionOuter + 8;
    const labelX = centerX + Math.cos(angle) * labelRadius;
    const labelY = centerY + Math.sin(angle) * labelRadius;

    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.beginPath();
    ctx.moveTo(tickInnerX, tickInnerY);
    ctx.lineTo(tickOuterX, tickOuterY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    ctx.fillText("Fleet median", labelX, labelY);
    ctx.restore();
  },
};

function buildScoreGaugeChart(score: number | null | undefined): {
  data: ChartConfiguration<"doughnut">["data"];
  options: ChartConfiguration<"doughnut">["options"];
  displayValue: string;
} {
  const hasScore = hasWorkloadProfileScore(score);
  const clampedValue = hasScore
    ? Math.min(Math.max(score, 0), SCORE_GAUGE_MAX)
    : 0;
  const displayValue = hasScore
    ? score.toLocaleString("en-US", { maximumFractionDigits: 3 })
    : "—";

  return {
    displayValue,
    data: {
      datasets: [
        {
          data: [clampedValue, SCORE_GAUGE_MAX - clampedValue],
          backgroundColor: [SCORE_GAUGE_FILL_COLOR, SCORE_GAUGE_TRACK_COLOR],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2,
      circumference: 200,
      rotation: -100,
      cutout: "72%",
      layout: {
        padding: {
          top: 8,
          bottom: 4,
          left: 16,
          right: 16,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    },
  };
}

@Component({
  selector: "app-workload-profile-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideDynamicIcon,
    LucideCircleArrowUp,
    LucideChevronDown,
    LucideInfo,
    LucideTriangleAlert,
    BenchmarkIconPipe,
    AccordionComponent,
    WorkloadProfileRadarChartComponent,
    BaseChartDirective,
    FlowbiteDropdownDirective,
  ],
  templateUrl: "./workload-profile-panel.component.html",
  styleUrls: ["./workload-profile-panel.component.scss"],
})
export class WorkloadProfilePanelComponent {
  private static nextId = 0;

  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private tooltipService = inject(ChartTooltipService);

  tooltip = viewChild<ElementRef<HTMLElement>>("tooltipDefault");
  scoreGaugeDirective = viewChild<BaseChartDirective>("scoreGauge");
  profileDropdown = viewChild<FlowbiteDropdownDirective>("profileDropdown");

  readonly idBase = `workload_profile_panel_${WorkloadProfilePanelComponent.nextId++}`;
  readonly profileButtonId = `${this.idBase}_button`;
  readonly profileOptionsId = `${this.idBase}_options`;

  layout = input<"details" | "compare">("compare");
  benchmarkMeta = input<WorkloadProfileBenchmarkMeta[]>([]);
  servers = input<WorkloadProfileCompareServer[]>([]);
  serverDetails = input<WorkloadProfileDetailsServer | undefined>(undefined);
  showHeader = input(true);

  readonly layoutChanged = output<void>();
  readonly activeAccordionIndex = signal(-1);
  readonly selectedProfileId = signal<string | undefined>(undefined);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly workloadProfileBenchmarks = computed(() =>
    resolveWorkloadProfileBenchmarksWithData({
      benchmarkMeta: this.benchmarkMeta(),
      layout: this.layout(),
      serverDetails: this.serverDetails(),
      servers: this.servers(),
    }),
  );
  readonly hasWorkloadProfiles = computed(
    () => this.workloadProfileBenchmarks().length > 0,
  );
  readonly profileDropdownItems = computed(() =>
    this.workloadProfileBenchmarks().map((benchmark) => ({
      id: benchmark.benchmark_id,
      title: formatWorkloadProfileLabel(benchmark.name),
    })),
  );
  readonly accordionItems = computed(() =>
    this.workloadProfileBenchmarks()
      .filter((benchmark) => benchmark.description?.trim())
      .map((benchmark) => ({
        title: formatWorkloadProfileLabel(benchmark.name),
        content: benchmark.description ?? "",
        note: this.getCompareBenchmarkNote(benchmark.benchmark_id),
      })),
  );
  readonly selectedProfileBenchmark = computed(() => {
    const profileId = this.selectedProfileId();

    if (!profileId) {
      return undefined;
    }

    return this.workloadProfileBenchmarks().find(
      (item) => item.benchmark_id === profileId,
    );
  });
  readonly selectedBenchmarkScore = computed(() => {
    const benchmark = this.selectedProfileBenchmark();

    if (!benchmark) {
      return undefined;
    }

    return this.serverDetails()?.benchmark_scores?.find(
      (score) => score.benchmark_id === benchmark.benchmark_id,
    );
  });
  readonly selectedProfileItem = computed(() => {
    const benchmark = this.selectedProfileBenchmark();

    if (!benchmark) {
      return undefined;
    }

    const note = this.selectedBenchmarkScore()?.note?.trim();

    return {
      id: benchmark.benchmark_id,
      title: formatWorkloadProfileLabel(benchmark.name),
      content: benchmark.description ?? "",
      note: note || undefined,
    };
  });
  readonly selectedBreakdownTable = computed(() => {
    const profile = this.selectedProfileBenchmark();

    if (this.layout() !== "details" || !profile) {
      return undefined;
    }

    return buildWorkloadProfileBreakdownTable({
      profile,
      benchmarkMeta: this.benchmarkMeta(),
      scoreBreakdown: this.selectedBenchmarkScore()?.score_breakdown,
    });
  });
  readonly scoreGaugeChart = computed(() =>
    buildScoreGaugeChart(this.selectedBenchmarkScore()?.score),
  );

  readonly workloadProfileInfoTooltip = WORKLOAD_PROFILE_INFO_TOOLTIP;
  readonly formatBreakdownNumericValue = formatBreakdownNumericValue;
  readonly compactBreakdownUnit = compactBreakdownUnit;
  readonly formatBreakdownPercent = formatBreakdownPercent;
  readonly formatImpactPercent = formatImpactPercent;
  readonly getImpactColorClass = getImpactColorClass;
  readonly scoreGaugePlugins = [scoreGaugeTickPlugin];

  readonly workloadProfileMetaNote = computed(() =>
    getBenchmarkMetaNotes(
      this.benchmarkMeta(),
      this.workloadProfileBenchmarks().map(
        (benchmark) => benchmark.benchmark_id,
      ),
    ),
  );

  tooltipContent = "";

  constructor() {
    effect(() => {
      if (this.layout() !== "details") {
        return;
      }

      const items = this.profileDropdownItems();
      const currentId = this.selectedProfileId();

      if (!items.length) {
        this.selectedProfileId.set(undefined);
        return;
      }

      if (!currentId || !items.some((item) => item.id === currentId)) {
        this.selectedProfileId.set(items[0].id);
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.destroyRef.onDestroy(() => {
        this.scoreGaugeDirective()?.chart?.destroy();
      });
    }
  }

  showTooltip(
    el: MouseEvent,
    content?: string,
    variant?: "warning-wide",
  ): void {
    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event: el,
      content,
      variant,
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

  onProfileSelected(profileId: string): void {
    this.selectedProfileId.set(profileId);
    this.layoutChanged.emit();
  }

  selectProfile(profileId: string): void {
    this.onProfileSelected(profileId);
    this.profileDropdown()?.hide();
  }

  private getCompareBenchmarkNote(benchmarkId: string): string | undefined {
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
