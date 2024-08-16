import { mergeApplicationConfig, ApplicationConfig, ErrorHandler } from '@angular/core';
import { appConfig } from './app.config';
import * as Sentry from "@sentry/angular";


// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_TRACE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_TRACE_SAMPLE_RATE || '0';
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_PROFILE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_PROFILE_SAMPLE_RATE || '0';
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_ENVIRONMENT = import.meta?.env?.NG_APP_SENTRY_ENVIRONMENT || 'development';
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_RELEASE = import.meta?.env?.NG_APP_SENTRY_RELEASE || 'development';

const BACKEND_BASE_URI = import.meta.env['NG_APP_BACKEND_BASE_URI'];


let sentry_client: any = null;
let providers = [];

if(SENTRY_DSN && SENTRY_DSN !== '') {
  sentry_client = Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,

    integrations: [Sentry.browserTracingIntegration()],

    tracePropagationTargets: ['localhost', /^\//, BACKEND_BASE_URI],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: Number(SENTRY_TRACE_SAMPLE_RATE),
    profilesSampleRate: Number(SENTRY_PROFILE_SAMPLE_RATE),
  });
}

if(SENTRY_DSN && SENTRY_DSN !== '') {
  providers.push(
  { provide: 'sentryClient', useValue: sentry_client });
}

const browserConfig: ApplicationConfig = {
  providers: providers
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
