import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  input,
} from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { ChartConfiguration, ChartData } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { LucideAngularModule } from "lucide-angular";
import { Benchmark, Status } from "../../../../sdk/data-contracts";
import {
  BenchmarkHistogramBin,
  BenchmarkWorkloadMockData,
} from "../../mocks/benchmark-workload.mock.interface";

export interface BenchmarkConfigEntry {
  key: string;
  description: string;
  examples: string[];
}

@Component({
  selector: "app-benchmark-workload",
  imports: [LucideAngularModule, BaseChartDirective, DecimalPipe],
  templateUrl: "./benchmark-workload.component.html",
  styleUrl: "./benchmark-workload.component.scss",
})
export class BenchmarkWorkloadComponent implements OnInit {
  readonly benchmark = input.required<Benchmark>();
  readonly mockData = input<BenchmarkWorkloadMockData | undefined>(undefined);

  readonly isActive = computed(
    () => !this.benchmark().status || this.benchmark().status === Status.Active,
  );

  readonly unit = computed(
    () => this.benchmark().unit ?? this.mockData()?.unit ?? "",
  );

  readonly hasConfigFields = computed(() => {
    const fields = this.benchmark().config_fields as
      | Record<string, string>
      | undefined;
    return fields && Object.keys(fields).length > 0;
  });

  configEntries: BenchmarkConfigEntry[] = [];
  histogramData: ChartData<"bar"> | null = null;
  histogramOptions: ChartConfiguration<"bar">["options"] = null!;

  tooltipContent = "";
  @ViewChild("tooltipEl") tooltipEl!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.buildConfigEntries();
    this.buildHistogram();
    this.buildHistogramOptions();
  }

  private buildConfigEntries(): void {
    const fields = this.benchmark().config_fields as
      | Record<string, string>
      | undefined;
    if (!fields) {
      this.configEntries = [];
      return;
    }
    const examples = this.mockData()?.config_examples ?? {};
    this.configEntries = Object.entries(fields).map(([key, description]) => ({
      key,
      description: description as string,
      examples: examples[key] ?? [],
    }));
  }

  private buildHistogram(): void {
    const bins = this.mockData()?.histogram;
    if (!bins || bins.length === 0) {
      this.histogramData = null;
      return;
    }
    this.histogramData = {
      labels: bins.map((b) => this.formatBinLabel(b)),
      datasets: [
        {
          data: bins.map((b) => b.N),
          label: "Server types",
          backgroundColor: "#34d399",
          hoverBackgroundColor: "#6ee7b7",
          borderWidth: 0,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
      ],
    };
  }

  private buildHistogramOptions(): void {
    const yLabel = "Server types";
    const xLabel = this.unit() ? `Score (${this.unit()})` : "Score";

    this.histogramOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const bin = this.mockData()?.histogram?.[items[0].dataIndex];
              if (!bin) return items[0].label;
              return `${this.formatValue(bin.low)} – ${this.formatValue(bin.high)} ${this.unit()}`;
            },
            label: (item) => ` ${item.formattedValue} server types`,
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
  }

  private formatBinLabel(bin: BenchmarkHistogramBin): string {
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
    const mock = this.mockData();
    if (!mock) return "N/A";
    return `${this.formatValue(mock.measurement_min)} – ${this.formatValue(mock.measurement_max)}`;
  }

  showTooltip(ev: MouseEvent, content: string): void {
    const tooltip = this.tooltipEl?.nativeElement;
    if (!tooltip) return;
    const rect = (ev.target as HTMLElement).getBoundingClientRect();
    const scrollY = window.scrollY ?? document.documentElement.scrollTop;
    tooltip.style.left = `${rect.right + 6}px`;
    tooltip.style.top = `${rect.top - 10 + scrollY}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
    this.tooltipContent = content;
  }

  hideTooltip(): void {
    const tooltip = this.tooltipEl?.nativeElement;
    if (!tooltip) return;
    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
  }
}
