import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { OrderDir } from "../../../../sdk/data-contracts";
import { AdvisorComponent } from "./advisor.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ServerCompareService } from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AdvisorComponent", () => {
  const queryParams$ = new BehaviorSubject({});
  const getServersSelect = jasmine.createSpy("getServersSelect");
  const getServerBenchmarkMeta = jasmine.createSpy("getServerBenchmarkMeta");
  const getBenchmarkConfigs = jasmine.createSpy("getBenchmarkConfigs");
  const getServerBenchmark = jasmine.createSpy("getServerBenchmark");
  const searchServers = jasmine.createSpy("searchServers");
  const getComplianceFrameworks = jasmine.createSpy("getComplianceFrameworks");
  const getVendors = jasmine.createSpy("getVendors");
  const getStorages = jasmine.createSpy("getStorages");
  const getCountries = jasmine.createSpy("getCountries");
  const getRegions = jasmine.createSpy("getRegions");
  const updateTitleAndMetaTags = jasmine.createSpy("updateTitleAndMetaTags");
  const showToast = jasmine.createSpy("show");
  const selectionChanged = new Subject();
  const toggleCompare = jasmine.createSpy("toggleCompare");
  const clearCompare = jasmine.createSpy("clearCompare");
  const openCompare = jasmine.createSpy("openCompare");

  let component: AdvisorComponent;
  let fixture: ComponentFixture<AdvisorComponent>;

  beforeEach(async () => {
    queryParams$.next({});
    getServersSelect.calls.reset();
    getServerBenchmarkMeta.calls.reset();
    getBenchmarkConfigs.calls.reset();
    getServerBenchmark.calls.reset();
    searchServers.calls.reset();
    getComplianceFrameworks.calls.reset();
    getVendors.calls.reset();
    getStorages.calls.reset();
    getCountries.calls.reset();
    getRegions.calls.reset();
    updateTitleAndMetaTags.calls.reset();
    showToast.calls.reset();
    toggleCompare.calls.reset();
    clearCompare.calls.reset();
    openCompare.calls.reset();

    getServersSelect.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          api_reference: "large",
          status: "active",
          vcpus: 4,
          memory_amount: 4096,
          gpu_memory_total: 0,
          storage_size: 80,
        },
      ],
    });
    getServerBenchmarkMeta.and.resolveTo({
      body: [
        {
          benchmark_id: "stress_ng:bestn",
          name: "Stress-ng Bestn",
          framework: "stress-ng",
        },
      ],
    });
    getBenchmarkConfigs.and.resolveTo({
      body: [
        {
          benchmark_id: "stress_ng:bestn",
          config: "{}",
          category: "stress-ng",
        },
      ],
    });
    getServerBenchmark.and.resolveTo({
      body: [
        {
          benchmark_id: "stress_ng:bestn",
          config: "{}",
          score: 100,
        },
      ],
    });
    searchServers.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          api_reference: "c7a.large",
          display_name: "c7a.large",
          server_id: "srv-1",
        },
      ],
      headers: {
        get: (name: string) => (name === "x-total-count" ? "1" : null),
      },
    });
    getComplianceFrameworks.and.resolveTo({ body: [] });
    getVendors.and.resolveTo({ body: [] });
    getStorages.and.resolveTo({ body: [] });
    getCountries.and.resolveTo({ body: [] });
    getRegions.and.resolveTo({ body: [] });

    await TestBed.configureTestingModule({
      imports: [AdvisorComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams$.asObservable(),
          },
        },
        {
          provide: KeeperAPIService,
          useValue: {
            getServersSelect,
            getServerBenchmarkMeta,
            getBenchmarkConfigs,
            getServerBenchmark,
            searchServers,
            getComplianceFrameworks,
            getVendors,
            getStorages,
            getCountries,
            getRegions,
          },
        },
        {
          provide: SeoHandlerService,
          useValue: {
            updateTitleAndMetaTags,
          },
        },
        {
          provide: ServerCompareService,
          useValue: {
            selectedForCompare: [],
            selectionChanged,
            toggleCompare,
            clearCompare,
            openCompare,
          },
        },
        {
          provide: ToastService,
          useValue: {
            show: showToast,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    queryParams$.next({});
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("preloads baseline servers with the advisor default column set", () => {
    expect(getServersSelect).toHaveBeenCalledOnceWith([
      "vendor_id",
      "api_reference",
      "status",
      "vcpus",
      "memory_amount",
      "gpu_memory_total",
      "storage_size",
    ]);

    component.baselineServerInput.set("aws large");

    expect(component.filteredBaselineServers().length).toBe(1);
    expect(component.filteredBaselineServers()[0].api_reference).toBe("large");
  });

  it("restores advisor state from the route query params", async () => {
    queryParams$.next({
      baseline_vendor: "aws",
      baseline_server: "large",
      workload_id: "stress_ng:bestn",
      workload_config: "{}",
      optimization_goal: "performance",
      avg_cpu_utilization: "60",
      minimum_memory: "1",
      peak_gpu_memory: "2",
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.selectedBaselineServer()?.vendor_id).toBe("aws");
    expect(component.selectedBaselineServer()?.api_reference).toBe("large");
    expect(component.selectedBenchmarkConfig()?.benchmark_id).toBe(
      "stress_ng:bestn",
    );
    expect(component.optimizationGoal()).toBe("performance");
    expect(component.averageCpuUtilization()).toBe(60);
    expect(component.minimumMemoryGiB()).toBe(1);
    expect(component.peakGpuMemoryGiB()).toBe(2);
  });

  it("only requests recommendations once the required inputs are valid", async () => {
    expect(component.recommendationQuery()).toBeNull();
    expect(searchServers).not.toHaveBeenCalled();

    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    component.averageCpuUtilization.set(50);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.recommendationQuery()).not.toBeNull();
    expect(component.recommendationQuery()?.benchmark_score_min).toBe(50);
    expect(component.recommendationQuery()?.memory_min).toBe(0.5);
    expect(component.recommendationQuery()?.order_by).toBe("min_price");
    expect(searchServers).toHaveBeenCalled();
  });

  it("clears advisor filters back to their defaults", () => {
    const baselineServer = component.serverTableRows()[0];

    component.query.set({ vendor_ids: ["aws"] });
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    component.optimizationGoal.set("performance");
    component.averageCpuUtilization.set(70);
    component.minimumMemoryGiB.set(4);
    component.peakGpuMemoryGiB.set(8);
    component.page.set(3);
    component.limit.set(50);
    component.manualOrderBy.set("memory_amount");
    component.manualOrderDir.set(OrderDir.Asc);

    component.clearFilters();

    expect(component.query()).toEqual({});
    expect(component.selectedBaselineServer()).toBeNull();
    expect(component.baselineServerInput()).toBe("");
    expect(component.selectedBenchmarkConfig()?.benchmark_id).toBe(
      "stress_ng:bestn",
    );
    expect(component.optimizationGoal()).toBe("cost");
    expect(component.averageCpuUtilization()).toBeNull();
    expect(component.minimumMemoryGiB()).toBe(0.5);
    expect(component.peakGpuMemoryGiB()).toBe(0);
    expect(component.page()).toBe(1);
    expect(component.limit()).toBe(25);
    expect(component.manualOrderBy()).toBeUndefined();
    expect(component.manualOrderDir()).toBeUndefined();
  });
});
