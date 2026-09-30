import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import type { SignInResource, SignUpResource } from "@clerk/shared/types";
import { AUTH_MESSAGES } from "../auth.constants";
import type { AuthKind, GitHubIntent } from "../auth.types";
import {
  authErrorMessage,
  authUrls,
  hasVerifiedGitHubExternal,
  isSecondFactorStatus,
  isTransferable,
  needsGitHubConsent,
  needsLegalAcceptance,
  newsletterMetadata,
} from "../auth.utils";
import { ClerkService } from "./clerk.service";

export type GitHubRedirectOutcome =
  | { status: "redirecting" }
  | { status: "error"; message: string };

export type GitHubSignUpOutcome =
  | { status: "complete"; sessionId: string; kind: AuthKind }
  | { status: "redirecting" }
  | { status: "needs_consent" }
  | { status: "error"; message: string };

@Injectable({ providedIn: "root" })
export class GitHubService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly clerk = inject(ClerkService);

  needsConsent(): boolean {
    return needsGitHubConsent(
      this.clerk.instance?.client?.signIn,
      this.clerk.instance?.client?.signUp,
      !!this.clerk.user,
    );
  }

  resetSignUpState(): void {
    this.clerk.instance?.client?.resetSignUp();
  }

  async startSignIn(): Promise<GitHubRedirectOutcome> {
    if (!isPlatformBrowser(this.platformId)) {
      return { status: "error", message: AUTH_MESSAGES.signInBrowserOnly };
    }

    const signIn = await this.clerk.getSignInResource();
    if (!signIn) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }

    const redirectUrl = this.buildRedirectUrl("signIn");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_github",
        redirectUrl,
        redirectUrlComplete: redirectUrl,
      });
      return { status: "redirecting" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToContinueGitHub),
      };
    }
  }

  private async startSignUp(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<GitHubRedirectOutcome> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.registrationBrowserOnly,
      };
    }

    const signUp = await this.clerk.getSignUpResource();
    if (!signUp) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }

    const redirectUrl = this.buildRedirectUrl("signUp");
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_github",
        redirectUrl,
        redirectUrlComplete: redirectUrl,
        continueSignUp: !!signUp.id,
        ...(legalAccepted ? { legalAccepted: true } : {}),
        unsafeMetadata: newsletterMetadata(newsletterOptIn),
      });
      return { status: "redirecting" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToContinueGitHub),
      };
    }
  }

  async continueSignUp(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<GitHubSignUpOutcome> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.registrationBrowserOnly,
      };
    }

    const { signIn, signUp } = await this.loadResources();

    if (isTransferable(signUp)) {
      return this.finalizeSignUpFlow(signIn, signUp, newsletterOptIn, false);
    }

    if (isTransferable(signIn)) {
      return { status: "needs_consent" };
    }

    if (hasVerifiedGitHubExternal(signUp)) {
      if (needsLegalAcceptance(signUp)) {
        return { status: "needs_consent" };
      }
      return this.finalizeSignUpFlow(signIn, signUp, newsletterOptIn, true);
    }

    return this.startSignUp(newsletterOptIn, legalAccepted);
  }

  async submitConsentAndComplete(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<GitHubSignUpOutcome> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.registrationBrowserOnly,
      };
    }

    const { signIn, signUp } = await this.loadResources();
    return this.finalizeSignUpFlow(
      signIn,
      signUp,
      newsletterOptIn,
      legalAccepted,
    );
  }

  private async finalizeSignUpFlow(
    signIn: SignInResource | null,
    currentSignUp: SignUpResource | null,
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<GitHubSignUpOutcome> {
    let signUp = currentSignUp;
    if (!signUp) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }
    if (!signUp.id && !isTransferable(signIn)) {
      this.resetSignUpState();
      return {
        status: "error",
        message: AUTH_MESSAGES.unableToCompleteGitHubSignUp,
      };
    }

    const legalUpdate = {
      legalAccepted,
      unsafeMetadata: newsletterMetadata(newsletterOptIn),
    };

    try {
      if (signUp.verifications?.externalAccount?.status === "unverified") {
        return this.startSignUp(newsletterOptIn, legalAccepted);
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
        this.resetSignUpState();
        return {
          status: "error",
          message: AUTH_MESSAGES.unableToCompleteGitHubSignUp,
        };
      }

      if (signUp.status === "missing_requirements") {
        if (signUp.verifications?.externalAccount?.status === "unverified") {
          return this.startSignUp(newsletterOptIn, legalAccepted);
        }
        if (isTransferable(signUp)) {
          return this.completeTransferToSignIn(
            await this.clerk.getSignInResource(),
          );
        }
        signUp = await signUp.update(legalUpdate);
      }

      if (signUp.status === "complete" && signUp.createdSessionId) {
        return {
          status: "complete",
          sessionId: signUp.createdSessionId,
          kind: "registration",
        };
      }

      this.resetSignUpState();
      return {
        status: "error",
        message: AUTH_MESSAGES.unableToCompleteGitHubSignUp,
      };
    } catch (error) {
      this.resetSignUpState();
      return {
        status: "error",
        message: authErrorMessage(
          error,
          AUTH_MESSAGES.unableToCompleteGitHubSignUp,
        ),
      };
    }
  }

  private async completeTransferToSignIn(
    signIn: SignInResource | null,
  ): Promise<GitHubSignUpOutcome> {
    if (!signIn) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }

    const transferred = await signIn.create({ transfer: true });
    if (transferred.status === "complete" && transferred.createdSessionId) {
      return {
        status: "complete",
        sessionId: transferred.createdSessionId,
        kind: "login",
      };
    }

    if (isSecondFactorStatus(transferred.status)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.additionalVerification,
      };
    }

    return {
      status: "error",
      message: AUTH_MESSAGES.unableToCompleteGitHubSignUp,
    };
  }

  private async loadResources(): Promise<{
    signIn: SignInResource | null;
    signUp: SignUpResource | null;
  }> {
    await this.clerk.syncClerkState();
    const [signIn, signUp] = await Promise.all([
      this.clerk.getSignInResource(),
      this.clerk.getSignUpResource(),
    ]);
    return { signIn, signUp };
  }

  private buildRedirectUrl(intent: GitHubIntent): string {
    return `${authUrls().authCallback}?intent=${intent}`;
  }
}
