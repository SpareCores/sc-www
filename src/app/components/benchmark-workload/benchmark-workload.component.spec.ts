import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkWorkloadComponent } from "./benchmark-workload.component";
import { Status } from "../../../../sdk/data-contracts";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("BenchmarkWorkloadComponent", () => {
  let component: BenchmarkWorkloadComponent;
  let fixture: ComponentFixture<BenchmarkWorkloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkWorkloadComponent],
      providers: [...sharedTestingProviders],
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

  it("uses the shared tooltip service for status and direction tooltips", () => {
    const tooltipService = TestBed.inject(UiTooltipService);
    const showSpy = spyOn(tooltipService, "show");
    const hideSpy = spyOn(tooltipService, "hide");
    const target = document.createElement("button");

    component.showTooltip(
      { currentTarget: target, target } as unknown as MouseEvent,
      "Active",
    );

    expect(component.tooltipContent()).toBe("Active");
    expect(showSpy).toHaveBeenCalledOnceWith(
      component.tooltipEl()?.nativeElement as HTMLElement,
      jasmine.any(Object),
      {
        left: "anchor-right",
        top: "anchor-above",
      },
    );

    component.hideTooltip();

    expect(hideSpy).toHaveBeenCalledOnceWith(
      component.tooltipEl()?.nativeElement,
    );
  });
});
