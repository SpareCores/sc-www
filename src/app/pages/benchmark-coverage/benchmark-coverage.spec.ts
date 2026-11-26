import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkCoverage } from "./benchmark-coverage";
import { KeeperAPI } from "../../services/keeper-api";
import { Toast } from "../../services/toast";
import { BENCHMARK_COVERAGE_ERROR_TOAST_ID } from "../../services/toast-ids";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { DialogRef } from "@angular/cdk/dialog";
import { Subject } from "rxjs";
import { ModalDialog } from "../../services/modal-dialog";

describe("BenchmarkCoverage", () => {
  let component: BenchmarkCoverage;
  let fixture: ComponentFixture<BenchmarkCoverage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkCoverage],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkCoverage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows transient toast when debug load fails with 500", async () => {
    const toastService = TestBed.inject(Toast);
    const keeperAPI = TestBed.inject(KeeperAPI);
    const showHttpError = spyOn(toastService, "showHttpError");
    spyOn(keeperAPI, "getDebugInfo").and.rejectWith({ status: 500 });
    spyOn(keeperAPI, "getVendors").and.resolveTo({ body: [] });

    await (component as any).loadDebugData();

    expect(showHttpError).toHaveBeenCalledWith(
      { status: 500 },
      jasmine.objectContaining({ id: BENCHMARK_COVERAGE_ERROR_TOAST_ID }),
    );
  });

  it("does not show toast when debug load is aborted", async () => {
    const toastService = TestBed.inject(Toast);
    const keeperAPI = TestBed.inject(KeeperAPI);
    const showHttpError = spyOn(toastService, "showHttpError");
    spyOn(keeperAPI, "getDebugInfo").and.rejectWith(
      new DOMException("The operation was aborted.", "AbortError"),
    );
    spyOn(keeperAPI, "getVendors").and.resolveTo({ body: [] });

    await (component as any).loadDebugData();

    expect(showHttpError).not.toHaveBeenCalled();
  });

  it("opens the filter modal only once while it is open", () => {
    const closed = new Subject<unknown>();
    const openSpy = spyOn(TestBed.inject(ModalDialog), "open").and.returnValue({
      closed,
      close: jasmine.createSpy("close"),
    } as unknown as DialogRef);

    component.openFilterModal();
    component.openFilterModal();

    expect(openSpy).toHaveBeenCalledTimes(1);

    closed.next(undefined);
    component.openFilterModal();

    expect(openSpy).toHaveBeenCalledTimes(2);
  });

  it("clears filters while keeping the page size", () => {
    component.limit.set(50);
    component.searchBarChanged({
      search: "c5",
      vendor_ids: ["aws"],
      server_status: "all",
      status_bool: {},
      benchmark_families: { geekbench: "yes" },
    });
    component.page.set(3);

    component.clearFilters();

    expect(component.filterParams()).toEqual({
      vendors: null,
      status: "active",
      search: null,
      page: 1,
      limit: 50,
      bools: JSON.stringify({ has_price: "yes" }),
      benchmarks: "{}",
    });
  });

  it("counts active filters that differ from the defaults", () => {
    component.clearFilters();

    expect(component.activeFilterCount()).toBe(0);

    component.searchBarChanged({
      search: "c5",
      vendor_ids: ["aws", "gcp"],
      server_status: "all",
      status_bool: { has_hw_info: "yes" },
      benchmark_families: { geekbench: "no" },
    });

    expect(component.searchQuery().vendor_ids).toEqual(["aws", "gcp"]);
    expect(component.activeFilterCount()).toBe(7);
  });
});
