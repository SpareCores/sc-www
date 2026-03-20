import { TestBed } from "@angular/core/testing";

import { GeekbenchRadarChartBuilderService } from "./geekbench-radar-chart-builder.service";

describe("GeekbenchRadarChartBuilderService", () => {
  let service: GeekbenchRadarChartBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeekbenchRadarChartBuilderService);
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

    expect(charts?.singleData?.datasets[0].borderColor).toBe("#E5E7EB");
    expect(charts?.singleData?.datasets[0].backgroundColor).toBe("#E5E7EB33");
    expect(charts?.multiData?.datasets[0].borderColor).toBe("#34D399");
    expect(charts?.multiData?.datasets[0].backgroundColor).toBe("#34D39933");
  });
});
