import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { Router, provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import {  HttpRequest, provideHttpClient, withFetch } from '@angular/common/http';
import { ArrowDownNarrowWide, ArrowDownWideNarrow, BookText, Clipboard, Box, Check, ChevronDown, ChevronLeft, ChevronRight, Codesandbox, Cpu, Database, DollarSign, Facebook, Github, Home, Hotel, Linkedin, LucideAngularModule, MemoryStick, PcCase, Search, Server, SquareKanban, Twitter, User, Building2, Heater, CandlestickChart, MapPinned, Scale, Ellipsis, Menu, Leaf, ShoppingCart, ChevronUp, ExternalLink, Info, ClipboardCheck, ScrollText, Youtube, Trash, CircleX, X, CircleArrowDown, CircleArrowUp, ArrowUpDown, Copy } from 'lucide-angular';
import { MarkdownModule } from 'ngx-markdown';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import * as Sentry from "@sentry/angular";
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

function httpFilter(req: HttpRequest<any>): boolean {
  return req.method === 'GET';
}

function customErrorHandler(error: any) {
  return error;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "top",
        anchorScrolling: "enabled",
      })),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ['x-total-count', 'x-request-id'],
        filter: httpFilter,
      }),
    ),
    provideHttpClient(withFetch()),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(
      LucideAngularModule.pick({
        PcCase,
        Hotel,
        Home,
        Search,
        User,
        Github,
        Linkedin,
        Codesandbox,
        Database,
        Twitter,
        Facebook,
        Check,
        BookText,
        Box,
        SquareKanban,
        Server,
        ChevronLeft,
        ChevronUp,
        ChevronDown,
        ChevronRight,
        DollarSign,
        Cpu,
        MemoryStick,
        ArrowDownNarrowWide,
        ArrowDownWideNarrow,
        Building2,
        Heater,
        CandlestickChart,
        MapPinned,
        Scale,
        Ellipsis,
        Menu,
        Leaf,
        ShoppingCart,
        ExternalLink,
        Info,
        Clipboard,
        ClipboardCheck,
        ScrollText,
        Youtube,
        Trash,
        CircleX,
        X,
        CircleArrowDown,
        CircleArrowUp,
        ArrowUpDown,
        Copy
      }),
    ),
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
        extractor: customErrorHandler
      }),
    }
  ],

};
