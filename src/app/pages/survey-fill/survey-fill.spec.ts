import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import { SurveyFill } from "./survey-fill";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { Analytics } from "../../services/analytics";

describe("SurveyFill", () => {
  let component: SurveyFill;
  let fixture: ComponentFixture<SurveyFill>;
  let analytics: Analytics;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    spyOn(window, "open");

    await TestBed.configureTestingModule({
      imports: [SurveyFill],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyFill);
    component = fixture.componentInstance;
    analytics = TestBed.inject(Analytics);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("builds the survey before analytics is ready", () => {
    spyOn(analytics, "getIdWhenReady").and.returnValue(
      new Promise<string>(() => undefined),
    );

    component.setup("demo");
    httpMock.expectOne("assets/surveys/demo.json").flush({ pages: [] });

    expect(component.surveyModel).toBeDefined();
    expect(component.tracker).toBeDefined();
  });

  it("starts no autosave timer when destroyed before the survey loads", () => {
    component.setup("demo");
    const request = httpMock.expectOne("assets/surveys/demo.json");

    fixture.destroy();

    expect(request.cancelled).toBeTrue();
    expect(component.tracker).toBeUndefined();
  });

  it("submits with the PostHog id once analytics is ready", async () => {
    spyOn(analytics, "getIdWhenReady").and.resolveTo("posthog-id");
    const track = spyOn(analytics, "trackEvent");

    component.setup("demo");
    await Promise.resolve();
    httpMock.expectOne("assets/surveys/demo.json").flush({ pages: [] });
    component.submit({ data: {} });

    expect(track).toHaveBeenCalledWith(
      "survey submit",
      jasmine.objectContaining({ visitorID: "posthog-id" }),
    );
    httpMock.expectOne("/api/survey-data");
  });
});
