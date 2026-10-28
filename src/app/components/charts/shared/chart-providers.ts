import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import { installChartLegendDefaults } from "./chart-legend.utils";
import { chartTooltipDefaults } from "./chart-tooltip.utils";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from "@angular/core";

Chart.register(...registerables, annotationPlugin);
installChartLegendDefaults();

export const E2E_DISABLE_CHART_ANIMATIONS_FLAG =
  "__scE2eDisableChartAnimations";

export function provideAppCharts() {
  return makeEnvironmentProviders([
    provideCharts(withDefaultRegisterables(annotationPlugin), {
      defaults: chartTooltipDefaults,
    }),
    provideEnvironmentInitializer(disableChartAnimationsForE2E),
  ]);
}

function disableChartAnimationsForE2E() {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return;
  }

  const win = inject(DOCUMENT).defaultView as
    | (Window & { [E2E_DISABLE_CHART_ANIMATIONS_FLAG]?: boolean })
    | null;

  if (win?.[E2E_DISABLE_CHART_ANIMATIONS_FLAG] === true) {
    Chart.defaults.animation = false;
  }
}
