import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from "@angular/core";
import { Router, provideRouter, withInMemoryScrolling } from "@angular/router";

import { routes } from "./app.routes";
import {
  provideClientHydration,
  withEventReplay,
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

const SCROLL_DISABLED_PATHS = [
  "/navigator/benchmark-coverage",
  "/servers",
  "/server_prices",
  "/storages",
  "/traffic-prices",
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        get scrollPositionRestoration() {
          if (typeof window === "undefined") return "disabled";

          const shouldDisableScroll = SCROLL_DISABLED_PATHS.some((path) =>
            window.location.pathname.startsWith(path),
          );

          return shouldDisableScroll ? "disabled" : "top";
        },
        anchorScrolling: "enabled",
      }),
    ),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ["x-total-count", "x-request-id"],
        filter: httpFilter,
      }),
      withEventReplay(),
    ),
    provideHttpClient(withFetch()),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(LucideAngularModule.pick(lucideIcons)),
    importProvidersFrom(MarkdownModule.forRoot()),
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    provideAppInitializer(() => {
      inject(Sentry.TraceService);
    }),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        extractor: customErrorHandler,
      }),
    },
  ],
};
