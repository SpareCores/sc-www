import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { EMPTY } from "rxjs";

import { EmbeddedCompareChartComponent } from "./embedded-compare-chart.component";
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ToastService } from "../../services/toast.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbeddedCompareChartComponent", () => {
  const routeSnapshot = {
    params: {
      chartname: "all",
    },
    queryParams: {} as Record<string, string>,
  };
  const showToast = jasmine.createSpy("show");
  const removeToast = jasmine.createSpy("removeToast");
  const sentryException = jasmine.createSpy("SentryException");
  const getServerMeta = jasmine.createSpy("getServerMeta");
  const getServerBenchmarkMeta = jasmine.createSpy("getServerBenchmarkMeta");
  const getVendors = jasmine.createSpy("getVendors");
  const getRegions = jasmine.createSpy("getRegions");
  const getZones = jasmine.createSpy("getZones");
  const getServerV2 = jasmine.createSpy("getServerV2");
  const getServerPrices = jasmine.createSpy("getServerPrices");
  const getServerBenchmark = jasmine.createSpy("getServerBenchmark");

  let component: EmbeddedCompareChartComponent;
  let fixture: ComponentFixture<EmbeddedCompareChartComponent>;

  beforeEach(async () => {
    routeSnapshot.params = { chartname: "all" };
    routeSnapshot.queryParams = {};
    showToast.calls.reset();
    removeToast.calls.reset();
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
      imports: [EmbeddedCompareChartComponent],
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
          useValue: {},
        },
        {
          provide: AnalyticsService,
          useValue: {
            SentryException: sentryException,
          },
        },
        {
          provide: ToastService,
          useValue: {
            show: showToast,
            removeToast,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedCompareChartComponent);
    component = fixture.componentInstance;
    component.showChart = "__test__";
    component.benchmarkMeta = [];
    component.benchmarkCategories = [];
    component.instanceProperties = [];
    component.instancePropertyCategories = [];
    component.servers = [];
    spyOn(console, "warn");
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
        title: "Invalid Compare URL",
        type: "error",
        id: "bad-compare-url-param",
      }),
    );
    expect(getServerMeta).not.toHaveBeenCalled();
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
        title: "Invalid Compare URL",
        type: "error",
        id: "bad-compare-url-param",
      }),
    );
    expect(getServerMeta).not.toHaveBeenCalled();
  });
});
