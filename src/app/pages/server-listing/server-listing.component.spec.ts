import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import {
  ActivatedRoute,
  Params,
  Router,
  convertToParamMap,
} from "@angular/router";
import { BehaviorSubject, of } from "rxjs";
import { OrderDir } from "../../../../sdk/data-contracts";

import { ServerListingComponent } from "./server-listing.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import {
  BAD_BENCHMARK_URL_TOAST_ID,
  QUERY_ERROR_SERVERS_TOAST_ID,
  SERVER_LISTING_BENCHMARK_ERROR_TOAST_ID,
} from "../../services/toast-ids";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { areSearchParamsEqual } from "../../tools/listing-search-params";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerListingComponent", () => {
  let component: ServerListingComponent;
  let fixture: ComponentFixture<ServerListingComponent>;
  let router: Router;
  let keeperAPI: KeeperAPIService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerListingComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerListingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    keeperAPI = TestBed.inject(KeeperAPIService);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the shared tooltip service for column info tooltips", () => {
    const tooltipService = TestBed.inject(UiTooltipService);
    const showSpy = spyOn(tooltipService, "show");
    const hideSpy = spyOn(tooltipService, "hide");
    const target = document.createElement("span");

    component.showTooltip(
      { currentTarget: target, target } as unknown as MouseEvent,
      "Tooltip content",
    );

    expect(component.tooltipContent).toBe("Tooltip content");
    expect(showSpy).toHaveBeenCalledOnceWith(
      component.tooltip.nativeElement,
      jasmine.any(Object),
      {
        left: "anchor-right",
        top: "anchor-above",
      },
    );

    component.hideTooltip();

    expect(hideSpy).toHaveBeenCalledOnceWith(component.tooltip.nativeElement);
  });

  it("cycles vendor ordering through desc, asc, and cleared state", () => {
    const vendorColumn = component.possibleColumns.find(
      (column) => column.name === "VENDOR",
    );
    const searchOptionsChangedSpy = spyOn(component, "searchOptionsChanged");

    expect(vendorColumn).toEqual(
      jasmine.objectContaining({
        show: false,
        orderField: "vendor_id",
      }),
    );

    component.toggleOrdering(vendorColumn!);

    expect(component.orderBy).toBe("vendor_id");
    expect(component.orderDir).toBe(OrderDir.Desc);

    component.toggleOrdering(vendorColumn!);

    expect(component.orderBy).toBe("vendor_id");
    expect(component.orderDir).toBe(OrderDir.Asc);

    component.toggleOrdering(vendorColumn!);

    expect(component.orderBy).toBeUndefined();
    expect(component.orderDir).toBeUndefined();
    expect(searchOptionsChangedSpy).toHaveBeenCalledTimes(3);
  });

  it("preserves falsy nested values and zero speeds in field helpers", () => {
    expect(
      component.getField(
        { server: { hw_virt: false } } as never,
        "server.hw_virt",
      ),
    ).toBeFalse();
    expect(
      component.getField(
        { server: { accelerator_count: 0 } } as never,
        "server.accelerator_count",
      ),
    ).toBe(0);
    expect(component.formatGbps(0)).toBe("0 Gbps");
  });

  it("keeps filter query params when merging a column update via Router", () => {
    const navigateSpy = spyOn(router, "navigate").and.resolveTo(true);
    const pushStateSpy = spyOn(history, "pushState");

    component.searchOptionsChanged({ vcpus_min: 105 });

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ vcpus_min: 105 }),
        replaceUrl: false,
      }),
    );
    const filterNavArgs = navigateSpy.calls.mostRecent().args[1] as {
      queryParamsHandling?: string;
    };
    expect(filterNavArgs.queryParamsHandling).toBeUndefined();

    navigateSpy.calls.reset();
    component.query = { vcpus_min: "105" } as any;
    component.refreshColumns(true);

    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ columns: jasmine.any(Number) }),
        queryParamsHandling: "merge",
        replaceUrl: true,
      }),
    );
    const columnNavArgs = navigateSpy.calls.mostRecent().args[1] as {
      queryParams?: Record<string, unknown>;
    };
    expect(columnNavArgs.queryParams?.["vcpus_min"]).toBeUndefined();
  });

  it("treats column-only URL changes as equal search state", () => {
    expect(
      areSearchParamsEqual(
        { vcpus_min: "105", columns: "1" },
        { vcpus_min: "105", columns: "99" },
      ),
    ).toBeTrue();
  });

  it("ignores stale search responses", fakeAsync(() => {
    let resolveFirst!: (value: any) => void;
    let resolveSecond!: (value: any) => void;

    spyOn(keeperAPI, "searchServers").and.returnValues(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
      new Promise((resolve) => {
        resolveSecond = resolve;
      }),
    );

    component.query = {};
    (component as any)._searchServers(true);
    component.query = { vcpus_min: "105" };
    (component as any)._searchServers(true);

    resolveSecond({
      body: [{ api_reference: "filtered" }],
      headers: { get: () => "1" },
    });
    tick();

    expect(component.servers).toEqual([
      jasmine.objectContaining({ api_reference: "filtered" }),
    ]);

    resolveFirst({
      body: [{ api_reference: "default" }],
      headers: { get: () => "1" },
    });
    tick();

    expect(component.servers).toEqual([
      jasmine.objectContaining({ api_reference: "filtered" }),
    ]);
  }));

  it("does not pushState when assigning the default benchmark config", () => {
    const pushStateSpy = spyOn(history, "pushState");
    const navigateSpy = spyOn(router, "navigate").and.resolveTo(true);

    component.selectedBenchmarkConfig = {
      benchmark_id: "stress_ng:bestn",
      config: "{}",
      benchmarkTemplate: { unit: "score" },
    };

    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("clears the bad benchmark toast when the benchmark query becomes valid or disappears", () => {
    const toastService = TestBed.inject(ToastService);
    const showToast = spyOn(toastService, "show");
    const removeToast = spyOn(toastService, "removeToast");
    const matchingConfig = {
      benchmark_id: "stress_ng:bestn",
      config: "{}",
      benchmarkTemplate: { unit: "score" },
    };
    component.benchmarksConfigs = [matchingConfig];

    (component as any).syncSelectedBenchmarkConfig("not-valid-base64");

    expect(showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: "Invalid URL",
        body: "Visit the Server Navigator page to select a benchmark.",
        id: BAD_BENCHMARK_URL_TOAST_ID,
      }),
    );

    const encodedBenchmark = btoa(
      JSON.stringify({
        id: matchingConfig.benchmark_id,
        config: matchingConfig.config,
      }),
    );
    removeToast.calls.reset();

    (component as any).syncSelectedBenchmarkConfig(encodedBenchmark);

    expect(component.selectedBenchmarkConfig).toEqual(matchingConfig);
    expect(removeToast).toHaveBeenCalledWith(BAD_BENCHMARK_URL_TOAST_ID);

    removeToast.calls.reset();
    (component as any).syncSelectedBenchmarkConfig(undefined);

    expect(removeToast).toHaveBeenCalledWith(BAD_BENCHMARK_URL_TOAST_ID);
  });

  it("shows query-error toast when search fails with 422 and clears it on retry success", fakeAsync(() => {
    const toastService = TestBed.inject(ToastService);
    const showHttpError = spyOn(toastService, "showHttpError");
    const removeToast = spyOn(toastService, "removeToast");
    let resolveSecond!: (value: any) => void;

    spyOn(keeperAPI, "searchServers").and.returnValues(
      Promise.reject({
        status: 422,
        error: { detail: "Invalid filter" },
      }),
      new Promise((resolve) => {
        resolveSecond = resolve;
      }),
    );

    showHttpError.calls.reset();
    removeToast.calls.reset();

    (component as any)._searchServers(true);
    tick();

    expect(showHttpError).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 422 }),
      jasmine.objectContaining({
        title: "Servers query error!",
        id: QUERY_ERROR_SERVERS_TOAST_ID,
      }),
    );

    showHttpError.calls.reset();
    removeToast.calls.reset();

    (component as any)._searchServers(true);
    expect(removeToast).toHaveBeenCalledWith(QUERY_ERROR_SERVERS_TOAST_ID);
    expect(
      removeToast.calls
        .allArgs()
        .filter((args) => args[0] === QUERY_ERROR_SERVERS_TOAST_ID).length,
    ).toBe(1);

    resolveSecond({
      body: [{ api_reference: "ok" }],
      headers: { get: () => "1" },
    });
    tick();

    expect(
      removeToast.calls
        .allArgs()
        .filter((args) => args[0] === QUERY_ERROR_SERVERS_TOAST_ID).length,
    ).toBe(2);
    expect(showHttpError).not.toHaveBeenCalled();
  }));

  it("removes the bad benchmark toast on destroy", () => {
    const toastService = TestBed.inject(ToastService);
    const removeToast = spyOn(toastService, "removeToast");

    component.ngOnDestroy();

    expect(removeToast).toHaveBeenCalledWith(BAD_BENCHMARK_URL_TOAST_ID);
  });
});

