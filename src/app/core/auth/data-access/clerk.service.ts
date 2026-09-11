import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { Clerk } from "@clerk/clerk-js";
import type {
  SignInResource,
  SignUpResource,
  UserResource,
} from "@clerk/shared/types";
import { ui } from "@clerk/ui/no-rhc";
import { CLERK_PUBLISHABLE_KEY } from "../auth.constants";
import type { ClerkWithNavigation } from "../auth.types";
import { appUrls } from "../auth.utils";
import { CLERK_APPEARANCE, CLERK_TEXTS } from "../clerk-configuration";

@Injectable({ providedIn: "root" })
export class ClerkService {
  private readonly platformId = inject(PLATFORM_ID);
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

  get navigationInstance(): ClerkWithNavigation | null {
    return this.clerk as ClerkWithNavigation | null;
  }

  isReady(): boolean {
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

  async requireSignIn(): Promise<SignInResource | null> {
    await this.init();
    return this.clerk?.client?.signIn ?? null;
  }

  async requireSignUp(): Promise<SignUpResource | null> {
    await this.init();
    return this.clerk?.client?.signUp ?? null;
  }

  async setActive(sessionId: string): Promise<void> {
    await this.clerk?.setActive({ session: sessionId });
  }

  async signOut(): Promise<void> {
    await this.clerk?.signOut();
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

  async handleRedirectCallback(options: {
    transferable: boolean;
    origin: string;
  }): Promise<void> {
    await this.clerk?.handleRedirectCallback({
      signInUrl: options.origin,
      signUpUrl: options.origin,
      continueSignUpUrl: options.origin,
      firstFactorUrl: options.origin,
      secondFactorUrl: options.origin,
      resetPasswordUrl: options.origin,
      signInProtectCheckUrl: options.origin,
      signUpProtectCheckUrl: options.origin,
      signInFallbackRedirectUrl: options.origin,
      signUpFallbackRedirectUrl: options.origin,
      transferable: options.transferable,
    });
  }

  async reloadClient(): Promise<void> {
    try {
      await this.clerk?.client?.reload();
    } catch (error) {
      console.error("Error reloading Clerk client:", error);
    }
  }

  addListener(listener: () => void): void {
    this.clerk?.addListener(listener);
  }

  private async loadClerk(): Promise<void> {
    if (!CLERK_PUBLISHABLE_KEY) {
      console.error("NG_APP_CLERK_PUBLISHABLE_KEY is not set");
      return;
    }

    this.clerk = new Clerk(CLERK_PUBLISHABLE_KEY);
    const urls = appUrls();
    await this.clerk.load({
      ui,
      appearance: CLERK_APPEARANCE,
      localization: CLERK_TEXTS,
      signInUrl: urls.origin,
      signUpUrl: urls.origin,
    });
  }
}
