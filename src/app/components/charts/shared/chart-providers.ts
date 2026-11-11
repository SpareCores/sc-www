import { Chart, Plugin, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import { installChartLegendDefaults } from "./chart-legend.utils";
import { chartTooltipDefaults } from "./chart-tooltip.utils";
import {
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from "@angular/core";
import { injectIsE2eRun } from "../../../core/e2e/e2e-readiness-providers";

Chart.register(...registerables, annotationPlugin);
installChartLegendDefaults();

const E2E_RENDER_MARKER_PLUGIN: Plugin = {
  id: "scE2eRenderMarker",
  beforeUpdate(chart) {
    chart.canvas.dataset["chartRendered"] = "false";
  },
  afterRender(chart) {
    chart.canvas.dataset["chartHasData"] = String(
      chart.data.datasets.some((dataset) => dataset.data.length > 0),
    );
    chart.canvas.dataset["chartRendered"] = "true";
  },
};

export function provideAppCharts() {
  return makeEnvironmentProviders([
    provideCharts(withDefaultRegisterables(annotationPlugin), {
      defaults: chartTooltipDefaults,
    }),
    provideEnvironmentInitializer(configureChartsForE2E),
  ]);
}

function configureChartsForE2E() {
  if (!injectIsE2eRun()) {
    return;
  }

  Chart.defaults.animation = false;
  Chart.register(E2E_RENDER_MARKER_PLUGIN);
}
