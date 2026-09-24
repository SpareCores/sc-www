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
    await this.clerk?.signOut(() => undefined);
  }

  openUserProfile(onDeleteAccount?: () => Promise<void>): void {
    const user = this.clerk?.user;
    const hidePasswordSection =
      !!user &&
      !user.passwordEnabled &&
      !!user.externalAccounts?.some((account) => account.provider === "github");

    const elements: Record<string, { display: string }> = {
      profileSection__danger: { display: "none" },
    };
    if (hidePasswordSection) {
      elements["profileSection__password"] = { display: "none" };
    }

    this.clerk?.openUserProfile({
      apiKeysProps: { hide: true },
      appearance: { elements },
      customPages: onDeleteAccount
        ? [this.createDeleteAccountPage(onDeleteAccount)]
        : undefined,
    });
  }

  private createDeleteAccountPage(onDeleteAccount: () => Promise<void>) {
    return {
      label: "Delete account",
      url: "delete-account",
      mount: (el: HTMLDivElement) => {
        el.replaceChildren();

        const title = document.createElement("h1");
        title.textContent = "Delete account";
        title.style.cssText =
          "margin:0 0 0.5rem;font-size:1.125rem;font-weight:600;color:#fff";

        const description = document.createElement("p");
        description.textContent =
          "Permanently delete your account and all associated data. This cannot be undone.";
        description.style.cssText =
          "margin:0 0 1rem;font-size:0.875rem;color:#9ca3af;line-height:1.4";

        const error = document.createElement("p");
        error.style.cssText =
          "display:none;margin:0 0 0.75rem;font-size:0.875rem;color:#EF4444";

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Delete account";
        button.style.cssText =
          "appearance:none;border:0;border-radius:0.5rem;padding:0.5rem 1rem;background:#EF4444;color:#fff;font-size:0.875rem;font-weight:500;cursor:pointer";

        button.addEventListener("click", () => {
          if (
            !window.confirm(
              "Delete your account permanently? This cannot be undone.",
            )
          ) {
            return;
          }

          error.style.display = "none";
          error.textContent = "";
          button.disabled = true;
          button.textContent = "Deleting…";

          void onDeleteAccount().catch((err: unknown) => {
            error.textContent =
              err instanceof Error
                ? err.message
                : "Unable to delete account. Please try again.";
            error.style.display = "block";
            button.disabled = false;
            button.textContent = "Delete account";
          });
        });

        el.append(title, description, error, button);
      },
      unmount: (el?: HTMLDivElement) => {
        el?.replaceChildren();
      },
    };
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

  async abandonSignIn(): Promise<void> {
    const signIn = this.clerk?.client?.signIn;
    if (!signIn) {
      return;
    }

    const identifier = signIn.identifier ?? undefined;
    try {
      await signIn.create(identifier ? { identifier } : {});
    } catch {
      await this.reloadClient();
    }
  }

  addListener(listener: () => void): (() => void) | undefined {
    return this.clerk?.addListener(listener) as (() => void) | undefined;
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
      telemetry: false,
    });
  }
}
