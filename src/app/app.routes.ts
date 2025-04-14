import { Routes } from '@angular/router';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { ServerListingComponent } from './pages/server-listing/server-listing.component';
import { ServerPricesComponent } from './pages/server-prices/server-prices.component';

export const routes: Routes = [
  { path: '', component: LandingpageComponent },

  { path: 'compare', loadComponent: () => import('./pages/server-compare/server-compare.component').then(m => m.ServerCompareComponent)},
  { path: 'compare/:id', loadComponent: () => import('./pages/server-compare/server-compare.component').then(m => m.ServerCompareComponent)},
  { path: 'servers', component: ServerListingComponent },
  { path: 'servers/:id', component: ServerListingComponent },
  { path: 'server_prices', component: ServerPricesComponent },
  { path: 'server/:vendor/:id', loadComponent: () => import('./pages/server-details/server-details.component').then(m => m.ServerDetailsComponent)},
  { path: 'og/:vendor/:id', loadComponent: () => import('./pages/server-og/server-og.component').then(m => m.ServerOGComponent)},
  { path: 'debug', loadComponent: () => import('./pages/missing-benchmarks/missing-benchmarks.component').then(m => m.MissingBenchmarksComponent)},

  { path: 'article/:id', loadComponent: () => import('./pages/article/article.component').then(m => m.ArticleComponent)},
  { path: 'articles', loadComponent: () => import('./pages/articles/articles.component').then(m => m.ArticlesComponent)},

  { path: 'talks', loadComponent: () => import('./pages/talks/talks.component').then(m => m.TalksComponent)},

  { path: 'legal', loadComponent: () => import('./pages/legal-documents/legal-documents.component').then(m => m.LegalDocumentsComponent)},
  { path: 'legal/tos', redirectTo: 'legal/terms-of-service' },
  { path: 'legal/:id', loadComponent: () => import('./pages/tos/tos.component').then(m => m.TOSComponent)},

  { path: 'regions', loadComponent: () => import('./pages/regions/regions.component').then(m => m.RegionsComponent)},
  { path: 'vendors', loadComponent: () => import('./pages/vendors/vendors.component').then(m => m.VendorsComponent)},
  { path: 'storages', loadComponent: () => import('./pages/storages/storages.component').then(m => m.StoragesComponent)},
  { path: 'traffic-prices', loadComponent: () => import('./pages/traffic-prices/traffic-prices.component').then(m => m.TrafficPricesComponent)},
  { path: 'datacenters', redirectTo: 'regions' },

  { path: 'survey/:id', loadComponent: () => import('./pages/survey-fill/survey-fill.component').then(m => m.SurveyFillComponent)},
  { path: 'feedback/:id', loadComponent: () => import('./pages/survey-fill/survey-fill.component').then(m => m.SurveyFillComponent)},

  { path: 'embed/server/:vendor/:id/:chartname', loadComponent: () => import('./pages/embedded-server-chart/embedded-server-chart.component').then(m => m.EmbeddedServerChartComponent)},
  { path: 'embed_debug/:vendor/:id/:chartname', loadComponent: () => import('./pages/embed-debug/embed-debug.component').then(m => m.EmbedDebugComponent)},

  { path: 'embed/compare/:chartname', loadComponent: () => import('./pages/embedded-compare-chart/embedded-compare-chart.component').then(m => m.EmbeddedCompareChartComponent)},
  { path: 'embed_compare_debug/:chartname', loadComponent: () => import('./pages/embed-compare-preview/embed-compare-preview.component').then(m => m.EmbedComparePreviewComponent)},

  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)},
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)},

  { path: '**', redirectTo: '' }
];
