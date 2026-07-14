import annotationPlugin from "chartjs-plugin-annotation";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import { chartTooltipDefaults } from "./chart-tooltip.utils";

export function provideAppCharts() {
  return provideCharts(withDefaultRegisterables(annotationPlugin), {
    defaults: chartTooltipDefaults,
  });
}
