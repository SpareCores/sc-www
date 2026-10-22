import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject, isDevMode } from "@angular/core";
import { Router } from "@angular/router";
import type { Clerk } from "@clerk/clerk-js";
import { isClerkRuntimeError, isNetworkError } from "@clerk/shared/error";
import type {
  SignInResource,
  SignUpResource,
  UserResource,
} from "@clerk/shared/types";
import { CLERK_PUBLISHABLE_KEY } from "../auth.constants";
import { authUrls } from "../auth.utils";
import { Analytics } from "../../../services/analytics";

@Injectable({ providedIn: "root" })
export class ClerkClient {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly analytics = inject(Analytics);
  private clerk: Clerk | null = null;
  private initPromise: Promise<void> | null = null;

  get instance(): Clerk | null {
    return this.clerk;
  }

  get user(): UserResource | null {
    return this.clerk?.user ?? null;
  }

  get session() {
    return this.clerk?.session ?? null;
  }

  isLoaded(): boolean {
    return this.clerk !== null;
  }

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.loadClerk();
    return this.initPromise;
  }

  async getSignInResource(): Promise<SignInResource | null> {
    await this.init();
    return this.clerk?.client?.signIn ?? null;
  }

  async getSignUpResource(): Promise<SignUpResource | null> {
    await this.init();
    return this.clerk?.client?.signUp ?? null;
  }

  async setActive(sessionId: string): Promise<void> {
    await this.clerk?.setActive({ session: sessionId });
  }

  async signOut(): Promise<void> {
    await this.clerk?.signOut(() => undefined);
  }

  async clearActiveSession(): Promise<void> {
    await this.clerk?.setActive({ session: null });
  }

  async getToken(template?: string): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      await this.init();

      const session = this.clerk?.session;
      if (!session) {
        return null;
      }

      return (
        (await session.getToken(template ? { template } : undefined)) ?? null
      );
    } catch {
      return null;
    }
  }

  async handleRedirectCallback(options: {
    transferable: boolean;
    origin: string;
    afterAuthUrl?: string;
  }): Promise<void> {
    await this.clerk?.handleRedirectCallback(
      {
        signInUrl: options.origin,
        signUpUrl: options.origin,
        continueSignUpUrl: options.origin,
        firstFactorUrl: options.origin,
        secondFactorUrl: options.origin,
        resetPasswordUrl: options.origin,
        signInProtectCheckUrl: options.origin,
        signUpProtectCheckUrl: options.origin,
        transferable: options.transferable,
        ...(options.afterAuthUrl
          ? {
              signInForceRedirectUrl: options.afterAuthUrl,
              signUpForceRedirectUrl: options.afterAuthUrl,
            }
          : {}),
      },
      async () => undefined,
    );
  }

  async syncClerkState(): Promise<boolean> {
    try {
      await this.clerk?.client?.reload();
      return true;
    } catch (error) {
      console.error("Failed to synchronize Clerk client state:", error);
      if (!this.isTransientNetworkError(error)) {
        this.analytics.SentryException(error, {
          tags: { feature: "clerk-sync" },
        });
      }
      return false;
    }
  }

  async resetSignInState(): Promise<void> {
    const signIn = this.clerk?.client?.signIn;
    if (!signIn) {
      return;
    }

    const identifier = signIn.identifier ?? undefined;
    try {
      await signIn.create(identifier ? { identifier } : {});
    } catch {
      await this.syncClerkState();
    }
  }

  addListener(listener: () => void): (() => void) | undefined {
    return this.clerk?.addListener(listener) as (() => void) | undefined;
  }

  isTransientNetworkError(error: unknown): boolean {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return true;
    }
    if (isClerkRuntimeError(error) && error.code === "network_error") {
      return true;
    }
    if (!(error instanceof Error)) {
      return false;
    }
    return (
      isNetworkError(error) ||
      (error instanceof TypeError &&
        /failed to fetch|load failed|network/i.test(error.message))
    );
  }

  private navigateRouter(url: string, replace = false): Promise<boolean> {
    return this.router.navigateByUrl(
      this.toRelativePath(url),
      replace ? { replaceUrl: true } : undefined,
    );
  }

  private toRelativePath(url: string): string {
    try {
      const target = new URL(url, window.location.origin);
      if (target.origin === window.location.origin) {
        return `${target.pathname}${target.search}${target.hash}`;
      }
    } catch {
      return url;
    }
    return url;
  }

  private async loadClerk(
    publishableKey = CLERK_PUBLISHABLE_KEY,
  ): Promise<void> {
    if (!publishableKey) {
      console.error("NG_APP_CLERK_PUBLISHABLE_KEY is not set");
      return;
    }

    const { Clerk: ClerkSdk } = await this.importClerk();
    this.clerk = new ClerkSdk(publishableKey);
    const urls = authUrls();
    await this.clerk.load({
      signInUrl: urls.origin,
      signUpUrl: urls.origin,
      routerPush: (url: string) => this.navigateRouter(url),
      routerReplace: (url: string) => this.navigateRouter(url, true),
      telemetry: false,
    });
    if (isDevMode() || "Cypress" in window) {
      (window as Window & { Clerk: Clerk }).Clerk = this.clerk;
    }
  }

  private importClerk(): Promise<typeof import("@clerk/clerk-js")> {
    return import("@clerk/clerk-js");
  }
}
