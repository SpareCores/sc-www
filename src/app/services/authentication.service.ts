import { Injectable } from '@angular/core';
import { AuthConfig, OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';

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
      switch (event.type) {
        case 'logout':
          this.authedState.next(false);
        break;
        case 'token_received':
        case 'token_refreshed':
          this.authedState.next(true);
        break;
      }
    });
  }

  public getOIDCUser(): Promise<any> {
    return this.oauthService.loadUserProfile();
  }

  public async tryAutoLogin(): Promise<void> {
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    if (this.oauthService.hasValidIdToken()) {
      this.authedState.next(true);
    } else {
      this.authedState.next(false);
    }
  }

  public async authenticate(path?: string): Promise<void> {
    try {
      this.oauthService.configure(this.authConfig);
      this.oauthService.setupAutomaticSilentRefresh();

      this.oauthService.strictDiscoveryDocumentValidation = false;
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      if (!this.oauthService.hasValidIdToken()) {
        const newState = path || window.location.pathname;
        sessionStorage.setItem('prelogin_url', newState);
        this.oauthService.initImplicitFlow();
      } else {
        this.authedState.next(true);
      }
      return;
    } catch (error) {
      console.error(error);
      this.authedState.next(false);
    }
  }

  public async loginCodeFlow(): Promise<void> {
    return this.oauthService.tryLoginCodeFlow();
  }

  public getToken(): string {
    return this.oauthService.getIdToken();
  }

  public hasToken(): boolean {
    return this.oauthService.hasValidIdToken();
  }

  public getUserID(): string | undefined {
    if(!this.oauthService.getIdentityClaims()) {
      return undefined;
    }
    return this.oauthService.getIdentityClaims()['sub'];
  }

  public isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public signout(): void {
    this.oauthService.logOut();
  }
}
