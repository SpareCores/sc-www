import { Routes } from '@angular/router';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { ServerListingComponent } from './pages/server-listing/server-listing.component';
import { ServerPricesComponent } from './pages/server-prices/server-prices.component';

export const routes: Routes = [
  { path: '', component: LandingpageComponent },

  { path: 'compare', loadComponent: () => import('./pages/server-compare/server-compare.component').then(m => m.ServerCompareComponent)},
  { path: 'servers', component: ServerListingComponent },
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
  { path: 'datacenters', redirectTo: 'regions' },

  { path: 'survey/:id', loadComponent: () => import('./pages/survey-fill/survey-fill.component').then(m => m.SurveyFillComponent)},

  { path: '**', redirectTo: '' }
];
