import { TestBed } from "@angular/core/testing";

import { Analytics } from "./analytics";

type PostHogModule = typeof import("posthog-js");

type AnalyticsInternals = {
  importPostHog: () => Promise<PostHogModule>;
  loadPostHog: (key: string, host: string) => Promise<void>;
  trackingPromise: Promise<void> | null;
  pendingOps: unknown[];
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
      "get_property",
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
    internals().trackingPromise = Promise.resolve();

    service.identify("user-1", { email: "a@b.co" });
    expect(posthog.identify).not.toHaveBeenCalled();

    await internals().loadPostHog("key", "https://host");

    expect(posthog.identify).toHaveBeenCalledWith("user-1", {
      email: "a@b.co",
    });
  });

  it("replays queued identity changes and events in recorded order", async () => {
    stubImport();
    internals().trackingPromise = Promise.resolve();

    service.identify("user-1");
    service.trackEvent("auth account deleted", {});
    service.reset();
    await internals().loadPostHog("key", "https://host");

    expect(posthog.identify).toHaveBeenCalledBefore(posthog.capture);
    expect(posthog.capture).toHaveBeenCalledBefore(posthog.reset);
  });

  it("queues events while the SDK is loading then flushes them", async () => {
    stubImport();
    internals().trackingPromise = Promise.resolve();

    service.trackEvent("pageView", { page: "/" });
    expect(posthog.capture).not.toHaveBeenCalled();

    await internals().loadPostHog("key", "https://host");

    expect(posthog.capture).toHaveBeenCalledOnceWith(
      "pageView",
      jasmine.objectContaining({ page: "/" }),
      jasmine.objectContaining({ timestamp: jasmine.any(Date) }),
    );
  });

  it("keeps the URL and time of a queued event", async () => {
    stubImport();
    internals().trackingPromise = Promise.resolve();
    const queuedUrl = window.location.href;
    const queuedPath = window.location.pathname;
    const before = Date.now();

    service.trackEvent("pageView", {});
    const after = Date.now();
    await internals().loadPostHog("key", "https://host");

    const [, properties, options] = posthog.capture.calls.mostRecent().args;
    expect(properties).toEqual({
      $current_url: queuedUrl,
      $pathname: queuedPath,
    });
    const timestamp = options?.timestamp?.getTime() ?? 0;
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
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
    expect(internals().pendingOps).toEqual([]);
  });

  it("clears a stale identified user before replaying queued events", async () => {
    stubImport();
    posthog.get_property.and.returnValue("identified");
    internals().trackingPromise = Promise.resolve();

    service.trackEvent("pageView", {});
    service.clearStaleIdentity();
    await internals().loadPostHog("key", "https://host");

    expect(posthog.get_property).toHaveBeenCalledWith("$user_state");
    expect(posthog.reset).toHaveBeenCalledBefore(posthog.capture);
  });

  it("keeps the identity of an anonymous visitor", async () => {
    stubImport();
    posthog.get_property.and.returnValue("anonymous");

    service.clearStaleIdentity();
    await internals().loadPostHog("key", "https://host");
    service.clearStaleIdentity();

    expect(posthog.get_property).toHaveBeenCalledTimes(2);
    expect(posthog.reset).not.toHaveBeenCalled();
  });

  it("clears a stale identified user once the SDK has loaded", async () => {
    stubImport();
    posthog.get_property.and.returnValue("identified");
    await internals().loadPostHog("key", "https://host");

    service.clearStaleIdentity();

    expect(posthog.reset).toHaveBeenCalledTimes(1);
  });

  it("caps the events queued while the SDK is loading", () => {
    internals().trackingPromise = Promise.resolve();

    for (let i = 0; i < 60; i++) {
      service.trackEvent(`event-${i}`, {});
    }

    expect(internals().pendingOps.length).toBe(50);
  });

  it("resolves the distinct id once the SDK has loaded", async () => {
    stubImport();
    posthog.get_distinct_id.and.returnValue("distinct-id");
    internals().trackingPromise = internals().loadPostHog(
      "key",
      "https://host",
    );

    await expectAsync(service.getIdWhenReady()).toBeResolvedTo("distinct-id");
  });

  it("resolves an empty id when tracking was never started", async () => {
    await expectAsync(service.getIdWhenReady()).toBeResolvedTo("");
  });
});
