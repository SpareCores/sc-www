import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerCompareMemoryChartComponent } from "./server-compare-memory-chart.component";
import { DropdownManagerService } from "../../../services/dropdown-manager.service";
import { MemoryBenchmarkMeta, MemoryChartServer } from "./memory-chart.types";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";

describe("ServerCompareMemoryChartComponent", () => {
  let component: ServerCompareMemoryChartComponent;
  let fixture: ComponentFixture<ServerCompareMemoryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerCompareMemoryChartComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: DropdownManagerService,
          useValue: {
            initDropdown: () =>
              Promise.resolve({ hide: jasmine.createSpy("hide") }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerCompareMemoryChartComponent);
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
});
