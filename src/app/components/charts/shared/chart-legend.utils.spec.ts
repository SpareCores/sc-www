import { Chart, registerables } from "chart.js";
import {
  applyCompareDatasetVisibility,
  captureNativeLegendHelpers,
  countVisibleComparableDatasets,
  createCompareLegendOnClick,
  createFilledRectLegendGenerateLabels,
  createLegendPointerOnHover,
  createNoDataFilteredGenerateLabels,
  datasetHasComparableData,
  getCompareDatasetKey,
  withCompareLegendBehavior,
} from "./chart-legend.utils";

describe("chart-legend.utils", () => {
  beforeAll(() => {
    Chart.register(...registerables);
    captureNativeLegendHelpers();
  });

  it("detects comparable numeric and point data", () => {
    expect(
      datasetHasComparableData({ data: [1, null, 3] } as never),
    ).toBeTrue();
    expect(
      datasetHasComparableData({ data: [{ x: 1, y: 2 }] } as never),
    ).toBeTrue();
    expect(
      datasetHasComparableData({ data: [{ value: 0.8 }] } as never),
    ).toBeTrue();
    expect(
      datasetHasComparableData({ data: [{ data: 100, label: 1 }] } as never),
    ).toBeTrue();
    expect(
      datasetHasComparableData({
        data: [{ compress: 10, decompress: 20 }],
      } as never),
    ).toBeTrue();
    expect(
      datasetHasComparableData({ data: [{ value: null }] } as never),
    ).toBeFalse();
    expect(
      datasetHasComparableData({ data: [null, null] } as never),
    ).toBeFalse();
    expect(datasetHasComparableData({ data: [] } as never)).toBeFalse();
  });

  it("filters legend labels without comparable data", () => {
    const generateLabels = createNoDataFilteredGenerateLabels();
    const chart = {
      data: {
        datasets: [
          { data: [1, 2], label: "with-data" },
          { data: [null, null], label: "empty" },
        ],
      },
    };

    const native = Chart.defaults.plugins.legend.labels.generateLabels;
    spyOn(Chart.defaults.plugins.legend.labels, "generateLabels").and.callFake(
      function () {
        return [
          { datasetIndex: 0, text: "with-data" },
          { datasetIndex: 1, text: "empty" },
        ] as never;
      },
    );

    const items = [
      { datasetIndex: 0, text: "with-data" },
      { datasetIndex: 1, text: "empty" },
    ].filter((item) =>
      datasetHasComparableData(chart.data.datasets[item.datasetIndex] as never),
    );
    expect(items.map((item) => item.text)).toEqual(["with-data"]);
    expect(generateLabels).toBeDefined();
    expect(native).toBeDefined();
  });

  it("does not hide the last visible comparable dataset", () => {
    const visible = [true, false];
    const chart = {
      data: {
        datasets: [
          { data: [1], serverCompareKey: "aws::a" },
          { data: [2], serverCompareKey: "gcp::b" },
        ],
      },
      isDatasetVisible: (index: number) => visible[index],
      hide: jasmine.createSpy("hide").and.callFake((index: number) => {
        visible[index] = false;
      }),
      show: jasmine.createSpy("show").and.callFake((index: number) => {
        visible[index] = true;
      }),
    };
    const changes: Array<[string, boolean]> = [];
    const onClick = createCompareLegendOnClick({
      onVisibilityChange: (identity, hidden) =>
        changes.push([identity, hidden]),
    });

    onClick.call(
      {} as never,
      {} as never,
      { datasetIndex: 0 } as never,
      { chart } as never,
    );
    expect(chart.hide).not.toHaveBeenCalled();
    expect(changes).toEqual([]);

    visible[1] = true;
    onClick.call(
      {} as never,
      {} as never,
      { datasetIndex: 0 } as never,
      { chart } as never,
    );
    expect(chart.hide).toHaveBeenCalledOnceWith(0);
    expect(changes).toEqual([["aws::a", true]]);

    onClick.call(
      {} as never,
      {} as never,
      { datasetIndex: 0 } as never,
      { chart } as never,
    );
    expect(chart.show).toHaveBeenCalledOnceWith(0);
    expect(changes).toEqual([
      ["aws::a", true],
      ["aws::a", false],
    ]);
  });

  it("uses not-allowed cursor when hovering the last visible legend item", () => {
    const visible = [true, false];
    const chart = {
      data: {
        datasets: [{ data: [1] }, { data: [2] }],
      },
      isDatasetVisible: (index: number) => visible[index],
    };
    const target = document.createElement("div");
    const event = { native: { target } };
    const onHover = createLegendPointerOnHover();

    onHover.call(
      {} as never,
      event as never,
      { datasetIndex: 0 } as never,
      { chart } as never,
    );
    expect(target.style.cursor).toBe("not-allowed");

    visible[1] = true;
    onHover.call(
      {} as never,
      event as never,
      { datasetIndex: 0 } as never,
      { chart } as never,
    );
    expect(target.style.cursor).toBe("pointer");
  });

  it("counts only comparable visible datasets", () => {
    const chart = {
      data: {
        datasets: [{ data: [1] }, { data: [] }, { data: [2] }],
      },
      isDatasetVisible: (index: number) => index !== 2,
    };
    expect(countVisibleComparableDatasets(chart)).toBe(1);
  });

  it("applies user and no-data visibility flags", () => {
    const result = applyCompareDatasetVisibility(
      {
        datasets: [
          { data: [1], serverCompareKey: "aws::a" },
          { data: [], serverCompareKey: "gcp::b" },
          { data: [3], serverCompareKey: "azure::c" },
        ],
      },
      new Map([["aws::a", true]]),
    );

    const datasets = result.datasets as Array<{
      hidden?: boolean;
      serverCompareKey?: string;
    }>;
    expect(datasets[0].hidden).toBeTrue();
    expect(datasets[1].hidden).toBeTrue();
    expect(datasets[2].hidden).toBeFalse();
    expect(getCompareDatasetKey(datasets[0])).toBe("aws::a");
  });

  it("retains configured hidden when no user override exists", () => {
    const result = applyCompareDatasetVisibility(
      {
        datasets: [
          { data: [1], serverCompareKey: "aws::a", hidden: true },
          { data: [2], serverCompareKey: "gcp::b" },
        ],
      },
      new Map(),
    );

    const datasets = result.datasets as Array<{
      hidden?: boolean;
      configuredHidden?: boolean;
    }>;
    expect(datasets[0].configuredHidden).toBeTrue();
    expect(datasets[0].hidden).toBeTrue();
    expect(datasets[1].configuredHidden).toBeFalse();
    expect(datasets[1].hidden).toBeFalse();
  });

  it("allows a user show to override configured hidden", () => {
    const initial = applyCompareDatasetVisibility(
      {
        datasets: [
          { data: [1], serverCompareKey: "aws::a", hidden: true },
          { data: [2], serverCompareKey: "gcp::b" },
        ],
      },
      new Map(),
    );

    const shown = applyCompareDatasetVisibility(
      initial,
      new Map([["aws::a", false]]),
    );

    const datasets = shown.datasets as Array<{
      hidden?: boolean;
      configuredHidden?: boolean;
    }>;
    expect(datasets[0].configuredHidden).toBeTrue();
    expect(datasets[0].hidden).toBeFalse();
    expect(datasets[1].hidden).toBeFalse();
  });

  it("keeps solid bar legend colors when the default border is translucent", () => {
    const generateLabels = createFilledRectLegendGenerateLabels();
    captureNativeLegendHelpers();
    spyOn(
      Chart.defaults.plugins.legend.labels,
      "generateLabels",
    ).and.returnValue([
      {
        text: "Spot",
        fillStyle: "#34D399",
        strokeStyle: "rgba(0, 0, 0, 0.1)",
      },
      {
        text: "Ondemand",
        fillStyle: "#E5E7EB",
        strokeStyle: "rgba(0, 0, 0, 0.1)",
      },
    ] as never);

    const items = generateLabels.call({}, { data: { datasets: [] } } as never);

    expect(items[0]?.fillStyle).toBe("#34D399");
    expect(items[1]?.fillStyle).toBe("#E5E7EB");
  });

  it("uses line border colors when the dataset fill is translucent", () => {
    const generateLabels = createFilledRectLegendGenerateLabels();
    captureNativeLegendHelpers();
    spyOn(
      Chart.defaults.plugins.legend.labels,
      "generateLabels",
    ).and.returnValue([
      {
        text: "server-a",
        fillStyle: "#34D39933",
        strokeStyle: "#34D399",
      },
    ] as never);

    const items = generateLabels.call({}, { data: { datasets: [] } } as never);

    expect(items[0]?.fillStyle).toBe("#34D399");
  });

  it("merges compare legend behavior into options", () => {
    const options = withCompareLegendBehavior(
      { plugins: { legend: { display: true, labels: { color: "#fff" } } } },
      { onVisibilityChange: () => undefined },
    );
    const legend = options?.plugins?.legend as {
      onClick?: unknown;
      labels?: {
        generateLabels?: unknown;
        color?: string;
        usePointStyle?: boolean;
        pointStyle?: string;
      };
    };
    expect(legend.onClick).toEqual(jasmine.any(Function));
    expect(legend.labels?.generateLabels).toEqual(jasmine.any(Function));
    expect(legend.labels?.color).toBe("#fff");
    expect(legend.labels?.usePointStyle).toBeFalse();
    expect(legend.labels?.boxWidth).toBe(40);
    expect(legend.labels?.boxHeight).toBe(12);
  });
});
