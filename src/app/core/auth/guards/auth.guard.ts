import { isPlatformBrowser } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStateService } from "../data-access/auth-state.service";

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return router.createUrlTree(["/"]);
  }

  await auth.init();
  auth.syncSession();

  if (auth.isAuthenticated()) {
    return true;
  }

  if (auth.isAuthPending() || auth.authInProgress()) {
    auth.startAuthPending();
    if (await auth.waitForSignedIn(20000)) {
      return true;
    }
    auth.clearAuthPending();
    return router.createUrlTree(["/"]);
  }

  return router.createUrlTree(["/"]);
};

export const blockLandingDuringAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (auth.awaitingGithubConsent() || auth.signUpGithubConsent()) {
    return true;
  }

  if (!auth.isAuthPending() && !auth.authInProgress()) {
    return true;
  }

  auth.startAuthPending();

  if (auth.isAuthenticated()) {
    return router.createUrlTree(["/bookmarks"]);
  }

  return true;
};
