import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
} from "@angular/core";
import { Router, provideRouter, withInMemoryScrolling } from "@angular/router";

import { routes } from "./app.routes";
import {
  provideClientHydration,
  withHttpTransferCacheOptions,
} from "@angular/platform-browser";
import {
  HttpRequest,
  provideHttpClient,
  withFetch,
} from "@angular/common/http";
import { LucideAngularModule } from "lucide-angular";
import { lucideIcons } from "./lucide-icons";
import { MarkdownModule } from "ngx-markdown";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import * as Sentry from "@sentry/angular";

function httpFilter(req: HttpRequest<any>): boolean {
  return req.method === "GET";
}

function customErrorHandler(error: any) {
  return error;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "top",
        anchorScrolling: "enabled",
      }),
    ),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ["x-total-count", "x-request-id"],
        filter: httpFilter,
      }),
    ),
    provideHttpClient(withFetch()),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(LucideAngularModule.pick(lucideIcons)),
    importProvidersFrom(MarkdownModule.forRoot()),
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        extractor: customErrorHandler,
      }),
    },
  ],
};
