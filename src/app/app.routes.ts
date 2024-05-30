import { Routes } from '@angular/router';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { ServerListingComponent } from './pages/server-listing/server-listing.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingpageComponent },
  { path: 'servers', component: ServerListingComponent },
  { path: 'server/:vendor/:id', loadComponent: () => import('./pages/server-details/server-details.component').then(m => m.ServerDetailsComponent)},
  { path: 'article/:id', loadComponent: () => import('./pages/article/article.component').then(m => m.ArticleComponent)},
  { path: 'articles', loadComponent: () => import('./pages/articles/articles.component').then(m => m.ArticlesComponent)},
  { path: 'legal/tos', loadComponent: () => import('./pages/tos/tos.component').then(m => m.TOSComponent)},
  { path: 'datacenters', loadComponent: () => import('./pages/datacenters/datacenters.component').then(m => m.DatacentersComponent)},
  { path: 'vendors', loadComponent: () => import('./pages/vendors/vendors.component').then(m => m.VendorsComponent)},

  { path: 'auth/callback', loadComponent: () => import('./auth/callback/callback.component').then(m => m.CallbackComponent)},

  { path: 'dashboard',
    loadComponent: () => import('./pages/my-spare-cores/my-spare-cores.component').then(m => m.MySpareCoresComponent),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: '' }
];
