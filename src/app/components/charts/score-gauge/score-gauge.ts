import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  input,
} from "@angular/core";
import { ChartConfiguration } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { chartColors } from "../shared/chart-colors.constants";

const SCORE_GAUGE_TRACK_COLOR = chartColors["sky-900"];
const SCORE_GAUGE_FILL_COLOR = chartColors["emerald-400"];

const SCORE_GAUGE_OPTIONS: ChartConfiguration<"doughnut">["options"] = {
  responsive: true,
  maintainAspectRatio: false,
  circumference: 200,
  rotation: -100,
  cutout: "72%",
  layout: {
    padding: {
      top: 4,
      bottom: 4,
      left: 8,
      right: 8,
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
};

@Component({
  selector: "sc-score-gauge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  templateUrl: "./score-gauge.html",
  styleUrls: ["./score-gauge.css"],
})
export class ScoreGauge {
  private platformId = inject(PLATFORM_ID);

  value = input<number | null>(null);
  max = input<number | null>(null);
  displayValue = input("");
  label = input("");

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly options = SCORE_GAUGE_OPTIONS;

  readonly data = computed<ChartConfiguration<"doughnut">["data"]>(() => {
    const value = this.value();
    const max = this.max();
    const ratio =
      value !== null && max !== null && max > 0
        ? Math.min(Math.max(value / max, 0), 1)
        : 0;

    return {
      datasets: [
        {
          data: [ratio, 1 - ratio],
          backgroundColor: [SCORE_GAUGE_FILL_COLOR, SCORE_GAUGE_TRACK_COLOR],
          borderWidth: 0,
        },
      ],
    };
  });
}
