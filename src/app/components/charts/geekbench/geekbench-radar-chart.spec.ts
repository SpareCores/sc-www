import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GeekbenchRadarChart } from "./geekbench-radar-chart";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import {
  GeekbenchRadarChartData,
  GeekbenchRadarChartOptions,
} from "./geekbench-radar-chart.types";

const detailsChartData: GeekbenchRadarChartData = {
  labels: ["A"],
  datasets: [{ data: [{ value: 1, tooltip: "Single" }], label: "Single" }],
};

const compareSingleChartData: GeekbenchRadarChartData = {
  labels: ["A"],
  datasets: [{ data: [{ value: 1, tooltip: "S" }], label: "S" }],
};

const compareMultiChartData: GeekbenchRadarChartData = {
  labels: ["A"],
  datasets: [{ data: [{ value: 2, tooltip: "M" }], label: "M" }],
};

const radarChartOptions: GeekbenchRadarChartOptions = {};

describe("GeekbenchRadarChart", () => {
  let component: GeekbenchRadarChart;
  let fixture: ComponentFixture<GeekbenchRadarChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeekbenchRadarChart],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(GeekbenchRadarChart);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("chartData", detailsChartData);
    fixture.componentRef.setInput("chartOptions", radarChartOptions);
    fixture.componentRef.setInput("score", "1234");
    fixture.componentRef.setInput("title", "Geekbench Single-Core");
    fixture.detectChanges();
  });

  it("creates the details presenter", () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe("Geekbench Single-Core");
  });

  it("supports compare layout", () => {
    fixture.componentRef.setInput("layout", "compare");
    fixture.componentRef.setInput("singleChartData", compareSingleChartData);
    fixture.componentRef.setInput("singleChartOptions", radarChartOptions);
    fixture.componentRef.setInput("multiChartData", compareMultiChartData);
    fixture.componentRef.setInput("multiChartOptions", radarChartOptions);
    fixture.detectChanges();

    expect(component.layout()).toBe("compare");
  });
});
