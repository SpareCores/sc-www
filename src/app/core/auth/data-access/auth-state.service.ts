import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  Injectable,
  NgZone,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import type { SignUpResource, UserResource } from "@clerk/shared/types";
import { AnalyticsService } from "../../../services/analytics.service";
import { ToastService } from "../../../services/toast.service";
import {
  GUEST_DATABASE_COMPARE_LIMIT_TOAST_ID,
  GUEST_SERVER_COMPARE_LIMIT_TOAST_ID,
} from "../../../services/toast-ids";
import {
  AUTH_MESSAGES,
  AUTH_OVERLAY_CLASS,
  AUTH_OVERLAY_ID,
} from "../auth.constants";
import type {
  AuthKind,
  GitHubCallbackResult,
  GitHubIntent,
  LoginPayload,
  LoginResult,
  PasswordResetResult,
  RegisterConsentPayload,
  RegisterDetailsPayload,
  RegisterResult,
} from "../auth.types";
import {
  authErrorMessage,
  authUrls,
  canResumeEmailVerification,
  clerkAuthError,
  getPendingEmailVerification,
  isSecondFactorStatus,
  needsLegalAcceptance,
  newsletterMetadata,
  signUpMissingPassword,
} from "../auth.utils";
import { AuthFlowStore } from "./auth-flow-store.service";
import { ClerkService } from "./clerk.service";
import { GitHubService, type GitHubSignUpOutcome } from "./github.service";

