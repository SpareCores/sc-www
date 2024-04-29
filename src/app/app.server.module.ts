import { NgModule } from '@angular/core';
import { AppModule } from './app.module';
import { ServerModule } from '@angular/platform-server';
import { AppComponent } from './app.component';
import { provideClientHydration } from '@angular/platform-browser';


@NgModule({
  declarations: [],
  imports: [
    AppModule,
    ServerModule
  ],
  providers: [
    provideClientHydration(),
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule { }
