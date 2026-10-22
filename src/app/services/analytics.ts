import { isPlatformBrowser } from "@angular/common";
import { Injectable, NgZone, PLATFORM_ID, inject } from "@angular/core";
import * as Sentry from "@sentry/angular";
import type { PostHog } from "posthog-js";

const SENTRY_DSN = import.meta.env.NG_APP_SENTRY_DSN;

type PendingIdentify = {
  distinctId: string;
  properties?: Record<string, unknown>;
};

type PendingEvent = {
  eventName: string;
  properties: Record<string, unknown>;
};

@Injectable({
  providedIn: "root",
})
export class Analytics {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private pendingIdentify: PendingIdentify | null = null;
  private pendingReset = false;
  private pendingEvents: PendingEvent[] = [];
  private posthog: PostHog | null = null;
  private trackingPromise: Promise<void> | null = null;

  public initializeTracking(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    const POSTHOG_KEY = import.meta.env.NG_APP_POSTHOG_KEY;
    const POSTHOG_HOST = import.meta.env.NG_APP_POSTHOG_HOST;

    if (
      !POSTHOG_KEY ||
      !POSTHOG_HOST ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      return Promise.resolve();
    }

    // PostHog installs timers and global listeners that should not block hydration.
    this.trackingPromise ??= this.ngZone.runOutsideAngular(() =>
      this.loadPostHog(POSTHOG_KEY, POSTHOG_HOST).catch((error) => {
        this.pendingEvents = [];
        console.error("PostHog initialization failed:", error);
      }),
    );
    return this.trackingPromise;
  }

  public identify(
    distinctId: string,
    properties?: Record<string, unknown>,
  ): void {
    if (!isPlatformBrowser(this.platformId) || !distinctId) {
      return;
    }

    const posthog = this.posthog;
    if (!posthog) {
      this.pendingIdentify = { distinctId, properties };
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      posthog.identify(distinctId, properties);
    });
  }

  public reset(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.pendingIdentify = null;

    const posthog = this.posthog;
    if (!posthog) {
      this.pendingReset = true;
      return;
    }

    this.pendingReset = false;

    this.ngZone.runOutsideAngular(() => {
      posthog.reset();
    });
  }

  public trackEvent(
    eventName: string,
    properties: Record<string, unknown>,
  ): void {
    const posthog = this.posthog;
    if (!posthog) {
      if (this.trackingPromise) {
        this.pendingEvents.push({ eventName, properties });
      }
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      posthog.capture(eventName, properties);
    });
  }

  public getId(): string {
    const posthog = this.posthog;
    if (!posthog) {
      return "";
    }

    const distinctId = this.ngZone.runOutsideAngular(() =>
      posthog.get_distinct_id(),
    );

    return typeof distinctId === "string" ? distinctId : "";
  }

  public SentryException(
    exception: unknown,
    hint?: Parameters<typeof Sentry.captureException>[1],
  ): void {
    if (SENTRY_DSN && SENTRY_DSN !== "") {
      Sentry.captureException(exception, hint);

      // Force Sentry to send the event immediately
      Sentry.flush(2000).then(() => {
        //console.log('Sentry flush complete');
      });
    }
  }

  private async loadPostHog(key: string, host: string): Promise<void> {
    const { default: posthog } = await this.importPostHog();
    posthog.init(key, {
      api_host: host,
      persistence: "sessionStorage",
    });
    this.posthog = posthog;
    this.flushPendingReset();
    this.flushPendingIdentify();
    this.flushPendingEvents();
  }

  private importPostHog(): Promise<typeof import("posthog-js")> {
    return import("posthog-js");
  }

  private flushPendingIdentify(): void {
    const pending = this.pendingIdentify;
    if (!pending) {
      return;
    }

    this.pendingIdentify = null;
    this.identify(pending.distinctId, pending.properties);
  }

  private flushPendingReset(): void {
    if (!this.pendingReset) {
      return;
    }

    this.pendingReset = false;
    this.posthog?.reset();
  }

  private flushPendingEvents(): void {
    const pending = this.pendingEvents;
    this.pendingEvents = [];
    for (const { eventName, properties } of pending) {
      this.trackEvent(eventName, properties);
    }
  }
}
