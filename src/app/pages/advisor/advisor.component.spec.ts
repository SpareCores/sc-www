import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick,
} from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import {
  Allocation,
  OrderDir,
  PriceUnit,
  Status,
} from "../../../../sdk/data-contracts";
import { AdvisorComponent } from "./advisor.component";
import {
  ADVISOR_AVERAGE_UTILIZATION_TOOLTIP,
  ADVISOR_BASELINE_SERVER_TOOLTIP,
  ADVISOR_BASELINE_WORKLOAD_TOOLTIP,
  ADVISOR_DISABLED_BASELINE_WORKLOAD_MESSAGE,
  ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
  ADVISOR_DEFAULT_PAGE_LIMIT,
  ADVISOR_DEFAULT_PEAK_GPU_MEMORY_GIB,
  ADVISOR_MINIMUM_MEMORY_MIN_GIB,
  ADVISOR_REQUIRED_GPU_MEMORY_TITLE,
  ADVISOR_REQUIRED_MEMORY_TITLE,
  ADVISOR_DEFAULT_SERVER_COLUMNS,
  ADVISOR_EMPTY_BASELINE_WORKLOAD_MESSAGE,
  ADVISOR_EMPTY_BASELINE_WORKLOAD_TOAST_ID,
  ADVISOR_LOADING_BASELINE_WORKLOAD_MESSAGE,
  ADVISOR_PAGE_LIMITS,
  ADVISOR_TABLE_COLUMNS,
} from "./advisor.constants";
import { DropdownManagerService } from "../../services/dropdown-manager.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ServerCompareService } from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import { NeetoCalService } from "../../services/neeto-cal.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AdvisorComponent", () => {
  const queryParams$ = new BehaviorSubject({});
  const getServersSelect = jasmine.createSpy("getServersSelect");
  const getServerBenchmarkMeta = jasmine.createSpy("getServerBenchmarkMeta");
  const getBenchmarkConfigs = jasmine.createSpy("getBenchmarkConfigs");
  const getBenchmarkWorkloads = jasmine.createSpy("getBenchmarkWorkloads");
  const getServerBenchmark = jasmine.createSpy("getServerBenchmark");
  const getServerPrices = jasmine.createSpy("getServerPrices");
  const searchServerPrices = jasmine.createSpy("searchServerPrices");
  const searchServers = jasmine.createSpy("searchServers");
  const getComplianceFrameworks = jasmine.createSpy("getComplianceFrameworks");
  const getVendors = jasmine.createSpy("getVendors");
  const getStorages = jasmine.createSpy("getStorages");
  const getCountries = jasmine.createSpy("getCountries");
  const getRegions = jasmine.createSpy("getRegions");
  const updateTitleAndMetaTags = jasmine.createSpy("updateTitleAndMetaTags");
  const showToast = jasmine.createSpy("show");
  const initDropdown = jasmine.createSpy("initDropdown");
  const initializeNeetoCal = jasmine.createSpy("initialize");
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
    getBenchmarkWorkloads.calls.reset();
    getServerBenchmark.calls.reset();
    getServerPrices.calls.reset();
    searchServerPrices.calls.reset();
    searchServers.calls.reset();
    getComplianceFrameworks.calls.reset();
    getVendors.calls.reset();
    getStorages.calls.reset();
    getCountries.calls.reset();
    getRegions.calls.reset();
    updateTitleAndMetaTags.calls.reset();
    showToast.calls.reset();
    initDropdown.calls.reset();
    initializeNeetoCal.calls.reset();
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
    getBenchmarkWorkloads.and.resolveTo({
      body: [
        {
          benchmark_id: "stress_ng:bestn",
          higher_is_better: true,
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
          zone_id: "us-east-1a",
          server_id: "srv-1",
          operating_system: "Linux",
          allocation: Allocation.Ondemand,
          unit: PriceUnit.Hour,
          price: 0.12,
          currency: "USD",
        },
        {
          vendor_id: "aws",
          region_id: "eu-west-1",
          zone_id: "eu-west-1a",
          server_id: "srv-1",
          operating_system: "Linux",
          allocation: Allocation.Spot,
          unit: PriceUnit.Hour,
          price: 0.07,
          currency: "USD",
        },
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          zone_id: "us-east-1a",
          server_id: "srv-1",
          operating_system: "Linux",
          allocation: Allocation.Ondemand,
          unit: PriceUnit.Month,
          price: 60,
          currency: "USD",
        },
      ],
    });
    searchServerPrices.and.resolveTo({ body: [] });
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
            getBenchmarkWorkloads,
            getServerBenchmark,
            getServerPrices,
            searchServerPrices,
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
        {
          provide: NeetoCalService,
          useValue: {
            initialize: initializeNeetoCal,
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

  function selectBaselineServer(): void {
    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();
  }

  function getBaselineServerInput(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector(
      "#custom_control_input_baseline_server",
    ) as HTMLInputElement | null;
  }

  function getBaselineWorkloadInput(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector(
      "#custom_control_input_server_workload",
    ) as HTMLInputElement | null;
  }

  function selectFirstAvailableWorkload(): void {
    const workload = component.baselineBenchmarkConfigOptions()[0];

    if (!workload) {
      fail("Expected an available baseline workload");
      return;
    }

    component.onCustomControlChanged({
      name: "server_workload",
      value: {
        inputValue: workload.displayName,
        selectedBenchmarkConfig: workload,
      },
    });
    fixture.detectChanges();
  }

  it("preloads baseline servers with the advisor default column set", () => {
    expect(initializeNeetoCal).toHaveBeenCalled();

    expect(getServersSelect).toHaveBeenCalledOnceWith([
      ...ADVISOR_DEFAULT_SERVER_COLUMNS,
    ]);

    component.baselineServerInput.set("aws large");

    expect(component.filteredBaselineServers().length).toBe(1);
    expect(component.filteredBaselineServers()[0].api_reference).toBe("large");
  });

  it("renders the advisor hero actions and exact example preset", () => {
    const host = fixture.nativeElement as HTMLElement;
    const exampleButton = host.querySelector("#advisor_example_button");
    const introductionButton = host.querySelector(
      "#advisor_introduction_button",
    );
    const shareButton = host.querySelector("#advisor_share_button");
    const introductionFrame = host.querySelector(
      "#advisor-introduction-modal iframe",
    ) as HTMLIFrameElement | null;

    expect(exampleButton?.textContent).toContain("Example");
    expect(introductionButton?.textContent).toContain("Introduction");
    expect(shareButton?.textContent).toContain("Share");
    expect(component.advisorExampleQueryParams).toEqual({
      baseline_vendor: "aws",
      baseline_server: "m5ad.large",
      limit_architecture: "true",
      workload_id: "workload_profile:web",
      workload_config: "{}",
      avg_cpu_utilization: "60",
      minimum_memory: "6",
    });
    expect(introductionFrame?.src).toContain("obkavneTmwU");
    expect(introductionFrame?.title).toBe("Spare Cores advisor introduction");
    expect(host.querySelector("#meeting-advisor-advanced")).toBeNull();
  });

  it("focuses the baseline server input when route state has no baseline", fakeAsync(() => {
    queryParams$.next({});
    fixture.detectChanges();
    flushMicrotasks();
    tick(16);
    fixture.detectChanges();

    expect(document.activeElement).toBe(getBaselineServerInput());
  }));

  it("focuses the baseline workload input after selecting a baseline server", fakeAsync(() => {
    const baselineServer = component.serverTableRows()[0];

    component.onCustomControlChanged({
      name: "baseline_server",
      value: {
        inputValue: `${baselineServer.vendor_id} ${baselineServer.api_reference}`,
        selectedServer: baselineServer,
      },
    });
    fixture.detectChanges();
    flushMicrotasks();
    tick(16);
    fixture.detectChanges();
    flushMicrotasks();
    tick(16);
    fixture.detectChanges();

    expect(document.activeElement).toBe(getBaselineWorkloadInput());
  }));

  it("restarts focus retries when the pending custom control target changes", () => {
    const searchBar = component.searchBar();

    if (!searchBar) {
      fail("Expected the advisor search bar to be available.");
      return;
    }

    const focusSpy = spyOn(searchBar, "focusCustomControl").and.returnValue(
      false,
    );
    const queueSpy = spyOn(
      component as unknown as {
        queuePendingCustomControlFocusAttempt(): void;
      },
      "queuePendingCustomControlFocusAttempt",
    ).and.stub();
    const advisorComponent = component as unknown as {
      customControlFocusAttemptCount: number;
      lastPendingCustomControlFocus: string | null;
      pendingCustomControlFocus: {
        set(value: string | null): void;
      };
      focusPendingCustomControl(): void;
    };

    advisorComponent.customControlFocusAttemptCount = 999;
    advisorComponent.lastPendingCustomControlFocus = "baseline_server";
    advisorComponent.pendingCustomControlFocus.set("server_workload");

    advisorComponent.focusPendingCustomControl();

    expect(focusSpy).toHaveBeenCalledOnceWith("server_workload");
    expect(advisorComponent.customControlFocusAttemptCount).toBe(1);
    expect(advisorComponent.lastPendingCustomControlFocus).toBe(
      "server_workload",
    );
    expect(queueSpy).toHaveBeenCalledOnceWith();
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
    const workloadControl = component
      .customControls()
      .find((control) => control.name === "server_workload");
    const minimumMemoryControl = component
      .customControls()
      .find((control) => control.name === "minimum_memory");
    const peakGpuMemoryControl = component
      .customControls()
      .find((control) => control.name === "peak_gpu_memory");

    expect(optimizationGoalControl?.type).toBe("singleSelect");
    expect(workloadControl?.disabled).toBeTrue();
    expect(workloadControl?.emptyMessage).toBe(
      ADVISOR_DISABLED_BASELINE_WORKLOAD_MESSAGE,
    );
    expect(minimumMemoryControl?.numericValue).toBeNull();
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

  it("uses empty minimum memory and omits baseline placeholder parentheses by default", () => {
    const minimumMemoryControl = component
      .customControls()
      .find((control) => control.name === "minimum_memory");
    const cpuAllocationControl = component
      .customControls()
      .find((control) => control.name === "limit_cpu_allocation");
    const cpuArchitectureControl = component
      .customControls()
      .find((control) => control.name === "limit_architecture");

    expect(component.minimumMemoryGiB()).toBeNull();
    expect(component.selectedBenchmarkConfig()).toBeNull();
    expect(minimumMemoryControl?.required).toBeFalsy();
    expect(cpuAllocationControl?.title).toBe("CPU allocation");
    expect(cpuArchitectureControl?.title).toBe("CPU architecture");
  });

  it("uses the updated advisor control copy for labels and tooltips", () => {
    const baselineServerControl = component
      .customControls()
      .find((control) => control.name === "baseline_server");
    const baselineWorkloadControl = component
      .customControls()
      .find((control) => control.name === "server_workload");
    const averageUtilizationControl = component
      .customControls()
      .find((control) => control.name === "average_cpu_utilization");
    const minimumMemoryControl = component
      .customControls()
      .find((control) => control.name === "minimum_memory");
    const peakGpuMemoryControl = component
      .customControls()
      .find((control) => control.name === "peak_gpu_memory");

    expect(baselineServerControl?.description).toBe(
      ADVISOR_BASELINE_SERVER_TOOLTIP,
    );
    expect(baselineServerControl?.descriptionDisplay).toBe("tooltip");
    expect(baselineWorkloadControl?.description).toBe(
      ADVISOR_BASELINE_WORKLOAD_TOOLTIP,
    );
    expect(baselineWorkloadControl?.descriptionDisplay).toBe("tooltip");
    expect(averageUtilizationControl?.description).toBe(
      ADVISOR_AVERAGE_UTILIZATION_TOOLTIP,
    );
    expect(averageUtilizationControl?.descriptionDisplay).toBe("tooltip");
    expect(minimumMemoryControl?.title).toBe(ADVISOR_REQUIRED_MEMORY_TITLE);
    expect(peakGpuMemoryControl?.title).toBe(ADVISOR_REQUIRED_GPU_MEMORY_TITLE);
  });

  it("adds utilization summary context once the baseline workload is selected", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();

    component.averageCpuUtilization.set(30);
    fixture.detectChanges();
    flushMicrotasks();

    const averageUtilizationControl = component
      .customControls()
      .find((control) => control.name === "average_cpu_utilization");

    expect(averageUtilizationControl?.valueSummary).toBe(
      "of 100; target score: 30",
    );
  }));

  it("keeps the outer sidebar collapser while removing advisor section chrome", () => {
    const host = fixture.nativeElement as HTMLElement;
    const advisorCategory = host.querySelector(
      '[data-category-id="advisor"]',
    ) as HTMLElement | null;

    expect(host.querySelector(".advisor-filter-bar-collapser")).not.toBeNull();
    expect(host.querySelector(".advisor-filter-bar-top")).toBeNull();
    expect(advisorCategory).not.toBeNull();
    expect(advisorCategory?.querySelector('[role="button"]')).toBeNull();
    expect(advisorCategory?.textContent).toContain("Baseline server");

    component.toggleCollapse();
    fixture.detectChanges();

    expect(
      host
        .querySelector(".advisor-filter-bar")
        ?.classList.contains("advisor-filter-bar-collapsed"),
    ).toBeTrue();
  });

  it("enables and filters baseline workloads after baseline scores load", fakeAsync(() => {
    component.benchmarkConfigOptions.set([
      ...component.benchmarkConfigOptions(),
      {
        benchmark_id: "geekbench:score",
        config: "{}",
        category: "geekbench",
        configTitle: "",
        displayName: "Geekbench Score",
        framework: "geekbench",
      },
    ]);

    expect(
      component
        .customControls()
        .find((control) => control.name === "server_workload")?.disabled,
    ).toBeTrue();

    selectBaselineServer();

    const workloadControl = component
      .customControls()
      .find((control) => control.name === "server_workload");

    expect(workloadControl?.disabled).toBeFalse();
    expect(
      workloadControl?.benchmarkOptions?.map((option) => option.benchmark_id),
    ).toEqual(["stress_ng:bestn"]);
    expect(
      workloadControl?.benchmarkGroups?.flatMap((group) =>
        group.options.map((option) => option.benchmark_id),
      ),
    ).toEqual(["stress_ng:bestn"]);
  }));

  it("sorts workload profile groups first and prefers friendly workload labels", fakeAsync(() => {
    getServerBenchmarkMeta.and.resolveTo({
      body: [
        {
          benchmark_id: "fio:randread",
          name: "Fio Random Read",
          framework: "fio",
        },
        {
          benchmark_id: "workload_profile:web",
          name: "Workload profile: Web server",
          framework: "workload-profile",
        },
      ],
    });
    getBenchmarkConfigs.and.resolveTo({
      body: [
        {
          benchmark_id: "fio:randread",
          config: "{}",
          category: "fio",
        },
        {
          benchmark_id: "workload_profile:web",
          config: "{}",
          category: "workload_profile",
        },
      ],
    });

    (
      component as unknown as {
        loadBenchmarkConfigs(): void;
      }
    ).loadBenchmarkConfigs();
    flushMicrotasks();
    component.selectedBaselineServer.set(component.serverTableRows()[0]);
    fixture.detectChanges();
    flushMicrotasks();
    component.baselineBenchmarkScores.set([
      {
        vendor_id: "aws",
        server_id: "srv-1",
        benchmark_id: "fio:randread",
        config: {},
        score: 200,
      },
      {
        vendor_id: "aws",
        server_id: "srv-1",
        benchmark_id: "workload_profile:web",
        config: {},
        score: 100,
      },
    ]);
    fixture.detectChanges();

    expect(component.benchmarkGroups().map((group) => group.name)).toEqual([
      "Workload profile",
      "Fio",
    ]);
    expect(component.benchmarkGroups()[0]?.options[0]?.displayName).toBe(
      "Workload profile: Web server",
    );
    expect(component.benchmarkGroups()[1]?.options[0]?.displayName).toBe(
      "Fio Random Read",
    );
  }));

  it("marks baseline workload as loading while baseline scores load", fakeAsync(() => {
    let resolveBenchmarkScores:
      | ((value: {
          body: Array<{ benchmark_id: string; config: string; score: number }>;
        }) => void)
      | undefined;

    getServerBenchmark.and.returnValue(
      new Promise((resolve) => {
        resolveBenchmarkScores = resolve;
      }),
    );

    const baselineServer = component.serverTableRows()[0];
    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    fixture.detectChanges();

    const loadingControl = component
      .customControls()
      .find((control) => control.name === "server_workload");

    expect(loadingControl?.disabled).toBeTrue();
    expect(loadingControl?.loading).toBeTrue();
    expect(loadingControl?.emptyMessage).toBe(
      ADVISOR_LOADING_BASELINE_WORKLOAD_MESSAGE,
    );

    const advisorPage = fixture.nativeElement.querySelector(
      ".advisor-page",
    ) as HTMLElement;

    expect(advisorPage.classList).toContain(
      "advisor-page--loading-baseline-workloads",
    );
    expect(getComputedStyle(advisorPage).cursor).toBe("wait");

    resolveBenchmarkScores?.({
      body: [
        {
          benchmark_id: "stress_ng:bestn",
          config: "{}",
          score: 100,
        },
      ],
    });
    flushMicrotasks();
    fixture.detectChanges();

    const loadedControl = component
      .customControls()
      .find((control) => control.name === "server_workload");

    expect(loadedControl?.disabled).toBeFalse();
    expect(loadedControl?.loading).toBeFalse();
    expect(advisorPage.classList).not.toContain(
      "advisor-page--loading-baseline-workloads",
    );
  }));

  it("shows a warning toast when a baseline has no benchmark workloads", fakeAsync(() => {
    getServerBenchmark.and.resolveTo({ body: [] });

    selectBaselineServer();

    const workloadControl = component
      .customControls()
      .find((control) => control.name === "server_workload");

    expect(component.baselineBenchmarkConfigOptions()).toEqual([]);
    expect(workloadControl?.disabled).toBeTrue();
    expect(workloadControl?.emptyMessage).toBe(
      ADVISOR_EMPTY_BASELINE_WORKLOAD_MESSAGE,
    );
    expect(showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: ADVISOR_EMPTY_BASELINE_WORKLOAD_TOAST_ID,
        title: "No baseline workloads found",
        type: "warning",
      }),
    );
  }));

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
    expect(component.minimumMemoryGiB()).toBe(ADVISOR_MINIMUM_MEMORY_MIN_GIB);
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

  it("derives minimum memory from the baseline server and utilization when empty", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();

    component.averageCpuUtilization.set(50);

    fixture.detectChanges();
    flushMicrotasks();

    expect(component.minimumMemoryGiB()).toBe(2);
    expect(component.recommendationQuery()?.memory_min).toBe(2);
  }));

  it("restores an empty minimum memory from the route and derives it from the baseline server", async () => {
    queryParams$.next({
      baseline_vendor: "aws",
      baseline_server: "large",
      workload_id: "stress_ng:bestn",
      workload_config: "{}",
      avg_cpu_utilization: "60",
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.selectedBaselineServer()?.api_reference).toBe("large");
    expect(component.minimumMemoryGiB()).toBe(2.4);
  });

  it("only requests recommendations once the required inputs are valid", fakeAsync(() => {
    expect(component.recommendationQuery()).toBeNull();
    expect(searchServers).not.toHaveBeenCalled();

    selectBaselineServer();
    selectFirstAvailableWorkload();

    component.averageCpuUtilization.set(50);

    fixture.detectChanges();
    tick(350);
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.recommendationQuery()).not.toBeNull();
    expect(component.recommendationQuery()?.benchmark_score_min).toBe(50);
    expect(component.recommendationQuery()?.memory_min).toBe(2);
    expect(component.recommendationQuery()?.order_by).toBe("min_price");
    expect(searchServers).toHaveBeenCalled();
  }));

  it("does not overwrite minimum memory after it has already been filled", fakeAsync(() => {
    const baselineServer = component.serverTableRows()[0];
    const nextBaselineServer = {
      ...baselineServer,
      api_reference: "xlarge",
      memory_amount: 8192,
    };

    component.selectedBaselineServer.set(baselineServer);
    component.baselineServerInput.set("aws large");
    component.averageCpuUtilization.set(50);
    fixture.detectChanges();
    flushMicrotasks();

    expect(component.minimumMemoryGiB()).toBe(2);

    component.selectedBaselineServer.set(nextBaselineServer);
    component.baselineServerInput.set("aws xlarge");
    fixture.detectChanges();
    flushMicrotasks();

    expect(component.minimumMemoryGiB()).toBe(2);
  }));

  it("only applies price allocation to recommendation queries when enabled", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();
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
    selectBaselineServer();
    selectFirstAvailableWorkload();

    expect(getServerPrices).toHaveBeenCalledOnceWith("aws", "large", "USD");
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

  it("reloads baseline prices when the selected currency changes", fakeAsync(() => {
    selectBaselineServer();

    component.selectCurrency(
      component.availableCurrencies.find(
        (currency) => currency.slug === "EUR",
      )!,
    );
    fixture.detectChanges();
    flushMicrotasks();

    expect(getServerPrices.calls.mostRecent().args).toEqual([
      "aws",
      "large",
      "EUR",
    ]);
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
    selectBaselineServer();
    selectFirstAvailableWorkload();

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
    expect(rows[0].querySelectorAll(".advisor-table-delta").length).toBe(0);
    expect(
      rows[1].classList.contains("advisor-table-row-baseline"),
    ).toBeFalse();
  });

  it("shows the baseline benchmark score when the baseline recommendation row has no benchmark field", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();

    component.recommendations.set([
      {
        vendor_id: "aws",
        api_reference: "large",
        display_name: "large",
        server_id: "srv-baseline",
        selected_benchmark_score: null,
      },
    ] as never[]);
    component.totalRecommendationCount.set(1);
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      "#advisor_results_table tbody tr",
    ) as HTMLTableRowElement;
    const benchmarkCell = row.querySelectorAll("td")[3] as HTMLTableCellElement;

    expect(benchmarkCell.textContent).toContain("100");
  }));

  it("renders positive benchmark, efficiency, and price deltas against the baseline", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();

    component.recommendations.set([
      {
        vendor_id: "aws",
        api_reference: "c7a.large",
        display_name: "c7a.large",
        server_id: "srv-1",
        selected_benchmark_score: 120,
        selected_benchmark_score_per_price: 2142.86,
        min_price: 0.05,
      },
    ] as never[]);
    component.totalRecommendationCount.set(1);
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      "#advisor_results_table tbody tr",
    ) as HTMLTableRowElement;
    const cells = row.querySelectorAll("td");
    const benchmarkDelta = cells[3].querySelector(
      ".advisor-table-delta",
    ) as HTMLElement;
    const efficiencyDelta = cells[4].querySelector(
      ".advisor-table-delta",
    ) as HTMLElement;
    const priceDelta = cells[8].querySelector(
      ".advisor-table-delta",
    ) as HTMLElement;

    expect(benchmarkDelta.textContent?.trim()).toBe("20%");
    expect(benchmarkDelta.classList).toContain("advisor-table-delta--positive");
    expect(efficiencyDelta.textContent?.trim()).toBe("(50%)");
    expect(efficiencyDelta.classList).toContain(
      "advisor-table-delta--positive",
    );
    expect(priceDelta.textContent?.trim()).toBe("-29%");
    expect(priceDelta.classList).toContain("advisor-table-delta--positive");
  }));

  it("renders benchmark improvements in red when higher_is_better is false", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();

    const selectedBenchmark = component.selectedBenchmarkConfig();
    expect(selectedBenchmark?.benchmarkTemplate).toBeTruthy();

    component.selectedBenchmarkConfig.set({
      ...(selectedBenchmark as NonNullable<typeof selectedBenchmark>),
      benchmarkTemplate: {
        ...selectedBenchmark!.benchmarkTemplate!,
        higher_is_better: false,
      },
    });

    component.recommendations.set([
      {
        vendor_id: "aws",
        api_reference: "c7a.large",
        display_name: "c7a.large",
        server_id: "srv-1",
        selected_benchmark_score: 120,
      },
    ] as never[]);
    component.totalRecommendationCount.set(1);
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      "#advisor_results_table tbody tr",
    ) as HTMLTableRowElement;
    const benchmarkDelta = row
      .querySelectorAll("td")[3]
      .querySelector(".advisor-table-delta") as HTMLElement;

    expect(benchmarkDelta.textContent?.trim()).toBe("20%");
    expect(benchmarkDelta.classList).toContain("advisor-table-delta--negative");
  }));

  it("does not render efficiency or price deltas when the baseline price is unavailable", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();

    const eurCurrency = component.availableCurrencies.find(
      (currency) => currency.slug === "EUR",
    );

    expect(eurCurrency).toBeDefined();

    component.selectedCurrency.set(eurCurrency!);
    component.recommendations.set([
      {
        vendor_id: "aws",
        api_reference: "c7a.large",
        display_name: "c7a.large",
        server_id: "srv-1",
        selected_benchmark_score_per_price: 1500,
        min_price: 0.05,
      },
    ] as never[]);
    component.totalRecommendationCount.set(1);
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      "#advisor_results_table tbody tr",
    ) as HTMLTableRowElement;
    const cells = row.querySelectorAll("td");
    const efficiencyDelta = cells[4].querySelector(".advisor-table-delta");
    const priceDelta = cells[8].querySelector(".advisor-table-delta");

    expect(efficiencyDelta).toBeNull();
    expect(priceDelta).toBeNull();
  }));

  it("uses selected baseline recommendation monthly price for monthly deltas when baseline monthly records are missing", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();

    component.isPriceAllocationEnabled.set(true);
    component.bestPriceAllocation.set(
      component.bestPriceAllocationTypes.find(
        (allocation) => allocation.slug === "MONTHLY",
      )!,
    );

    component.baselineServerPrices.set([
      {
        vendor_id: "aws",
        region_id: "us-east-1",
        zone_id: "us-east-1a",
        server_id: "srv-baseline",
        operating_system: "Linux",
        allocation: Allocation.Ondemand,
        unit: PriceUnit.Hour,
        price: 0.0245,
        currency: "USD",
      },
    ] as never[]);

    component.recommendations.set([
      {
        vendor_id: "aws",
        api_reference: "large",
        display_name: "large",
        server_id: "srv-baseline",
        min_price: 17.89,
        min_price_ondemand_monthly: 17.89,
      },
      {
        vendor_id: "aws",
        api_reference: "c7a.large",
        display_name: "c7a.large",
        server_id: "srv-1",
        min_price: 39.35,
        min_price_ondemand_monthly: 39.35,
      },
    ] as never[]);

    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.baselinePriceAggregate().min_price_ondemand_monthly).toBe(
      17.89,
    );
    expect(component.baselinePriceAggregate().min_price).toBe(17.89);

    const bestPriceDelta = component.getPriceDelta(
      component.recommendations()[1] as never,
      "min_price",
    );

    const monthlyDelta = component.getPriceDelta(
      component.recommendations()[1] as never,
      "min_price_ondemand_monthly",
    );

    expect(bestPriceDelta).not.toBeNull();
    expect(component.getDeltaLabel(bestPriceDelta!)).toBe("120%");
    expect(monthlyDelta).not.toBeNull();
    expect(component.getDeltaLabel(monthlyDelta!)).toBe("120%");
  }));

  it("uses searched baseline monthly prices for monthly deltas when the baseline server is not in the recommendations", fakeAsync(() => {
    getServerPrices.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          zone_id: "us-east-1a",
          server_id: "srv-baseline",
          operating_system: "Linux",
          allocation: Allocation.Ondemand,
          unit: PriceUnit.Hour,
          price: 0.0245,
          currency: "USD",
        },
      ],
    });
    searchServerPrices.and.resolveTo({
      body: [
        {
          vendor_id: "aws",
          region_id: "us-east-1",
          zone_id: "us-east-1a",
          server_id: "srv-baseline",
          operating_system: "Linux",
          allocation: Allocation.Ondemand,
          unit: PriceUnit.Hour,
          price: 0.0245,
          price_monthly: 17.89,
          currency: "USD",
          server: {
            vendor_id: "aws",
            server_id: "srv-baseline",
            api_reference: "large",
          },
        },
      ],
    });

    selectBaselineServer();
    selectFirstAvailableWorkload();

    component.isPriceAllocationEnabled.set(true);
    component.bestPriceAllocation.set(
      component.bestPriceAllocationTypes.find(
        (allocation) => allocation.slug === "MONTHLY",
      )!,
    );

    component.recommendations.set([
      {
        vendor_id: "aws",
        api_reference: "c7a.large",
        display_name: "c7a.large",
        server_id: "srv-1",
        min_price: 39.35,
        min_price_ondemand_monthly: 39.35,
      },
    ] as never[]);

    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.baselinePriceAggregate().min_price_ondemand_monthly).toBe(
      17.89,
    );
    expect(component.baselinePriceAggregate().min_price).toBe(17.89);

    const bestPriceDelta = component.getPriceDelta(
      component.recommendations()[0] as never,
      "min_price",
    );
    const monthlyDelta = component.getPriceDelta(
      component.recommendations()[0] as never,
      "min_price_ondemand_monthly",
    );

    expect(bestPriceDelta).not.toBeNull();
    expect(component.getDeltaLabel(bestPriceDelta!)).toBe("120%");
    expect(monthlyDelta).not.toBeNull();
    expect(component.getDeltaLabel(monthlyDelta!)).toBe("120%");
  }));

  it("removes the top price allocation dropdown from the toolbar", () => {
    expect(
      fixture.nativeElement.querySelector("#advisor_allocation_button"),
    ).toBeNull();
  });

  it("debounces rapid recommendation filter changes", fakeAsync(() => {
    selectBaselineServer();
    selectFirstAvailableWorkload();

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
    selectBaselineServer();
    selectFirstAvailableWorkload();

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

    selectBaselineServer();
    selectFirstAvailableWorkload();

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
    expect(component.selectedBenchmarkConfig()).toBeNull();
    expect(component.optimizationGoal()).toBe("cost");
    expect(component.averageCpuUtilization()).toBeNull();
    expect(component.minimumMemoryGiB()).toBe(
      ADVISOR_DEFAULT_MINIMUM_MEMORY_GIB,
    );
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
