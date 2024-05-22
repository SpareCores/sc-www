import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import posthog from 'posthog-js'

const POSTHOG_TOKEN = import.meta.env['NG_APP_POSTHOG_TOKEN'];
const POSTHOG_HOST = import.meta.env['NG_APP_POSTHOG_HOST'];

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  trackingInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {

  }

  public initializeTracking() {
    if(!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.trackingInitialized && POSTHOG_TOKEN && POSTHOG_HOST && typeof window !== 'undefined' && typeof document !== 'undefined') {
      posthog.init(POSTHOG_TOKEN, {
      api_host: POSTHOG_HOST,
      persistence: 'memory'});
      this.trackingInitialized = true;
    }
  }

  public pageTrack(url: string) {
    if (this.trackingInitialized) {
      posthog.capture('pageView', { property: url })
    }
  }
}

