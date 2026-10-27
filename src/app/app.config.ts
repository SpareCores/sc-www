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
  withInterceptors,
} from "@angular/common/http";
import { OVERLAY_DEFAULT_CONFIG } from "@angular/cdk/overlay";
import { provideLucideIcons } from "@lucide/angular";
import { lucideIcons } from "./lucide-icons";
import { MarkdownModule } from "ngx-markdown";
import * as Sentry from "@sentry/angular";
import { provideAppCharts } from "./components/charts/shared/chart-providers";
import { AuthState, authInterceptor, provideAuthFeature } from "./core/auth";
import { provideCollectionsFeature } from "./collections/collections-feature.providers";

function httpFilter(req: HttpRequest<any>): boolean {
  return req.method === "GET";
}

function customErrorHandler(error: any) {
  return error;
}

const SCROLL_DISABLED_PATHS = [
  "/advisor",
  "/navigator/benchmark-coverage",
  "/servers",
  "/databases",
  "/server_prices",
  "/storages",
  "/traffic-prices",
];

const SCROLL_TOP_PREFIXES = ["/servers/compare", "/databases/compare"];

function scrollPositionRestoration(): "disabled" | "top" {
  if (typeof window === "undefined") {
    return "disabled";
  }

  const pathname = window.location.pathname;
  if (SCROLL_TOP_PREFIXES.some((path) => pathname.startsWith(path))) {
    return "top";
  }

  const shouldDisableScroll = SCROLL_DISABLED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return shouldDisableScroll ? "disabled" : "top";
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        get scrollPositionRestoration() {
          return scrollPositionRestoration();
        },
        anchorScrolling: "enabled",
      }),
    ),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ["x-total-count", "x-request-id"],
        filter: httpFilter,
        includeRequestsWithAuthHeaders: true,
      }),
      withEventReplay(),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAuthFeature(),
    provideCollectionsFeature(),
    provideAppCharts(),
    { provide: OVERLAY_DEFAULT_CONFIG, useValue: { usePopover: false } },
    provideLucideIcons(...lucideIcons),
    importProvidersFrom(MarkdownModule.forRoot()),
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    provideAppInitializer(() => {
      inject(Sentry.TraceService);
    }),
    provideAppInitializer(() => {
      return inject(AuthState)
        .init()
        .catch((error) => {
          console.error("Clerk initialization failed:", error);
        });
    }),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        extractor: customErrorHandler,
      }),
    },
  ],
};
