import type { UserResource } from "@clerk/shared/types";

export interface GithubAuthHost {
  isGithubConsentActive(): boolean;
  startAuthPending(): void;
  clearAuthPending(): void;
  openGithubConsentSignUp(): void;
  closeSignIn(): void;
  closeSignUp(): void;
  setUser(user: UserResource | null): void;
  waitForSignedIn(timeoutMs: number): Promise<boolean>;
  isAuthenticated(): boolean;
  navigateAfterAuth(): Promise<void>;
  leaveAuthCallback(): Promise<void>;
  syncState(fromListener?: boolean): void;
  handleRedirectCallback(options?: { transferable?: boolean }): Promise<void>;
  resetGithubConsent(): void;
  completeSession(sessionId: string): Promise<void>;
  notifyContinueGithubSignUp(): void;
}
