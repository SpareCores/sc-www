import {
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { DecimalPipe, isPlatformBrowser } from "@angular/common";
import { ChartConfiguration, ChartData } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { LucideAngularModule } from "lucide-angular";
import { Status } from "../../../../sdk/data-contracts";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import {
  BenchmarkWorkloadExample,
  BenchmarkWorkloadItem,
} from "../../pages/benchmark-workloads/benchmark-workloads.models";

export interface BenchmarkConfigEntry {
  key: string;
  description: string;
  examples: BenchmarkWorkloadExample[];
}

interface HistogramBin {
  low: number;
  high: number;
  count: number;
}

@Component({
  selector: "app-benchmark-workload",
  imports: [LucideAngularModule, BaseChartDirective, DecimalPipe],
  templateUrl: "./benchmark-workload.component.html",
  styleUrl: "./benchmark-workload.component.scss",
})
export class BenchmarkWorkloadComponent {
  private platformId = inject(PLATFORM_ID);
  private uiTooltip = inject(UiTooltipService);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly workload = input.required<BenchmarkWorkloadItem>();

  readonly isActive = computed(
    () => this.workload().status !== Status.Inactive,
  );

  readonly unit = computed(() => this.workload().unit ?? "");

  readonly hasConfigs = computed(() => this.configEntries().length > 0);

  readonly configEntries = computed<BenchmarkConfigEntry[]>(() => {
    const configs = this.workload().configs;
    if (!configs) {
      return [];
    }
    return Object.entries(configs).map(([key, config]) => ({
      key,
      description: config.description,
      examples: config.examples,
    }));
  });

  readonly histogramBins = computed<HistogramBin[]>(() => {
    const histogram = this.workload().histogram;
    if (!histogram) {
      return [];
    }

    const { breakpoints, counts } = histogram;
    if (breakpoints.length !== counts.length + 1 || counts.length === 0) {
      return [];
    }

    return counts.map((count, index) => ({
      low: breakpoints[index],
      high: breakpoints[index + 1],
      count,
    }));
  });

  readonly histogramData = computed<ChartData<"bar"> | undefined>(() => {
    const bins = this.histogramBins();
    if (bins.length === 0) {
      return undefined;
    }
    return {
      labels: bins.map((b) => this.formatBinLabel(b)),
      datasets: [
        {
          data: bins.map((b) => b.count),
          label: "Measurements",
          backgroundColor: "#34d399",
          hoverBackgroundColor: "#6ee7b7",
          borderWidth: 0,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
      ],
    };
  });

  readonly histogramOptions = computed<ChartConfiguration<"bar">["options"]>(
    () => {
      const yLabel = "Measurements";
      const xLabel = this.unit() ? `Score (${this.unit()})` : "Score";

      return {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                const bin = this.histogramBins()[items[0].dataIndex];
                if (!bin) return items[0].label;
                return `${this.formatValue(bin.low)} – ${this.formatValue(bin.high)} ${this.unit()}`;
              },
              label: (item) => ` ${item.formattedValue} measurements`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#FFF",
              maxRotation: 45,
              font: { size: 10 },
            },
            grid: { color: "rgba(75,85,99,0.4)" },
            title: {
              display: true,
              text: xLabel,
              color: "#FFF",
              font: { size: 11 },
            },
          },
          y: {
            ticks: { color: "#FFF" },
            grid: { color: "rgba(75,85,99,0.4)" },
            title: {
              display: true,
              text: yLabel,
              color: "#FFF",
              font: { size: 11 },
            },
          },
        },
      };
    },
  );

  tooltipContent = signal("");
  tooltipEl = viewChild<ElementRef<HTMLElement>>("tooltipEl");

  private formatBinLabel(bin: HistogramBin): string {
    return `${this.formatValue(bin.low)}–${this.formatValue(bin.high)}`;
  }

  formatValue(n: number): string {
    if (n === 0) return "0";
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${+(n / 1_000).toFixed(1)}K`;
    if (abs < 1 && abs > 0) return +n.toPrecision(3) + "";
    return String(Math.round(n * 10) / 10);
  }

  formatRange(): string {
    const bins = this.histogramBins();
    if (bins.length === 0) return "N/A";
    return `${this.formatValue(bins[0].low)} – ${this.formatValue(bins[bins.length - 1].high)}`;
  }

  showTooltip(ev: MouseEvent, content: string): void {
    const tooltip = this.tooltipEl()?.nativeElement;
    if (!tooltip) return;

    this.tooltipContent.set(content);
    this.uiTooltip.show(tooltip, ev, {
      left: "anchor-right",
      top: "anchor-above",
    });
  }

  hideTooltip(): void {
    const tooltip = this.tooltipEl()?.nativeElement;
    if (!tooltip) return;

    this.uiTooltip.hide(tooltip);
  }
}
