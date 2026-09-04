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
import { Clerk } from "@clerk/clerk-js";
import type { SignUpResource, UserResource } from "@clerk/shared/types";
import { ui } from "@clerk/ui/no-rhc";
import { CLERK_APPEARANCE, CLERK_TEXTS } from "./clerk-configuration";
import { ToastService } from "../toast.service";

const CLERK_PUBLISHABLE_KEY =
  import.meta.env.NG_APP_CLERK_PUBLISHABLE_KEY || "";
const WWW_API_BASE_URI =
  import.meta.env.NG_APP_WWW_API_BASE_URI?.replace(/\/$/, "") || "";
const NEWSLETTER_OPT_IN_KEY = "newsletterOptIn";
const NEWSLETTER_SUBSCRIBED_KEY = "newsletterSubscribed";

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  legalAccepted: boolean;
  newsletterOptIn: boolean;
};

export type RegisterResult =
  | { status: "complete" }
  | { status: "verify" }
  | { status: "error"; message: string };

@Injectable({ providedIn: "root" })
export class Auth {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private clerk: Clerk | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly newsletterSyncUsers = new Set<string>();

  private readonly _user = signal<UserResource | null>(null);

  readonly signUpModalOpen = signal(false);
  readonly isAuthenticated = computed(() => this._user() !== null);

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

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initializeClerk();
    return this.initPromise;
  }

  signIn(): void {
    this.clerk?.openSignIn({ withSignUp: false });
  }

  signUp(): void {
    this.signUpModalOpen.set(true);
  }

  closeSignUp(): void {
    this.signUpModalOpen.set(false);
  }

  async submitRegister(payload: RegisterPayload): Promise<RegisterResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        status: "error",
        message: "Registration is only available in the browser.",
      };
    }

    const signUp = await this.requireSignUp();
    if (!signUp) {
      return { status: "error", message: "Authentication is not ready yet." };
    }

    try {
      const result = await signUp.create({
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        emailAddress: payload.emailAddress.trim(),
        password: payload.password,
        legalAccepted: payload.legalAccepted,
        unsafeMetadata: this.newsletterMetadata(payload.newsletterOptIn),
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
      return {
        status: "error",
        message: this.authErrorMessage(error, "Unable to create your account."),
      };
    }
  }

  async verifyRegister(code: string): Promise<RegisterResult> {
    const signUp = await this.requireSignUp();
    if (!signUp) {
      return { status: "error", message: "Authentication is not ready yet." };
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status !== "complete" || !result.createdSessionId) {
        return {
          status: "error",
          message: "Unable to verify your email address.",
        };
      }

      await this.completeSession(result.createdSessionId);
      return { status: "complete" };
    } catch (error) {
      return {
        status: "error",
        message: this.authErrorMessage(
          error,
          "Unable to verify your email address.",
        ),
      };
    }
  }

  async resendRegisterCode(): Promise<RegisterResult> {
    const signUp = await this.requireSignUp();
    if (!signUp) {
      return { status: "error", message: "Authentication is not ready yet." };
    }

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      return { status: "verify" };
    } catch (error) {
      return {
        status: "error",
        message: this.authErrorMessage(
          error,
          "Unable to resend the verification code.",
        ),
      };
    }
  }

  async signUpWithGithub(
    newsletterOptIn: boolean,
    legalAccepted: boolean,
  ): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const width = window.screen.availWidth;
    const height = window.screen.availHeight;
    const popup = window.open(
      "about:blank",
      "scGithubSignUp",
      `popup=yes,width=${width},height=${height},left=0,top=0,noopener=no`,
    );
    if (!popup) {
      throw new Error("Enable popups to continue with GitHub.");
    }

    popup.focus();
    try {
      popup.moveTo(0, 0);
      popup.resizeTo(width, height);
    } catch {
      console.error("Failed to resize the popup. :(");
    }

    try {
      const signUp = await this.requireSignUp();
      if (!signUp) {
        throw new Error("Authentication is not ready yet.");
      }

      popup.focus();
      const urls = this.appUrls();
      await signUp.authenticateWithPopup({
        strategy: "oauth_github",
        redirectUrl: urls.authCallback,
        redirectUrlComplete: urls.bookmarks,
        popup,
        legalAccepted,
        unsafeMetadata: this.newsletterMetadata(newsletterOptIn),
      });
      popup.focus();
    } catch (error) {
      if (!popup.closed) {
        popup.close();
      }
      throw error;
    }
  }

  async handleRedirectCallback(): Promise<void> {
    await this.init();
    const urls = this.appUrls();
    await this.clerk?.handleRedirectCallback({
      signInUrl: urls.origin,
      signUpUrl: urls.signUp,
      signInFallbackRedirectUrl: urls.origin,
      signUpFallbackRedirectUrl: urls.signUp,
    });
  }

  async signOut(): Promise<void> {
    this.closeSignUp();
    await this.clerk?.signOut();
    this.syncState();
  }

  openUserProfile(): void {
    this.clerk?.openUserProfile();
  }

  async getToken(template?: string): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    await this.init();

    const session = this.clerk?.session;
    if (!session) {
      return null;
    }

    try {
      return (
        (await session.getToken(template ? { template } : undefined)) ?? null
      );
    } catch {
      return null;
    }
  }

  private async initializeClerk(): Promise<void> {
    if (!CLERK_PUBLISHABLE_KEY) {
      console.error("NG_APP_CLERK_PUBLISHABLE_KEY is not set");
      return;
    }

    this.clerk = new Clerk(CLERK_PUBLISHABLE_KEY);
    const urls = this.appUrls();
    await this.clerk.load({
      ui,
      appearance: CLERK_APPEARANCE,
      localization: CLERK_TEXTS,
      signInUrl: urls.origin,
      signUpUrl: urls.signUp,
    });

    this.syncState();
    this.clerk.addListener(() => {
      this.ngZone.run(() => this.syncState(true));
    });
  }

  private syncState(fromListener = false): void {
    const previousUser = this._user();
    const user = this.clerk?.user ?? null;
    this._user.set(user);

    if (isPlatformBrowser(this.platformId) && user) {
      void this.subscribeToNewsletterIfNeeded(user);
    }

    if (
      fromListener &&
      isPlatformBrowser(this.platformId) &&
      user &&
      !previousUser
    ) {
      void this.router.navigateByUrl("/bookmarks");
    }
  }

  private appUrls(): {
    origin: string;
    signUp: string;
    bookmarks: string;
    authCallback: string;
  } {
    const origin = window.location.origin;
    return {
      origin,
      signUp: `${origin}/?register=1`,
      bookmarks: `${origin}/bookmarks`,
      authCallback: `${origin}/auth/callback`,
    };
  }

  private async requireSignUp(): Promise<SignUpResource | null> {
    await this.init();
    return this.clerk?.client?.signUp ?? null;
  }

  private newsletterMetadata(
    newsletterOptIn: boolean,
  ): Record<string, unknown> | undefined {
    if (!newsletterOptIn) {
      return undefined;
    }

    return {
      [NEWSLETTER_OPT_IN_KEY]: true,
    };
  }

  private async completeSession(sessionId: string): Promise<void> {
    await this.clerk?.setActive({ session: sessionId });
    this.syncState();
    if (isPlatformBrowser(this.platformId)) {
      await this.router.navigateByUrl("/bookmarks", { replaceUrl: true });
    }
    this.closeSignUp();
  }

  private async subscribeToNewsletterIfNeeded(
    user: UserResource,
  ): Promise<void> {
    if (!WWW_API_BASE_URI) {
      return;
    }

    if (this.newsletterSyncUsers.has(user.id)) {
      return;
    }

    const metadata = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
    if (
      metadata[NEWSLETTER_OPT_IN_KEY] !== true ||
      metadata[NEWSLETTER_SUBSCRIBED_KEY] === true
    ) {
      return;
    }

    this.newsletterSyncUsers.add(user.id);

    try {
      const token = await this.getToken();
      if (!token) {
        this.newsletterSyncUsers.delete(user.id);
        return;
      }

      const response = await fetch(`${WWW_API_BASE_URI}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Application-ID": "sc-www",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Newsletter subscription failed with ${response.status}`,
        );
      }

      await user.updateMetadata({
        unsafeMetadata: {
          [NEWSLETTER_OPT_IN_KEY]: null,
          [NEWSLETTER_SUBSCRIBED_KEY]: true,
        },
      });

      this.toastService.show({
        title: "Yay, you've just subscribed to our newsletter!",
        type: "success",
        duration: 4000,
      });
    } catch (error) {
      console.error("Newsletter subscription failed! :(", error);
      this.toastService.show({
        title:
          "Couldn't subscribe to the newsletter. Try again later or contact us.",
        type: "error",
        duration: 5000,
      });
      this.newsletterSyncUsers.delete(user.id);
    }
  }

  private authErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object") {
      const errorWithList = error as {
        errors?: Array<{ longMessage?: string; message?: string }>;
        message?: string;
      };
      const longMessage = errorWithList.errors?.[0]?.longMessage;
      if (longMessage) {
        return longMessage;
      }

      const message =
        errorWithList.errors?.[0]?.message || errorWithList.message;
      if (message) {
        return message;
      }
    }

    return fallback;
  }
}
