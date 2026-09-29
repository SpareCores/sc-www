import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import type { SignInResource } from "@clerk/shared/types";
import {
  AUTH_MESSAGES,
  GITHUB_SIGNIN_KEY,
  GITHUB_SIGNUP_KEY,
} from "../auth.constants";
import type { RegisterResult } from "../auth.types";
import {
  appUrls,
  authErrorMessage,
  getSessionFlag,
  isSecondFactorStatus,
  isTransferable,
  needsGithubConsent as needsGithubConsentPure,
  newsletterMetadata,
  setSessionFlag,
} from "../auth.utils";
import { ClerkService } from "./clerk.service";
import type { GithubAuthHost } from "./github-auth-host";

@Injectable({ providedIn: "root" })
export class GithubService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly clerk = inject(ClerkService);
  private host: GithubAuthHost | null = null;

  bindHost(host: GithubAuthHost): void {
    this.host = host;
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

  clearSignUpHandoff(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setSessionFlag(GITHUB_SIGNUP_KEY, false);
  }

  hasSignUpHandoff(): boolean {
    return getSessionFlag(GITHUB_SIGNUP_KEY);
  }

  // Local reset only: signUp.create({}) would run Clerk's CAPTCHA, and the
  // next real create() replaces the server-side sign-up anyway.
  abandonIncompleteSignUp(): void {
    this.clearSignUpHandoff();
    this.clerk.instance?.client?.resetSignUp();
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

    this.markSignInHandoff();
    host.clearAuthPending();
    host.resetGithubConsent();

    const urls = appUrls();
    const redirectUrl = `${urls.authCallback}?intent=signIn`;
    const oauthParams = {
      strategy: "oauth_github" as const,
      redirectUrl,
      redirectUrlComplete: redirectUrl,
    };

    try {
      await signIn.authenticateWithRedirect(oauthParams);
    } catch (error) {
      this.clearSignInHandoff();
      host.clearAuthPending();
      throw error;
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
    this.clearSignInHandoff();
    this.markSignUpHandoff();

    const urls = appUrls();
    const oauthParams = {
      strategy: "oauth_github" as const,
      redirectUrl: urls.authCallback,
      redirectUrlComplete: urls.authCallback,
      continueSignUp: !!signUp.id,
      ...(legalAccepted ? { legalAccepted: true } : {}),
      unsafeMetadata: newsletterMetadata(newsletterOptIn),
    };

    try {
      await signUp.authenticateWithRedirect(oauthParams);
    } catch (error) {
      this.clearSignUpHandoff();
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

    await this.clerk.reloadClient();
    const signIn = await this.clerk.requireSignIn();
    let signUp = await this.clerk.requireSignUp();
    if (!signUp) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }
    if (!signUp.id && !isTransferable(signIn)) {
      this.abandonIncompleteSignUp();
      host.resetGithubConsent();
      return {
        status: "error",
        message: AUTH_MESSAGES.unableToCompleteGithubSignUp,
      };
    }

    const legalUpdate = {
      legalAccepted,
      unsafeMetadata: newsletterMetadata(newsletterOptIn),
    };

    try {
      const oauthUnverified =
        signUp.verifications?.externalAccount?.status === "unverified";

      if (oauthUnverified) {
        return await this.finishUnverifiedOauth(newsletterOptIn, legalAccepted);
      }

      if (isTransferable(signUp)) {
        return this.completeTransferToSignIn(signIn);
      }

      if (isTransferable(signIn)) {
        signUp = await signUp.create({
          transfer: true,
          ...legalUpdate,
        });
      } else if (signUp.status === "missing_requirements") {
        signUp = await signUp.update(legalUpdate);
      } else {
        this.abandonIncompleteSignUp();
        host.resetGithubConsent();
        return {
          status: "error",
          message: AUTH_MESSAGES.unableToCompleteGithubSignUp,
        };
      }

      if (signUp.status === "missing_requirements") {
        if (signUp.verifications?.externalAccount?.status === "unverified") {
          return await this.finishUnverifiedOauth(
            newsletterOptIn,
            legalAccepted,
          );
        }
        if (isTransferable(signUp)) {
          return this.completeTransferToSignIn(
            await this.clerk.requireSignIn(),
          );
        }
        signUp = await signUp.update(legalUpdate);
      }

      if (signUp.status === "complete" && signUp.createdSessionId) {
        host.resetGithubConsent();
        this.clearSignInHandoff();
        this.clearSignUpHandoff();
        await host.completeSession(signUp.createdSessionId);
        return { status: "complete" };
      }

      this.abandonIncompleteSignUp();
      host.resetGithubConsent();
      return {
        status: "error",
        message: AUTH_MESSAGES.unableToCompleteGithubSignUp,
      };
    } catch (error) {
      host.clearAuthPending();
      this.abandonIncompleteSignUp();
      host.resetGithubConsent();
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
    this.requireHost().notifyContinueGithubSignUp();
    await this.signUp(newsletterOptIn, legalAccepted);
    return { status: "complete" };
  }

  private async completeTransferToSignIn(
    signIn: SignInResource | null,
  ): Promise<RegisterResult> {
    const host = this.requireHost();
    if (!signIn) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }

    const transferred = await signIn.create({ transfer: true });
    if (transferred.status === "complete" && transferred.createdSessionId) {
      host.resetGithubConsent();
      this.clearSignInHandoff();
      this.clearSignUpHandoff();
      await host.completeSession(transferred.createdSessionId);
      return { status: "complete" };
    }

    if (isSecondFactorStatus(transferred.status)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.additionalVerification,
      };
    }

    return {
      status: "error",
      message: AUTH_MESSAGES.unableToCompleteGithubSignUp,
    };
  }

  async completeSignedInLogin(): Promise<void> {
    const host = this.requireHost();
    this.clearSignInHandoff();
    host.resetGithubConsent();
    host.closeSignIn();
    host.closeSignUp();
    host.startAuthPending();
    await host.navigateAfterAuth();
  }

  private markSignInHandoff(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setSessionFlag(GITHUB_SIGNIN_KEY, true);
  }

  private markSignUpHandoff(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setSessionFlag(GITHUB_SIGNUP_KEY, true);
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
