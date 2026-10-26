import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { EMPTY } from "rxjs";

import { EmbeddedCompareChart } from "./embedded-compare-chart";
import { Analytics } from "../../services/analytics";
import { KeeperAPI } from "../../services/keeper-api";
import { SeoHandler } from "../../services/seo-handler";
import { Toast } from "../../services/toast";
import { BAD_SERVER_COMPARE_URL_TOAST_ID } from "../../services/toast-ids";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbeddedCompareChart", () => {
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

  let component: EmbeddedCompareChart;
  let fixture: ComponentFixture<EmbeddedCompareChart>;

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
      imports: [EmbeddedCompareChart],
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
          provide: KeeperAPI,
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
          provide: SeoHandler,
          useValue: {},
        },
        {
          provide: Analytics,
          useValue: {
            SentryException: sentryException,
          },
        },
        {
          provide: Toast,
          useValue: {
            show: showToast,
            removeToast,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedCompareChart);
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
        title: "Invalid URL",
        body: "Select servers to compare.",
        type: "error",
        id: BAD_SERVER_COMPARE_URL_TOAST_ID,
        action: jasmine.objectContaining({
          label: "Server Navigator page",
        }),
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
        title: "Invalid URL",
        body: "Select servers to compare.",
        type: "error",
        id: BAD_SERVER_COMPARE_URL_TOAST_ID,
        action: jasmine.objectContaining({
          label: "Server Navigator page",
        }),
      }),
    );
    expect(getServerMeta).not.toHaveBeenCalled();
  });

  it("removes the invalid URL toast on destroy", () => {
    component.ngOnDestroy();

    expect(removeToast).toHaveBeenCalledWith(BAD_SERVER_COMPARE_URL_TOAST_ID);
  });
});
