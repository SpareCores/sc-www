import { isPlatformBrowser } from "@angular/common";
import { Injectable, NgZone, PLATFORM_ID, inject } from "@angular/core";
import * as Sentry from "@sentry/angular";
import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.NG_APP_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.NG_APP_POSTHOG_HOST;

const SENTRY_DSN = import.meta.env.NG_APP_SENTRY_DSN;

type PendingIdentify = {
  distinctId: string;
  properties?: Record<string, unknown>;
};

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private pendingIdentify: PendingIdentify | null = null;

  trackingInitialized = false;

  public initializeTracking() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (
      !this.trackingInitialized &&
      POSTHOG_KEY &&
      POSTHOG_HOST &&
      typeof window !== "undefined" &&
      typeof document !== "undefined"
    ) {
      // PostHog installs timers and global listeners that should not block hydration.
      this.ngZone.runOutsideAngular(() => {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          persistence: "sessionStorage",
        });
      });
      this.trackingInitialized = true;
      this.flushPendingIdentify();
    }
  }

  public identify(
    distinctId: string,
    properties?: Record<string, unknown>,
  ): void {
    if (!isPlatformBrowser(this.platformId) || !distinctId) {
      return;
    }

    if (!this.trackingInitialized) {
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

    if (!this.trackingInitialized) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      posthog.reset();
    });
  }

  public trackEvent(
    eventName: string,
    properties: Record<string, unknown>,
  ): void {
    if (this.trackingInitialized) {
      this.ngZone.runOutsideAngular(() => {
        posthog.capture(eventName, properties);
      });
    }
  }

  public getId(): string {
    if (!this.trackingInitialized) {
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

  private flushPendingIdentify(): void {
    const pending = this.pendingIdentify;
    if (!pending) {
      return;
    }

    this.pendingIdentify = null;
    this.identify(pending.distinctId, pending.properties);
  }
}
