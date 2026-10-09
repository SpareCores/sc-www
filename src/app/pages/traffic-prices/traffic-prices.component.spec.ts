import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";

import { TrafficPricesComponent } from "./traffic-prices.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { QUERY_ERROR_TRAFFIC_PRICES_TOAST_ID } from "../../services/toast-ids";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("TrafficPricesComponent", () => {
  let component: TrafficPricesComponent;
  let fixture: ComponentFixture<TrafficPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficPricesComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(TrafficPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("does not allow ordering by vendor column", () => {
    const vendorColumn = component.possibleColumns.find(
      (column) => column.name === "VENDOR",
    );
    const searchOptionsChangedSpy = spyOn(component, "searchOptionsChanged");

    expect(vendorColumn).toEqual(
      jasmine.objectContaining({
        show: true,
        key: "vendor_id",
      }),
    );
    expect(vendorColumn?.orderField).toBeNull();

    const orderByBefore = component.orderBy;
    const orderDirBefore = component.orderDir;
    component.toggleOrdering(vendorColumn!);

    expect(component.orderBy).toBe(orderByBefore);
    expect(component.orderDir).toBe(orderDirBefore);
    expect(searchOptionsChangedSpy).not.toHaveBeenCalled();
  });

  it("shows query-error toast when traffic prices search fails with 422", async () => {
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
    const showHttpError = spyOn(toastService, "showHttpError");
    spyOn(keeperAPI, "getTrafficPrices").and.rejectWith({
      status: 422,
      error: { detail: "Invalid filter" },
    });

    showHttpError.calls.reset();
    (component as any)._searchTrafficPrices();
    await fixture.whenStable();

    expect(showHttpError).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 422 }),
      jasmine.objectContaining({
        title: "Traffic prices query error!",
        id: QUERY_ERROR_TRAFFIC_PRICES_TOAST_ID,
      }),
    );
  });

  it("ignores stale traffic-price failure after a newer search starts", fakeAsync(() => {
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
    const showHttpError = spyOn(toastService, "showHttpError");
    let rejectFirst!: (reason?: any) => void;
    let resolveSecond!: (value: any) => void;

    spyOn(keeperAPI, "getTrafficPrices").and.returnValues(
      new Promise((_resolve, reject) => {
        rejectFirst = reject;
      }),
      new Promise((resolve) => {
        resolveSecond = resolve;
      }),
    );

    showHttpError.calls.reset();

    (component as any)._searchTrafficPrices();
    (component as any)._searchTrafficPrices();

    resolveSecond({
      body: [{ vendor_id: "aws" }],
      headers: { get: () => "1" },
    });
    tick();

    expect(component.traffic_prices).toEqual([{ vendor_id: "aws" }]);
    expect(component.isLoading).toBeFalse();

    rejectFirst({ status: 500 });
    tick();

    expect(showHttpError).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.traffic_prices).toEqual([{ vendor_id: "aws" }]);
  }));

  it("ignores stale traffic-price success after a newer search starts", fakeAsync(() => {
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
    const removeToast = spyOn(toastService, "removeToast");
    let resolveFirst!: (value: any) => void;
    let resolveSecond!: (value: any) => void;

    spyOn(keeperAPI, "getTrafficPrices").and.returnValues(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
      new Promise((resolve) => {
        resolveSecond = resolve;
      }),
    );

    removeToast.calls.reset();

    (component as any)._searchTrafficPrices();
    (component as any)._searchTrafficPrices();

    resolveSecond({
      body: [{ vendor_id: "gcp" }],
      headers: { get: () => "1" },
    });
    tick();

    expect(component.traffic_prices).toEqual([{ vendor_id: "gcp" }]);
    expect(component.isLoading).toBeFalse();
    removeToast.calls.reset();

    resolveFirst({
      body: [{ vendor_id: "aws" }],
      headers: { get: () => "1" },
    });
    tick();

    expect(component.traffic_prices).toEqual([{ vendor_id: "gcp" }]);
    expect(component.isLoading).toBeFalse();
    expect(removeToast).not.toHaveBeenCalledWith(
      QUERY_ERROR_TRAFFIC_PRICES_TOAST_ID,
    );
  }));

  it("aborts the previous traffic-price search when a newer one starts", () => {
    const keeperAPI = TestBed.inject(KeeperAPIService);
    const signals: AbortSignal[] = [];

    spyOn(keeperAPI, "getTrafficPrices").and.callFake(
      (_query: any, params: any = {}) => {
        signals.push(params.signal);
        return new Promise(() => {});
      },
    );

    (component as any)._searchTrafficPrices();
    (component as any)._searchTrafficPrices();

    expect(signals.length).toBe(2);
    expect(signals[0].aborted).toBeTrue();
    expect(signals[1].aborted).toBeFalse();
  });

  it("aborts the active traffic-price search on destroy", () => {
    const keeperAPI = TestBed.inject(KeeperAPIService);
    let activeSignal: AbortSignal | undefined;

    spyOn(keeperAPI, "getTrafficPrices").and.callFake(
      (_query: any, params: any = {}) => {
        activeSignal = params.signal;
        return new Promise(() => {});
      },
    );

    (component as any)._searchTrafficPrices();
    component.ngOnDestroy();

    expect(activeSignal?.aborted).toBeTrue();
  });
});