describe("ServerListingComponent benchmark bootstrap", () => {
  let fixture: ComponentFixture<ServerListingComponent>;
  let component: ServerListingComponent;
  let keeperAPI: KeeperAPIService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerListingComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerListingComponent);
    component = fixture.componentInstance;
    keeperAPI = TestBed.inject(KeeperAPIService);

    spyOn(keeperAPI, "getServerBenchmarkMeta").and.callFake(() =>
      Promise.reject({ status: 500 }),
    );
    spyOn(keeperAPI, "getBenchmarkConfigs").and.returnValue(
      new Promise(() => {}),
    );
    spyOn(keeperAPI, "searchServers").and.resolveTo({
      body: [],
      headers: { get: () => "0" },
    } as never);
  });

  it("shows an error toast and searches without a benchmark when bootstrap fails", fakeAsync(() => {
    const toastService = TestBed.inject(ToastService);
    const showHttpError = spyOn(toastService, "showHttpError");

    fixture.detectChanges();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(showHttpError).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 500 }),
      jasmine.objectContaining({
        id: SERVER_LISTING_BENCHMARK_ERROR_TOAST_ID,
        title: "Failed to load server filters.",
      }),
    );
    expect(keeperAPI.searchServers).toHaveBeenCalledTimes(1);
    expect(
      (keeperAPI.searchServers as jasmine.Spy).calls.mostRecent().args[0]
        .benchmark_id,
    ).toBeUndefined();
  }));
});

