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
  { path: 'article/:id', loadComponent: () => import('./pages/article/article.component').then(m => m.ArticleComponent)},
  { path: 'articles', loadComponent: () => import('./pages/articles/articles.component').then(m => m.ArticlesComponent)},
  { path: 'legal/tos', loadComponent: () => import('./pages/tos/tos.component').then(m => m.TOSComponent)},
  { path: 'datacenters', loadComponent: () => import('./pages/datacenters/datacenters.component').then(m => m.DatacentersComponent)},
  { path: 'vendors', loadComponent: () => import('./pages/vendors/vendors.component').then(m => m.VendorsComponent)},
  { path: '**', redirectTo: '' }
];
