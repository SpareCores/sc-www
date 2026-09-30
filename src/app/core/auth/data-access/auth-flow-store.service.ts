import { isPlatformBrowser } from "@angular/common";
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from "@angular/core";
import type { GitHubIntent } from "../auth.types";

type AuthFlowState = {
  pending: boolean;
  returnUrl: string | null;
  githubIntent: GitHubIntent | null;
};

const AUTH_FLOW_KEY = "scAuthFlow";
const EMPTY_FLOW: AuthFlowState = {
  pending: false,
  returnUrl: null,
  githubIntent: null,
};

@Injectable({ providedIn: "root" })
export class AuthFlowStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = signal<AuthFlowState>(this.loadFromStorage());
  readonly pending = computed(() => this.state().pending);
  readonly githubIntent = computed(() => this.state().githubIntent);

  setReturnUrl(returnUrl: string): void {
    if (returnUrl.startsWith("/auth/callback")) {
      return;
    }
    this.saveToStorage({
      ...this.state(),
      returnUrl: this.safeReturnUrl(returnUrl),
    });
  }

  setPending(pending: boolean): void {
    this.saveToStorage({ ...this.state(), pending });
  }

  setGitHubIntent(githubIntent: GitHubIntent | null): void {
    this.saveToStorage({ ...this.state(), githubIntent });
  }

  peekReturnUrl(): string | null {
    return this.safeReturnUrl(this.state().returnUrl);
  }

  consumeReturnUrl(): string {
    const returnUrl = this.peekReturnUrl() ?? "/";
    this.clearReturnUrl();
    return returnUrl;
  }

  clearReturnUrl(): void {
    this.saveToStorage({ ...this.state(), returnUrl: null });
  }

  clear(): void {
    this.saveToStorage(EMPTY_FLOW);
  }

  private loadFromStorage(): AuthFlowState {
    if (!this.canUseStorage()) {
      return EMPTY_FLOW;
    }
    try {
      const raw = sessionStorage.getItem(AUTH_FLOW_KEY);
      if (!raw) {
        return EMPTY_FLOW;
      }
      const parsed = JSON.parse(raw) as Partial<AuthFlowState>;
      const githubIntent =
        parsed.githubIntent === "signIn" || parsed.githubIntent === "signUp"
          ? parsed.githubIntent
          : null;
      return {
        pending: parsed.pending === true,
        returnUrl: this.safeReturnUrl(
          typeof parsed.returnUrl === "string" ? parsed.returnUrl : null,
        ),
        githubIntent,
      };
    } catch {
      return EMPTY_FLOW;
    }
  }

  private saveToStorage(state: AuthFlowState): void {
    this.state.set(state);
    if (!this.canUseStorage()) {
      return;
    }
    try {
      if (!state.pending && !state.returnUrl && !state.githubIntent) {
        sessionStorage.removeItem(AUTH_FLOW_KEY);
      } else {
        sessionStorage.setItem(AUTH_FLOW_KEY, JSON.stringify(state));
      }
    } catch {
      return;
    }
  }

  private safeReturnUrl(value: string | null): string | null {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
      return null;
    }
    return value;
  }

  private canUseStorage(): boolean {
    return (
      isPlatformBrowser(this.platformId) &&
      typeof sessionStorage !== "undefined"
    );
  }
}
