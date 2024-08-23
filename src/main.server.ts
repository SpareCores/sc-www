import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { config } from "./app/app.config.server";
import * as Sentry from "@sentry/angular";

const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;
const SENTRY_TRACE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_TRACE_SAMPLE_RATE || '0';
const SENTRY_PROFILE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_PROFILE_SAMPLE_RATE || '0';
const SENTRY_ENVIRONMENT = import.meta?.env?.NG_APP_SENTRY_ENVIRONMENT || 'development';
const SENTRY_RELEASE = import.meta?.env?.NG_APP_SENTRY_RELEASE || undefined;

const BACKEND_BASE_URI = import.meta.env['NG_APP_BACKEND_BASE_URI'];

if(SENTRY_DSN && SENTRY_DSN !== '') {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT + 'server',
    release: SENTRY_RELEASE,

    integrations: [Sentry.browserTracingIntegration()],
    tracePropagationTargets: ['localhost', /^\//, BACKEND_BASE_URI],
    tracesSampleRate: Number(SENTRY_TRACE_SAMPLE_RATE),
    profilesSampleRate: Number(SENTRY_PROFILE_SAMPLE_RATE),
  });
}

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
