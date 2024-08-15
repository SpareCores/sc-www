import { mergeApplicationConfig, ApplicationConfig, ErrorHandler } from '@angular/core';
import { appConfig } from './app.config';
import * as Sentry from "@sentry/angular";

function customErrorHandler(error: any) {
  return error;
}

// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_TRACE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_TRACE_SAMPLE_RATE || '0';
// @ts-expect-error i want this to compile, but it doesn't
const SENTRY_PROFILE_SAMPLE_RATE = import.meta?.env?.NG_APP_SENTRY_PROFILE_SAMPLE_RATE || '0';

let sentry_client: any = null;

if(SENTRY_DSN && SENTRY_DSN !== '') {
  sentry_client = Sentry.init({
    dsn: SENTRY_DSN,

    integrations: [Sentry.browserTracingIntegration()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: Number(SENTRY_TRACE_SAMPLE_RATE),
    profilesSampleRate: Number(SENTRY_PROFILE_SAMPLE_RATE),
  });
}

let providers = [];

if(SENTRY_DSN && SENTRY_DSN !== '') {
  providers.push({
    provide: ErrorHandler,
    useValue: Sentry.createErrorHandler({
      extractor: customErrorHandler
    }),
  },
  { provide: 'sentryClient', useValue: sentry_client });
}

const browserConfig: ApplicationConfig = {
  providers: providers
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
