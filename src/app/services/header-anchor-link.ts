import { Location, ViewportScroller, isPlatformBrowser } from "@angular/common";
import { DOCUMENT, Injectable, PLATFORM_ID, inject } from "@angular/core";
import { SeoHandler } from "./seo-handler";
import { Toast } from "./toast";
import { HEADER_ANCHOR_COPY_TOAST_ID } from "./toast-ids";

const FRAGMENT_SCROLL_RETRY_MS = 50;
const FRAGMENT_SCROLL_MAX_ATTEMPTS = 200;

@Injectable({
  providedIn: "root",
})
export class HeaderAnchorLink {
  private document = inject(DOCUMENT);
  private location = inject(Location);
  private platformId = inject(PLATFORM_ID);
  private seoHandler = inject(SeoHandler);
  private toast = inject(Toast);
  private viewportScroller = inject(ViewportScroller);

  syncScrollOffset(): void {
    this.viewportScroller.setOffset(() => [
      0,
      this.scrollPaddingTop() + this.fragmentScrollMarginTop(),
    ]);
  }

  scrollToCurrentFragment(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const anchorId = this.currentFragment();
    if (!anchorId) {
      return;
    }

    let attempts = 0;
    const scrollWhenReady = () => {
      if (this.document.getElementById(anchorId)) {
        this.viewportScroller.scrollToAnchor(anchorId, { behavior: "smooth" });
        return;
      }

      attempts += 1;
      if (attempts < FRAGMENT_SCROLL_MAX_ATTEMPTS) {
        setTimeout(scrollWhenReady, FRAGMENT_SCROLL_RETRY_MS);
      }
    };

    scrollWhenReady();
  }

  href(anchorId: string): string {
    return this.location.prepareExternalUrl(
      `${this.location.path()}#${anchorId}`,
    );
  }

  copy(anchorId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const url = `${this.seoHandler.getBaseURL()}${this.href(anchorId)}`;

    if (!navigator.clipboard) {
      this.showCopyError();
      return;
    }

    navigator.clipboard.writeText(url).then(
      () => {
        this.toast.show({
          id: HEADER_ANCHOR_COPY_TOAST_ID,
          title: "Link copied to clipboard!",
          type: "success",
          duration: 2000,
        });
      },
      () => this.showCopyError(),
    );
  }

  private showCopyError(): void {
    this.toast.show({
      id: HEADER_ANCHOR_COPY_TOAST_ID,
      title: "Could not copy the link",
      body: "Clipboard access is not available in this browser.",
      type: "error",
      duration: 4000,
    });
  }

  private currentFragment(): string {
    try {
      return decodeURIComponent(this.document.location.hash.slice(1));
    } catch {
      return "";
    }
  }

  private fragmentScrollMarginTop(): number {
    const view = this.document.defaultView;
    const anchorId = this.currentFragment();
    const target = anchorId ? this.document.getElementById(anchorId) : null;
    if (!view || !target) {
      return 0;
    }

    return parseFloat(view.getComputedStyle(target).scrollMarginTop) || 0;
  }

  private scrollPaddingTop(): number {
    const view = this.document.defaultView;
    if (!view) {
      return 0;
    }

    return (
      parseFloat(
        view.getComputedStyle(this.document.documentElement).scrollPaddingTop,
      ) || 0
    );
  }
}
