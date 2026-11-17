import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import { SurveyFill } from "./survey-fill";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { Analytics } from "../../services/analytics";

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

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
    await settle();
    httpMock.expectOne("assets/surveys/demo.json").flush({ pages: [] });
    component.submit({ data: {} });
    await settle();

    expect(track).toHaveBeenCalledWith(
      "survey submit",
      jasmine.objectContaining({ visitorID: "posthog-id" }),
    );
    httpMock.expectOne("/api/survey-data");
  });

  it("waits for the PostHog id before saving an early page change", async () => {
    let resolveId!: (id: string) => void;
    spyOn(analytics, "getIdWhenReady").and.returnValue(
      new Promise<string>((resolve) => (resolveId = resolve)),
    );

    component.setup("demo");
    httpMock.expectOne("assets/surveys/demo.json").flush({ pages: [] });
    component.pageChange(
      { data: { q1: "a" } },
      { oldCurrentPage: { visibleIndex: 0 } },
    );
    await settle();
    httpMock.expectNone("/api/survey-data");

    resolveId("posthog-id");
    await settle();

    const saved = httpMock.expectOne("/api/survey-data");
    expect(saved.request.body.filename).toMatch(
      /^id_posthog-id_pageChange1_timestamp_\d+$/,
    );
    expect(saved.request.body.payload.visitorID).toBe("posthog-id");
  });
});
