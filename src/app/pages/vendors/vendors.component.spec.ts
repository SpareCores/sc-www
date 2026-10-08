import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VendorsComponent } from "./vendors.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { VENDORS_ERROR_TOAST_ID } from "../../services/toast-ids";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("VendorsComponent", () => {
  let component: VendorsComponent;
  let fixture: ComponentFixture<VendorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows fallback toast when vendors load fails with 422", async () => {
    const toastService = TestBed.inject(ToastService);
    const keeperAPI = TestBed.inject(KeeperAPIService);
    const showHttpError = spyOn(toastService, "showHttpError");
    spyOn(keeperAPI, "getVendors").and.rejectWith({
      status: 422,
      error: { detail: "Bad vendor query" },
    });

    fixture = TestBed.createComponent(VendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(showHttpError).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 422 }),
      jasmine.objectContaining({
        title: "Failed to load vendors",
        id: VENDORS_ERROR_TOAST_ID,
      }),
    );
  });
});
