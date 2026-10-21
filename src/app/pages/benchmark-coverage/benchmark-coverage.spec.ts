import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkCoverage } from "./benchmark-coverage";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { BENCHMARK_COVERAGE_ERROR_TOAST_ID } from "../../services/toast-ids";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

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
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
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
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
    const showHttpError = spyOn(toastService, "showHttpError");
    spyOn(keeperAPI, "getDebugInfo").and.rejectWith(
      new DOMException("The operation was aborted.", "AbortError"),
    );
    spyOn(keeperAPI, "getVendors").and.resolveTo({ body: [] });

    await (component as any).loadDebugData();

    expect(showHttpError).not.toHaveBeenCalled();
  });
});
