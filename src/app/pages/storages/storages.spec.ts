import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OrderDir } from "../../../../sdk/data-contracts";

import { Storages } from "./storages";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { KeeperAPI } from "../../services/keeper-api";
import { Toast } from "../../services/toast";
import { QUERY_ERROR_STORAGE_PRICES_TOAST_ID } from "../../services/toast-ids";

describe("Storages", () => {
  let component: Storages;
  let fixture: ComponentFixture<Storages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Storages],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Storages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows query-error toast when storage prices search fails with 422", async () => {
    const toastService = TestBed.inject(Toast);
    const keeperAPI = TestBed.inject(KeeperAPI);
    const showHttpError = spyOn(toastService, "showHttpError");
    spyOn(keeperAPI, "getStoragePrices").and.rejectWith({
      status: 422,
      error: { detail: "Invalid filter" },
    });

    showHttpError.calls.reset();
    (component as any)._searchStorages();
    await fixture.whenStable();

    expect(showHttpError).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 422 }),
      jasmine.objectContaining({
        title: "Storage prices query error!",
        id: QUERY_ERROR_STORAGE_PRICES_TOAST_ID,
      }),
    );
  });

  it("cycles vendor ordering through desc, asc, and cleared state", () => {
    const vendorColumn = component.possibleColumns.find(
      (column) => column.name === "VENDOR",
    );
    const searchOptionsChangedSpy = spyOn(component, "searchOptionsChanged");

    expect(vendorColumn).toEqual(
      jasmine.objectContaining({
        show: true,
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

  it("aborts the previous storage-price search when a newer one starts", () => {
    const keeperAPI = TestBed.inject(KeeperAPI);
    const signals: AbortSignal[] = [];

    spyOn(keeperAPI, "getStoragePrices").and.callFake(
      (_query: any, params: any = {}) => {
        signals.push(params.signal);
        return new Promise(() => {});
      },
    );

    (component as any)._searchStorages();
    (component as any)._searchStorages();

    expect(signals.length).toBe(2);
    expect(signals[0].aborted).toBeTrue();
    expect(signals[1].aborted).toBeFalse();
  });

  it("aborts the active storage-price search on destroy", () => {
    const keeperAPI = TestBed.inject(KeeperAPI);
    let activeSignal: AbortSignal | undefined;

    spyOn(keeperAPI, "getStoragePrices").and.callFake(
      (_query: any, params: any = {}) => {
        activeSignal = params.signal;
        return new Promise(() => {});
      },
    );

    (component as any)._searchStorages();
    component.ngOnDestroy();

    expect(activeSignal?.aborted).toBeTrue();
  });
});
