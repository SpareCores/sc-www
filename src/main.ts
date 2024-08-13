import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import * as Sentry from "@sentry/angular";
import { config } from './app/app.config.browser';

// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;

if(SENTRY_DSN && SENTRY_DSN !== '') {
  Sentry.init({
    dsn: SENTRY_DSN,

    integrations: [],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0,
  });
}

bootstrapApplication(AppComponent, config)
  .catch((err) => console.error(err));
