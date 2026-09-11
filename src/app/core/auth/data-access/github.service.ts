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
  private oauthNeedsSignUp = false;
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

  get oauthNeedsSignUpFlag(): boolean {
    return this.oauthNeedsSignUp;
  }

  set oauthNeedsSignUpFlag(value: boolean) {
    this.oauthNeedsSignUp = value;
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
    host.awaitingGithubConsent.set(false);
    host.signUpGithubConsent.set(false);

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
      await this.finishSignIn();
    } catch (error) {
      host.clearAuthPending();
      throw error;
    } finally {
      restoreNavigation();
      this.signInInProgress = false;
      if (!host.awaitingGithubConsent()) {
        this.clearSignInHandoff();
      }
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

    try {
      await this.withPopup("scGithubSignUp", async (popup) => {
        popup.focus();
        await signUp.authenticateWithPopup({
          ...oauthParams,
          popup,
        });
      });
      host.startAuthPending();
      await this.finishPopup();
    } catch (error) {
      host.clearAuthPending();
      throw error;
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

      if (signUp.status === "missing_requirements") {
        signUp = await signUp.update(legalUpdate);
      } else if (
        transferableSignIn ||
        transferableSignUp ||
        host.githubConsentIsTransfer()
      ) {
        signUp = await signUp.create({
          transfer: true,
          ...legalUpdate,
        });
      } else {
        await this.signUp(newsletterOptIn, legalAccepted);
        host.syncState();
        if (host.isAuthenticated()) {
          host.resetGithubConsentFlags();
          this.clearSignInHandoff();
          return { status: "complete" };
        }
        return {
          status: "error",
          message: AUTH_MESSAGES.unableToCompleteGithubSignUp,
        };
      }

      if (signUp.status === "missing_requirements") {
        signUp = await signUp.update(legalUpdate);
      }

      if (signUp.status === "complete" && signUp.createdSessionId) {
        host.resetGithubConsentFlags();
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

    if (!host.isAuthenticated() && this.clerk.session) {
      await host.waitForSignedIn(5000);
    }

    if (host.isAuthenticated()) {
      await this.completeSignedInLogin();
      return;
    }

    if (host.awaitingGithubConsent() || host.signUpGithubConsent()) {
      return;
    }

    if (this.needsConsent() || this.oauthNeedsSignUp) {
      this.oauthNeedsSignUp = false;
      host.closeSignIn();
      host.openGithubConsentSignUp({ transfer: true });
      if (window.location.pathname.startsWith("/auth/callback")) {
        await this.router.navigateByUrl("/", { replaceUrl: true });
      }
      return;
    }

    this.clearSignInHandoff();
  }

  async completeSignedInLogin(): Promise<void> {
    const host = this.requireHost();
    this.oauthNeedsSignUp = false;
    this.signInInProgress = false;
    this.clearSignInHandoff();
    host.resetGithubConsentFlags();
    host.closeSignIn();
    host.closeSignUp();
    host.startAuthPending();
    await host.navigateAfterAuth();
  }

  private async finishPopup(): Promise<void> {
    const host = this.requireHost();
    host.startAuthPending();
    await this.clerk.reloadClient();

    if (this.clerk.user) {
      host.setUser(this.clerk.user);
    }

    if (this.openConsentIfNeeded()) {
      return;
    }

    if (host.isAuthenticated()) {
      await host.navigateAfterAuth();
      return;
    }

    if (await host.waitForSignedIn(10000)) {
      if (this.openConsentIfNeeded()) {
        return;
      }
      await host.navigateAfterAuth();
      return;
    }

    if (this.openConsentIfNeeded()) {
      return;
    }

    host.clearAuthPending();
  }

  private openConsentIfNeeded(): boolean {
    const host = this.requireHost();
    if (!this.needsConsent()) {
      return false;
    }
    host.clearAuthPending();
    host.openGithubConsentSignUp({ transfer: true });
    return true;
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

  private async withPopup(
    name: string,
    authenticate: (popup: Window) => Promise<void>,
    options?: {
      showPendingOnNavigate?: boolean;
      waitForSignInOutcome?: boolean;
    },
  ): Promise<void> {
    const host = this.requireHost();
    const popup = openAuthPopup(name);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let pollId: ReturnType<typeof setInterval> | undefined;
    let leftBlank = false;
    const showPendingOnNavigate = options?.showPendingOnNavigate !== false;
    const waitForSignInOutcome = options?.waitForSignInOutcome === true;

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

    const stall = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(AUTH_MESSAGES.githubPopupTimeout));
      }, GITHUB_POPUP_TIMEOUT_MS);

      pollId = setInterval(() => {
        if (popup.closed) {
          if (!leftBlank) {
            reject(new Error(AUTH_MESSAGES.githubPopupCancelled));
          }
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
    });

    try {
      await Promise.race([authenticate(popup), stall]);
      if (waitForSignInOutcome) {
        await this.waitForSignInOutcome(popup);
      }
      host.clearAuthPending();
    } catch (error) {
      host.clearAuthPending();
      if (!popup.closed) {
        popup.close();
      }
      throw error;
    } finally {
      cleanup();
    }
  }

  private async waitForSignInOutcome(popup: Window): Promise<void> {
    const host = this.requireHost();
    const started = Date.now();
    const onMessage = (event: MessageEvent): void => {
      const origin = event.origin || "";
      const data = event.data as { session?: string; return_url?: string };
      if (
        !(origin.includes("clerk") || origin.includes("accounts.dev")) ||
        popup.closed
      ) {
        return;
      }
      if (data?.return_url && !data?.session) {
        this.oauthNeedsSignUp = true;
      }
      if ((data?.session || data?.return_url) && !popup.closed) {
        popup.close();
      }
    };
    window.addEventListener("message", onMessage);

    try {
      while (Date.now() - started < GITHUB_POPUP_TIMEOUT_MS) {
        await this.clerk.reloadClient();
        if (
          this.clerk.user ||
          this.needsConsent() ||
          host.awaitingGithubConsent() ||
          this.oauthNeedsSignUp
        ) {
          if (!popup.closed) {
            popup.close();
          }
          return;
        }
        if (popup.closed) {
          await this.clerk.reloadClient();
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      if (!popup.closed) {
        popup.close();
      }
    } finally {
      window.removeEventListener("message", onMessage);
    }
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
