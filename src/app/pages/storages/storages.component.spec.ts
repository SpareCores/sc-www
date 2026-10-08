import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OrderDir } from "../../../../sdk/data-contracts";

import { StoragesComponent } from "./storages.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { QUERY_ERROR_STORAGE_PRICES_TOAST_ID } from "../../services/toast-ids";

describe("StoragesComponent", () => {
  let component: StoragesComponent;
  let fixture: ComponentFixture<StoragesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoragesComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(StoragesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows query-error toast when storage prices search fails with 422", async () => {
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
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
});
