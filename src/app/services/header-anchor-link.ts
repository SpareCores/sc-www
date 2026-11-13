import { Location, ViewportScroller, isPlatformBrowser } from "@angular/common";
import {
  DOCUMENT,
  Injectable,
  NgZone,
  PLATFORM_ID,
  inject,
} from "@angular/core";
import { SeoHandler } from "./seo-handler";
import { ShareLink } from "./share-link";

const FRAGMENT_SCROLL_RETRY_MS = 50;
const FRAGMENT_SCROLL_MAX_ATTEMPTS = 200;
const FRAGMENT_SCROLL_CANCEL_EVENTS = [
  "wheel",
  "touchmove",
  "keydown",
  "mousedown",
] as const;

@Injectable({
  providedIn: "root",
})
export class HeaderAnchorLink {
  private document = inject(DOCUMENT);
  private location = inject(Location);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private seoHandler = inject(SeoHandler);
  private shareLink = inject(ShareLink);
  private viewportScroller = inject(ViewportScroller);
  private cancelPendingScroll: (() => void) | null = null;

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

    this.cancelPendingScroll?.();

    const anchorId = this.currentFragment();
    const view = this.document.defaultView;
    if (!anchorId || !view) {
      return;
    }

    const pathname = this.document.location.pathname;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const stop = () => {
      clearTimeout(timer);
      FRAGMENT_SCROLL_CANCEL_EVENTS.forEach((type) =>
        view.removeEventListener(type, stop),
      );
      if (this.cancelPendingScroll === stop) {
        this.cancelPendingScroll = null;
      }
    };

    const scrollWhenReady = () => {
      if (
        this.document.location.pathname !== pathname ||
        this.currentFragment() !== anchorId
      ) {
        stop();
        return;
      }

      if (this.document.getElementById(anchorId)) {
        stop();
        this.viewportScroller.scrollToAnchor(anchorId, { behavior: "smooth" });
        return;
      }

      attempts += 1;
      if (attempts < FRAGMENT_SCROLL_MAX_ATTEMPTS) {
        timer = setTimeout(scrollWhenReady, FRAGMENT_SCROLL_RETRY_MS);
      } else {
        stop();
      }
    };

    this.cancelPendingScroll = stop;
    this.ngZone.runOutsideAngular(() => {
      FRAGMENT_SCROLL_CANCEL_EVENTS.forEach((type) =>
        view.addEventListener(type, stop, { passive: true }),
      );
      scrollWhenReady();
    });
  }

  href(anchorId: string): string {
    return this.location.prepareExternalUrl(
      `${this.location.path()}#${anchorId}`,
    );
  }

  copy(anchorId: string): void {
    void this.shareLink.copyUrl(
      `${this.seoHandler.getBaseURL()}${this.href(anchorId)}`,
    );
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
