import { TestBed } from "@angular/core/testing";

import { GeekbenchRadarChartBuilder } from "./geekbench-radar-chart-builder";
import { chartColor, chartColors } from "../shared/chart-colors.constants";

describe("GeekbenchRadarChartBuilder", () => {
  let service: GeekbenchRadarChartBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeekbenchRadarChartBuilder);
  });

  it("uses the white legacy palette for single-core details charts", () => {
    const charts = service.buildDetailsCharts({
      benchmarksByCategory: [
        {
          benchmark_id: "geekbench:score",
          benchmarks: [
            {
              benchmark_id: "geekbench:score",
              config: { cores: "Single-Core Performance" },
              score: 1200,
            },
            {
              benchmark_id: "geekbench:score",
              config: { cores: "Multi-Core Performance" },
              score: 2400,
            },
          ],
        },
        {
          benchmark_id: "geekbench:aes-xts",
          benchmarks: [
            {
              benchmark_id: "geekbench:aes-xts",
              config: { cores: "Single-Core Performance" },
              score: 100,
            },
            {
              benchmark_id: "geekbench:aes-xts",
              config: { cores: "Multi-Core Performance" },
              score: 200,
            },
          ],
        },
      ] as any,
      benchmarkMeta: [
        {
          benchmark_id: "geekbench:score",
          name: "Geekbench: Score",
        },
        {
          benchmark_id: "geekbench:aes-xts",
          name: "Geekbench: AES-XTS",
        },
      ] as any,
    });

    expect(charts?.singleData?.datasets[0].borderColor).toBe(
      chartColors["gray-200"],
    );
    expect(charts?.singleData?.datasets[0].backgroundColor).toBe(
      chartColor("gray-200", 0.2),
    );
    expect(charts?.multiData?.datasets[0].borderColor).toBe(
      chartColors["emerald-400"],
    );
    expect(charts?.multiData?.datasets[0].backgroundColor).toBe(
      chartColor("emerald-400", 0.2),
    );
  });
});
