import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import posthog from 'posthog-js'

const MIXPANEL_TOKEN = import.meta.env['NG_APP_MIXPANEL_TOKEN'];
const MIXPANEL_HOST = import.meta.env['NG_APP_MIXPANEL_HOST'];

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private mixpanelConfig = {
    ignore_dnt: false,
    disable_persistence: true,
    track_pageview: false,
    api_host: MIXPANEL_HOST,
    //debug: true
  };

  mixpanelProject: string = MIXPANEL_TOKEN;

  trackingInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {

              }

  public initializeTracking() {
    if(!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.trackingInitialized && MIXPANEL_TOKEN && MIXPANEL_HOST && typeof window !== 'undefined' && typeof document !== 'undefined') {
      posthog.init(MIXPANEL_TOKEN, {
        api_host: MIXPANEL_HOST,
        persistence: 'memory'});
      this.trackingInitialized = true;
    }
  }

  public pageTrack(url: string) {
    if (this.trackingInitialized) {
      //mixpanel.track('pageView', {url: url, analytics: true});
      posthog.capture('pageView', { property: url })
    }
  }
}
