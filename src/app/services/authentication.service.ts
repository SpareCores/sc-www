import { Injectable } from '@angular/core';
import { AuthConfig, OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, from, Observable } from 'rxjs';

//import { StatehandlerService } from './statehandler.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  constructor(
    private oauthService: OAuthService,
    private authConfig: AuthConfig,
    //private statehandler: StatehandlerService,
  ) {
    this.oauthService.events.subscribe((event: OAuthEvent) => {
      console.log('oauth event', event);
    });
  }

  public getOIDCUser(): Observable<any> {
    return from(this.oauthService.loadUserProfile());
  }

  public async authenticate(setState: boolean = true): Promise<void> {
    this.oauthService.configure(this.authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    this.oauthService.strictDiscoveryDocumentValidation = false;
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();


    if (!this.oauthService.hasValidIdToken()) {
      const newState = undefined; //setState ? await this.statehandler.createState().toPromise() : undefined;
      this.oauthService.initCodeFlow(newState);
    }

    return;
  }

  public async loginCodeFlow(): Promise<void> {
    const newState = undefined; //await this.statehandler.createState().toPromise();
    return this.oauthService.tryLoginCodeFlow(newState);
  }

  public async getToken(): Promise<string> {
    return this.oauthService.getIdToken();
  }

  public isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public signout(): void {
    this.oauthService.logOut();
  }
}
