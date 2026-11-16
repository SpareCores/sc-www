import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { Toast } from "./toast";

@Injectable({ providedIn: "root" })
export class ShareLink {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private toastService = inject(Toast);

  async copyCurrentUrl(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(this.document.location.href);
    } catch {
      this.toastService.show({
        title: "Could not copy the link.",
        type: "error",
        duration: 2000,
      });
      return false;
    }

    this.toastService.show({
      title: "Link copied to clipboard!",
      type: "success",
      duration: 2000,
    });
    return true;
  }
}
