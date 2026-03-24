import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SurveyFillComponent } from "./survey-fill.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("SurveyFillComponent", () => {
  let component: SurveyFillComponent;
  let fixture: ComponentFixture<SurveyFillComponent>;

  beforeEach(async () => {
    spyOn(window, "open");

    await TestBed.configureTestingModule({
      imports: [SurveyFillComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyFillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
