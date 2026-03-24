import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkWorkloadsComponent } from "./benchmark-workloads.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { Status } from "../../../../sdk/data-contracts";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("BenchmarkWorkloadsComponent", () => {
  const originalInnerWidth = window.innerWidth;
  const keeperApiService = {
    getBenchmarkWorkloads: jasmine.createSpy("getBenchmarkWorkloads"),
  };

  let component: BenchmarkWorkloadsComponent;
  let fixture: ComponentFixture<BenchmarkWorkloadsComponent>;

  beforeEach(async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
      writable: true,
    });

    keeperApiService.getBenchmarkWorkloads.and.resolveTo({
      body: [
        {
          benchmark_id: "membench:bandwidth_copy",
          name: "Memory copy bandwidth",
          description: "Measures aggregate memory copy bandwidth.",
          framework: "membench",
          measurement: "memory_bandwidth",
          unit: "MB/s",
          higher_is_better: true,
          status: "ACTIVE",
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
        },
      ],
    });

    await TestBed.configureTestingModule({
      imports: [BenchmarkWorkloadsComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: KeeperAPIService,
          useValue: keeperApiService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkWorkloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
      writable: true,
    });
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load and normalize benchmark workload data", () => {
    expect(keeperApiService.getBenchmarkWorkloads).toHaveBeenCalled();
    expect(component.benchmarkFamilies().length).toBe(1);
    expect(component.benchmarkFamilies()[0].benchmarks[0].status).toBe(
      Status.Active,
    );
  });

  it("should collapse the sidebar by default on mobile viewports", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 768,
      writable: true,
    });

    const mobileFixture = TestBed.createComponent(BenchmarkWorkloadsComponent);
    const mobileComponent = mobileFixture.componentInstance;

    mobileFixture.detectChanges();
    await mobileFixture.whenStable();
    mobileFixture.detectChanges();

    expect(mobileComponent.isMobileViewport()).toBeTrue();
    expect(mobileComponent.isCollapsed()).toBeTrue();
  });
});
