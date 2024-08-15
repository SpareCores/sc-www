import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import * as Sentry from "@sentry/angular";
import { config } from './app/app.config.browser';

// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_TRACE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_TRACE_SAMPLE_RATE || '0';
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_PROFILE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_PROFILE_SAMPLE_RATE || '0';

if(SENTRY_DSN && SENTRY_DSN !== '') {
  Sentry.init({
    dsn: SENTRY_DSN,

    integrations: [Sentry.browserTracingIntegration()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: Number(SENTRY_TRACE_SAMPLE_RATE),
    profilesSampleRate: Number(SENTRY_PROFILE_SAMPLE_RATE),
  });
}

bootstrapApplication(AppComponent, config)
  .catch((err) => console.error(err));
