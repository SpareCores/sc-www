import { importProvidersFrom } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LucideAngularModule } from "lucide-angular";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";

import { ServerMemoryChartComponent } from "./server-memory-chart.component";
import { DropdownManagerService } from "../../../services/dropdown-manager.service";
import { lucideIcons } from "../../../lucide-icons";
import {
  MemoryBenchmarkGroup,
  MemoryBenchmarkMeta,
  MemoryDetailsServer,
} from "./memory-chart.types";

describe("ServerMemoryChartComponent", () => {
  let component: ServerMemoryChartComponent;
  let fixture: ComponentFixture<ServerMemoryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerMemoryChartComponent],
      providers: [
        provideCharts(withDefaultRegisterables()),
        importProvidersFrom(LucideAngularModule.pick(lucideIcons)),
        {
          provide: DropdownManagerService,
          useValue: {
            initDropdown: () =>
              Promise.resolve({ hide: jasmine.createSpy("hide") }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerMemoryChartComponent);
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
});
