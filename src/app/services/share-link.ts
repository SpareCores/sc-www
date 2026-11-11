import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { Toast } from "./toast";

@Injectable({ providedIn: "root" })
export class ShareLink {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private toastService = inject(Toast);

  copyCurrentUrl(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    void navigator.clipboard.writeText(this.document.location.href);
    this.toastService.show({
      title: "Link copied to clipboard!",
      type: "success",
      duration: 2000,
    });
    return true;
  }
}
