import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ServerMemoryChart } from "./server-memory-chart";
import { Dropdown } from "../../../directives/dropdown";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import {
  MemoryBenchmarkGroup,
  MemoryBenchmarkMeta,
  MemoryDetailsServer,
} from "./memory-chart.types";

describe("ServerMemoryChart", () => {
  let component: ServerMemoryChart;
  let fixture: ComponentFixture<ServerMemoryChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerMemoryChart],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerMemoryChart);
    component = fixture.componentInstance;
    const serverDetails: MemoryDetailsServer = {
      cpu_cores: 4,
      cpu_l1d_cache: 32,
    };
    const benchmarkMeta: MemoryBenchmarkMeta[] = [
      {
        benchmark_id: "membench:bandwidth_copy",
        unit: "MB/s",
        higher_is_better: true,
      },
      {
        benchmark_id: "membench:bandwidth_read",
        unit: "MB/s",
        higher_is_better: true,
      },
    ];
    const benchmarksByCategory: MemoryBenchmarkGroup[] = [
      {
        benchmark_id: "membench:bandwidth_read",
        benchmarks: [
          {
            benchmark_id: "membench:bandwidth_read",
            config: { size_kb: 1024 },
            score: 10,
          },
        ],
      },
      {
        benchmark_id: "membench:bandwidth_copy",
        benchmarks: [
          {
            benchmark_id: "membench:bandwidth_copy",
            config: { size_kb: 1024 },
            score: 12,
          },
        ],
      },
    ];

    fixture.componentRef.setInput("serverDetails", serverDetails);
    fixture.componentRef.setInput("benchmarkMeta", benchmarkMeta);
    fixture.componentRef.setInput("benchmarksByCategory", benchmarksByCategory);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(component.chartData()).toBeDefined();
  });

  it("keeps cache annotations on the computed chart options", () => {
    const annotations = (component.chartOptions() as any)?.plugins?.annotation
      ?.annotations;

    expect(annotations?.line1?.value).toBe(32 / 1024);
  });

  it("renders full-width left-aligned details options", () => {
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
    expect(firstOptionButton?.classList.contains("w-full")).toBeTrue();
    expect(firstOptionButton?.classList.contains("text-left")).toBeTrue();
    expect(firstOptionLabel?.classList.contains("text-white")).toBeTrue();
  });
});
