import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkWorkloadComponent } from "./benchmark-workload.component";
import { Status } from "../../../../sdk/data-contracts";

describe("BenchmarkWorkloadComponent", () => {
  let component: BenchmarkWorkloadComponent;
  let fixture: ComponentFixture<BenchmarkWorkloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkWorkloadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkWorkloadComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("workload", {
      benchmark_id: "membench:bandwidth_copy",
      name: "Memory copy bandwidth",
      description: "Measures aggregate memory copy bandwidth.",
      framework: "membench",
      measurement: "memory_bandwidth",
      unit: "MB/s",
      higher_is_better: true,
      status: Status.Active,
      configs: {
        size_kb: {
          description: "Per-thread buffer size in KiB.",
          examples: [16, 32],
        },
      },
      count: 3668,
      count_servers: 375,
      histogram: {
        breakpoints: [10, 20, 30],
        counts: [2, 1],
      },
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should derive range and config entries from API data", () => {
    expect(component.configEntries().length).toBe(1);
    expect(component.formatRange()).toBe("10 – 30");
    expect(component.histogramData()?.datasets[0].data).toEqual([2, 1]);
  });
});
