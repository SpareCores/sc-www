import { mergeApplicationConfig, ApplicationConfig, ErrorHandler } from '@angular/core';
import { appConfig } from './app.config';
import * as Sentry from "@sentry/angular";

// @ts-expect-error
// i want this to compile, but it doesn't
const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;

function customErrorHandler(error: any) {
  return error;
}

let providers = [];

if(SENTRY_DSN && SENTRY_DSN !== '') {
  providers.push({
    provide: ErrorHandler,
    useValue: Sentry.createErrorHandler({
      extractor: customErrorHandler
    }),
  });
}

const browserConfig: ApplicationConfig = {
  providers: providers
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
