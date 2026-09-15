import { isPlatformBrowser } from "@angular/common";
import {
  Injectable,
  NgZone,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import type { UserResource } from "@clerk/shared/types";
import { ToastService } from "../../../services/toast.service";
import {
  AUTH_MESSAGES,
  AUTH_OVERLAY_CLASS,
  AUTH_OVERLAY_ID,
  AUTH_PENDING_KEY,
} from "../auth.constants";
import type {
  GithubCallbackOutcome,
  LoginPayload,
  LoginResult,
  PasswordResetResult,
  RegisterPayload,
  RegisterResult,
} from "../auth.types";
import {
  appUrls,
  authErrorMessage,
  getSessionFlag,
  isPendingGithubExternalComplete,
  isSecondFactorStatus,
  isTransferable,
  needsLegalAcceptance,
  newsletterMetadata,
  pendingEmailVerification,
  setSessionFlag,
} from "../auth.utils";
import { ClerkService } from "./clerk.service";
import type { GithubAuthHost } from "./github-auth-host";
import { GithubService } from "./github.service";

@Injectable({ providedIn: "root" })
export class AuthStateService implements GithubAuthHost {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly clerk = inject(ClerkService);
  private readonly github = inject(GithubService);
  private navigatingAfterAuth = false;
  private boundHost = false;
  private boundListener = false;

  private readonly _user = signal<UserResource | null>(null);
  readonly user = this._user.asReadonly();

  readonly signInModalOpen = signal(false);
  readonly signUpModalOpen = signal(false);
  readonly signUpSubtitle = signal<string>(AUTH_MESSAGES.defaultSignUpSubtitle);
  private readonly githubConsent = signal(false);
  readonly githubConsentActive = computed(() => this.githubConsent());
  readonly authInProgress = signal(this.isAuthPending());
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly userId = computed(() => this._user()?.id ?? null);

  readonly userName = computed(() => {
    const user = this._user();
    if (!user) return "";
    return (
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      ""
    );
  });

  readonly userImageUrl = computed(() => this._user()?.imageUrl ?? "");

  constructor() {
    this.ensureHostBound();
  }

  private ensureHostBound(): void {
    if (this.boundHost) {
      return;
    }
    this.github.bindHost(this);
    this.boundHost = true;
  }

  async init(): Promise<void> {
    this.ensureHostBound();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.clerk.init();
    this.syncState();
    if (this.isAuthPending()) {
      const onAuthCallback =
        window.location.pathname.startsWith("/auth/callback");
      if (onAuthCallback) {
        if (this.isAuthenticated() && !this.needsGithubConsent()) {
          this.startAuthPending();
        } else {
          this.clearAuthPending();
        }
      } else if (this.isAuthenticated()) {
        this.startAuthPending();
        void this.navigateAfterAuth();
      } else {
        this.clearAuthPending();
      }
    }
    if (!this.boundListener) {
      this.clerk.addListener(() => {
        this.ngZone.run(() => this.syncState(true));
      });
      this.boundListener = true;
    }
  }

  signIn(): void {
    if (!this.clerk.isReady()) {
      this.toastAuthUnavailable();
      return;
    }
    this.resetGithubConsent();
    this.signUpModalOpen.set(false);
    this.signInModalOpen.set(true);
  }

  closeSignIn(): void {
    this.signInModalOpen.set(false);
    this.github.cancelPendingPopupWait();
  }

  signUp(options?: { subtitle?: string }): void {
    if (!this.clerk.isReady()) {
      this.toastAuthUnavailable();
      return;
    }
    this.signUpSubtitle.set(
      options?.subtitle ?? AUTH_MESSAGES.defaultSignUpSubtitle,
    );
    this.signInModalOpen.set(false);
    this.resetGithubConsent();
    this.signUpModalOpen.set(true);
  }

  closeSignUp(): void {
    this.signUpModalOpen.set(false);
    this.resetGithubConsent();
    this.signUpSubtitle.set(AUTH_MESSAGES.defaultSignUpSubtitle);
    this.github.cancelPendingPopupWait();
    this.github.clearSignInHandoff();
  }

  openGithubConsentSignUp(): void {
    if (!this.clerk.isReady()) {
      this.toastAuthUnavailable();
      return;
    }
    if (this.clerk.user) {
      void this.github.completeSignedInLogin();
      return;
    }
    this.githubConsent.set(true);
    this.clearAuthPending();
    this.navigatingAfterAuth = false;
    this.signInModalOpen.set(false);
    this.signUpModalOpen.set(true);
  }

  isGithubConsentActive(): boolean {
    return this.githubConsent();
  }

  notifyContinueGithubSignUp(): void {
    this.toastService.show({
      title: AUTH_MESSAGES.githubContinueSignUp,
      type: "info",
      duration: 5000,
    });
  }

  syncSession(): void {
    this.syncState();
  }

  isGithubSignInInProgress(): boolean {
    return this.github.isSignInInProgress();
  }

  consumeGithubSignInHandoff(): boolean {
    return this.github.consumeSignInHandoff();
  }

  startAuthPending(): void {
    if (this.githubConsentActive()) {
      return;
    }
    this.authInProgress.set(true);
    if (isPlatformBrowser(this.platformId)) {
      setSessionFlag(AUTH_PENDING_KEY, true);
      this.setAuthOverlayVisible(true);
    }
  }

  clearAuthPending(): void {
    if (isPlatformBrowser(this.platformId)) {
      setSessionFlag(AUTH_PENDING_KEY, false);
    }
    this.authInProgress.set(false);
    this.setAuthOverlayVisible(false);
  }

  isAuthPending(): boolean {
    return getSessionFlag(AUTH_PENDING_KEY);
  }

  async finishAuthRedirect(): Promise<void> {
    this.startAuthPending();
    await this.navigateAfterAuth();
  }

  waitForSignedIn(timeoutMs: number): Promise<boolean> {
    if (this.isAuthenticated()) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const started = Date.now();
      const timer = window.setInterval(() => {
        const user = this.clerk.user;
        if (user) {
          this.setUser(user);
          window.clearInterval(timer);
          resolve(true);
          return;
        }
        if (Date.now() - started >= timeoutMs) {
          window.clearInterval(timer);
          resolve(false);
        }
      }, 150);
    });
  }

  needsGithubConsent(): boolean {
    return this.github.needsConsent();
  }

  getPendingEmailVerification(): string | null {
    return pendingEmailVerification(this.clerk.instance?.client?.signUp);
  }

  async submitLogin(payload: LoginPayload): Promise<LoginResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.signInBrowserOnly,
      };
    }

    const signIn = await this.clerk.requireSignIn();
    if (!signIn) {
      return this.authNotReady();
    }

    try {
      const result = await signIn.create({
        identifier: payload.emailAddress.trim(),
        password: payload.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await this.completeSession(result.createdSessionId);
        return { status: "complete" };
      }

      if (isSecondFactorStatus(result.status)) {
        const prepared = await this.prepareEmailSecondFactor(signIn);
        if (prepared.status === "error") {
          return prepared;
        }
        return { status: "second_factor" };
      }

      this.clearAuthPending();
      return {
        status: "error",
        message: AUTH_MESSAGES.additionalVerification,
      };
    } catch (error) {
      this.clearAuthPending();
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToSignIn),
      };
    }
  }

  async completeLoginSecondFactor(code: string): Promise<LoginResult> {
    const signIn = await this.clerk.requireSignIn();
    if (!signIn) {
      return this.authNotReady();
    }

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: code.trim(),
      });

      if (result.status === "complete" && result.createdSessionId) {
        await this.completeSession(result.createdSessionId);
        return { status: "complete" };
      }

      return {
        status: "error",
        message: AUTH_MESSAGES.unableToVerifyDeviceTrust,
      };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(
          error,
          AUTH_MESSAGES.unableToVerifyDeviceTrust,
        ),
      };
    }
  }

  async resendLoginSecondFactor(): Promise<LoginResult> {
    const signIn = await this.clerk.requireSignIn();
    if (!signIn) {
      return this.authNotReady();
    }

    return this.prepareEmailSecondFactor(signIn);
  }

  async abandonLoginAttempt(): Promise<void> {
    await this.clerk.abandonSignIn();
  }

  private async prepareEmailSecondFactor(
    signIn: NonNullable<Awaited<ReturnType<ClerkService["requireSignIn"]>>>,
  ): Promise<LoginResult> {
    const emailCodeFactor = signIn.supportedSecondFactors?.find(
      (factor) => factor.strategy === "email_code",
    );
    if (
      !emailCodeFactor ||
      !("emailAddressId" in emailCodeFactor) ||
      !emailCodeFactor.emailAddressId
    ) {
      return {
        status: "error",
        message: AUTH_MESSAGES.additionalVerification,
      };
    }

    try {
      await signIn.prepareSecondFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      });
      return { status: "second_factor" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(
          error,
          AUTH_MESSAGES.unableToSendDeviceTrustCode,
        ),
      };
    }
  }

  async startPasswordReset(emailAddress: string): Promise<PasswordResetResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.passwordResetBrowserOnly,
      };
    }

    const signIn = await this.clerk.requireSignIn();
    if (!signIn) {
      return this.authNotReady();
    }

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress.trim(),
      });
      return { status: "code_sent" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToSendResetCode),
      };
    }
  }

  async completePasswordReset(payload: {
    code: string;
    password: string;
  }): Promise<PasswordResetResult> {
    const signIn = await this.clerk.requireSignIn();
    if (!signIn) {
      return this.authNotReady();
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: payload.code.trim(),
        password: payload.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await this.completeSession(result.createdSessionId);
        return { status: "complete" };
      }

      return {
        status: "error",
        message: AUTH_MESSAGES.unableToResetPassword,
      };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToResetPassword),
      };
    }
  }

  async resendPasswordResetCode(): Promise<PasswordResetResult> {
    const signIn = await this.clerk.requireSignIn();
    if (!signIn) {
      return this.authNotReady();
    }

    try {
      const emailFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === "reset_password_email_code",
      );
      if (!emailFactor || !("emailAddressId" in emailFactor)) {
        return {
          status: "error",
          message: AUTH_MESSAGES.unableToResendResetCode,
        };
      }

      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: emailFactor.emailAddressId,
      });
      return { status: "code_sent" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToResendResetCode),
      };
    }
  }

  async signInWithGithub(): Promise<void> {
    await this.github.signIn();
  }

  async submitRegister(payload: RegisterPayload): Promise<RegisterResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.registrationBrowserOnly,
      };
    }

    const signUp = await this.clerk.requireSignUp();
    if (!signUp) {
      return this.authNotReady();
    }

    const email = payload.emailAddress.trim();
    const pendingEmail = pendingEmailVerification(signUp);
    if (pendingEmail && pendingEmail.toLowerCase() === email.toLowerCase()) {
      return { status: "verify" };
    }

    try {
      const result = await signUp.create({
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        emailAddress: email,
        password: payload.password,
        legalAccepted: payload.legalAccepted,
        unsafeMetadata: newsletterMetadata(payload.newsletterOptIn),
      });

      if (result.status === "complete" && result.createdSessionId) {
        await this.completeSession(result.createdSessionId);
        return { status: "complete" };
      }

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      return { status: "verify" };
    } catch (error) {
      const stillPending = pendingEmailVerification(
        this.clerk.instance?.client?.signUp,
      );
      if (stillPending) {
        return { status: "verify" };
      }
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToCreateAccount),
      };
    }
  }

  async verifyRegister(code: string): Promise<RegisterResult> {
    const signUp = await this.clerk.requireSignUp();
    if (!signUp) {
      return this.authNotReady();
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status !== "complete" || !result.createdSessionId) {
        return {
          status: "error",
          message: AUTH_MESSAGES.unableToVerifyEmail,
        };
      }

      await this.completeSession(result.createdSessionId);
      return { status: "complete" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToVerifyEmail),
      };
    }
  }

  async resendRegisterCode(): Promise<RegisterResult> {
    const signUp = await this.clerk.requireSignUp();
    if (!signUp) {
      return this.authNotReady();
    }

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      return { status: "verify" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(
          error,
          AUTH_MESSAGES.unableToResendVerification,
        ),
      };
    }
  }

  async submitGithubConsent(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<RegisterResult> {
    if (this.githubConsentActive()) {
      const result = await this.github.completePendingSignUp(
        newsletterOptIn,
        legalAccepted,
      );
      if (result.status !== "error") {
        this.closeSignUp();
      }
      return result;
    }

    try {
      await this.clerk.reloadClient();
      const signUp = await this.clerk.requireSignUp();

      if (isTransferable(signUp)) {
        const result = await this.github.completePendingSignUp(
          newsletterOptIn,
          true,
        );
        if (result.status !== "error") {
          this.closeSignUp();
        }
        return result;
      }

      if (isPendingGithubExternalComplete(signUp)) {
        if (needsLegalAcceptance(signUp)) {
          this.openGithubConsentSignUp();
          return { status: "complete" };
        }
        const result = await this.github.completePendingSignUp(
          newsletterOptIn,
          true,
        );
        if (result.status !== "error") {
          this.closeSignUp();
        }
        return result;
      }

      await this.github.signUp(newsletterOptIn, legalAccepted);
      if (this.isAuthenticated()) {
        this.closeSignUp();
        return { status: "complete" };
      }
      if (this.githubConsentActive() || this.needsGithubConsent()) {
        return { status: "complete" };
      }
      return {
        status: "error",
        message: AUTH_MESSAGES.unableToContinueGithub,
      };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToContinueGithub),
      };
    }
  }

  async handleRedirectCallback(options?: {
    transferable?: boolean;
  }): Promise<void> {
    await this.init();
    const urls = appUrls();
    const params = new URLSearchParams(window.location.search);
    const transferable =
      options?.transferable ?? params.get("intent") !== "signIn";
    const restoreNavigation = this.github.suppressHostedNavigation();
    try {
      await this.clerk.handleRedirectCallback({
        transferable,
        origin: urls.origin,
      });
      await this.clerk.reloadClient();
    } finally {
      restoreNavigation();
    }
    this.syncState();
  }

  resolveGithubCallbackOutcome(): GithubCallbackOutcome {
    if (this.clerk.user) {
      this.setUser(this.clerk.user);
      return "authenticated";
    }

    if (this.needsGithubConsent()) {
      return "consent";
    }

    if (this.isAuthenticated()) {
      return "authenticated";
    }

    return "error";
  }

  async signOut(): Promise<void> {
    this.closeSignIn();
    this.closeSignUp();
    try {
      await this.clerk.signOut();
    } finally {
      this.clearAuthPending();
      this.navigatingAfterAuth = false;
      this.setUser(null);
      await this.router.navigateByUrl("/", { replaceUrl: true });
    }
  }

  openUserProfile(): void {
    this.clerk.openUserProfile();
  }

  async getToken(template?: string): Promise<string | null> {
    return this.clerk.getToken(template);
  }

  setUser(user: UserResource | null): void {
    this._user.set(user);
  }

  resetGithubConsent(): void {
    this.githubConsent.set(false);
  }

  syncState(fromListener = false): void {
    const previousUser = this._user();
    const user = this.clerk.user;

    if (this.github.isSignInInProgress()) {
      return;
    }

    if (this.githubConsentActive()) {
      if (user) {
        this.setUser(user);
        void this.github.completeSignedInLogin();
      } else {
        this.clearAuthPending();
      }
      return;
    }

    if (
      !user &&
      previousUser &&
      (this.clerk.session ||
        this.authInProgress() ||
        this.isAuthPending() ||
        this.navigatingAfterAuth)
    ) {
      return;
    }

    this.setUser(user);

    if (!isPlatformBrowser(this.platformId) || !user) {
      return;
    }

    if (this.signInModalOpen() || this.signUpModalOpen()) {
      void this.github.completeSignedInLogin();
      return;
    }

    const path = window.location.pathname;
    if (path.startsWith("/auth/callback")) {
      return;
    }

    if (path.startsWith("/bookmarks")) {
      return;
    }

    if (this.navigatingAfterAuth) {
      return;
    }

    if (this.needsGithubConsent()) {
      this.openGithubConsentSignUp();
      return;
    }

    if (this.isAuthPending() || this.authInProgress()) {
      void this.navigateAfterAuth();
      return;
    }

    if (fromListener && !previousUser) {
      void this.navigateAfterAuth();
    }
  }

  async navigateAfterAuth(): Promise<void> {
    if (this.navigatingAfterAuth || this.github.isSignInInProgress()) {
      return;
    }

    if (
      this.isAuthenticated() &&
      window.location.pathname.startsWith("/bookmarks")
    ) {
      this.clearAuthPending();
      return;
    }

    if (
      !this.isAuthenticated() &&
      (this.githubConsentActive() || this.needsGithubConsent())
    ) {
      this.openGithubConsentSignUp();
      return;
    }

    this.navigatingAfterAuth = true;
    this.startAuthPending();
    this.closeSignIn();
    this.closeSignUp();

    try {
      if (!this.isAuthenticated()) {
        await this.waitForSignedIn(20000);
      }
      if (!this.isAuthenticated()) {
        if (this.needsGithubConsent()) {
          this.openGithubConsentSignUp();
        }
        return;
      }
      await this.router.navigateByUrl("/bookmarks", { replaceUrl: true });
      this.clearAuthPending();
    } finally {
      this.navigatingAfterAuth = false;
    }
  }

  async completeSession(sessionId: string): Promise<void> {
    this.startAuthPending();
    this.closeSignIn();
    this.closeSignUp();
    await this.clerk.setActive(sessionId);
    this.syncState();
    await this.navigateAfterAuth();
  }

  private setAuthOverlayVisible(enabled: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document.documentElement.classList.toggle(AUTH_OVERLAY_CLASS, enabled);
    document
      .getElementById(AUTH_OVERLAY_ID)
      ?.setAttribute("aria-hidden", enabled ? "false" : "true");
  }

  private authNotReady(): { status: "error"; message: string } {
    return { status: "error", message: AUTH_MESSAGES.authNotReady };
  }

  private toastAuthUnavailable(): void {
    this.toastService.show({
      title: AUTH_MESSAGES.authUnavailable,
      type: "error",
      duration: 5000,
    });
  }
}
