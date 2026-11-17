import { EnvironmentInjector } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Chart, ChartData, Plugin } from "chart.js";
import { E2E_WINDOW_FLAG } from "../../../core/e2e/e2e-readiness-providers";
import { provideAppCharts } from "./chart-providers";

describe("provideAppCharts", () => {
  const win = window as Window & { [E2E_WINDOW_FLAG]?: boolean };
  const markerId = "scE2eRenderMarker";
  const defaultAnimation = Chart.defaults.animation;
  let chart: Chart<"bar"> | undefined;

  afterEach(() => {
    chart?.destroy();
    chart = undefined;
    delete win[E2E_WINDOW_FLAG];
    Chart.defaults.animation = defaultAnimation;
    const marker = Chart.registry.plugins.get(markerId);
    if (marker) {
      Chart.unregister(marker);
    }
  });

  function setup(): void {
    TestBed.configureTestingModule({ providers: [provideAppCharts()] });
    TestBed.inject(EnvironmentInjector);
  }

  function renderChart(
    data: ChartData<"bar">,
    plugins: Plugin<"bar">[] = [],
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    chart = new Chart<"bar">(canvas, {
      type: "bar",
      data,
      options: { responsive: false },
      plugins,
    });
    return canvas;
  }

  it("disables animations and marks rendered charts in e2e runs", () => {
    win[E2E_WINDOW_FLAG] = true;
    setup();

    expect(Chart.defaults.animation).toBeFalse();
    expect(Chart.registry.plugins.get(markerId)).toBeDefined();

    const canvas = renderChart({ labels: ["a"], datasets: [{ data: [1] }] });

    expect(canvas.dataset["chartRendered"]).toBe("true");
    expect(canvas.dataset["chartHasData"]).toBe("true");
  });

  it("flags charts rendered without data in e2e runs", () => {
    win[E2E_WINDOW_FLAG] = true;
    setup();

    const canvas = renderChart({ labels: [], datasets: [{ data: [] }] });

    expect(canvas.dataset["chartRendered"]).toBe("true");
    expect(canvas.dataset["chartHasData"]).toBe("false");
  });

  it("resets the rendered marker before each update in e2e runs", () => {
    win[E2E_WINDOW_FLAG] = true;
    setup();
    const states: (string | undefined)[] = [];
    const canvas = renderChart({ labels: ["a"], datasets: [{ data: [1] }] }, [
      {
        id: "spyRenderMarker",
        beforeDatasetsUpdate: (instance) => {
          states.push(instance.canvas.dataset["chartRendered"]);
        },
      },
    ]);

    chart?.update();

    expect(states).toEqual(["false", "false"]);
    expect(canvas.dataset["chartRendered"]).toBe("true");
  });

  it("leaves charts untouched outside e2e runs", () => {
    setup();

    expect(Chart.registry.plugins.get(markerId)).toBeUndefined();

    const canvas = renderChart({ labels: ["a"], datasets: [{ data: [1] }] });

    expect(canvas.dataset["chartRendered"]).toBeUndefined();
  });
});
