import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import { installChartLegendDefaults } from "./chart-legend.utils";
import { chartTooltipDefaults } from "./chart-tooltip.utils";

Chart.register(...registerables, annotationPlugin);
installChartLegendDefaults();

export function provideAppCharts() {
  return provideCharts(withDefaultRegisterables(annotationPlugin), {
    defaults: chartTooltipDefaults,
  });
}
