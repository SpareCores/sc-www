import { cloneChartOptions } from "./chart-options.utils";

describe("chart-options.utils", () => {
  it("clones option objects without preserving references", () => {
    const source = {
      plugins: {
        legend: {
          display: true,
        },
      },
    };

    const result = cloneChartOptions(source);
    result.plugins.legend.display = false;

    expect(source.plugins.legend.display).toBeTrue();
    expect(result.plugins.legend.display).toBeFalse();
  });

  it("preserves callback functions while cloning nested options", () => {
    const formatter = () => "formatted";
    const source = {
      plugins: {
        tooltip: {
          callbacks: {
            label: formatter,
          },
        },
      },
    };

    const result = cloneChartOptions(source);

    expect(result).not.toBe(source);
    expect(result.plugins).not.toBe(source.plugins);
    expect(result.plugins.tooltip.callbacks.label).toBe(formatter);
  });
});
