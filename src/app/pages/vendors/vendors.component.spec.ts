import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VendorsComponent } from "./vendors.component";
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
});
