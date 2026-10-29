import { TestBed } from "@angular/core/testing";

import { Analytics } from "./analytics";

type PostHogModule = typeof import("posthog-js");

type AnalyticsInternals = {
  importPostHog: () => Promise<PostHogModule>;
  loadPostHog: (key: string, host: string) => Promise<void>;
  trackingPromise: Promise<void> | null;
  pendingEvents: unknown[];
};

describe("Analytics", () => {
  let service: Analytics;
  let posthog: jasmine.SpyObj<PostHogModule["default"]>;

  function internals(): AnalyticsInternals {
    return service as unknown as AnalyticsInternals;
  }

  function stubImport(): jasmine.Spy {
    return spyOn(internals(), "importPostHog").and.resolveTo({
      default: posthog,
    } as unknown as PostHogModule);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Analytics);
    posthog = jasmine.createSpyObj("posthog", [
      "init",
      "identify",
      "reset",
      "capture",
      "get_distinct_id",
    ]);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("returns an empty string before tracking is initialized", () => {
    expect(service.getId()).toBe("");
    expect(posthog.get_distinct_id).not.toHaveBeenCalled();
  });

  it("loads the SDK lazily and initializes it", async () => {
    const importSpy = stubImport();

    await internals().loadPostHog("key", "https://host");

    expect(importSpy).toHaveBeenCalledTimes(1);
    expect(posthog.init).toHaveBeenCalledWith("key", {
      api_host: "https://host",
      persistence: "sessionStorage",
    });
  });

  it("returns the posthog distinct id or an empty fallback string", async () => {
    stubImport();
    posthog.get_distinct_id.and.returnValues(
      "distinct-id",
      undefined as unknown as string,
    );
    await internals().loadPostHog("key", "https://host");

    expect(service.getId()).toBe("distinct-id");
    expect(service.getId()).toBe("");
    expect(posthog.get_distinct_id).toHaveBeenCalledTimes(2);
  });

  it("identifies when tracking is initialized", async () => {
    stubImport();
    await internals().loadPostHog("key", "https://host");

    service.identify("user-1", { email: "a@b.co" });

    expect(posthog.identify).toHaveBeenCalledWith("user-1", {
      email: "a@b.co",
    });
  });

  it("queues identify until the SDK has loaded then flushes", async () => {
    stubImport();

    service.identify("user-1", { email: "a@b.co" });
    expect(posthog.identify).not.toHaveBeenCalled();

    await internals().loadPostHog("key", "https://host");

    expect(posthog.identify).toHaveBeenCalledWith("user-1", {
      email: "a@b.co",
    });
  });

  it("resets identity and drops a pending identify", async () => {
    stubImport();

    service.identify("user-1");
    service.reset();
    await internals().loadPostHog("key", "https://host");

    expect(posthog.identify).not.toHaveBeenCalled();
    expect(posthog.reset).toHaveBeenCalled();
  });

  it("queues events while the SDK is loading then flushes them", async () => {
    stubImport();
    internals().trackingPromise = Promise.resolve();

    service.trackEvent("pageView", { page: "/" });
    expect(posthog.capture).not.toHaveBeenCalled();

    await internals().loadPostHog("key", "https://host");

    expect(posthog.capture).toHaveBeenCalledOnceWith("pageView", {
      page: "/",
    });
  });

  it("drops events when tracking was never started", async () => {
    stubImport();

    service.trackEvent("pageView", {});
    await internals().loadPostHog("key", "https://host");

    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("stays uninitialized when the SDK fails to load", async () => {
    spyOn(internals(), "importPostHog").and.rejectWith(
      new Error("chunk failed"),
    );
    spyOn(console, "error");

    await expectAsync(
      internals().loadPostHog("key", "https://host"),
    ).toBeResolved();

    service.identify("user-1");
    expect(service.getId()).toBe("");
    expect(posthog.identify).not.toHaveBeenCalled();
  });

  it("stops queueing events once the SDK fails to load", async () => {
    spyOn(internals(), "importPostHog").and.rejectWith(
      new Error("chunk failed"),
    );
    spyOn(console, "error");
    internals().trackingPromise = Promise.resolve();

    service.trackEvent("beforeFailure", {});
    await internals().loadPostHog("key", "https://host");
    service.trackEvent("afterFailure", {});

    expect(internals().trackingPromise).toBeNull();
    expect(internals().pendingEvents).toEqual([]);
  });
});
