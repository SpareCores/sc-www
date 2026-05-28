import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  DOCUMENT,
  inject,
} from "@angular/core";
import { Meta } from "@angular/platform-browser";
import {
  NavigationEnd,
  Router,
  Event,
  RouterModule,
  RoutesRecognized,
} from "@angular/router";
import { register } from "swiper/element/bundle";
import { HeaderComponent } from "./layout/header/header.component";
import { FooterComponent } from "./layout/footer/footer.component";
import { PromoBanner } from "./components/promo-banner/promo-banner";
import {
  PROMO_BANNER_BY_PATH,
  type PromoBannerDismissalGroup,
  type PromoBannerMessage,
} from "./components/promo-banner/promo-banner.constants";
import { AnalyticsService } from "./services/analytics.service";
import { Subscription } from "rxjs";
import { NeetoCalService } from "./services/neeto-cal.service";

const PROMO_BANNER_DISMISSAL_STORAGE_PREFIX = "sc-promo-banner-dismissed-v1";

@Component({
  selector: "app-root",
  imports: [PromoBanner, HeaderComponent, FooterComponent, RouterModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private metaTagService = inject(Meta);
  private neetoCalService = inject(NeetoCalService);

  title = "sc-www";

  showHeader = true;
  showFooter = true;
  promoBannerMessage: PromoBannerMessage | null = null;
  private dismissedPromoBannerGroups = new Set<PromoBannerDismissalGroup>();
  private subscription = new Subscription();

  constructor() {
    this.updateShellChrome(this.router.url);

    this.subscription.add(
      this.router.events.subscribe((event: Event) => {
        if (
          event instanceof RoutesRecognized ||
          event instanceof NavigationEnd
        ) {
          this.updateShellChrome(event.urlAfterRedirects);
        }

        if (!(event instanceof NavigationEnd)) {
          return;
        }

        const canonicalUrl =
          event.urlAfterRedirects.length > 1
            ? `https://sparecores.com${event.urlAfterRedirects}`
            : "https://sparecores.com";

        this.analytics.trackEvent("pageView", {});
        this.updateCanonical(canonicalUrl.toLowerCase());
      }),
    );
  }

  ngOnInit(): void {
    register();
    this.neetoCalService.initialize();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.analytics.initializeTracking();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateCanonical(url: string) {
    const canonicalUrl = url;
    const head = this.document.getElementsByTagName("head")[0];
    let element: HTMLLinkElement | null =
      this.document.querySelector(`link[rel='canonical']`) || null;
    if (element == null) {
      element = this.document.createElement("link") as HTMLLinkElement;
      head.appendChild(element);
    }
    element.setAttribute("rel", "canonical");
    element.setAttribute("href", canonicalUrl);

    this.metaTagService.updateTag(
      { property: "og:url", content: canonicalUrl },
      "property='og:url'",
    );
  }

  dismissPromoBanner(): void {
    const group = this.promoBannerMessage?.dismissalGroup;
    if (group) {
      this.dismissedPromoBannerGroups.add(group);
      this.storePromoBannerDismissal(group);
    }

    this.promoBannerMessage = null;
  }

  private updateShellChrome(url: string | undefined): void {
    const path = this.normalizePath(url);
    const shouldHideChrome = this.isChromeHiddenRoute(path);

    this.showHeader = !shouldHideChrome;
    this.showFooter = !shouldHideChrome;
    this.promoBannerMessage = shouldHideChrome
      ? null
      : this.getPromoBannerMessage(path);
  }

  private normalizePath(url: string | undefined): string {
    const path = (url || "/").split(/[?#]/)[0];
    return path.length > 1 ? path.replace(/\/+$/, "") || "/" : path || "/";
  }

  private isChromeHiddenRoute(path: string): boolean {
    return (
      path.startsWith("/og/") ||
      path.startsWith("/embed/") ||
      path.startsWith("/hu/")
    );
  }

  private getPromoBannerMessage(path: string): PromoBannerMessage | null {
    const promoBannerMessage = PROMO_BANNER_BY_PATH[path];

    if (!promoBannerMessage) {
      return null;
    }

    return this.isPromoBannerGroupDismissed(promoBannerMessage.dismissalGroup)
      ? null
      : promoBannerMessage;
  }

  private isPromoBannerGroupDismissed(
    group: PromoBannerDismissalGroup,
  ): boolean {
    if (this.dismissedPromoBannerGroups.has(group)) {
      return true;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      const isDismissed =
        window.sessionStorage.getItem(this.getPromoBannerStorageKey(group)) ===
        "true";

      if (isDismissed) {
        this.dismissedPromoBannerGroups.add(group);
      }

      return isDismissed;
    } catch {
      return false;
    }
  }

  private storePromoBannerDismissal(group: PromoBannerDismissalGroup): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        this.getPromoBannerStorageKey(group),
        "true",
      );
    } catch {
      return;
    }
  }

  private getPromoBannerStorageKey(group: PromoBannerDismissalGroup): string {
    return `${PROMO_BANNER_DISMISSAL_STORAGE_PREFIX}:${group}`;
  }
}
