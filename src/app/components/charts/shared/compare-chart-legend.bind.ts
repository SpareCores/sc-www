import { inject } from "@angular/core";
import {
  applyCompareDatasetVisibility,
  withCompareLegendBehavior,
} from "./chart-legend.utils";
import { CompareChartLegendVisibility } from "./compare-chart-legend-visibility";

export function injectCompareLegendVisibility() {
  return inject(CompareChartLegendVisibility, { optional: true });
}

export function syncCompareLegendData<T>(
  data: T | undefined,
  visibility: CompareChartLegendVisibility | null | undefined,
): T | undefined {
  if (!data) {
    return data;
  }

  return applyCompareDatasetVisibility(
    data as T & { datasets: unknown[] },
    visibility?.visibilityOverrides() ?? new Map<string, boolean>(),
  ) as T;
}

export function syncCompareLegendOptions<T extends { plugins?: object }>(
  options: T | undefined,
  visibility: CompareChartLegendVisibility | null | undefined,
): T | undefined {
  if (!options) {
    return options;
  }

  return withCompareLegendBehavior(options, {
    onVisibilityChange: (identity, hidden) =>
      visibility?.setHidden(identity, hidden),
  });
}

export function bindCompareLegendChart<
  TData extends { datasets: unknown[] },
  TOptions extends { plugins?: object } | undefined,
>(
  chart: { data: TData; options: TOptions } | undefined,
  visibility: CompareChartLegendVisibility | null | undefined,
): { data: TData; options: TOptions } | undefined {
  if (!chart) {
    return undefined;
  }

  return {
    data: syncCompareLegendData(chart.data, visibility) as TData,
    options: syncCompareLegendOptions(
      chart.options as (TOptions & { plugins?: object }) | undefined,
      visibility,
    ) as TOptions,
  };
}
