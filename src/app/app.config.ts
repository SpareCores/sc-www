import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ArrowDownNarrowWide, ArrowDownWideNarrow, BookText, Clipboard, Box, Check, ChevronDown, ChevronLeft, ChevronRight, Codesandbox, Cpu, Database, DollarSign, Facebook, Github, Home, Hotel, Linkedin, LucideAngularModule, MemoryStick, PcCase, Search, Server, SquareKanban, Twitter, User, Building2, Heater, CandlestickChart, MapPinned, Scale, Ellipsis, Menu, Leaf, ShoppingCart, ChevronUp, ExternalLink, Info, ClipboardCheck } from 'lucide-angular';
import { MarkdownModule } from 'ngx-markdown';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
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
        ClipboardCheck
      }),
    ),
    importProvidersFrom(MarkdownModule.forRoot()),
  ],

};
