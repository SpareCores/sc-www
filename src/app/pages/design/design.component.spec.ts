import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignComponent } from "./design.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("DesignComponent", () => {
  let component: DesignComponent;
  let fixture: ComponentFixture<DesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(DesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
