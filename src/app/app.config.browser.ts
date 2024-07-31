import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { appConfig } from './app.config';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

const GA_TRACKING_KEY = import.meta.env['NG_APP_GOOGLE_ANALYTICS_KEY'];

const browserConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(NgxGoogleAnalyticsModule.forRoot(GA_TRACKING_KEY, [{command: 'config', values: [GA_TRACKING_KEY, { 'anonymize_ip': true }]}])),
  ]
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
