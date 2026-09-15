import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { Router } from "@angular/router";
import type { SignInResource, SignUpResource } from "@clerk/shared/types";
import {
  AUTH_MESSAGES,
  GITHUB_POPUP_TIMEOUT_MS,
  GITHUB_SIGNIN_KEY,
} from "../auth.constants";
import type { RegisterResult } from "../auth.types";
import {
  appUrls,
  authErrorMessage,
  getSessionFlag,
  isTransferable,
  needsGithubConsent as needsGithubConsentPure,
  newsletterMetadata,
  openAuthPopup,
  prefersGithubRedirect,
  resolveHostedNavAction,
  setSessionFlag,
} from "../auth.utils";
import { ClerkService } from "./clerk.service";
import type { GithubAuthHost } from "./github-auth-host";

@Injectable({ providedIn: "root" })
export class GithubService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly clerk = inject(ClerkService);
  private host: GithubAuthHost | null = null;
  private signInInProgress = false;
  private handlingOAuthCallback = false;
  private hostedNavDepth = 0;
  private hostedNavOriginalNavigate:
    | ((to?: string, options?: unknown) => Promise<unknown>)
    | null = null;
  private hostedNavOriginalWindow: ((url: URL | string) => void) | null = null;

  bindHost(host: GithubAuthHost): void {
    this.host = host;
  }

  isSignInInProgress(): boolean {
    return this.signInInProgress;
  }

  consumeSignInHandoff(): boolean {
    if (!this.hasSignInHandoff()) {
      return false;
    }
    this.clearSignInHandoff();
    return true;
  }

  clearSignInHandoff(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setSessionFlag(GITHUB_SIGNIN_KEY, false);
  }

  cancelPendingPopupWait(): void {
    this.stopOutcomeWait();
  }

  needsConsent(): boolean {
    return needsGithubConsentPure(
      this.clerk.instance?.client?.signIn,
      this.clerk.instance?.client?.signUp,
      !!this.clerk.user,
    );
  }

  async signIn(): Promise<void> {
    const host = this.requireHost();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const signIn = await this.clerk.requireSignIn();
    if (!signIn) {
      throw new Error(AUTH_MESSAGES.authNotReady);
    }

    this.signInInProgress = true;
    this.markSignInHandoff();
    host.clearAuthPending();
    host.resetGithubConsent();

    const urls = appUrls();
    const oauthParams = {
      strategy: "oauth_github" as const,
      redirectUrl: urls.authCallback,
      redirectUrlComplete: urls.authCallback,
    };
    const restoreNavigation = this.suppressHostedNavigation();

    try {
      await this.withPopup(
        "scGithubSignIn",
        async (popup) => {
          popup.focus();
          await signIn.authenticateWithPopup({
            ...oauthParams,
            popup,
          });
        },
        { showPendingOnNavigate: false, waitForSignInOutcome: true },
      );
      this.signInInProgress = false;
      await this.finishSignIn();
    } catch (error) {
      host.clearAuthPending();
      throw error;
    } finally {
      restoreNavigation();
      this.signInInProgress = false;
      if (!host.isGithubConsentActive()) {
        this.clearSignInHandoff();
      }
      host.syncState(true);
    }
  }

  async signUp(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<void> {
    const host = this.requireHost();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const signUp = await this.clerk.requireSignUp();
    if (!signUp) {
      throw new Error(AUTH_MESSAGES.authNotReady);
    }

    host.clearAuthPending();

    const urls = appUrls();
    const oauthParams = {
      strategy: "oauth_github" as const,
      redirectUrl: urls.authCallback,
      redirectUrlComplete: urls.authCallback,
      continueSignUp: !!signUp.id,
      legalAccepted,
      unsafeMetadata: newsletterMetadata(newsletterOptIn),
    };

    if (prefersGithubRedirect()) {
      try {
        await signUp.authenticateWithRedirect(oauthParams);
      } catch (error) {
        host.clearAuthPending();
        throw error;
      }
      return;
    }

    const restoreNavigation = this.suppressHostedNavigation();
    try {
      await this.withPopup(
        "scGithubSignUp",
        async (popup) => {
          popup.focus();
          await signUp.authenticateWithPopup({
            ...oauthParams,
            popup,
          });
        },
        {
          showPendingOnNavigate: true,
          waitForSignInOutcome: true,
          requireUser: true,
        },
      );
      await this.finishSignIn();
    } catch (error) {
      host.clearAuthPending();
      throw error;
    } finally {
      restoreNavigation();
      host.syncState(true);
    }
  }

  async completePendingSignUp(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<RegisterResult> {
    const host = this.requireHost();
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.registrationBrowserOnly,
      };
    }

    await this.clerk.reloadClient();
    const signIn = await this.clerk.requireSignIn();
    let signUp = await this.clerk.requireSignUp();
    if (!signUp) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }

    const legalUpdate = {
      legalAccepted,
      unsafeMetadata: newsletterMetadata(newsletterOptIn),
    };

    try {
      const transferableSignIn = isTransferable(
        signIn as (SignInResource & { isTransferable?: boolean }) | null,
      );
      const transferableSignUp = isTransferable(
        signUp as (SignUpResource & { isTransferable?: boolean }) | null,
      );
      const forceTransfer = host.isGithubConsentActive();
      const oauthUnverified =
        signUp.verifications?.externalAccount?.status === "unverified";

      if (oauthUnverified) {
        return this.finishUnverifiedOauth(newsletterOptIn, legalAccepted);
      }

      if (signUp.status === "missing_requirements") {
        signUp = await signUp.update(legalUpdate);
      } else if (transferableSignIn || transferableSignUp || forceTransfer) {
        signUp = await signUp.create({
          transfer: true,
          ...legalUpdate,
        });
      } else {
        return {
          status: "error",
          message: AUTH_MESSAGES.unableToCompleteGithubSignUp,
        };
      }

      if (signUp.status === "missing_requirements") {
        if (signUp.verifications?.externalAccount?.status === "unverified") {
          return this.finishUnverifiedOauth(newsletterOptIn, legalAccepted);
        }
        signUp = await signUp.update(legalUpdate);
      }

      if (signUp.status === "complete" && signUp.createdSessionId) {
        host.resetGithubConsent();
        this.clearSignInHandoff();
        await host.completeSession(signUp.createdSessionId);
        return { status: "complete" };
      }

      return {
        status: "error",
        message: AUTH_MESSAGES.unableToCompleteGithubSignUp,
      };
    } catch (error) {
      host.clearAuthPending();
      return {
        status: "error",
        message: authErrorMessage(
          error,
          AUTH_MESSAGES.unableToCompleteGithubSignUp,
        ),
      };
    }
  }

  private async finishUnverifiedOauth(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<RegisterResult> {
    const host = this.requireHost();
    host.notifyContinueGithubSignUp();
    await this.signUp(newsletterOptIn, legalAccepted);
    host.syncState();
    if (host.isAuthenticated()) {
      host.resetGithubConsent();
      this.clearSignInHandoff();
      return { status: "complete" };
    }
    return {
      status: "error",
      message: AUTH_MESSAGES.unableToCompleteGithubSignUp,
    };
  }

  suppressHostedNavigation(): () => void {
    const clerk = this.clerk.navigationInstance;
    if (!clerk) {
      return () => undefined;
    }

    this.hostedNavDepth += 1;
    if (this.hostedNavDepth === 1) {
      this.hostedNavOriginalNavigate = clerk.navigate.bind(clerk) as (
        to?: string,
        options?: unknown,
      ) => Promise<unknown>;
      this.hostedNavOriginalWindow =
        clerk.__internal_windowNavigate.bind(clerk);

      clerk.navigate = (async (to?: string, options?: unknown) => {
        const href = String(to ?? "");
        const action = resolveHostedNavAction(href, {
          blockSameOrigin: this.signInInProgress || this.handlingOAuthCallback,
        });
        if (action === "block") {
          return;
        }
        if (action === "oauth") {
          await this.consumeOAuthCallback(href);
          return;
        }
        return this.hostedNavOriginalNavigate?.(to as string, options as never);
      }) as typeof clerk.navigate;

      clerk.__internal_windowNavigate = (url) => {
        const href = url instanceof URL ? url.href : String(url);
        const action = resolveHostedNavAction(href, {
          blockSameOrigin: this.signInInProgress || this.handlingOAuthCallback,
        });
        if (action === "block") {
          return;
        }
        if (action === "oauth") {
          void this.consumeOAuthCallback(href);
          return;
        }
        this.hostedNavOriginalWindow?.(url);
      };
    }

    return () => {
      this.hostedNavDepth = Math.max(0, this.hostedNavDepth - 1);
      if (this.hostedNavDepth > 0 || !this.hostedNavOriginalNavigate) {
        return;
      }
      clerk.navigate = this.hostedNavOriginalNavigate as typeof clerk.navigate;
      clerk.__internal_windowNavigate = this.hostedNavOriginalWindow!;
      this.hostedNavOriginalNavigate = null;
      this.hostedNavOriginalWindow = null;
    };
  }

  async finishSignIn(): Promise<void> {
    const host = this.requireHost();
    host.clearAuthPending();
    await this.clerk.reloadClient();
    host.setUser(this.clerk.user);

    if (!host.isAuthenticated()) {
      await host.waitForSignedIn(10000);
    }

    if (host.isAuthenticated() || this.clerk.user) {
      if (this.clerk.user) {
        host.setUser(this.clerk.user);
      }
      await this.completeSignedInLogin();
      return;
    }

    if (host.isGithubConsentActive()) {
      return;
    }

    if (this.needsConsent()) {
      host.closeSignIn();
      host.openGithubConsentSignUp();
      if (window.location.pathname.startsWith("/auth/callback")) {
        await this.router.navigateByUrl("/", { replaceUrl: true });
      }
      return;
    }

    this.clearSignInHandoff();
  }

  async completeSignedInLogin(): Promise<void> {
    const host = this.requireHost();
    this.signInInProgress = false;
    this.clearSignInHandoff();
    host.resetGithubConsent();
    host.closeSignIn();
    host.closeSignUp();
    host.startAuthPending();
    await host.navigateAfterAuth();
  }

  private async consumeOAuthCallback(href: string): Promise<void> {
    if (this.handlingOAuthCallback) {
      return;
    }

    const host = this.requireHost();
    this.handlingOAuthCallback = true;
    try {
      const url = new URL(href, window.location.origin);
      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
      await this.clerk.reloadClient();
      if (!this.clerk.user) {
        await host.handleRedirectCallback({ transferable: false });
      }
      await this.finishSignIn();
    } finally {
      this.handlingOAuthCallback = false;
    }
  }

  private outcomeWaitCleanup: (() => void) | null = null;
  private outcomeWaitResolve: (() => void) | null = null;

  private stopOutcomeWait(): void {
    this.outcomeWaitCleanup?.();
    this.outcomeWaitCleanup = null;
    const resolve = this.outcomeWaitResolve;
    this.outcomeWaitResolve = null;
    resolve?.();
  }

  private async withPopup(
    name: string,
    authenticate: (popup: Window) => Promise<void>,
    options?: {
      showPendingOnNavigate?: boolean;
      waitForSignInOutcome?: boolean;
      requireUser?: boolean;
    },
  ): Promise<void> {
    const host = this.requireHost();
    this.stopOutcomeWait();
    const popup = openAuthPopup(name);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let pollId: ReturnType<typeof setInterval> | undefined;
    let leftBlank = false;
    const showPendingOnNavigate = options?.showPendingOnNavigate !== false;
    const waitForSignInOutcome = options?.waitForSignInOutcome === true;
    const requireUser = options?.requireUser === true;

    const cleanup = (): void => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      if (pollId !== undefined) {
        clearInterval(pollId);
      }
    };

    const markOAuthStarted = (): void => {
      leftBlank = true;
      if (showPendingOnNavigate) {
        host.startAuthPending();
      }
    };

    try {
      await new Promise<void>((resolve, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(AUTH_MESSAGES.githubPopupTimeout));
        }, GITHUB_POPUP_TIMEOUT_MS);

        pollId = setInterval(() => {
          if (popup.closed) {
            if (!leftBlank) {
              reject(new Error(AUTH_MESSAGES.githubPopupCancelled));
              return;
            }
            cleanup();
            resolve();
            return;
          }

          try {
            const href = popup.location.href;
            if (href && href !== "about:blank") {
              markOAuthStarted();
            }
          } catch {
            markOAuthStarted();
          }
        }, 200);

        void authenticate(popup)
          .then(() => {
            cleanup();
            resolve();
          })
          .catch((error: unknown) => {
            cleanup();
            reject(error);
          });
      });

      if (waitForSignInOutcome) {
        await this.waitForSignInOutcome(popup, { requireUser });
      }
      host.clearAuthPending();
    } catch (error) {
      this.stopOutcomeWait();
      host.clearAuthPending();
      if (!popup.closed) {
        popup.close();
      }
      throw error;
    } finally {
      cleanup();
    }
  }

  private async waitForSignInOutcome(
    popup: Window,
    options?: { requireUser?: boolean },
  ): Promise<void> {
    const host = this.requireHost();
    const started = Date.now();
    const requireUser = options?.requireUser === true;

    this.stopOutcomeWait();

    const isReady = (): boolean => {
      if (this.clerk.user) {
        return true;
      }
      if (requireUser) {
        return false;
      }
      return this.needsConsent() && !host.isGithubConsentActive();
    };

    await new Promise<void>((resolve) => {
      const timers: ReturnType<typeof setInterval>[] = [];
      let unsubscribe: (() => void) | undefined;
      let settled = false;

      const cleanup = (): void => {
        for (const timer of timers) {
          clearInterval(timer);
        }
        timers.length = 0;
        unsubscribe?.();
        unsubscribe = undefined;
        if (this.outcomeWaitCleanup === cleanup) {
          this.outcomeWaitCleanup = null;
        }
        if (this.outcomeWaitResolve === finish) {
          this.outcomeWaitResolve = null;
        }
      };

      const finish = (): void => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        if (!popup.closed) {
          popup.close();
        }
        void this.clerk.reloadClient().finally(() => resolve());
      };

      const checkReady = (): void => {
        if (isReady()) {
          finish();
        }
      };

      this.outcomeWaitCleanup = cleanup;
      this.outcomeWaitResolve = finish;

      unsubscribe = this.clerk.addListener(checkReady);
      timers.push(
        setInterval(() => {
          if (Date.now() - started >= GITHUB_POPUP_TIMEOUT_MS) {
            finish();
            return;
          }
          void this.clerk.reloadClient().then(checkReady);
        }, 1000),
      );
      timers.push(
        setInterval(() => {
          if (!popup.closed) {
            return;
          }
          if (requireUser) {
            void this.clerk.reloadClient().then(checkReady);
            return;
          }
          finish();
        }, 250),
      );
      void this.clerk.reloadClient().then(checkReady);
    });
  }

  private markSignInHandoff(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setSessionFlag(GITHUB_SIGNIN_KEY, true);
  }

  private hasSignInHandoff(): boolean {
    return getSessionFlag(GITHUB_SIGNIN_KEY);
  }

  private requireHost(): GithubAuthHost {
    if (!this.host) {
      throw new Error(AUTH_MESSAGES.authNotReady);
    }
    return this.host;
  }
}
