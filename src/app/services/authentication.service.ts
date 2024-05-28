import { Injectable } from '@angular/core';
import { AuthConfig, OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  authedState = new BehaviorSubject<boolean | undefined>(undefined);

  constructor(
    private oauthService: OAuthService,
    private authConfig: AuthConfig,
  ) {
    this.oauthService.events.subscribe((event: OAuthEvent) => {
      console.log('oauth event', event);
      switch (event.type) {
        case 'logout':
          this.authedState.next(false);
        break;
      }
    });
  }

  public getOIDCUser(): Observable<any> {
    return from(this.oauthService.loadUserProfile());
  }

  public async authenticate(): Promise<void> {
    this.oauthService.configure(this.authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    this.oauthService.strictDiscoveryDocumentValidation = false;
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();


    if (!this.oauthService.hasValidIdToken()) {
      const newState = window.location.pathname;
      sessionStorage.setItem('prelogin_url', newState);
      this.oauthService.initImplicitFlow();
    }

    return;
  }

  public async loginCodeFlow(): Promise<void> {
    return this.oauthService.initCodeFlow();
  }

  public async getToken(): Promise<string> {
    return this.oauthService.getIdToken();
  }

  public async getAccessToken(): Promise<string> {
    return this.oauthService.getAccessToken();
  }

  public isLoggedIn(): boolean {
    console.log('hasValidAccessToken', this.oauthService.hasValidAccessToken());
    return this.oauthService.hasValidAccessToken();
  }

  public signout(): void {
    this.oauthService.logOut();
  }
}
