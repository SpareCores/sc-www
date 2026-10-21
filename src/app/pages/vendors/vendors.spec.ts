import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Vendors } from "./vendors";
import { KeeperAPI } from "../../services/keeper-api";
import { Toast } from "../../services/toast";
import { VENDORS_ERROR_TOAST_ID } from "../../services/toast-ids";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("Vendors", () => {
  let component: Vendors;
  let fixture: ComponentFixture<Vendors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vendors],
      providers: [...sharedTestingProviders],
    }).compileComponents();
  });

  it("should create", () => {
    fixture = TestBed.createComponent(Vendors);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("shows fallback toast when vendors load fails with 422", async () => {
    const toastService = TestBed.inject(Toast);
    const keeperAPI = TestBed.inject(KeeperAPI);
    const showHttpError = spyOn(toastService, "showHttpError");
    spyOn(keeperAPI, "getVendors").and.rejectWith({
      status: 422,
      error: { detail: "Bad vendor query" },
    });

    fixture = TestBed.createComponent(Vendors);
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
