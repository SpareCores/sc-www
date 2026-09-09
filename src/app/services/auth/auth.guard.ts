import { isPlatformBrowser } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Auth } from "./auth";

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
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
    return router.createUrlTree(["/auth/callback"]);
  }

  return router.createUrlTree(["/"]);
};

export const blockLandingDuringAuthGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!auth.isAuthPending() && !auth.authInProgress()) {
    return true;
  }

  auth.startAuthPending();

  if (auth.isAuthenticated()) {
    return router.createUrlTree(["/bookmarks"]);
  }

  return router.createUrlTree(["/auth/callback"]);
};
