import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { EMPTY, Subject } from "rxjs";

import { ServerCompareComponent } from "./server-compare.component";
import { AnalyticsService } from "../../services/analytics.service";
import { ChartTooltipService } from "../../components/charts/shared/chart-tooltip.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { PrismService } from "../../services/prism.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import {
  ServerCompare,
  ServerCompareBaseline,
  ServerCompareService,
} from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerCompareComponent", () => {
  const routeSnapshot = {
    paramMap: convertToParamMap({}),
    queryParams: {} as Record<string, string>,
  };
  const showToast = jasmine.createSpy("show");
  const removeToast = jasmine.createSpy("removeToast");
  const updateTitleAndMetaTags = jasmine.createSpy("updateTitleAndMetaTags");
  const highlightAll = jasmine.createSpy("highlightAll");
  const showIfPresent = jasmine.createSpy("showIfPresent");
  const hideTooltip = jasmine.createSpy("hide");
  const clearCompare = jasmine.createSpy("clearCompare");
  const toggleCompare = jasmine.createSpy("toggleCompare");
  const setBaselineServer = jasmine.createSpy("setBaselineServer");
  const syncCompareRoute = jasmine.createSpy("syncCompareRoute");
  const baselineChanged = new Subject<ServerCompareBaseline | null>();
  const selectionChanged = new Subject<ServerCompare[]>();
  const sentryException = jasmine.createSpy("SentryException");
  const getServerMeta = jasmine.createSpy("getServerMeta");
  const getServerBenchmarkMeta = jasmine.createSpy("getServerBenchmarkMeta");
  const getVendors = jasmine.createSpy("getVendors");
  const getRegions = jasmine.createSpy("getRegions");
  const getZones = jasmine.createSpy("getZones");
  const getServerV2 = jasmine.createSpy("getServerV2");
  const getServerPrices = jasmine.createSpy("getServerPrices");
  const getServerBenchmark = jasmine.createSpy("getServerBenchmark");

  let component: ServerCompareComponent;
  let fixture: ComponentFixture<ServerCompareComponent>;

  beforeEach(async () => {
    routeSnapshot.paramMap = convertToParamMap({});
    routeSnapshot.queryParams = {};
    showToast.calls.reset();
    removeToast.calls.reset();
    updateTitleAndMetaTags.calls.reset();
    highlightAll.calls.reset();
    showIfPresent.calls.reset();
    hideTooltip.calls.reset();
    clearCompare.calls.reset();
    toggleCompare.calls.reset();
    setBaselineServer.calls.reset();
    syncCompareRoute.calls.reset();
    sentryException.calls.reset();
    getServerMeta.calls.reset();
    getServerBenchmarkMeta.calls.reset();
    getVendors.calls.reset();
    getRegions.calls.reset();
    getZones.calls.reset();
    getServerV2.calls.reset();
    getServerPrices.calls.reset();
    getServerBenchmark.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ServerCompareComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: routeSnapshot,
            queryParams: EMPTY,
            params: EMPTY,
          },
        },
        {
          provide: KeeperAPIService,
          useValue: {
            getServerMeta,
            getServerBenchmarkMeta,
            getVendors,
            getRegions,
            getZones,
            getServerV2,
            getServerPrices,
            getServerBenchmark,
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
            clearCompare,
            toggleCompare,
            setBaselineServer,
            syncCompareRoute,
            baselineChanged,
            selectionChanged,
          },
        },
        {
          provide: ToastService,
          useValue: {
            show: showToast,
            removeToast,
          },
        },
        {
          provide: PrismService,
          useValue: {
            highlightAll,
          },
        },
        {
          provide: ChartTooltipService,
          useValue: {
            showIfPresent,
            hide: hideTooltip,
          },
        },
        {
          provide: AnalyticsService,
          useValue: {
            SentryException: sentryException,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerCompareComponent);
    component = fixture.componentInstance;
    spyOn(console, "warn");
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it("coalesces mirror layout updates into one animation frame and removes those listeners on destroy", () => {
    const mainTable = document.createElement("table");
    mainTable.id = "main-table";
    document.body.appendChild(mainTable);
    const mainTableRect = spyOn(
      mainTable,
      "getBoundingClientRect",
    ).and.returnValue({
      x: 0,
      y: 120,
      left: 0,
      top: 120,
      right: 800,
      bottom: 160,
      width: 800,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);
    const frameCallbacks: FrameRequestCallback[] = [];
    const requestAnimationFrame = spyOn(
      window,
      "requestAnimationFrame",
    ).and.callFake((callback: FrameRequestCallback): number => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
    const removeEventListener = spyOn(
      window,
      "removeEventListener",
    ).and.callThrough();

    try {
      component.ngAfterViewInit();

      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
      frameCallbacks.shift()?.(0);
      requestAnimationFrame.calls.reset();

      mainTableRect.and.returnValue({
        x: 0,
        y: 60,
        left: 0,
        top: 60,
        right: 800,
        bottom: 100,
        width: 800,
        height: 40,
        toJSON: () => ({}),
      } as DOMRect);

      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("orientationchange"));

      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(component.isTableOutsideViewport()).toBeFalse();

      frameCallbacks.shift()?.(0);

      expect(component.isTableOutsideViewport()).toBeTrue();

      component.ngOnDestroy();

      expect(removeEventListener).toHaveBeenCalledWith(
        "scroll",
        jasmine.any(Function),
      );
      expect(removeEventListener).toHaveBeenCalledWith(
        "resize",
        jasmine.any(Function),
      );
      expect(removeEventListener).toHaveBeenCalledWith(
        "orientationchange",
        jasmine.any(Function),
      );
    } finally {
      mainTable.remove();
    }
  });

  it("clears pending mirror layout timeout and animation frame on destroy", () => {
    const clearTimeout = spyOn(window, "clearTimeout").and.callThrough();
    const cancelAnimationFrame = spyOn(
      window,
      "cancelAnimationFrame",
    ).and.callThrough();

    Object.defineProperty(component, "mirrorLayoutTimeoutId", {
      configurable: true,
      value: 12,
      writable: true,
    });
    Object.defineProperty(component, "mirrorLayoutFrameId", {
      configurable: true,
      value: 34,
      writable: true,
    });

    component.ngOnDestroy();

    expect(clearTimeout).toHaveBeenCalledWith(12);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(34);
  });

  it("restores baseline server from URL query params", () => {
    routeSnapshot.queryParams = {
      baseline_vendor: "aws",
      baseline_server: "t3.medium",
    };
    component.servers = [
      {
        vendor_id: "aws",
        api_reference: "t3.medium",
        display_name: "T3 Medium",
      },
    ] as typeof component.servers;

    component["restoreBaselineFromUrl"]();

    expect(component.selectedBaselineServer?.api_reference).toBe("t3.medium");
    expect(setBaselineServer).toHaveBeenCalledWith({
      vendor: "aws",
      server: "t3.medium",
    });
  });

  it("selectBaselineServer updates URL with baseline query params", () => {
    component.instancesRaw = "encoded-instances";
    component.servers = [
      {
        vendor_id: "aws",
        api_reference: "t3.medium",
        display_name: "T3 Medium",
      },
    ] as typeof component.servers;
    const pushState = spyOn(window.history, "pushState");

    component.selectBaselineServer(component.servers[0]);

    expect(component.selectedBaselineServer).toBe(component.servers[0]);
    expect(setBaselineServer).toHaveBeenCalledWith({
      vendor: "aws",
      server: "t3.medium",
    });
    expect(pushState).toHaveBeenCalledWith(
      {},
      "",
      jasmine.stringMatching(/baseline_vendor=aws&baseline_server=t3\.medium/),
    );
  });

  it("clearing baseline removes baseline params from URL", () => {
    component.instancesRaw = "encoded-instances";
    component.servers = [
      {
        vendor_id: "aws",
        api_reference: "t3.medium",
        display_name: "T3 Medium",
      },
    ] as typeof component.servers;
    component.selectedBaselineServer = component.servers[0];
    component["lastEncodedCompareQuery"] =
      "baseline_vendor=aws&baseline_server=t3.medium";
    const pushState = spyOn(window.history, "pushState");

    component.selectBaselineServer(null);

    expect(component.selectedBaselineServer).toBeNull();
    expect(setBaselineServer).toHaveBeenCalledWith(null);
    const pushedUrl = pushState.calls.mostRecent().args[2] as string;
    expect(pushedUrl).toContain("instances=encoded-instances");
    expect(pushedUrl).not.toContain("baseline_vendor");
  });

  it("selectBaselineServer preserves URL hash when updating query params", () => {
    component.instancesRaw = "encoded-instances";
    component.servers = [
      {
        vendor_id: "aws",
        api_reference: "t3.medium",
        display_name: "T3 Medium",
      },
    ] as typeof component.servers;
    window.history.replaceState(
      null,
      "",
      "/compare?instances=encoded-instances#benchmark_line_cpu",
    );
    component["lastEncodedCompareQuery"] = "";
    const pushState = spyOn(window.history, "pushState");

    component.selectBaselineServer(component.servers[0]);

    const pushedUrl = pushState.calls.mostRecent().args[2] as string;
    expect(pushedUrl).toContain("#benchmark_line_cpu");
    expect(pushedUrl).toContain("baseline_vendor=aws");
  });

  it("selectBaselineServer URL-encodes Base64 instances query values", () => {
    component.instancesRaw = "abc+def=ghi";
    component.servers = [
      {
        vendor_id: "aws",
        api_reference: "t3.medium",
        display_name: "T3 Medium",
      },
    ] as typeof component.servers;
    const pushState = spyOn(window.history, "pushState");

    component.selectBaselineServer(component.servers[0]);

    const pushedUrl = pushState.calls.mostRecent().args[2] as string;
    expect(pushedUrl).toContain("instances=abc%2Bdef%3Dghi");
  });

  it("reorders and deletes compare servers without refetching", () => {
    const serverA = {
      vendor_id: "aws",
      api_reference: "a1",
      display_name: "A",
    };
    const serverB = {
      vendor_id: "gcp",
      api_reference: "b1",
      display_name: "B",
    };
    const serverC = {
      vendor_id: "azure",
      api_reference: "c1",
      display_name: "C",
    };
    component.isLoading = false;
    component.servers = [serverA, serverB, serverC] as typeof component.servers;
    component.benchmarkMeta = [
      {
        benchmark_id: "bw_mem",
        configs: [{ config: {}, values: [1, 2, 3] }],
      },
    ];
    component.benchmarkCategories = [
      {
        id: "memory",
        data: component.benchmarkMeta,
      },
    ];
    const pushState = spyOn(window.history, "pushState");
    getServerMeta.calls.reset();

    selectionChanged.next([
      {
        display_name: "B",
        vendor: "gcp",
        server: "b1",
        zonesRegions: [],
      },
      {
        display_name: "A",
        vendor: "aws",
        server: "a1",
        zonesRegions: [],
      },
    ]);

    expect(component.servers).toEqual([
      serverB,
      serverA,
    ] as typeof component.servers);
    expect(component.benchmarkMeta[0].configs[0].values).toEqual([2, 1]);
    expect(getServerMeta).not.toHaveBeenCalled();
    expect(syncCompareRoute).not.toHaveBeenCalled();
    expect(pushState).toHaveBeenCalled();
  });
});
