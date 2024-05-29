import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ArrowDownNarrowWide, ArrowDownWideNarrow, BookText, Box, Check, ChevronDown, ChevronLeft, ChevronRight, Codesandbox, Cpu, Database, DollarSign, Facebook, Github, Home, Hotel, Linkedin, LucideAngularModule, MemoryStick, PcCase, Search, Server, SquareKanban, Twitter, User, Building2, Heater, CandlestickChart, MapPinned, Scale, Ellipsis, Menu, Leaf, ShoppingCart, ChevronUp, ExternalLink, Info, Settings, Star, Trash2 } from 'lucide-angular';
import { MarkdownModule } from 'ngx-markdown';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const ZITADEL_CLIENT_ID = import.meta.env['NG_APP_ZITADEL_CLIENT_ID'];
const ZITADEL_DOMAIN = import.meta.env['NG_APP_ZITADEL_DOMAIN'];
const ZITADEL_USERINFO_ENDPOINT = import.meta.env['NG_APP_ZITADEL_USERINFO_ENDPOINT'];
const DOMAIN_BASE_URL = import.meta.env['NG_APP_DOMAIN_BASE_URL'];

const authConfig: AuthConfig = {
  scope: 'openid profile email offline_access',
  responseType: 'code',
  oidc: true,
  clientId: ZITADEL_CLIENT_ID,
  issuer: ZITADEL_DOMAIN,
  redirectUri: `${DOMAIN_BASE_URL}auth/callback`,
  postLogoutRedirectUri: `${DOMAIN_BASE_URL}`,
  requireHttps: false, // required for running locally
  tokenEndpoint: `${ZITADEL_DOMAIN}/oauth/v2/token`,
  userinfoEndpoint: ZITADEL_USERINFO_ENDPOINT,
};

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
        Settings,
        Star,
        Trash2
      }),
    ),
    importProvidersFrom(MarkdownModule.forRoot()),
    importProvidersFrom(
      OAuthModule.forRoot({
        resourceServer: {
          allowedUrls: [
            `${ZITADEL_DOMAIN}/admin/v1`,
            `${ZITADEL_DOMAIN}/management/v1`,
            `${ZITADEL_DOMAIN}/auth/v1/`],
          sendAccessToken: true,
        },
      })
    ),
    {
      provide: AuthConfig,
      useValue: authConfig,
    }
  ],

};
