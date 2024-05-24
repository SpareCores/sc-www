import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env['NG_APP_POSTHOG_KEY'];
const POSTHOG_HOST = import.meta.env['NG_APP_POSTHOG_HOST'];

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
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        persistence: 'sessionStorage',
      });
      this.trackingInitialized = true;
    }
  }

  public trackEvent(eventName: string, properties: { [key: string]: any }): void {
    if (this.trackingInitialized) {
      posthog.capture(eventName, properties)
    }
  }

}
