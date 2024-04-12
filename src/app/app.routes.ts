import { Routes } from '@angular/router';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { ServerListingComponent } from './pages/server-listing/server-listing.component';

export const routes: Routes = [
  { path: '', component: LandingpageComponent },
  { path: 'servers', component: ServerListingComponent },
  { path: '**', redirectTo: '' }
];
