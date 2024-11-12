import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import * as Sentry from "@sentry/angular";

const POSTHOG_KEY = import.meta?.env?.NG_APP_POSTHOG_KEY;
const POSTHOG_HOST = import.meta?.env?.NG_APP_POSTHOG_HOST;

const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  trackingInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  public initializeTracking() {
    if(!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.trackingInitialized && POSTHOG_KEY && POSTHOG_HOST && typeof window !== 'undefined' && typeof document !== 'undefined') {
      /*
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        persistence: 'sessionStorage',
      });
      this.trackingInitialized = true;
      */
    }
  }

  public trackEvent(eventName: string, properties: { [key: string]: any }): void {
    if (this.trackingInitialized) {
      //posthog.capture(eventName, properties)
      console.log('Event tracked:', eventName, properties);
    }
  }

  public getId() {
    //return posthog.get_distinct_id();
    return '';
  }

  public SentryException(exception: any, hint?: any) {
    if (SENTRY_DSN && SENTRY_DSN !== '') {
      Sentry.captureException(exception, hint);

      // Force Sentry to send the event immediately
      Sentry.flush(2000).then(() => {
        //console.log('Sentry flush complete');
      });
    }
  }

}
