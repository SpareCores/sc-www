import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SurveyFillComponent } from "./survey-fill.component";

describe("SurveyFillComponent", () => {
  let component: SurveyFillComponent;
  let fixture: ComponentFixture<SurveyFillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyFillComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyFillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
