import { mergeApplicationConfig, ApplicationConfig, ErrorHandler } from '@angular/core';
import { appConfig } from './app.config';
import * as Sentry from "@sentry/angular";

function customErrorHandler(error: any) {
  return error;
}

const browserConfig: ApplicationConfig = {
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        extractor: customErrorHandler
      }),
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
