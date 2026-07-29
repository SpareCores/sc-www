import { isPlatformBrowser } from "@angular/common";
import {
  Injectable,
  NgZone,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from "@angular/core";
import { Clerk } from "@clerk/clerk-js";
import { ui } from "@clerk/ui/no-rhc";
import type { UserResource } from "@clerk/shared/types";
import { CLERK_APPEARANCE, CLERK_TEXTS } from "./clerk-configuration";

const CLERK_PUBLISHABLE_KEY =
  import.meta.env["NG_APP_CLERK_PUBLISHABLE_KEY"] || "";

@Injectable({ providedIn: "root" })
export class Auth {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private clerk: Clerk | null = null;

  private readonly _user = signal<UserResource | null>(null);

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

    if (!CLERK_PUBLISHABLE_KEY) {
      console.error("NG_APP_CLERK_PUBLISHABLE_KEY is not set");
      return;
    }

    this.clerk = new Clerk(CLERK_PUBLISHABLE_KEY);
    await this.clerk.load({
      ui,
      appearance: CLERK_APPEARANCE,
      localization: CLERK_TEXTS,
    });

    this.syncState();
    this.clerk.addListener(() => {
      this.ngZone.run(() => this.syncState());
    });
  }

  private syncState(): void {
    this._user.set(this.clerk?.user ?? null);
  }

  signIn(): void {
    this.clerk?.openSignIn({ withSignUp: true });
  }

  signUp(): void {
    this.clerk?.openSignUp();
  }

  async signOut(): Promise<void> {
    await this.clerk?.signOut();
    this.syncState();
  }

  openUserProfile(): void {
    this.clerk?.openUserProfile();
  }
}
