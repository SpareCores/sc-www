import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SurveyFill } from "./survey-fill";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("SurveyFill", () => {
  let component: SurveyFill;
  let fixture: ComponentFixture<SurveyFill>;

  beforeEach(async () => {
    spyOn(window, "open");

    await TestBed.configureTestingModule({
      imports: [SurveyFill],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyFill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
