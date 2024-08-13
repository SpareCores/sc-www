import { mergeApplicationConfig, ApplicationConfig, ErrorHandler } from '@angular/core';
import { appConfig } from './app.config';
import * as Sentry from "@sentry/angular";

// @ts-ignore
const SENTRY_DSN = import.meta?.env?.NG_APP_SENTRY_DSN;

function customErrorHandler(error: any) {
  return error;
}

let providers = [];

if(SENTRY_DSN) {
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
