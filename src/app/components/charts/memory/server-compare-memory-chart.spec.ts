import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ServerCompareMemoryChart } from "./server-compare-memory-chart";
import { Dropdown } from "../../../directives/dropdown";
import { MemoryBenchmarkMeta, MemoryChartServer } from "./memory-chart.types";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";

describe("ServerCompareMemoryChart", () => {
  let component: ServerCompareMemoryChart;
  let fixture: ComponentFixture<ServerCompareMemoryChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerCompareMemoryChart],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerCompareMemoryChart);
    component = fixture.componentInstance;
    const benchmarkMeta: MemoryBenchmarkMeta[] = [
      { benchmark_id: "membench:bandwidth_copy", unit: "MB/s" },
    ];
    const servers: MemoryChartServer[] = [
      {
        display_name: "Server A",
        benchmark_scores: [
          {
            benchmark_id: "membench:bandwidth_copy",
            config: { size_kb: 1024 },
            score: 12,
          },
          {
            benchmark_id: "membench:latency",
            config: { size_kb: 1024 },
            score: 3,
          },
        ],
      },
    ];

    fixture.componentRef.setInput("benchmarkMeta", benchmarkMeta);
    fixture.componentRef.setInput("servers", servers);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(component.chartData()).toBeDefined();
  });

  it("defaults to the preferred compare memory option", () => {
    expect(component.selectedOption()?.id).toBe("membench-copy");
  });

  it("updates the selected memory option locally", () => {
    component.selectMemoryChartOption(1);
    fixture.detectChanges();

    expect(component.selectedOption()?.id).toBe("membench-latency");
  });

  it("renders a content-sized dropdown with full-width left-aligned options", () => {
    fixture.debugElement
      .query(By.css(`#${component.buttonId}`))
      .injector.get(Dropdown)
      .open();
    fixture.detectChanges();

    const optionsPanel = document.querySelector(`#${component.optionsId}`);
    const firstOptionButton = optionsPanel?.querySelector("button");
    const firstOptionLabel = firstOptionButton?.querySelector("div");

    expect(optionsPanel?.classList.contains("w-max")).toBeTrue();
    expect(optionsPanel?.classList.contains("min-w-64")).toBeTrue();
    expect(
      firstOptionButton?.classList.contains("sc-dropdown__option"),
    ).toBeTrue();
    expect(firstOptionLabel?.classList.contains("text-white")).toBeTrue();
  });
});
