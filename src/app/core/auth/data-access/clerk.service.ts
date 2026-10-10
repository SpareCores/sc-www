import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Clerk } from "@clerk/clerk-js";
import type {
  SignInResource,
  SignUpResource,
  UserResource,
} from "@clerk/shared/types";
import { ui } from "@clerk/ui/no-rhc";
import { AnalyticsService } from "../../../services/analytics.service";
import { CLERK_PUBLISHABLE_KEY } from "../auth.constants";
import { authUrls } from "../auth.utils";
import { CLERK_APPEARANCE, CLERK_TEXTS } from "../clerk-configuration";

@Injectable({ providedIn: "root" })
export class ClerkService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);
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

  openUserProfileModal(): void {
    const user = this.clerk?.user;
    const hidePasswordSection =
      !!user &&
      !user.passwordEnabled &&
      !!user.externalAccounts?.some((account) => account.provider === "github");

    const elements: Record<string, { display: string }> = {};
    if (hidePasswordSection) {
      elements["profileSection__password"] = { display: "none" };
    }

    this.clerk?.openUserProfile({
      apiKeysProps: { hide: true },
      appearance: Object.keys(elements).length ? { elements } : undefined,
    });
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
      this.analytics.SentryException(error, {
        tags: { feature: "clerk-sync" },
      });
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

  private async loadClerk(): Promise<void> {
    if (!CLERK_PUBLISHABLE_KEY) {
      console.error("NG_APP_CLERK_PUBLISHABLE_KEY is not set");
      return;
    }

    this.clerk = new Clerk(CLERK_PUBLISHABLE_KEY);
    const urls = authUrls();
    await this.clerk.load({
      ui,
      appearance: CLERK_APPEARANCE,
      localization: CLERK_TEXTS,
      signInUrl: urls.origin,
      signUpUrl: urls.origin,
      routerPush: (url: string) => this.navigateRouter(url),
      routerReplace: (url: string) => this.navigateRouter(url, true),
      telemetry: false,
    });
  }
}