describe("ServerListingComponent query param handling", () => {
  let fixture: ComponentFixture<ServerListingComponent>;
  let component: ServerListingComponent;
  let keeperAPI: KeeperAPIService;
  let queryParams: BehaviorSubject<Params>;

  const defaultConfig = {
    benchmark_id: "stress_ng:bestn",
    config: "{}",
    category: "CPU",
  };

  let benchmarkMeta: () => Promise<unknown>;

  beforeEach(async () => {
    queryParams = new BehaviorSubject<Params>({});
    benchmarkMeta = () =>
      Promise.resolve({
        body: [{ benchmark_id: "stress_ng:bestn", unit: "score" }],
      });

    await TestBed.configureTestingModule({
      imports: [ServerListingComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams,
            params: of({}),
            snapshot: {
              queryParams: {},
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();

    keeperAPI = TestBed.inject(KeeperAPIService);

    spyOn(keeperAPI, "getServerBenchmarkMeta").and.callFake(
      () => benchmarkMeta() as never,
    );
    spyOn(keeperAPI, "getBenchmarkConfigs").and.resolveTo({
      body: [defaultConfig],
    } as never);
    spyOn(keeperAPI, "searchServers").and.resolveTo({
      body: [],
      headers: { get: () => "0" },
    } as never);
    spyOn(TestBed.inject(Router), "navigate").and.resolveTo(true);
  });

  function create() {
    fixture = TestBed.createComponent(ServerListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function benchmarkColumn() {
    return component.possibleColumns.find(
      (column) => column.type === "benchmark",
    );
  }

  it("keeps the benchmark column hidden after unticking it", fakeAsync(() => {
    create();
    tick();

    expect(benchmarkColumn()?.show).toBeTrue();

    const columns = component.possibleColumns
      .map((column) =>
        column.type === "benchmark" ? 0 : column.show ? 1 : 0,
      )
      .reduce((acc: number, bit) => (acc << 1) | bit, 0);
    queryParams.next({ columns: String(columns) });
    tick();

    expect(benchmarkColumn()?.show).toBeFalse();
  }));

  it("selects the default benchmark once a bad benchmark param is gone", fakeAsync(() => {
    const toastService = TestBed.inject(ToastService);
    const showToast = spyOn(toastService, "show");
    const removeToast = spyOn(toastService, "removeToast");
    create();
    tick();

    queryParams.next({ benchmark: "not-valid-base64" });
    tick();

    expect(showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: BAD_BENCHMARK_URL_TOAST_ID }),
    );
    expect(component.selectedBenchmarkConfig).toBeNull();

    showToast.calls.reset();
    removeToast.calls.reset();
    queryParams.next({ vcpus_min: "2" });
    tick();

    expect(showToast).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ id: BAD_BENCHMARK_URL_TOAST_ID }),
    );
    expect(removeToast).toHaveBeenCalledWith(BAD_BENCHMARK_URL_TOAST_ID);
    expect(component.selectedBenchmarkConfig?.benchmark_id).toBe(
      "stress_ng:bestn",
    );
  }));

  it("still searches on filter changes after benchmark bootstrap fails", fakeAsync(() => {
    benchmarkMeta = () => Promise.reject({ status: 500 });
    spyOn(TestBed.inject(ToastService), "showHttpError");
    create();
    tick();

    (keeperAPI.searchServers as jasmine.Spy).calls.reset();
    queryParams.next({ vcpus_min: "2" });
    tick();

    expect(keeperAPI.searchServers).toHaveBeenCalledTimes(1);
  }));
});
