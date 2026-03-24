import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LandingpageComponent } from "./landingpage.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("LandingpageComponent", () => {
  let component: LandingpageComponent;
  let fixture: ComponentFixture<LandingpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingpageComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
