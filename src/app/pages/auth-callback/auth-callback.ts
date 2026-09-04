import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, OnInit, PLATFORM_ID, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { Auth } from "../../services/auth/auth";

@Component({
  selector: "sc-auth-callback",
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="w-full bg-primary min-h-[60vh]">
      <div class="content flex min-h-[60vh] items-center justify-center px-4">
        <div class="flex flex-col items-center gap-4 text-center">
          <sc-loading-spinner size="lg"></sc-loading-spinner>
          @if (errorMessage()) {
            <p class="text-red-400">{{ errorMessage() }}</p>
          } @else {
            <p class="text-white text-lg">Finishing sign-up...</p>
          }
        </div>
      </div>
    </div>
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

    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      await this.finish(false);
      return;
    }

    try {
      await this.auth.handleRedirectCallback();
      await this.finish(this.auth.isAuthenticated());
    } catch {
      this.errorMessage.set("Unable to complete sign-up.");
      await this.finish(false);
    }
  }

  private async finish(authenticated: boolean): Promise<void> {
    if (window.opener && !window.opener.closed) {
      window.close();
      return;
    }

    if (authenticated) {
      await this.router.navigateByUrl("/bookmarks", { replaceUrl: true });
      return;
    }

    await this.router.navigateByUrl("/?register=1", { replaceUrl: true });
    this.auth.signUp();
  }
}
