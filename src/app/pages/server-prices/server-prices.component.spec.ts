import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { OrderDir } from "../../../../sdk/data-contracts";

import { ServerPricesComponent } from "./server-prices.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { QUERY_ERROR_SERVER_PRICES_TOAST_ID } from "../../services/toast-ids";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerPricesComponent", () => {
  let component: ServerPricesComponent;
  let fixture: ComponentFixture<ServerPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerPricesComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerPricesComponent);
    component = fixture.componentInstance;
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

  it("preserves falsy nested values and zero scores in field helpers", () => {
    expect(
      component.getField(
        { server: { hw_virt: false } } as never,
        "server.hw_virt",
      ),
    ).toBeFalse();
    expect(
      component.getField(
        { server: { gpu_count: 0 } } as never,
        "server.gpu_count",
      ),
    ).toBe(0);
    expect(component.getScore(0)).toBe("0");
  });

  it("shows query-error toast when search fails with 422 and clears it on retry success", fakeAsync(() => {
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
    const showHttpError = spyOn(toastService, "showHttpError");
    const removeToast = spyOn(toastService, "removeToast");
    let resolveSecond!: (value: any) => void;

    spyOn(keeperAPI, "searchServerPrices").and.returnValues(
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
        title: "Server prices query error!",
        id: QUERY_ERROR_SERVER_PRICES_TOAST_ID,
      }),
    );

    showHttpError.calls.reset();
    removeToast.calls.reset();

    (component as any)._searchServers(true);
    expect(removeToast).toHaveBeenCalledWith(
      QUERY_ERROR_SERVER_PRICES_TOAST_ID,
    );
    expect(
      removeToast.calls
        .allArgs()
        .filter((args) => args[0] === QUERY_ERROR_SERVER_PRICES_TOAST_ID)
        .length,
    ).toBe(1);

    resolveSecond({
      body: [],
      headers: { get: () => "0" },
    });
    tick();

    expect(
      removeToast.calls
        .allArgs()
        .filter((args) => args[0] === QUERY_ERROR_SERVER_PRICES_TOAST_ID)
        .length,
    ).toBe(2);
    expect(showHttpError).not.toHaveBeenCalled();
  }));
});
