import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WorkloadProfileRadarChartComponent } from "./workload-profile-radar-chart.component";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import { Status } from "../../../../../sdk/data-contracts";
import {
  WorkloadProfileRadarChartData,
  WorkloadProfileRadarChartOptions,
} from "./workload-profile-radar-chart.types";

const compareChartData: WorkloadProfileRadarChartData = {
  labels: ["Web server"],
  datasets: [{ data: [{ value: 1, tooltip: "A" }], label: "Server A" }],
};

const radarChartOptions: WorkloadProfileRadarChartOptions = {};

describe("WorkloadProfileRadarChartComponent", () => {
  let component: WorkloadProfileRadarChartComponent;
  let fixture: ComponentFixture<WorkloadProfileRadarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkloadProfileRadarChartComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkloadProfileRadarChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("layout", "compare");
    fixture.componentRef.setInput("chartData", compareChartData);
    fixture.componentRef.setInput("chartOptions", radarChartOptions);
    fixture.detectChanges();
  });

  it("creates the compare presenter", () => {
    expect(component).toBeTruthy();
    expect(component.layout()).toBe("compare");
  });

  it("supports details layout", () => {
    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("chartData", undefined);
    fixture.componentRef.setInput("chartOptions", undefined);
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        {
          benchmark_id: "workload_profile:web",
          score: 42,
        },
      ],
    });
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        status: Status.Active,
      },
    ]);
    fixture.detectChanges();

    expect(component.layout()).toBe("details");
    expect(component.hasChart()).toBeTrue();
  });

  it("emits the clicked profile on details layout", () => {
    const selectedIds: string[] = [];

    fixture.componentRef.setInput("layout", "details");
    fixture.componentRef.setInput("chartData", undefined);
    fixture.componentRef.setInput("chartOptions", undefined);
    fixture.componentRef.setInput("benchmarkMeta", [
      {
        benchmark_id: "workload_profile:web",
        name: "Workload profile: Web server",
        status: Status.Active,
      },
      {
        benchmark_id: "workload_profile:cache",
        name: "Workload profile: Cache Intensive",
        status: Status.Active,
      },
    ]);
    fixture.componentRef.setInput("serverDetails", {
      benchmark_scores: [
        { benchmark_id: "workload_profile:web", score: 0.8 },
        { benchmark_id: "workload_profile:cache", score: 0.9 },
      ],
    });
    fixture.componentInstance.profileSelected.subscribe((benchmarkId) => {
      selectedIds.push(benchmarkId);
    });
    fixture.detectChanges();

    component
      .resolvedChartOptions()
      ?.onClick?.({} as never, [{ index: 1 } as never]);

    expect(selectedIds).toEqual(["workload_profile:cache"]);
  });
});
