import { isPlatformBrowser } from "@angular/common";
import { Component, OnInit, PLATFORM_ID, inject } from "@angular/core";
import { AuthStateService } from "../../core/auth";
import { CollectionsUiService } from "../../collections/collections-ui.service";

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
  private readonly auth = inject(AuthStateService);
  private readonly collectionsUi = inject(CollectionsUiService);
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
