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
  AUTH_MESSAGES,
  AUTH_OVERLAY_CLASS,
  AUTH_OVERLAY_ID,
  AUTH_PENDING_KEY,
  AUTH_RETURN_URL_KEY,
} from "../auth.constants";
import type {
  GithubCallbackOutcome,
  LoginPayload,
  LoginResult,
  PasswordResetResult,
  RegisterConsentPayload,
  RegisterDetailsPayload,
  RegisterResult,
} from "../auth.types";
import {
  appUrls,
  authErrorMessage,
  canResumeEmailVerification,
  clerkAuthError,
  getSessionFlag,
  isPendingGithubExternalComplete,
  isSecondFactorStatus,
  isTransferable,
  needsLegalAcceptance,
  newsletterMetadata,
  pendingEmailVerification,
  setSessionFlag,
  signUpMissingPassword,
} from "../auth.utils";
import { ClerkService } from "./clerk.service";
import type { GithubAuthHost } from "./github-auth-host";
import { GithubService } from "./github.service";

@Injectable({ providedIn: "root" })
export class AuthStateService implements GithubAuthHost {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly analytics = inject(AnalyticsService);
  private readonly clerk = inject(ClerkService);
  private readonly github = inject(GithubService);
  private navigatingAfterAuth = false;
  private boundHost = false;
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
    } else if (
      !window.location.pathname.startsWith("/auth/callback") &&
      this.shouldResumeGithubConsent()
    ) {
      this.openGithubConsentSignUp();
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
    this.rememberReturnUrl();
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
    this.rememberReturnUrl();
    this.signUpSubtitle.set(
      options?.subtitle ?? AUTH_MESSAGES.defaultSignUpSubtitle,
    );
    this.signInModalOpen.set(false);

    if (this.shouldResumeGithubConsent()) {
      this.openGithubConsentSignUp();
      return;
    }

    if (
      this.needsGithubConsent() ||
      this.githubConsentActive() ||
      this.github.hasSignUpHandoff()
    ) {
      this.github.abandonIncompleteSignUp();
    }
    this.resetGithubConsent();
    this.github.clearSignUpHandoff();
    this.signUpModalOpen.set(true);
  }

  closeSignUp(): void {
    this.signUpModalOpen.set(false);
    this.resetGithubConsent();
    this.signUpSubtitle.set(AUTH_MESSAGES.defaultSignUpSubtitle);
    this.github.cancelPendingPopupWait();
    this.github.clearSignInHandoff();
    this.github.clearSignUpHandoff();
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
    }
    this.setAuthOverlayVisible(true);
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

  clearGithubSignUpHandoff(): void {
    this.github.clearSignUpHandoff();
  }

  async leaveAuthCallback(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!window.location.pathname.startsWith("/auth/callback")) {
      return;
    }
    await this.router.navigateByUrl(this.consumeReturnUrl(), {
      replaceUrl: true,
    });
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

  private shouldResumeGithubConsent(): boolean {
    return (
      !this.clerk.user &&
      this.github.hasSignUpHandoff() &&
      this.needsGithubConsent()
    );
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

  async startRegister(
    payload: RegisterDetailsPayload,
  ): Promise<RegisterResult> {
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
    const signUp = await this.clerk.requireSignUp();
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
    const signUp = await this.clerk.requireSignUp();
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
        await this.completeSession(result.createdSessionId);
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
    const signUp = await this.clerk.requireSignUp();
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
      const signIn = await this.clerk.requireSignIn();

      if (isTransferable(signUp)) {
        const result = await this.github.completePendingSignUp(
          newsletterOptIn,
          false,
        );
        if (result.status !== "error") {
          this.closeSignUp();
        }
        return result;
      }

      if (isTransferable(signIn)) {
        this.openGithubConsentSignUp();
        return { status: "complete" };
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
      return { status: "complete" };
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
    await this.clerk.handleRedirectCallback({
      transferable,
      origin: urls.origin,
    });
    await this.clerk.reloadClient();
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
    }
  }

  openUserProfile(): void {
    this.clerk.openUserProfile();
  }

  async getToken(template?: string): Promise<string | null> {
    return this.clerk.getToken(template);
  }

  setUser(user: UserResource | null): void {
    const previousUser = this._user();
    this._user.set(user);

    if (user) {
      this.github.clearSignUpHandoff();
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
    this.leaveBookmarks();
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

  private leaveBookmarks(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!window.location.pathname.startsWith("/bookmarks")) {
      return;
    }
    void this.router.navigateByUrl("/");
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

    if (this.navigatingAfterAuth) {
      return;
    }

    if (this.shouldResumeGithubConsent()) {
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
      !this.isAuthenticated() &&
      (this.githubConsentActive() || this.shouldResumeGithubConsent())
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
        if (this.shouldResumeGithubConsent()) {
          this.openGithubConsentSignUp();
        }
        return;
      }
      if (window.location.pathname.startsWith("/auth/callback")) {
        await this.router.navigateByUrl(this.consumeReturnUrl(), {
          replaceUrl: true,
        });
      } else {
        this.clearReturnUrl();
      }
      this.clearAuthPending();
    } finally {
      this.navigatingAfterAuth = false;
    }
  }

  async completeSession(sessionId: string): Promise<void> {
    const eventName =
      this.signUpModalOpen() || this.githubConsentActive()
        ? "auth register"
        : "auth login";
    const registering = eventName === "auth register";
    if (registering) {
      this.resetGithubConsent();
    } else {
      this.startAuthPending();
      this.closeSignIn();
      this.closeSignUp();
    }
    await this.clerk.setActive(sessionId);
    this.syncState();
    this.analytics.trackEvent(eventName, {});
    if (registering) {
      this.closeSignUp();
      this.clearAuthPending();
      this.clearReturnUrl();
      return;
    }
    await this.navigateAfterAuth();
  }

  private setAuthOverlayVisible(enabled: boolean): void {
    this.document.documentElement.classList.toggle(AUTH_OVERLAY_CLASS, enabled);
    this.document
      .getElementById(AUTH_OVERLAY_ID)
      ?.setAttribute("aria-hidden", enabled ? "false" : "true");
  }

  private rememberReturnUrl(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (path.startsWith("/auth/callback")) {
      return;
    }
    try {
      sessionStorage.setItem(AUTH_RETURN_URL_KEY, path);
    } catch {
      return;
    }
  }

  private clearReturnUrl(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      sessionStorage.removeItem(AUTH_RETURN_URL_KEY);
    } catch {
      return;
    }
  }

  private consumeReturnUrl(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return "/";
    }
    try {
      const value = sessionStorage.getItem(AUTH_RETURN_URL_KEY);
      sessionStorage.removeItem(AUTH_RETURN_URL_KEY);
      if (value?.startsWith("/") && !value.startsWith("//")) {
        return value;
      }
    } catch {
      return "/";
    }
    return "/";
  }

  private async resolveRegisterProgress(
    result: SignUpResource,
    prepareEmail: boolean,
  ): Promise<RegisterResult> {
    if (result.status === "complete" && result.createdSessionId) {
      await this.completeSession(result.createdSessionId);
      return { status: "complete" };
    }

    if (signUpMissingPassword(result)) {
      return this.missingPasswordError();
    }

    if (!prepareEmail || needsLegalAcceptance(result)) {
      return { status: "consent" };
    }

    if (pendingEmailVerification(result)) {
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
