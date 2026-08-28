import {
  Chart,
  ChartDataset,
  ChartEvent,
  ChartType,
  LegendElement,
  LegendItem,
} from "chart.js";

export type CompareChartDataset = {
  serverCompareKey?: string;
  serverTooltipIdentity?: string;
  hidden?: boolean;
  configuredHidden?: boolean;
  data?: unknown;
};

type LegendGenerateLabels = (this: unknown, chart: Chart) => LegendItem[];

type LegendOnClick = (
  this: LegendElement<ChartType>,
  event: ChartEvent,
  legendItem: LegendItem,
  legend: LegendElement<ChartType>,
) => void;

type LegendHoverHandler = (
  this: LegendElement<ChartType>,
  event: ChartEvent,
  legendItem: LegendItem,
  legend: LegendElement<ChartType>,
) => void;

export const chartLegendLabels = {
  color: "#FFF",
  boxWidth: 40,
  boxHeight: 12,
  usePointStyle: false,
};

function isTranslucentColor(
  color: string | CanvasGradient | CanvasPattern | undefined,
): boolean {
  if (!color || typeof color !== "string") {
    return false;
  }

  const eightDigitHex = /^#([0-9a-fA-F]{8})$/.exec(color);
  if (eightDigitHex) {
    return parseInt(eightDigitHex[1].slice(6, 8), 16) < 255;
  }

  const rgba = /^rgba\(([^)]+)\)$/.exec(color);
  if (rgba) {
    const alpha = parseFloat(rgba[1].split(",").at(3)?.trim() ?? "1");
    return alpha < 1;
  }

  return false;
}

function resolveLegendSwatchColor(
  item: LegendItem,
): string | CanvasGradient | CanvasPattern | undefined {
  if (isTranslucentColor(item.fillStyle)) {
    return item.strokeStyle || item.fillStyle;
  }

  return item.fillStyle || item.strokeStyle;
}

function normalizeLegendItemStyle(item: LegendItem): LegendItem {
  const fillColor = resolveLegendSwatchColor(item);
  if (!fillColor) {
    return item;
  }

  return {
    ...item,
    lineWidth: 0,
    fillStyle: fillColor,
    strokeStyle: fillColor,
  };
}

function setLegendCursor(event: ChartEvent, cursor: string): void {
  const target = event.native?.target;
  if (target instanceof HTMLElement) {
    target.style.cursor = cursor;
  }
}

export function createLegendPointerOnHover(): LegendHoverHandler {
  return function onHover(event, legendItem, legend) {
    const { chart } = legend;
    const datasetIndex = legendItem.datasetIndex;
    if (
      datasetIndex !== undefined &&
      chart.isDatasetVisible(datasetIndex) &&
      countVisibleComparableDatasets(chart) <= 1
    ) {
      setLegendCursor(event, "not-allowed");
      return;
    }
    setLegendCursor(event, "pointer");
  };
}

export function createLegendPointerOnLeave(): LegendHoverHandler {
  return function onLeave(event) {
    setLegendCursor(event, "default");
  };
}

let nativeLegendGenerateLabels: LegendGenerateLabels | undefined;

export function captureNativeLegendHelpers(): void {
  if (!nativeLegendGenerateLabels) {
    nativeLegendGenerateLabels =
      Chart.defaults.plugins.legend.labels.generateLabels;
  }
}

export function datasetHasComparableData(
  dataset: CompareChartDataset | ChartDataset | undefined,
): boolean {
  if (!dataset) {
    return false;
  }

  const data = dataset.data;
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  return data.some((point) => pointHasComparableValue(point));
}

const COMPARABLE_POINT_KEYS = [
  "y",
  "r",
  "score",
  "value",
  "data",
  "compress",
  "decompress",
] as const;

function pointHasComparableValue(point: unknown): boolean {
  if (point === null || point === undefined) {
    return false;
  }
  if (typeof point === "number") {
    return Number.isFinite(point);
  }
  if (typeof point !== "object") {
    return false;
  }

  const record = point as unknown as Record<string, unknown>;
  return COMPARABLE_POINT_KEYS.some((key) => {
    const value = record[key];
    return typeof value === "number" && Number.isFinite(value);
  });
}

export function getCompareDatasetKey(
  dataset: CompareChartDataset | undefined,
): string {
  if (!dataset) {
    return "";
  }

  return (
    dataset.serverCompareKey?.trim() ||
    dataset.serverTooltipIdentity?.trim() ||
    ""
  );
}

export function countVisibleComparableDatasets(chart: {
  data: { datasets: ChartDataset[] };
  isDatasetVisible: (index: number) => boolean;
}): number {
  return chart.data.datasets.reduce((count, dataset, index) => {
    if (!datasetHasComparableData(dataset)) {
      return count;
    }
    return chart.isDatasetVisible(index) ? count + 1 : count;
  }, 0);
}

