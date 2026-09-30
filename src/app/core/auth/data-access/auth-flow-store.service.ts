import { isPlatformBrowser } from "@angular/common";
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from "@angular/core";
import type { GitHubIntent } from "../auth.types";

type AuthFlowRecord = {
  pending: boolean;
  returnUrl: string | null;
  githubIntent: GitHubIntent | null;
};

const AUTH_FLOW_KEY = "scAuthFlow";
const EMPTY_FLOW: AuthFlowRecord = {
  pending: false,
  returnUrl: null,
  githubIntent: null,
};

@Injectable({ providedIn: "root" })
export class AuthFlowStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly record = signal<AuthFlowRecord>(this.read());
  readonly pending = computed(() => this.record().pending);
  readonly githubIntent = computed(() => this.record().githubIntent);

  rememberReturnUrl(currentUrl: string): void {
    if (currentUrl.startsWith("/auth/callback")) {
      return;
    }
    this.write({
      ...this.record(),
      returnUrl: this.safeReturnUrl(currentUrl),
    });
  }

  setPending(pending: boolean): void {
    this.write({ ...this.record(), pending });
  }

  setGitHubIntent(githubIntent: GitHubIntent | null): void {
    this.write({ ...this.record(), githubIntent });
  }

  peekReturnUrl(): string | null {
    return this.safeReturnUrl(this.record().returnUrl);
  }

  consumeReturnUrl(): string {
    const returnUrl = this.peekReturnUrl() ?? "/";
    this.clearReturnUrl();
    return returnUrl;
  }

  clearReturnUrl(): void {
    this.write({ ...this.record(), returnUrl: null });
  }

  clear(): void {
    this.write(EMPTY_FLOW);
  }

  private read(): AuthFlowRecord {
    if (!this.canUseStorage()) {
      return EMPTY_FLOW;
    }
    try {
      const raw = sessionStorage.getItem(AUTH_FLOW_KEY);
      if (!raw) {
        return EMPTY_FLOW;
      }
      const parsed = JSON.parse(raw) as Partial<AuthFlowRecord>;
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

  private write(record: AuthFlowRecord): void {
    this.record.set(record);
    if (!this.canUseStorage()) {
      return;
    }
    try {
      if (!record.pending && !record.returnUrl && !record.githubIntent) {
        sessionStorage.removeItem(AUTH_FLOW_KEY);
      } else {
        sessionStorage.setItem(AUTH_FLOW_KEY, JSON.stringify(record));
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
