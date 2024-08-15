import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { config } from "./app/app.config.server";
import * as Sentry from "@sentry/angular";

// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_TRACE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_TRACE_SAMPLE_RATE || '0';
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_PROFILE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_PROFILE_SAMPLE_RATE || '0';

const BACKEND_BASE_URI = import.meta.env['NG_APP_BACKEND_BASE_URI'];

if(SENTRY_DSN && SENTRY_DSN !== '') {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: 'server',

    integrations: [Sentry.browserTracingIntegration()],

    tracePropagationTargets: ['localhost', /^\//, BACKEND_BASE_URI],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: Number(SENTRY_TRACE_SAMPLE_RATE),
    profilesSampleRate: Number(SENTRY_PROFILE_SAMPLE_RATE),
  });
}

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
