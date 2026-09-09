import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, OnInit, PLATFORM_ID, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Auth } from "../../services/auth/auth";

@Component({
  selector: "sc-auth-callback",
  imports: [CommonModule],
  template: `
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
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected errorMessage = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.auth.startAuthPending();

    const inPopup = !!window.opener && !window.opener.closed;
    const params = new URLSearchParams(window.location.search);

    if (params.get("error")) {
      await this.finish("error", inPopup);
      return;
    }

    try {
      await this.auth.handleRedirectCallback();
      if (this.auth.isAuthenticated()) {
        await this.finish("authenticated", inPopup);
        return;
      }

      if (this.auth.needsGithubConsent()) {
        await this.finish("consent", inPopup);
        return;
      }

      await this.finish("error", inPopup);
    } catch {
      this.errorMessage.set("Unable to complete sign-in.");
      await this.finish("error", inPopup);
    }
  }

  private async finish(
    outcome: "authenticated" | "consent" | "error",
    inPopup: boolean,
  ): Promise<void> {
    if (inPopup) {
      window.close();
      return;
    }

    if (outcome === "authenticated") {
      await this.auth.finishAuthRedirect();
      return;
    }

    if (outcome === "consent") {
      this.auth.openGithubConsentSignUp();
      await this.router.navigateByUrl("/", { replaceUrl: true });
      return;
    }

    this.auth.clearAuthPending();
    await this.router.navigateByUrl("/", { replaceUrl: true });
  }
}
