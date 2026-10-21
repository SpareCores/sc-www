import { isPlatformBrowser } from "@angular/common";
import { Component, OnInit, PLATFORM_ID, inject } from "@angular/core";
import { AuthState } from "../../core/auth";
import { CollectionsUi } from "../../collections/collections-ui";

@Component({
  selector: "sc-auth-callback",
  template: `<div id="clerk-captcha"></div>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AuthCallback implements OnInit {
  private readonly auth = inject(AuthState);
  private readonly collectionsUi = inject(CollectionsUi);
  private readonly platformId = inject(PLATFORM_ID);

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const result = await this.auth.handleGitHubCallback();
    if (result.status === "cancelled" || result.status === "error") {
      this.collectionsUi.clearPendingFeatureAction();
    }
  }
}
