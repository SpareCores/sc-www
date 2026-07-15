import { TestBed } from "@angular/core/testing";
import { TooltipItem, TooltipModel } from "chart.js";

import { WorkloadProfileRadarChartBuilderService } from "./workload-profile-radar-chart-builder.service";
import { Status } from "../../../../../sdk/data-contracts";

describe("WorkloadProfileRadarChartBuilderService", () => {
  let service: WorkloadProfileRadarChartBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkloadProfileRadarChartBuilderService);
  });

  it("builds a details radar chart for workload profile benchmarks", () => {
    const charts = service.buildDetailsCharts({
      serverDetails: {
        benchmark_scores: [
          {
            benchmark_id: "workload_profile:web",
            score: 120,
            note: "Web server",
          },
        ],
      },
      benchmarkMeta: [
        {
          benchmark_id: "workload_profile:web",
          name: "Workload profile: Web server",
          description: "Web server workload profile",
          status: Status.Active,
        },
      ],
    });

    expect(charts?.chartData.labels).toEqual(["Web server"]);
    expect(charts?.chartData.datasets[0]?.data[0]).toEqual({
      value: 120,
      tooltip: "Web server",
    });
    expect(charts?.options?.maintainAspectRatio).toBeFalse();
    const label = charts?.options?.plugins?.tooltip?.callbacks?.label;
    const title = charts?.options?.plugins?.tooltip?.callbacks?.title;
    const tooltipContext = {} as TooltipModel<"radar">;
    expect(
      label?.call(tooltipContext, {
        raw: { value: 0.169 },
      } as TooltipItem<"radar">),
    ).toEqual(["0.169"]);
    expect(
      label?.call(tooltipContext, {
        raw: { value: 120, tooltip: "Web server" },
      } as TooltipItem<"radar">),
    ).toEqual(["120", "Web server"]);
    expect(
      title?.call(tooltipContext, [
        {
          dataIndex: 0,
          label: "Web server",
        } as TooltipItem<"radar">,
      ]),
    ).toBe("Workload profile: Web server");
  });

  it("builds a compare radar chart with one dataset per server", () => {
    const charts = service.buildCompareCharts({
      servers: [
        {
          display_name: "Server A",
          benchmark_scores: [
            {
              benchmark_id: "workload_profile:web",
              score: 100,
            },
          ],
        },
        {
          display_name: "Server B",
          benchmark_scores: [
            {
              benchmark_id: "workload_profile:web",
              score: 200,
            },
          ],
        },
      ],
      benchmarkMeta: [
        {
          benchmark_id: "workload_profile:web",
          name: "Workload profile: Web server",
          status: Status.Active,
        },
      ],
    });

    expect(charts?.chartData.datasets).toHaveSize(2);
    expect(charts?.chartData.datasets[0]?.label).toBe("Server A");
    expect(
      (charts?.chartData.datasets[0] as { serverTooltipIdentity?: string })
        .serverTooltipIdentity,
    ).toBe("Server A");
    expect(charts?.chartData.datasets[1]?.data[0]).toEqual({
      value: 200,
      tooltip: undefined,
    });

    const title = charts?.options?.plugins?.tooltip?.callbacks?.title;
    const tooltipContext = {} as TooltipModel<"radar">;
    expect(
      title?.call(tooltipContext, [
        {
          dataIndex: 0,
          label: "Web server",
          dataset: { serverTooltipIdentity: "m7g.large by aws" },
        } as unknown as TooltipItem<"radar">,
      ]),
    ).toEqual(["m7g.large by aws", "Workload profile: Web server"]);
  });
});
