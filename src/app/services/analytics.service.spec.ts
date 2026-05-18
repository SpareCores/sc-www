import { TestBed } from "@angular/core/testing";
import posthog from "posthog-js";

import { AnalyticsService } from "./analytics.service";

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("returns an empty string before tracking is initialized", () => {
    const getDistinctIdSpy = spyOn(posthog, "get_distinct_id");

    expect(service.getId()).toBe("");
    expect(getDistinctIdSpy).not.toHaveBeenCalled();
  });

  it("returns the posthog distinct id or an empty fallback string", () => {
    service.trackingInitialized = true;
    const getDistinctIdSpy = spyOn(posthog, "get_distinct_id").and.returnValues(
      "distinct-id",
      undefined as unknown as string,
    );

    expect(service.getId()).toBe("distinct-id");
    expect(service.getId()).toBe("");
    expect(getDistinctIdSpy).toHaveBeenCalledTimes(2);
  });
});
