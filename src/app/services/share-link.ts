import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { Toast } from "./toast";
import { LINK_COPY_TOAST_ID } from "./toast-ids";

@Injectable({ providedIn: "root" })
export class ShareLink {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private toastService = inject(Toast);

  copyCurrentUrl(): Promise<boolean> {
    return this.copyUrl(this.document.location.href);
  }

  async copyUrl(url: string): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      this.toastService.show({
        id: LINK_COPY_TOAST_ID,
        title: "Could not copy the link.",
        type: "error",
        duration: 2000,
      });
      return false;
    }

    this.toastService.show({
      id: LINK_COPY_TOAST_ID,
      title: "Link copied to clipboard!",
      type: "success",
      duration: 2000,
    });
    return true;
  }
}
