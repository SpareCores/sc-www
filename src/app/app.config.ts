import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ArrowDownNarrowWide, ArrowDownWideNarrow, BookText, Box, Check, ChevronDown, ChevronLeft, ChevronRight, Codesandbox, Cpu, Database, DollarSign, Facebook, Github, Home, Hotel, Linkedin, LucideAngularModule, MemoryStick, PcCase, Search, Server, SquareKanban, Twitter, User, Building2, Heater, CandlestickChart, MapPinned, Scale, Ellipsis } from 'lucide-angular';
import { MarkdownModule } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
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
        DollarSign,
        Cpu,
        ChevronDown,
        ChevronRight,
        MemoryStick,
        ArrowDownNarrowWide,
        ArrowDownWideNarrow,
        Building2,
        Heater,
        CandlestickChart,
        MapPinned,
        Scale,
        Ellipsis
      }),
    ),
    importProvidersFrom(MarkdownModule.forRoot()),
  ],

};
