import { TestBed } from "@angular/core/testing";
import {
  redisChartTemplate,
  staticWebChartCompareTemplate,
} from "../../../pages/server-details/chartFromBenchmarks";
import { barChartOptionsTemplate } from "../../../pages/server-details/chartOptions";
import {
  buildCompareTooltipTitle,
  getDatasetTooltipIdentity,
} from "../shared/chart-tooltip.utils";
import { BenchmarkMultiBarChartBuilderService } from "./benchmark-multi-bar-chart-builder.service";
import {
  MultiBarBenchmarkMeta,
  MultiBarServer,
} from "./benchmark-multi-bar-chart.types";

describe("BenchmarkMultiBarChartBuilderService", () => {
  let service: BenchmarkMultiBarChartBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenchmarkMultiBarChartBuilderService);
  });

  it("initializes details template metadata", () => {
    const chartTemplate = JSON.parse(JSON.stringify(redisChartTemplate));
    const benchmarkMeta: MultiBarBenchmarkMeta[] = [
      {
        benchmark_id: "redis:rps",
        name: "Redis: RPS",
        unit: "ops/sec",
        higher_is_better: true,
        config_fields: { operation: "Operation", pipeline: "Pipeline" },
      },
    ];

    service.initializeDetailsTemplate(chartTemplate, benchmarkMeta);

    expect(chartTemplate.options[0].name).toBe("Redis: RPS");
    expect(chartTemplate.options[0].icon).toBe("circle-arrow-up");
    expect(chartTemplate.options[0].XLabel).toBe("Pipeline");
  });

  it("does not throw while compare metadata is temporarily unavailable", () => {
    const chartTemplate = JSON.parse(JSON.stringify(redisChartTemplate));

    expect(() => {
      service.initializeCompareTemplate(chartTemplate, undefined);
    }).not.toThrow();
  });

  it("builds compare datasets from selected secondary option", () => {
    const chartTemplate = JSON.parse(JSON.stringify(redisChartTemplate));
    chartTemplate.selectedOption = 0;
    chartTemplate.selectedSecondaryOption = 0;

    const benchmarkMeta: MultiBarBenchmarkMeta[] = [
      {
        benchmark_id: "redis:rps",
        configs: [
          { config: { operation: "SET", pipeline: 1 } },
          { config: { operation: "SET", pipeline: 4 } },
        ],
      },
    ];
    const servers: MultiBarServer[] = [
      {
        display_name: "Server A",
        benchmark_scores: [
          {
            benchmark_id: "redis:rps",
            config: { operation: "SET", pipeline: 1 },
            score: 100,
            note: "a",
          },
          {
            benchmark_id: "redis:rps",
            config: { operation: "SET", pipeline: 4 },
            score: 400,
            note: "b",
          },
        ],
      },
    ];

    const result = service.buildCompareChart(
      chartTemplate,
      benchmarkMeta,
      servers,
    );

    expect(result?.labels).toEqual([1, 4]);
    expect(result?.datasets[0].data.length).toBe(2);
  });

  it("returns undefined while compare metadata is unavailable", () => {
    const chartTemplate = JSON.parse(JSON.stringify(redisChartTemplate));
    chartTemplate.selectedOption = 0;
    chartTemplate.selectedSecondaryOption = 0;

    const result = service.buildCompareChart(chartTemplate, undefined, []);

    expect(result).toBeUndefined();
  });

  it("syncs chart titles even when no compare data exists", () => {
    const chartTemplate = JSON.parse(JSON.stringify(redisChartTemplate));
    chartTemplate.options[0].XLabel = "Pipeline";
    chartTemplate.options[0].YLabel = "ops/sec";
    chartTemplate.options[0].title = "Operation";

    service.syncCompareChart(chartTemplate, [], []);

    expect(chartTemplate.chartData).toBeUndefined();
    expect(chartTemplate.chartOptions.scales.x.title.text).toBe("Pipeline");
    expect(chartTemplate.chartOptions.scales.y.title.text).toBe("ops/sec");
    expect(chartTemplate.chartOptions.plugins.title.text).toBe("Operation");
  });

  it("applies compare tooltip callbacks with server identity in the title", () => {
    const chartTemplate = JSON.parse(JSON.stringify(redisChartTemplate));
    chartTemplate.selectedOption = 0;
    chartTemplate.selectedSecondaryOption = 0;

    service.syncCompareChart(
      chartTemplate,
      [
        {
          benchmark_id: "redis:rps",
          configs: [{ config: { operation: "SET", pipeline: 1 } }],
        },
      ],
      [
        {
          display_name: "Server A",
          vendor_id: "aws",
          api_reference: "m7g.large",
          benchmark_scores: [
            {
              benchmark_id: "redis:rps",
              config: { operation: "SET", pipeline: 1 },
              score: 100,
            },
          ],
        },
      ],
    );

    const dataset = chartTemplate.chartData?.datasets[0];
    const titleCallback = chartTemplate.chartOptions.plugins.tooltip.callbacks
      .title as (
      tooltipItems: Array<{ label: string; dataset: unknown }>,
    ) => string | string[];
    const title = titleCallback([{ label: "1", dataset }]);

    expect(getDatasetTooltipIdentity(dataset)).toBe("m7g.large by aws");
    expect(title).toEqual(
      buildCompareTooltipTitle(
        "m7g.large by aws",
        "1 concurrent pipelined requests",
      ),
    );
  });

  it("uses template chart options for static web compare charts", () => {
    expect(staticWebChartCompareTemplate.chartOptions).toBe(
      barChartOptionsTemplate,
    );
  });
});
