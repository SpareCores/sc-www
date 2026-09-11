import type { Signal, WritableSignal } from "@angular/core";
import type { UserResource } from "@clerk/shared/types";

export interface GithubAuthHost {
  awaitingGithubConsent: WritableSignal<boolean>;
  signUpGithubConsent: WritableSignal<boolean>;
  githubConsentIsTransfer: Signal<boolean>;
  startAuthPending(): void;
  clearAuthPending(): void;
  openGithubConsentSignUp(options?: {
    transfer?: boolean;
    fromLogin?: boolean;
  }): void;
  closeSignIn(): void;
  closeSignUp(): void;
  setUser(user: UserResource | null): void;
  waitForSignedIn(timeoutMs: number): Promise<boolean>;
  isAuthenticated(): boolean;
  navigateAfterAuth(): Promise<void>;
  syncState(fromListener?: boolean): void;
  handleRedirectCallback(options?: { transferable?: boolean }): Promise<void>;
  resetGithubConsentFlags(): void;
  completeSession(sessionId: string): Promise<void>;
}
