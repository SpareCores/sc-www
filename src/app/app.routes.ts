import { Routes } from '@angular/router';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { ServerListingComponent } from './pages/server-listing/server-listing.component';

export const routes: Routes = [
  { path: '', component: LandingpageComponent },
  { path: 'servers', component: ServerListingComponent },
  { path: 'article/:category/:id', loadComponent: () => import('./pages/article/article.component').then(m => m.ArticleComponent)},
  { path: 'legal/tos', loadComponent: () => import('./pages/tos/tos.component').then(m => m.TOSComponent)},
  { path: '**', redirectTo: '' }
];
