import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BenchmarkCoverageComponent } from "./benchmark-coverage.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("BenchmarkCoverageComponent", () => {
  let component: BenchmarkCoverageComponent;
  let fixture: ComponentFixture<BenchmarkCoverageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkCoverageComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows transient toast when debug load fails with 500", async () => {
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
    const showTransient = spyOn(toastService, "showTransientHttpError");
    spyOn(keeperAPI, "getDebugInfo").and.rejectWith({ status: 500 });
    spyOn(keeperAPI, "getVendors").and.resolveTo({ body: [] });

    await (component as any).loadDebugData();

    expect(showTransient).toHaveBeenCalledWith({ status: 500 });
  });
});
