import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Pipe } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { LucideAngularModule, PcCase, Hotel, Home, Search, User, Github, Linkedin, Codesandbox, Database, Facebook, Twitter, Check } from 'lucide-angular';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ServerModule } from '@angular/platform-server';
import { FooterComponent } from './layout/footer/footer.component';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { ThemeTextComponent } from './components/theme-text/theme-text.component';
import { HttpClient, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { TimeToShortDatePipe } from './pipes/time-to-short-date.pipe';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LandingpageComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    LucideAngularModule.pick({ PcCase, Hotel, Home, Search, User, Github, Linkedin, Codesandbox, Database, Twitter, Facebook, Check}),
    CommonModule,
    FormsModule,
    ServerModule,
    BrowserModule,
    HttpClientModule,
    ThemeTextComponent,
    TimeToShortDatePipe
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
