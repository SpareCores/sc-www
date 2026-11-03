import { isPlatformBrowser } from "@angular/common";
import { Injectable, NgZone, PLATFORM_ID, inject } from "@angular/core";
import * as Sentry from "@sentry/angular";
import type { PostHog } from "posthog-js";

const SENTRY_DSN = import.meta.env.NG_APP_SENTRY_DSN;
const MAX_PENDING_EVENTS = 50;

type PendingOp =
  | {
      type: "identify";
      distinctId: string;
      properties?: Record<string, unknown>;
    }
  | { type: "reset" }
  | {
      type: "capture";
      eventName: string;
      properties: Record<string, unknown>;
      timestamp: Date;
    };

@Injectable({
  providedIn: "root",
})
export class Analytics {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private pendingOps: PendingOp[] = [];
  private pendingStaleIdentityCheck = false;
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
      this.loadPostHog(POSTHOG_KEY, POSTHOG_HOST),
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
      if (this.trackingPromise) {
        this.pendingOps.push({ type: "identify", distinctId, properties });
      }
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

    const posthog = this.posthog;
    if (!posthog) {
      if (this.trackingPromise) {
        this.pendingOps.push({ type: "reset" });
      }
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      posthog.reset();
    });
  }

  public clearStaleIdentity(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const posthog = this.posthog;
    if (!posthog) {
      this.pendingStaleIdentityCheck = true;
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.resetIfIdentified(posthog);
    });
  }

  public trackEvent(
    eventName: string,
    properties: Record<string, unknown>,
  ): void {
    const posthog = this.posthog;
    if (!posthog) {
      if (this.trackingPromise && this.pendingOps.length < MAX_PENDING_EVENTS) {
        this.pendingOps.push({
          type: "capture",
          eventName,
          properties: {
            ...properties,
            $current_url: window.location.href,
            $pathname: window.location.pathname,
          },
          timestamp: new Date(),
        });
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

  public async getIdWhenReady(): Promise<string> {
    await this.trackingPromise;
    return this.getId();
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
    try {
      const { default: posthog } = await this.importPostHog();
      posthog.init(key, {
        api_host: host,
        persistence: "sessionStorage",
      });
      this.posthog = posthog;
    } catch (error) {
      this.trackingPromise = null;
      this.pendingOps = [];
      this.pendingStaleIdentityCheck = false;
      console.error("PostHog initialization failed:", error);
      return;
    }

    this.flushPending();
  }

  private importPostHog(): Promise<typeof import("posthog-js")> {
    return import("posthog-js");
  }

  private resetIfIdentified(posthog: PostHog): void {
    if (posthog.get_property("$user_state") === "identified") {
      posthog.reset();
    }
  }

  private flushPending(): void {
    const posthog = this.posthog;
    if (!posthog) {
      return;
    }

    const staleIdentityCheck = this.pendingStaleIdentityCheck;
    const pending = this.pendingOps;
    this.pendingStaleIdentityCheck = false;
    this.pendingOps = [];

    this.ngZone.runOutsideAngular(() => {
      if (staleIdentityCheck) {
        this.resetIfIdentified(posthog);
      }
      for (const op of pending) {
        if (op.type === "identify") {
          posthog.identify(op.distinctId, op.properties);
        } else if (op.type === "reset") {
          posthog.reset();
        } else {
          posthog.capture(op.eventName, op.properties, {
            timestamp: op.timestamp,
          });
        }
      }
    });
  }
}
