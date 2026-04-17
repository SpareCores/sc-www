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

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows a toast and skips loading for malformed instances data", () => {
    routeSnapshot.queryParams = {
      instances: "%not-base64%",
    };

    component.setup();

    expect(component.instances).toEqual([]);
    expect(component.instancesRaw).toBe("");
    expect(showToast).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        title: "Invalid URL",
        body: 'Visit the <a href="https://sparecores.com/servers" class="underline font-semibold">Server Navigator page</a> to select servers to compare.',
        type: "error",
        id: "bad-compare-url-param",
      }),
    );
    expect(getServerMeta).not.toHaveBeenCalled();
    expect(component.breadcrumbs.length).toBe(2);
  });

  it("shows a toast when decoded instances do not match the expected shape", () => {
    routeSnapshot.queryParams = {
      instances: btoa(JSON.stringify({ vendor: "aws", server: "c7a.large" })),
    };

    component.setup();

    expect(component.instances).toEqual([]);
    expect(component.instancesRaw).toBe("");
    expect(showToast).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        title: "Invalid URL",
        body: 'Visit the <a href="https://sparecores.com/servers" class="underline font-semibold">Server Navigator page</a> to select servers to compare.',
        type: "error",
        id: "bad-compare-url-param",
      }),
    );
    expect(getServerMeta).not.toHaveBeenCalled();
  });

  it("removes the invalid compare toast when a special compare id is unknown", () => {
    routeSnapshot.paramMap = convertToParamMap({
      id: "missing-special-compare",
    });
    component.breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Compare Servers", url: "/compare" },
      { name: "Old Compare", url: "/compare/old" },
    ];

    component.setup();

    expect(removeToast).toHaveBeenCalledWith("bad-compare-url-param");
    expect(component.breadcrumbs).toEqual([
      { name: "Home", url: "/" },
      { name: "Compare Servers", url: "/compare" },
    ]);
  });
});
