import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, OnInit, PLATFORM_ID, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AuthStateService } from "../../core/auth";

@Component({
  selector: "sc-auth-callback",
  imports: [CommonModule],
  template: `
    <div id="clerk-captcha"></div>
    @if (errorMessage()) {
      <div class="sc-auth-pending-overlay" role="alert">
        <div class="sc-auth-pending-overlay__content">
          <p
            class="sc-auth-pending-overlay__text sc-auth-pending-overlay__text--error"
          >
            {{ errorMessage() }}
          </p>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AuthCallback implements OnInit {
  private readonly auth = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected errorMessage = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const inPopup = !!window.opener && !window.opener.closed;
    if (inPopup) {
      window.close();
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const fromGithubSignIn =
      params.get("intent") === "signIn" ||
      this.auth.isGithubSignInInProgress() ||
      this.auth.consumeGithubSignInHandoff();

    this.auth.clearAuthPending();

    if (params.get("error")) {
      await this.finish("error");
      return;
    }

    try {
      await this.auth.handleRedirectCallback({
        transferable: !fromGithubSignIn,
      });
      if (this.auth.isAuthenticated()) {
        await this.finish("authenticated");
        return;
      }
      const outcome = this.auth.resolveGithubCallbackOutcome();
      await this.finish(
        fromGithubSignIn && outcome === "error" ? "consent" : outcome,
      );
    } catch {
      if (this.auth.isAuthenticated()) {
        await this.finish("authenticated");
        return;
      }
      if (fromGithubSignIn) {
        await this.finish("consent");
        return;
      }
      this.errorMessage.set("Unable to complete sign-in.");
      await this.finish("error");
    }
  }

  private async finish(
    outcome: "authenticated" | "consent" | "error",
  ): Promise<void> {
    if (outcome === "authenticated") {
      await this.auth.finishAuthRedirect();
      return;
    }

    if (outcome === "consent") {
      this.auth.clearAuthPending();
      this.auth.openGithubConsentSignUp({ transfer: true });
      await this.router.navigateByUrl("/", { replaceUrl: true });
      return;
    }

    this.auth.clearAuthPending();
    await this.router.navigateByUrl("/", { replaceUrl: true });
  }
}
