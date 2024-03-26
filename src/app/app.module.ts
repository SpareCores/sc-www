import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { LucideAngularModule, PcCase, Hotel, Home, Search, User, Github, Linkedin, Codesandbox, Database, Facebook, Twitter } from 'lucide-angular';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { ServerModule } from '@angular/platform-server';
import { FooterComponent } from './layout/footer/footer.component';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { ThemeTextComponent } from './components/theme-text/theme-text.component';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LandingpageComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    LucideAngularModule.pick({ PcCase, Hotel, Home, Search, User, Github, Linkedin, Codesandbox, Database, Twitter, Facebook}),
    CommonModule,
    ServerModule,
    ThemeTextComponent,
  ],
  providers: [
    provideClientHydration(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