export function createNoDataFilteredGenerateLabels(): LegendGenerateLabels {
  return function generateLabels(this: unknown, chart: Chart): LegendItem[] {
    captureNativeLegendHelpers();
    const items = nativeLegendGenerateLabels!.call(this, chart);
    return items
      .filter((item) => {
        if (item.datasetIndex === undefined) {
          return false;
        }
        return datasetHasComparableData(chart.data.datasets[item.datasetIndex]);
      })
      .map(normalizeLegendItemStyle);
  };
}

export function createFilledRectLegendGenerateLabels(): LegendGenerateLabels {
  return function generateLabels(this: unknown, chart: Chart): LegendItem[] {
    captureNativeLegendHelpers();
    const items = nativeLegendGenerateLabels!.call(this, chart);
    return items.map(normalizeLegendItemStyle);
  };
}

export function createCompareLegendOnClick(options?: {
  onVisibilityChange?: (identity: string, hidden: boolean) => void;
}): LegendOnClick {
  return function onClick(
    this: LegendElement<ChartType>,
    _event: ChartEvent,
    legendItem: LegendItem,
    legend: LegendElement<ChartType>,
  ): void {
    const { chart } = legend;
    const datasetIndex = legendItem.datasetIndex;
    if (datasetIndex === undefined) {
      return;
    }

    const dataset = chart.data.datasets[datasetIndex] as CompareChartDataset;
    if (!datasetHasComparableData(dataset)) {
      return;
    }

    if (chart.isDatasetVisible(datasetIndex)) {
      if (countVisibleComparableDatasets(chart) <= 1) {
        return;
      }
      chart.hide(datasetIndex);
      const identity = getCompareDatasetKey(dataset);
      if (identity) {
        options?.onVisibilityChange?.(identity, true);
      }
      return;
    }

    chart.show(datasetIndex);
    const identity = getCompareDatasetKey(dataset);
    if (identity) {
      options?.onVisibilityChange?.(identity, false);
    }
  };
}

export function applyCompareDatasetVisibility<
  T extends { datasets: readonly unknown[] },
>(data: T, visibilityOverrides: ReadonlyMap<string, boolean>): T {
  return {
    ...data,
    datasets: data.datasets.map((dataset) => {
      const compareDataset = dataset as CompareChartDataset;
      const identity = getCompareDatasetKey(compareDataset);
      const configuredHidden =
        compareDataset.configuredHidden ?? !!compareDataset.hidden;
      const hiddenByData = !datasetHasComparableData(compareDataset);
      const userOverride =
        identity && visibilityOverrides.has(identity)
          ? visibilityOverrides.get(identity)
          : undefined;
      return {
        ...(dataset as object),
        configuredHidden,
        hidden:
          hiddenByData ||
          (userOverride !== undefined ? userOverride : configuredHidden),
      };
    }),
  } as T;
}

export function withCompareLegendBehavior<T extends { plugins?: object }>(
  options: T,
  handlers?: {
    onVisibilityChange?: (identity: string, hidden: boolean) => void;
  },
): T;
export function withCompareLegendBehavior<T extends { plugins?: object }>(
  options: T | undefined,
  handlers?: {
    onVisibilityChange?: (identity: string, hidden: boolean) => void;
  },
): T | undefined;
export function withCompareLegendBehavior<T extends { plugins?: object }>(
  options: T | undefined,
  handlers?: {
    onVisibilityChange?: (identity: string, hidden: boolean) => void;
  },
): T | undefined {
  if (!options) {
    return options;
  }

  const plugins = (options.plugins ?? {}) as Record<string, unknown>;
  const legend =
    typeof plugins["legend"] === "object" && plugins["legend"] !== null
      ? (plugins["legend"] as Record<string, unknown>)
      : {};
  const labels =
    typeof legend["labels"] === "object" && legend["labels"] !== null
      ? (legend["labels"] as Record<string, unknown>)
      : {};

  return {
    ...options,
    plugins: {
      ...plugins,
      legend: {
        ...legend,
        labels: {
          ...chartLegendLabels,
          ...labels,
          generateLabels: createNoDataFilteredGenerateLabels(),
        },
        onClick: createCompareLegendOnClick(handlers),
        onHover: createLegendPointerOnHover(),
        onLeave: createLegendPointerOnLeave(),
      },
    },
  } as T;
}

export function installChartLegendDefaults(): void {
  captureNativeLegendHelpers();
  Chart.defaults.plugins.legend.labels = {
    ...Chart.defaults.plugins.legend.labels,
    ...chartLegendLabels,
    generateLabels: createFilledRectLegendGenerateLabels(),
  };
  Chart.defaults.plugins.legend.onClick = createCompareLegendOnClick();
  Chart.defaults.plugins.legend.onHover = createLegendPointerOnHover();
  Chart.defaults.plugins.legend.onLeave = createLegendPointerOnLeave();
}
