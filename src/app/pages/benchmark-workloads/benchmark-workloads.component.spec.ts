import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkWorkloadsComponent } from "./benchmark-workloads.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { BENCHMARK_WORKLOADS_ERROR_TOAST_ID } from "../../services/toast-ids";
import { Status } from "../../../../sdk/data-contracts";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("BenchmarkWorkloadsComponent", () => {
  const originalInnerWidth = window.innerWidth;
  const keeperApiService = {
    getBenchmarkWorkloads: jasmine.createSpy("getBenchmarkWorkloads"),
    getServerBenchmarkMeta: jasmine.createSpy("getServerBenchmarkMeta"),
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
    keeperApiService.getServerBenchmarkMeta.and.resolveTo({
      body: [
        {
          benchmark_id: "membench:bandwidth_copy",
          note: "Limited scaling above 32 vCPUs.",
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
    expect(keeperApiService.getServerBenchmarkMeta).toHaveBeenCalled();
    expect(component.benchmarkFamilies().length).toBe(1);
    expect(component.benchmarkFamilies()[0].benchmarks[0].status).toBe(
      Status.Active,
    );
    expect(component.benchmarkFamilies()[0].benchmarks[0].note).toBe(
      "Limited scaling above 32 vCPUs.",
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

  it("shows http error toast when workloads load fails with 500", async () => {
    const toastService = TestBed.inject(ToastService);
    const showHttpError = spyOn(toastService, "showHttpError");
    keeperApiService.getBenchmarkWorkloads.and.rejectWith({ status: 500 });

    const failFixture = TestBed.createComponent(BenchmarkWorkloadsComponent);
    failFixture.detectChanges();
    await failFixture.whenStable();

    expect(showHttpError).toHaveBeenCalledWith(
      { status: 500 },
      jasmine.objectContaining({ id: BENCHMARK_WORKLOADS_ERROR_TOAST_ID }),
    );
  });

  it("shows http error toast when workloads load fails with 404", async () => {
    const toastService = TestBed.inject(ToastService);
    const showHttpError = spyOn(toastService, "showHttpError");
    keeperApiService.getBenchmarkWorkloads.and.rejectWith({
      status: 404,
      error: { detail: "Not found" },
    });

    const failFixture = TestBed.createComponent(BenchmarkWorkloadsComponent);
    failFixture.detectChanges();
    await failFixture.whenStable();

    expect(showHttpError).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 404 }),
      jasmine.objectContaining({
        id: BENCHMARK_WORKLOADS_ERROR_TOAST_ID,
        title: "Failed to load benchmark data.",
        body: "Please try again later.",
      }),
    );
  });

  it("does not show toast when workloads load is aborted", async () => {
    const toastService = TestBed.inject(ToastService);
    const showHttpError = spyOn(toastService, "showHttpError");
    keeperApiService.getBenchmarkWorkloads.and.rejectWith(
      new DOMException("The operation was aborted.", "AbortError"),
    );

    const failFixture = TestBed.createComponent(BenchmarkWorkloadsComponent);
    failFixture.detectChanges();
    await failFixture.whenStable();

    expect(showHttpError).not.toHaveBeenCalled();
  });
});
