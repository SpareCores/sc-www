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
  NavigationError,
  NavigationStart,
  Router,
  Event,
  RouterModule,
  RoutesRecognized,
} from "@angular/router";
import { register } from "swiper/element/bundle";
import { HeaderComponent } from "./layout/header/header.component";
import { FooterComponent } from "./layout/footer/footer.component";
import { AnalyticsService } from "./services/analytics.service";
import { Subscription } from "rxjs";
import { NeetoCalService } from "./services/neeto-cal.service";

@Component({
  selector: "app-root",
  imports: [HeaderComponent, FooterComponent, RouterModule],
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
  private subscription = new Subscription();

  constructor() {
    const router = this.router;

    this.subscription.add(
      router.events.subscribe((event: Event) => {
        if (event instanceof NavigationStart) {
          // Show loading indicator
        }

        if (event instanceof NavigationEnd) {
          let url = "https://sparecores.com";
          if (event?.urlAfterRedirects?.length > 1) {
            url += event?.urlAfterRedirects;
            if (
              event?.urlAfterRedirects?.startsWith("/og/") ||
              event?.urlAfterRedirects?.startsWith("/embed/") ||
              event.urlAfterRedirects?.startsWith("/hu/")
            ) {
              this.showHeader = false;
              this.showFooter = false;
            } else {
              this.showHeader = true;
              this.showFooter = true;
            }
          }
          this.analytics.trackEvent("pageView", {});
          // update canonical url with query params as well

          this.updateCanonical(url.toLowerCase());
        }

        if (event instanceof RoutesRecognized) {
          if (
            event?.urlAfterRedirects?.startsWith("/og/") ||
            event?.urlAfterRedirects?.startsWith("/embed/") ||
            event.urlAfterRedirects?.startsWith("/hu/")
          ) {
            this.showHeader = false;
            this.showFooter = false;
          } else {
            this.showHeader = true;
            this.showFooter = true;
          }
        }

        if (event instanceof NavigationError) {
          // Hide loading indicator
          // Present error to user
        }
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
}
