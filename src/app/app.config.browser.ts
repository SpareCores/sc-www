import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { OAuthStorage } from 'angular-oauth2-oidc';

const browserConfig: ApplicationConfig = {
  providers: [
    {
      provide: OAuthStorage,
      useValue: localStorage,
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
