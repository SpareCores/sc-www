import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { EMPTY } from "rxjs";

import { ServerCompareComponent } from "./server-compare.component";
import { AnalyticsService } from "../../services/analytics.service";
import { ChartTooltipService } from "../../components/charts/shared/chart-tooltip.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { PrismService } from "../../services/prism.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ServerCompareService } from "../../services/server-compare.service";
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
});