@Injectable({ providedIn: "root" })
export class AuthStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly analytics = inject(AnalyticsService);
  private readonly clerk = inject(ClerkService);
  private readonly github = inject(GitHubService);
  private readonly flow = inject(AuthFlowStore);
  private activating = false;
  private finalizePromise: Promise<void> | null = null;
  private gitHubCallbackPromise: Promise<GitHubCallbackResult> | null = null;
  private boundListener = false;
  private accountDeleted = false;
  private signedOutIdentityCleared = false;

  private readonly _user = signal<UserResource | null>(null);
  readonly user = this._user.asReadonly();

  readonly signInModalOpen = signal(false);
  readonly signUpModalOpen = signal(false);
  readonly signUpSubtitle = signal<string>(AUTH_MESSAGES.defaultSignUpSubtitle);
  private readonly githubConsent = signal(false);
  readonly githubConsentActive = computed(() => this.githubConsent());
  readonly authInProgress = this.flow.pending;
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

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.clerk.init();
    this.syncUserFromClerk();
    this.bindClerkListener();
    this.setAuthOverlayVisible(this.authInProgress());
    if (this.finalizePromise || this.isAuthCallbackRoute()) {
      return;
    }
    if (this.shouldResumeGitHubConsent()) {
      this.clearAuthPending();
      return;
    }
    if (this.authInProgress()) {
      this.flow.clear();
      this.setAuthOverlayVisible(false);
    }
  }

  signIn(): void {
    if (!this.clerk.isLoaded()) {
      this.toastAuthUnavailable();
      return;
    }
    this.setCurrentReturnUrl();
    this.githubConsent.set(false);
    this.signUpModalOpen.set(false);
    this.signInModalOpen.set(true);
  }

  closeSignIn(): void {
    this.signInModalOpen.set(false);
    this.flow.clearReturnUrl();
  }

  signUp(options?: { subtitle?: string }): void {
    if (!this.clerk.isLoaded()) {
      this.toastAuthUnavailable();
      return;
    }
    this.setCurrentReturnUrl();
    this.signUpSubtitle.set(
      options?.subtitle ?? AUTH_MESSAGES.defaultSignUpSubtitle,
    );
    this.signInModalOpen.set(false);

    if (this.shouldResumeGitHubConsent()) {
      this.openGitHubConsent();
      return;
    }

    if (this.github.needsConsent() || this.flow.githubIntent() === "signUp") {
      this.github.resetSignUpState();
    }
    this.githubConsent.set(false);
    this.flow.setGitHubIntent(null);
    this.signUpModalOpen.set(true);
  }

  closeSignUp(): void {
    this.signUpModalOpen.set(false);
    this.githubConsent.set(false);
    this.signUpSubtitle.set(AUTH_MESSAGES.defaultSignUpSubtitle);
    this.flow.setGitHubIntent(null);
    this.flow.clearReturnUrl();
  }

  cancelSignUp(): void {
    this.github.resetSignUpState();
    this.closeSignUp();
  }

  private syncUserFromClerk(): void {
    const previousUser = this._user();
    const user = this.clerk.user;

    if (
      !user &&
      previousUser &&
      (this.clerk.session ||
        this.authInProgress() ||
        this.activating ||
        !!this.finalizePromise)
    ) {
      return;
    }

    this.setUser(user);
  }

  startAuthPending(): void {
    if (this.githubConsent()) {
      return;
    }
    this.flow.setPending(true);
    if (this.signUpModalOpen() || this.signInModalOpen()) {
      this.setAuthOverlayVisible(false);
      return;
    }
    this.setAuthOverlayVisible(true);
  }

  private clearAuthPending(): void {
    this.flow.setPending(false);
    this.setAuthOverlayVisible(false);
  }

  async handleGitHubCallback(): Promise<GitHubCallbackResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.signInBrowserOnly,
      };
    }

    if (!this.gitHubCallbackPromise) {
      this.gitHubCallbackPromise = this.processGitHubCallback().finally(() => {
        this.gitHubCallbackPromise = null;
      });
    }
    return this.gitHubCallbackPromise;
  }

  private async processGitHubCallback(): Promise<GitHubCallbackResult> {
    await this.init();
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      if (oauthError.toLowerCase().includes("access_denied")) {
        const message = AUTH_MESSAGES.githubAuthorizationDenied;
        await this.failGitHubCallback(message);
        return { status: "cancelled" };
      }
      const message =
        params.get("error_description")?.trim() ||
        AUTH_MESSAGES.unableToContinueGitHub;
      await this.failGitHubCallback(message);
      return { status: "error", message };
    }

    const intent = this.resolveGitHubIntent();
    if (!intent) {
      const message = AUTH_MESSAGES.unableToContinueGitHub;
      await this.failGitHubCallback(message);
      return { status: "error", message };
    }

    const returnUrl = this.flow.peekReturnUrl();
    const afterAuthUrl = returnUrl
      ? new URL(returnUrl, authUrls().origin).href
      : undefined;

    let callbackError: unknown;
    try {
      await this.clerk.handleRedirectCallback({
        transferable: intent !== "signIn",
        origin: authUrls().origin,
        afterAuthUrl,
      });
    } catch (error) {
      callbackError = error;
    }

    await this.clerk.syncClerkState();
    this.syncUserFromClerk();

    if (this.isAuthenticated()) {
      await this.finalizeAuthFlow(
        intent === "signUp" ? "registration" : "login",
      );
      return { status: "authenticated" };
    }

    if (this.github.needsConsent()) {
      await this.completeGitHubConsent();
      return { status: "needs_consent" };
    }

    if (!callbackError) {
      const message = AUTH_MESSAGES.githubAuthorizationDenied;
      await this.failGitHubCallback(message);
      return { status: "cancelled" };
    }

    const message = authErrorMessage(
      callbackError,
      AUTH_MESSAGES.unableToContinueGitHub,
    );
    await this.failGitHubCallback(message);
    return {
      status: "error",
      message,
    };
  }

  async submitLogin(payload: LoginPayload): Promise<LoginResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.signInBrowserOnly,
      };
    }

    const signIn = await this.clerk.getSignInResource();
    if (!signIn) {
      return this.authNotReady();
    }

    try {
      const result = await signIn.create({
        identifier: payload.emailAddress.trim(),
        password: payload.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await this.activateSession(result.createdSessionId, "login");
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
    const signIn = await this.clerk.getSignInResource();
    if (!signIn) {
      return this.authNotReady();
    }

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: code.trim(),
      });

      if (result.status === "complete" && result.createdSessionId) {
        await this.activateSession(result.createdSessionId, "login");
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
    const signIn = await this.clerk.getSignInResource();
    if (!signIn) {
      return this.authNotReady();
    }

    return this.prepareEmailSecondFactor(signIn);
  }

  async abandonLoginAttempt(): Promise<void> {
    await this.clerk.resetSignInState();
  }

  async startPasswordReset(emailAddress: string): Promise<PasswordResetResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.passwordResetBrowserOnly,
      };
    }

    const signIn = await this.clerk.getSignInResource();
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
    const signIn = await this.clerk.getSignInResource();
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
        await this.activateSession(result.createdSessionId, "login");
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
    const signIn = await this.clerk.getSignInResource();
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

  async signInWithGitHub(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.setCurrentReturnUrl();
    this.githubConsent.set(false);
    this.flow.setGitHubIntent("signIn");
    this.startAuthPending();
    const result = await this.github.startSignIn();
    if (result.status === "error") {
      this.flow.setGitHubIntent(null);
      this.clearAuthPending();
      throw new Error(result.message);
    }
  }

  async startRegister(
    payload: RegisterDetailsPayload,
  ): Promise<RegisterResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: AUTH_MESSAGES.registrationBrowserOnly,
      };
    }

    const signUp = await this.clerk.getSignUpResource();
    if (!signUp) {
      return this.authNotReady();
    }

    const email = payload.emailAddress.trim();
    if (canResumeEmailVerification(signUp, email)) {
      return { status: "verify" };
    }

    const details = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      emailAddress: email,
      password: payload.password,
    };

    const resumable =
      !!signUp.id && !signUp.verifications?.externalAccount?.status;

    try {
      const result = resumable
        ? await signUp.update(details)
        : await signUp.create(details);

      return this.resolveRegisterProgress(result, false);
    } catch (error) {
      return this.registerClerkError(
        error,
        AUTH_MESSAGES.unableToCreateAccount,
      );
    }
  }

  async completeRegister(
    payload: RegisterConsentPayload,
  ): Promise<RegisterResult> {
    const signUp = await this.clerk.getSignUpResource();
    if (!signUp) {
      return this.authNotReady();
    }

    try {
      const result = await signUp.update({
        legalAccepted: payload.legalAccepted,
        unsafeMetadata: newsletterMetadata(payload.newsletterOptIn),
      });

      return this.resolveRegisterProgress(result, true);
    } catch (error) {
      return this.registerClerkError(
        error,
        AUTH_MESSAGES.unableToCreateAccount,
      );
    }
  }

  async verifyRegister(code: string): Promise<RegisterResult> {
    const signUp = await this.clerk.getSignUpResource();
    if (!signUp) {
      return this.authNotReady();
    }

    if (signUpMissingPassword(signUp)) {
      return this.missingPasswordError();
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status === "complete" && result.createdSessionId) {
        await this.activateSession(result.createdSessionId, "registration");
        return { status: "complete" };
      }

      if (signUpMissingPassword(result)) {
        return this.missingPasswordError();
      }

      return {
        status: "error",
        message: AUTH_MESSAGES.unableToVerifyEmail,
      };
    } catch (error) {
      return this.registerClerkError(error, AUTH_MESSAGES.unableToVerifyEmail);
    }
  }

  async resendRegisterCode(): Promise<RegisterResult> {
    const signUp = await this.clerk.getSignUpResource();
    if (!signUp) {
      return this.authNotReady();
    }

    if (signUpMissingPassword(signUp)) {
      return this.missingPasswordError();
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

  async submitGitHubConsent(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<RegisterResult> {
    this.setCurrentReturnUrl();
    this.flow.setGitHubIntent("signUp");
    this.startAuthPending();
    const result = this.githubConsent()
      ? await this.github.submitConsentAndComplete(
          newsletterOptIn,
          legalAccepted,
        )
      : await this.github.continueSignUp(newsletterOptIn, legalAccepted);
    return this.applyGitHubOutcome(result);
  }

  async signOut(): Promise<void> {
    this.closeSignIn();
    this.closeSignUp();
    try {
      await this.clerk.signOut();
    } finally {
      this.flow.clear();
      this.setAuthOverlayVisible(false);
      this.activating = false;
      this.finalizePromise = null;
      this.gitHubCallbackPromise = null;
      this.setUser(null);
    }
  }

  openUserProfile(): void {
    this.clerk.openUserProfileModal();
  }

  async getToken(template?: string): Promise<string | null> {
    return this.clerk.getToken(template);
  }

  private setUser(user: UserResource | null): void {
    const previousUser = this._user();
    this._user.set(user);

    if (user) {
      this.watchAccountDeletion(user);
      this.identifyAnalyticsUser(user);
      return;
    }

    const accountDeleted = this.accountDeleted;
    this.accountDeleted = false;

    if (!previousUser) {
      if (
        isPlatformBrowser(this.platformId) &&
        !this.signedOutIdentityCleared
      ) {
        this.signedOutIdentityCleared = true;
        this.analytics.reset();
      }
      return;
    }

    if (accountDeleted) {
      this.analytics.identify(previousUser.id);
      this.analytics.trackEvent("auth account deleted", {});
    }
    this.analytics.reset();
    this.redirectFromBookmarks();
  }

  private async applyGitHubOutcome(
    result: GitHubSignUpOutcome,
  ): Promise<RegisterResult> {
    if (result.status === "error") {
      this.flow.setGitHubIntent(null);
      this.githubConsent.set(false);
      this.clearAuthPending();
      return result;
    }

    if (result.status === "needs_consent") {
      this.openGitHubConsent();
      return { status: "consent" };
    }

    if (result.status === "redirecting") {
      return { status: "complete" };
    }

    await this.activateSession(result.sessionId, result.kind);
    return { status: "complete" };
  }

  private async activateSession(
    sessionId: string,
    kind: AuthKind,
  ): Promise<void> {
    this.activating = true;
    try {
      if (kind === "login") {
        this.startAuthPending();
      } else {
        this.githubConsent.set(false);
      }
      await this.clerk.setActive(sessionId);
      await this.clerk.syncClerkState();
      this.syncUserFromClerk();
      await this.finalizeAuthFlow(kind);
    } catch (error) {
      this.clearAuthPending();
      throw error;
    } finally {
      this.activating = false;
    }
  }

  private finalizeAuthFlow(kind: AuthKind): Promise<void> {
    if (!this.finalizePromise) {
      this.finalizePromise = this.runFinalize(kind).finally(() => {
        this.finalizePromise = null;
      });
    }
    return this.finalizePromise;
  }

  private async runFinalize(kind: AuthKind): Promise<void> {
    if (!this.isAuthenticated()) {
      this.clearAuthPending();
      return;
    }

    this.analytics.trackEvent(
      kind === "registration" ? "auth register" : "auth login",
      {},
    );
    this.toastService.removeToast(GUEST_SERVER_COMPARE_LIMIT_TOAST_ID);
    this.toastService.removeToast(GUEST_DATABASE_COMPARE_LIMIT_TOAST_ID);
    const returnUrl = this.isAuthCallbackRoute()
      ? this.flow.consumeReturnUrl()
      : null;
    this.closeSignIn();
    this.closeSignUp();
    this.clearAuthPending();
    if (returnUrl) {
      await this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      return;
    }
    this.flow.clearReturnUrl();
  }

  private async completeGitHubConsent(): Promise<void> {
    const returnUrl = this.flow.consumeReturnUrl();
    this.flow.setGitHubIntent("signUp");
    this.clearAuthPending();
    await this.router.navigateByUrl(returnUrl, { replaceUrl: true });
    this.openGitHubConsent();
  }

  private async failGitHubCallback(message?: string): Promise<void> {
    this.github.resetSignUpState();
    const returnUrl = this.flow.consumeReturnUrl();
    this.closeSignIn();
    this.closeSignUp();
    this.flow.clear();
    this.setAuthOverlayVisible(false);
    await this.router.navigateByUrl(returnUrl, { replaceUrl: true });
    if (message) {
      this.toastService.show({
        title: message,
        type: "error",
      });
    }
  }

  private openGitHubConsent(): void {
    if (!this.clerk.isLoaded()) {
      this.toastAuthUnavailable();
      return;
    }
    this.flow.setGitHubIntent("signUp");
    this.githubConsent.set(true);
    this.clearAuthPending();
    this.signInModalOpen.set(false);
    this.signUpModalOpen.set(true);
  }

  private shouldResumeGitHubConsent(): boolean {
    return (
      !this.clerk.user &&
      this.flow.githubIntent() === "signUp" &&
      this.github.needsConsent()
    );
  }

  private resolveGitHubIntent(): GitHubIntent | null {
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent === "signIn" || intent === "signUp") {
      return intent;
    }
    return this.flow.githubIntent();
  }

  private isAuthCallbackRoute(): boolean {
    return (
      isPlatformBrowser(this.platformId) &&
      window.location.pathname.startsWith("/auth/callback")
    );
  }

  private setCurrentReturnUrl(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.flow.setReturnUrl(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
  }

  private bindClerkListener(): void {
    if (this.boundListener) {
      return;
    }
    this.clerk.addListener(() => {
      this.ngZone.run(() => this.syncUserFromClerk());
    });
    this.boundListener = true;
  }

  private async prepareEmailSecondFactor(
    signIn: NonNullable<Awaited<ReturnType<ClerkService["getSignInResource"]>>>,
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

  private watchAccountDeletion(user: UserResource): void {
    const target = user as UserResource & { __scDeleteWrapped?: boolean };
    if (target.__scDeleteWrapped || typeof user.delete !== "function") {
      return;
    }

    const originalDelete = user.delete.bind(user);
    user.delete = async () => {
      this.accountDeleted = true;
      try {
        await originalDelete();
      } catch (error) {
        this.accountDeleted = false;
        throw error;
      }
    };
    target.__scDeleteWrapped = true;
  }

  private redirectFromBookmarks(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!window.location.pathname.startsWith("/bookmarks")) {
      return;
    }
    void this.router.navigateByUrl("/");
  }

  private setAuthOverlayVisible(enabled: boolean): void {
    this.document.documentElement.classList.toggle(AUTH_OVERLAY_CLASS, enabled);
    this.document
      .getElementById(AUTH_OVERLAY_ID)
      ?.setAttribute("aria-hidden", enabled ? "false" : "true");
  }

  private async resolveRegisterProgress(
    result: SignUpResource,
    prepareEmail: boolean,
  ): Promise<RegisterResult> {
    if (result.status === "complete" && result.createdSessionId) {
      await this.activateSession(result.createdSessionId, "registration");
      return { status: "complete" };
    }

    if (signUpMissingPassword(result)) {
      return this.missingPasswordError();
    }

    if (!prepareEmail || needsLegalAcceptance(result)) {
      return { status: "consent" };
    }

    if (getPendingEmailVerification(result)) {
      await result.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      return { status: "verify" };
    }

    return {
      status: "error",
      message: AUTH_MESSAGES.unableToCreateAccount,
    };
  }

  private registerClerkError(error: unknown, fallback: string): RegisterResult {
    const parsed = clerkAuthError(error, fallback);
    return {
      status: "error",
      message: parsed.message,
      param: parsed.paramName,
    };
  }

  private missingPasswordError(): RegisterResult {
    return {
      status: "error",
      message: AUTH_MESSAGES.unableToCreateAccount,
      param: "password",
    };
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

  private identifyAnalyticsUser(user: UserResource | null): void {
    if (!user) {
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress;
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      undefined;

    this.analytics.identify(user.id, {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    });
  }
}
