import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick,
} from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { OrderDir, Status } from "../../../../sdk/data-contracts";
import { AdvisorComponent } from "./advisor.component";
import {
  ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
  ADVISOR_DEFAULT_PAGE_LIMIT,
  ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
  ADVISOR_DEFAULT_SERVER_COLUMNS,
  ADVISOR_PAGE_LIMITS,
  ADVISOR_TABLE_COLUMNS,
} from "./advisor.constants";
import { DropdownManagerService } from "../../services/dropdown-manager.service";
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
  const getServerPrices = jasmine.createSpy("getServerPrices");
  const searchServers = jasmine.createSpy("searchServers");
  const getComplianceFrameworks = jasmine.createSpy("getComplianceFrameworks");
  const getVendors = jasmine.createSpy("getVendors");
  const getStorages = jasmine.createSpy("getStorages");
  const getCountries = jasmine.createSpy("getCountries");
  const getRegions = jasmine.createSpy("getRegions");
  const updateTitleAndMetaTags = jasmine.createSpy("updateTitleAndMetaTags");
  const showToast = jasmine.createSpy("show");
  const initDropdown = jasmine.createSpy("initDropdown");
  const selectionChanged = new Subject();
  const compareService = {
    selectedForCompare: [] as Array<{
      display_name: string;
      vendor: string;
      server: string;
      zonesRegions: unknown[];
    }>,
    selectionChanged,
    toggleCompare: jasmine.createSpy("toggleCompare"),
    clearCompare: jasmine.createSpy("clearCompare"),
    openCompare: jasmine.createSpy("openCompare"),
  };

  let component: AdvisorComponent;
  let fixture: ComponentFixture<AdvisorComponent>;

  beforeEach(async () => {
    queryParams$.next({});
    getServersSelect.calls.reset();
    getServerBenchmarkMeta.calls.reset();
    getBenchmarkConfigs.calls.reset();
    getServerBenchmark.calls.reset();
    getServerPrices.calls.reset();
    searchServers.calls.reset();
    getComplianceFrameworks.calls.reset();
    getVendors.calls.reset();
    getStorages.calls.reset();
    getCountries.calls.reset();
    getRegions.calls.reset();
    updateTitleAndMetaTags.calls.reset();
    showToast.calls.reset();
    initDropdown.calls.reset();
    compareService.selectedForCompare = [];
    compareService.toggleCompare.calls.reset();
    compareService.clearCompare.calls.reset();
    compareService.openCompare.calls.reset();
    compareService.toggleCompare.and.callFake(
      (
        shouldSelect: boolean,
        server: { display_name: string; vendor: string; server: string },
      ) => {
        if (shouldSelect) {
          compareService.selectedForCompare = [
            ...compareService.selectedForCompare.filter(
              (item) =>
                item.vendor !== server.vendor || item.server !== server.server,
            ),
            {
              display_name: server.display_name,
              vendor: server.vendor,
              server: server.server,
              zonesRegions: [],
            },
          ];
        } else {
          compareService.selectedForCompare =
            compareService.selectedForCompare.filter(
              (item) =>
                item.vendor !== server.vendor || item.server !== server.server,
            );
        }

        selectionChanged.next(compareService.selectedForCompare);
      },
    );
    compareService.clearCompare.and.callFake(() => {
      compareService.selectedForCompare = [];
      selectionChanged.next(compareService.selectedForCompare);
    });

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
    getServerPrices.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
        },
        {
          vendor_id: "aws",
          region_id: "eu-west-1",
        },
        {
          vendor_id: "aws",
          region_id: "us-east-1",
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
    getRegions.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          name: "US East 1",
        },
        {
          vendor_id: "aws",
          region_id: "eu-west-1",
          name: "EU West 1",
        },
      ],
    });
    initDropdown.and.resolveTo({
      hide: jasmine.createSpy("hide"),
      show: jasmine.createSpy("show"),
    });

    await TestBed.configureTestingModule({
      imports: [AdvisorComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: DropdownManagerService,
          useValue: {
            initDropdown,
          },
        },
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
            getServerPrices,
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
          useValue: compareService,
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

  it("preloads baseline servers with the advisor default column set", () => {
    expect(getServersSelect).toHaveBeenCalledOnceWith([
      ...ADVISOR_DEFAULT_SERVER_COLUMNS,
    ]);

    component.baselineServerInput.set("aws large");

    expect(component.filteredBaselineServers().length).toBe(1);
    expect(component.filteredBaselineServers()[0].api_reference).toBe("large");
  });

  it("sorts filtered baseline servers by vcpus, memory, vendor, and api reference", () => {
    component.serverTableRows.set([
      {
        vendor_id: "gcp",
        api_reference: "sort-a",
        status: Status.Active,
        vcpus: 8,
        memory_amount: 8192,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-z",
        status: Status.Active,
        vcpus: 4,
        memory_amount: 8192,
      },
      {
        vendor_id: "aws",
        api_reference: "sort-a",
        status: Status.Active,
        vcpus: 4,
        memory_amount: 4096,
      },
      {
        vendor_id: "azure",
        api_reference: "sort-b",
        status: Status.Active,
        vcpus: 4,
        memory_amount: 4096,
      },
    ]);
    component.baselineServerInput.set("so");

    expect(
      component.filteredBaselineServers().map((server) => server.vendor_id),
    ).toEqual(["aws", "azure", "aws", "gcp"]);
    expect(
      component.filteredBaselineServers().map((server) => server.api_reference),
    ).toEqual(["sort-a", "sort-b", "sort-z", "sort-a"]);
  });

  it("uses the server listing default visible columns and page sizes", () => {
    expect(component.tableColumns().map((column) => column.name)).toEqual([
      "NAME & PROVIDER",
      "PROCESSOR",
      "BENCHMARK",
      "$ EFFICIENCY",
      "MEMORY",
      "GPUs",
      "STORAGE",
      "BEST PRICE",
    ]);
    expect(component.pageLimits).toEqual([10, 25, 50, 100, 250]);
  });

  it("exposes the full advisor column selector inventory", () => {
    expect(component.possibleColumns().map((column) => column.name)).toEqual(
      ADVISOR_TABLE_COLUMNS.map((column) => column.name),
    );
    expect(
      component.possibleColumns().map((column) => column.name),
    ).not.toContain("API REFERENCE");
    expect(
      component.possibleColumns().map((column) => column.name),
    ).not.toContain("VCPUs");
  });

  it("renders only extra storage and traffic filters after peak GPU memory", () => {
    const optimizationGoalControl = component
      .customControls()
      .find((control) => control.name === "optimization_goal");
    const minimumMemoryControl = component
      .customControls()
      .find((control) => control.name === "minimum_memory");
    const peakGpuMemoryControl = component
      .customControls()
      .find((control) => control.name === "peak_gpu_memory");

    expect(optimizationGoalControl?.type).toBe("singleSelect");
    expect(minimumMemoryControl?.unit).toBe("GiB");
    expect(minimumMemoryControl?.description).toContain("GiB");
    expect(peakGpuMemoryControl?.unit).toBe("GiB");
    expect(peakGpuMemoryControl?.description).toContain("GiB");
    expect(
      component
        .customControls()
        .find((control) => control.name === "price_allocation_enabled")
        ?.descriptionDisplay,
    ).toBe("tooltip");
    expect(
      component
        .customControls()
        .find((control) => control.name === "baseline_region_enabled")
        ?.descriptionDisplay,
    ).toBe("tooltip");

    const advisorCategory = fixture.nativeElement.querySelector(
      '[data-category-id="advisor"]',
    ) as HTMLElement;
    const peakGpuMemory = advisorCategory.querySelector(
      "#custom_control_numeric_peak_gpu_memory",
    ) as HTMLElement;
    const extraStorageSize = advisorCategory.querySelector(
      "#filter_number_extra_storage_size",
    ) as HTMLElement;
    const extraStorageType = advisorCategory.querySelector(
      "#filter_enum_extra_storage_type_hdd",
    ) as HTMLElement;
    const inboundTraffic = advisorCategory.querySelector(
      "#filter_number_monthly_inbound_traffic",
    ) as HTMLElement;
    const outboundTraffic = advisorCategory.querySelector(
      "#filter_number_monthly_outbound_traffic",
    ) as HTMLElement;
    const cpuAllocation = advisorCategory.querySelector(
      "#custom_control_checkbox_limit_cpu_allocation",
    ) as HTMLElement;

    expect(extraStorageSize).not.toBeNull();
    expect(extraStorageType).not.toBeNull();
    expect(inboundTraffic).not.toBeNull();
    expect(outboundTraffic).not.toBeNull();
    expect(
      advisorCategory.querySelector("#filter_number_storage_size"),
    ).toBeNull();
    expect(
      advisorCategory.querySelector("#filter_enum_storage_type_hdd"),
    ).toBeNull();
    expect(
      advisorCategory.querySelector("#filter_number_network_speed_min"),
    ).toBeNull();
    expect(
      peakGpuMemory.compareDocumentPosition(extraStorageSize) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      extraStorageSize.compareDocumentPosition(extraStorageType) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      extraStorageType.compareDocumentPosition(inboundTraffic) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      outboundTraffic.compareDocumentPosition(cpuAllocation) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-category-id="storage"]'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-category-id="traffic"]'),
    ).toBeNull();
  });

  it("restores advisor state from the route query params", async () => {
    queryParams$.next({
      baseline_vendor: "aws",
      baseline_server: "large",
      workload_id: "stress_ng:bestn",
      workload_config: "{}",
      optimization_goal: "performance",
      currency: "EUR",
      price_allocation_enabled: "true",
      best_price_allocation: "SPOT_ONLY",
      baseline_region_enabled: "true",
      baseline_vendor_region: "aws~us-east-1",
      order_by: "status",
      order_dir: "asc",
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
    expect(component.selectedCurrency().slug).toBe("EUR");
    expect(component.isPriceAllocationEnabled()).toBeTrue();
    expect(component.bestPriceAllocation().slug).toBe("SPOT_ONLY");
    expect(component.isBaselineRegionEnabled()).toBeTrue();
    expect(component.selectedBaselineVendorRegion()).toBe("aws~us-east-1");
    expect(component.manualOrderBy()).toBe("status");
    expect(component.manualOrderDir()).toBe(OrderDir.Asc);
    expect(
      component.possibleColumns().find((column) => column.name === "STATUS")
        ?.show,
    ).toBeTrue();
    expect(component.averageCpuUtilization()).toBe(60);
    expect(component.minimumMemoryGiB()).toBe(1);
    expect(component.peakGpuMemoryGiB()).toBe(2);
  });

  it("sanitizes invalid numeric advisor query params from the route", async () => {
    queryParams$.next({
      page: "-3",
      limit: "999",
      avg_cpu_utilization: "120",
      minimum_memory: "-8",
      peak_gpu_memory: "oops",
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.page()).toBe(1);
    expect(component.limit()).toBe(Math.max(...ADVISOR_PAGE_LIMITS));
    expect(component.averageCpuUtilization()).toBe(100);
    expect(component.minimumMemoryGiB()).toBe(
      ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
    );
    expect(component.peakGpuMemoryGiB()).toBe(
      ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
    );
    expect(component.getUrlStateQueryParams()).not.toEqual(
      jasmine.objectContaining({
        page: "-3",
        limit: "999",
      }),
    );
  });

  it("only requests recommendations once the required inputs are valid", fakeAsync(() => {
    expect(component.recommendationQuery()).toBeNull();
    expect(searchServers).not.toHaveBeenCalled();

    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    component.averageCpuUtilization.set(50);

    fixture.detectChanges();
    tick(350);
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.recommendationQuery()).not.toBeNull();
    expect(component.recommendationQuery()?.benchmark_score_min).toBe(50);
    expect(component.recommendationQuery()?.memory_min).toBe(0.5);
    expect(component.recommendationQuery()?.order_by).toBe("min_price");
    expect(searchServers).toHaveBeenCalled();
  }));

  it("only applies price allocation to recommendation queries when enabled", fakeAsync(() => {
    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    component.selectCurrency(
      component.availableCurrencies.find(
        (currency) => currency.slug === "EUR",
      )!,
    );
    component.onCustomControlChanged({
      name: "price_allocation",
      value: { selectedValue: "SPOT_ONLY" },
    });
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    component.averageCpuUtilization.set(50);
    fixture.detectChanges();
    tick(350);
    flushMicrotasks();

    expect(searchServers.calls.mostRecent().args[0].currency).toBe("EUR");
    expect(
      searchServers.calls.mostRecent().args[0].best_price_allocation,
    ).toBeUndefined();

    component.onCustomControlChanged({
      name: "price_allocation_enabled",
      value: { checked: true },
    });
    fixture.detectChanges();
    tick(350);
    flushMicrotasks();

    expect(searchServers.calls.mostRecent().args[0].currency).toBe("EUR");
    expect(searchServers.calls.mostRecent().args[0].best_price_allocation).toBe(
      "SPOT_ONLY",
    );
  }));

  it("loads baseline region options and applies the dedicated region filter", fakeAsync(() => {
    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    expect(getServerPrices).toHaveBeenCalledOnceWith("aws", "large");
    expect(component.baselineRegionOptions()).toEqual([
      { value: "aws~eu-west-1", label: "EU West 1" },
      { value: "aws~us-east-1", label: "US East 1" },
    ]);

    component.onCustomControlChanged({
      name: "price_allocation_enabled",
      value: { checked: true },
    });
    fixture.detectChanges();

    expect(
      component
        .customControls()
        .find((control) => control.name === "price_allocation")?.hideTitle,
    ).toBeTrue();

    component.onCustomControlChanged({
      name: "baseline_region_enabled",
      value: { checked: true },
    });
    fixture.detectChanges();

    expect(
      component
        .customControls()
        .find((control) => control.name === "baseline_region")?.hideTitle,
    ).toBeTrue();

    component.onCustomControlChanged({
      name: "baseline_region",
      value: { selectedValue: "aws~us-east-1" },
    });
    component.averageCpuUtilization.set(50);
    fixture.detectChanges();
    tick(350);
    flushMicrotasks();

    expect(component.advisorSearchBarExtraParameters()).toEqual({
      vendor: ["aws"],
      vendor_regions: ["aws~us-east-1"],
    });
    expect(searchServers.calls.mostRecent().args[0].vendor_regions).toBe(
      "aws~us-east-1",
    );
  }));

  it("gives vendor filters precedence over the dedicated baseline region state", async () => {
    queryParams$.next({
      baseline_vendor: "aws",
      baseline_server: "large",
      vendor: "hcloud",
      baseline_region_enabled: "true",
      baseline_vendor_region: "aws~us-east-1",
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.query().vendor).toEqual(["hcloud"]);
    expect(component.isBaselineRegionEnabled()).toBeFalse();
    expect(component.selectedBaselineVendorRegion()).toBeNull();
    expect(
      component
        .customControls()
        .find((control) => control.name === "baseline_region_enabled")
        ?.disabled,
    ).toBeTrue();
  });

  it("gives vendor and region id precedence over the dedicated baseline region state", async () => {
    queryParams$.next({
      baseline_vendor: "aws",
      baseline_server: "large",
      vendor_regions: "aws~eu-west-1,aws~us-east-1",
      baseline_region_enabled: "true",
      baseline_vendor_region: "aws~us-east-1",
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.query().vendor_regions).toEqual([
      "aws~eu-west-1",
      "aws~us-east-1",
    ]);
    expect(component.isBaselineRegionEnabled()).toBeFalse();
    expect(component.selectedBaselineVendorRegion()).toBeNull();
    expect(
      component
        .customControls()
        .find((control) => control.name === "baseline_region_enabled")
        ?.disabled,
    ).toBeTrue();
  });

  it("resets to cost ordering when optimization goal changes", fakeAsync(() => {
    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    component.manualOrderBy.set("status");
    component.manualOrderDir.set(OrderDir.Asc);

    component.onCustomControlChanged({
      name: "optimization_goal",
      value: { selectedValue: "cost" },
    });

    expect(component.manualOrderBy()).toBeUndefined();
    expect(component.manualOrderDir()).toBeUndefined();
    expect(component.activeOrderBy()).toBe("min_price");
    expect(component.activeOrderDir()).toBe(OrderDir.Asc);

    component.averageCpuUtilization.set(50);
    fixture.detectChanges();
    tick(350);
    flushMicrotasks();
    fixture.detectChanges();

    expect(searchServers.calls.mostRecent().args[0].order_by).toBe("min_price");
    expect(searchServers.calls.mostRecent().args[0].order_dir).toBe(
      OrderDir.Asc,
    );
  }));

  it("keeps the vendor column informational rather than orderable", () => {
    const vendorColumn = component
      .possibleColumns()
      .find((column) => column.name === "VENDOR");

    expect(vendorColumn?.name).toBe("VENDOR");
    expect(vendorColumn?.orderField).toBeUndefined();

    component.manualOrderBy.set("memory_amount");
    component.manualOrderDir.set(OrderDir.Desc);
    component.toggleOrdering(vendorColumn!);

    expect(component.manualOrderBy()).toBe("memory_amount");
    expect(component.manualOrderDir()).toBe(OrderDir.Desc);
    expect(component.getOrderingIcon(vendorColumn!)).toBeNull();
  });

  it("toggles the selected baseline server in compare", () => {
    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);

    component.toggleBaselineCompare();

    expect(compareService.toggleCompare).toHaveBeenCalledWith(true, {
      server: "large",
      vendor: "aws",
      display_name: "large",
    });
    expect(component.isBaselineSelectedForCompare()).toBeTrue();
    expect(component.baselineCompareButtonLabel()).toBe("Remove baseline");

    component.toggleBaselineCompare();

    expect(compareService.toggleCompare).toHaveBeenCalledWith(false, {
      server: "large",
      vendor: "aws",
      display_name: "large",
    });
    expect(component.isBaselineSelectedForCompare()).toBeFalse();
    expect(component.baselineCompareButtonLabel()).toBe("Compare baseline");
  });

  it("highlights the matching recommendation row for the selected baseline server", () => {
    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.recommendations.set([
      {
        vendor_id: "aws",
        api_reference: "large",
        display_name: "large",
        server_id: "srv-baseline",
      },
      {
        vendor_id: "aws",
        api_reference: "c7a.large",
        display_name: "c7a.large",
        server_id: "srv-1",
      },
    ] as never[]);

    fixture.detectChanges();

    const rows = Array.from(
      fixture.nativeElement.querySelectorAll("#advisor_results_table tbody tr"),
    ) as HTMLTableRowElement[];

    expect(rows.length).toBe(2);
    expect(rows[0].classList.contains("advisor-table-row-baseline")).toBeTrue();
    expect(
      rows[1].classList.contains("advisor-table-row-baseline"),
    ).toBeFalse();
  });

  it("removes the top price allocation dropdown from the toolbar", () => {
    expect(
      fixture.nativeElement.querySelector("#advisor_allocation_button"),
    ).toBeNull();
  });

  it("debounces rapid recommendation filter changes", fakeAsync(() => {
    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    component.averageCpuUtilization.set(20);
    fixture.detectChanges();
    tick(100);

    component.averageCpuUtilization.set(30);
    fixture.detectChanges();
    tick(100);

    component.averageCpuUtilization.set(40);
    fixture.detectChanges();
    tick(349);

    expect(searchServers).not.toHaveBeenCalled();

    tick(1);
    flushMicrotasks();

    expect(searchServers).toHaveBeenCalledTimes(1);
    expect(searchServers.calls.mostRecent().args[0].benchmark_score_min).toBe(
      40,
    );
  }));

  it("requests recommendations again for a repeated query", fakeAsync(() => {
    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    component.averageCpuUtilization.set(50);
    fixture.detectChanges();
    tick(350);
    flushMicrotasks();

    expect(searchServers).toHaveBeenCalledTimes(1);

    component.averageCpuUtilization.set(60);
    fixture.detectChanges();
    tick(350);
    flushMicrotasks();

    expect(searchServers).toHaveBeenCalledTimes(2);

    component.averageCpuUtilization.set(50);
    fixture.detectChanges();
    tick(350);
    flushMicrotasks();

    expect(searchServers).toHaveBeenCalledTimes(3);
  }));

  it("ignores stale recommendation responses", fakeAsync(() => {
    let resolveSlow: ((value: unknown) => void) | undefined;
    let resolveFast: ((value: unknown) => void) | undefined;

    searchServers.and.callFake((query: { benchmark_score_min?: number }) => {
      if (query.benchmark_score_min === 50) {
        return new Promise((resolve) => {
          resolveSlow = resolve;
        });
      }

      return new Promise((resolve) => {
        resolveFast = resolve;
      });
    });

    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    component.averageCpuUtilization.set(50);
    fixture.detectChanges();
    tick(350);

    component.averageCpuUtilization.set(60);
    fixture.detectChanges();
    tick(350);

    resolveFast?.({
      body: [
        {
          vendor_id: "aws",
          api_reference: "newer",
          display_name: "newer",
          server_id: "srv-new",
        },
      ],
      headers: {
        get: (name: string) => (name === "x-total-count" ? "1" : null),
      },
    });
    flushMicrotasks();

    expect(component.recommendations()[0]?.api_reference).toBe("newer");

    resolveSlow?.({
      body: [
        {
          vendor_id: "aws",
          api_reference: "older",
          display_name: "older",
          server_id: "srv-old",
        },
      ],
      headers: {
        get: (name: string) => (name === "x-total-count" ? "1" : null),
      },
    });
    flushMicrotasks();

    expect(component.recommendations()[0]?.api_reference).toBe("newer");
  }));

  it("ignores stale baseline benchmark responses", fakeAsync(() => {
    let resolveSlow: ((value: unknown) => void) | undefined;
    let resolveFast: ((value: unknown) => void) | undefined;

    getServerBenchmark.and.callFake(
      (vendorId: string, apiReference: string) => {
        if (vendorId === "aws" && apiReference === "large") {
          return new Promise((resolve) => {
            resolveSlow = resolve;
          });
        }

        return new Promise((resolve) => {
          resolveFast = resolve;
        });
      },
    );

    component.serverTableRows.set([
      {
        vendor_id: "aws",
        api_reference: "large",
        status: Status.Active,
        vcpus: 4,
        memory_amount: 4096,
      },
      {
        vendor_id: "gcp",
        api_reference: "n2-standard-4",
        status: Status.Active,
        vcpus: 4,
        memory_amount: 4096,
      },
    ]);

    component.selectedBaselineServer.set(component.serverTableRows()[0]);
    fixture.detectChanges();

    component.selectedBaselineServer.set(component.serverTableRows()[1]);
    fixture.detectChanges();

    resolveFast?.({
      body: [
        {
          benchmark_id: "stress_ng:bestn",
          config: "{}",
          score: 200,
        },
      ],
    });
    flushMicrotasks();

    expect(component.baselineBenchmarkScores()[0]?.score).toBe(200);

    resolveSlow?.({
      body: [
        {
          benchmark_id: "stress_ng:bestn",
          config: "{}",
          score: 100,
        },
      ],
    });
    flushMicrotasks();

    expect(component.baselineBenchmarkScores()[0]?.score).toBe(200);
  }));

  it("clears advisor filters back to their defaults", () => {
    const baselineServer = component.serverTableRows()[0];

    component.query.set({ vendor: ["aws"] });
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    component.optimizationGoal.set("performance");
    component.averageCpuUtilization.set(70);
    component.minimumMemoryGiB.set(4);
    component.peakGpuMemoryGiB.set(8);
    component.selectCurrency(
      component.availableCurrencies.find(
        (currency) => currency.slug === "EUR",
      )!,
    );
    component.isPriceAllocationEnabled.set(true);
    component.onCustomControlChanged({
      name: "price_allocation",
      value: { selectedValue: "SPOT_ONLY" },
    });
    component.isBaselineRegionEnabled.set(true);
    component.selectedBaselineVendorRegion.set("aws~us-east-1");
    component.setColumnVisibility("VENDOR", true);
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
    expect(component.selectedCurrency().slug).toBe("USD");
    expect(component.isPriceAllocationEnabled()).toBeFalse();
    expect(component.bestPriceAllocation().slug).toBe("ANY");
    expect(component.isBaselineRegionEnabled()).toBeFalse();
    expect(component.selectedBaselineVendorRegion()).toBeNull();
    expect(component.tableColumns().map((column) => column.name)).toEqual([
      "NAME & PROVIDER",
      "PROCESSOR",
      "BENCHMARK",
      "$ EFFICIENCY",
      "MEMORY",
      "GPUs",
      "STORAGE",
      "BEST PRICE",
    ]);
    expect(component.page()).toBe(1);
    expect(component.limit()).toBe(ADVISOR_DEFAULT_PAGE_LIMIT);
    expect(component.manualOrderBy()).toBeUndefined();
    expect(component.manualOrderDir()).toBeUndefined();
  });
});
