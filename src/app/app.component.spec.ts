import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AppComponent } from "./app.component";
import { AnalyticsService } from "./services/analytics.service";
import { sharedTestingProviders } from "../testing/testbed.providers";
import {
  ADVISOR_PROMO_BANNER,
  SERVER_PRICES_PROMO_BANNER,
  SITE_PROMO_BANNER,
  STORAGE_PRICES_PROMO_BANNER,
  TRAFFIC_PRICES_PROMO_BANNER,
} from "./components/promo-banner/promo-banner.constants";

@Component({
  template: "",
})
class TestRouteComponent {}

describe("AppComponent", () => {
  const initializeTracking = jasmine.createSpy("initializeTracking");
  const trackEvent = jasmine.createSpy("trackEvent");

  beforeEach(async () => {
    window.sessionStorage.clear();
    initializeTracking.calls.reset();
    trackEvent.calls.reset();

    const [, ...nonRouterTestingProviders] = sharedTestingProviders;

    await TestBed.configureTestingModule({
      imports: [AppComponent, TestRouteComponent],
      providers: [
        ...nonRouterTestingProviders,
        {
          provide: AnalyticsService,
          useValue: {
            initializeTracking,
            trackEvent,
          },
        },
        provideRouter([
          { path: "", component: TestRouteComponent },
          { path: "advisor", component: TestRouteComponent },
          { path: "server_prices", component: TestRouteComponent },
          { path: "storages", component: TestRouteComponent },
          { path: "traffic-prices", component: TestRouteComponent },
          { path: "other", component: TestRouteComponent },
        ]),
      ],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'sc-www' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual("sc-www");
  });

  it("should render the app shell", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector(".app-shell")).not.toBeNull();
  });

  it("should render the site promo banner below the navbar", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const chrome = compiled.querySelector(".app-shell-chrome");
    const bannerHost = compiled.querySelector("app-promo-banner");
    const ctaLink = bannerHost?.querySelector("a") as HTMLAnchorElement | null;

    expect(bannerHost?.textContent).toContain(SITE_PROMO_BANNER.lead);
    expect(bannerHost?.textContent).toContain(SITE_PROMO_BANNER.body);
    expect(bannerHost?.textContent).toContain(SITE_PROMO_BANNER.ctaLabel!);
    expect(bannerHost?.textContent).not.toContain("Ready to scale?");
    expect(ctaLink?.getAttribute("href")).toContain("/advisor");
    expect(chrome?.firstElementChild?.tagName).toBe("HEADER");
    expect(
      compiled.querySelector(
        ".app-shell-chrome + .app-shell-banner app-promo-banner",
      ),
    ).toBe(bannerHost);
  });

  it("should render the advisor promo banner with the scheduler CTA", async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(AppComponent);

    await router.navigateByUrl("/advisor");
    fixture.detectChanges();

    const bannerHost = fixture.nativeElement.querySelector(
      "app-promo-banner",
    ) as HTMLElement | null;

    expect(bannerHost?.textContent).toContain(ADVISOR_PROMO_BANNER.lead);
    expect(bannerHost?.textContent).toContain(ADVISOR_PROMO_BANNER.body);
    expect(
      bannerHost?.querySelector("#meeting-advisor-promo-banner")?.textContent,
    ).toContain(ADVISOR_PROMO_BANNER.ctaLabel!);
    expect(bannerHost?.querySelector("a")).toBeNull();
  });

  it("should render mapped promo banners only on configured routes", async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(AppComponent);

    await router.navigateByUrl("/server_prices");
    fixture.detectChanges();

    let bannerHost = fixture.nativeElement.querySelector(
      "app-promo-banner",
    ) as HTMLElement | null;
    const ctaLink = bannerHost?.querySelector("a") as HTMLAnchorElement | null;

    expect(bannerHost?.textContent).toContain(SERVER_PRICES_PROMO_BANNER.body);
    expect(bannerHost?.textContent).toContain(
      SERVER_PRICES_PROMO_BANNER.ctaLabel!,
    );
    expect(ctaLink?.getAttribute("href")).toContain("/servers");

    await router.navigateByUrl("/storages");
    fixture.detectChanges();

    bannerHost = fixture.nativeElement.querySelector("app-promo-banner");
    expect(bannerHost?.textContent).toContain(STORAGE_PRICES_PROMO_BANNER.body);

    await router.navigateByUrl("/traffic-prices");
    fixture.detectChanges();

    bannerHost = fixture.nativeElement.querySelector("app-promo-banner");
    expect(bannerHost?.textContent).toContain(TRAFFIC_PRICES_PROMO_BANNER.body);

    await router.navigateByUrl("/other");
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("app-promo-banner")).toBeNull();
  });

  it("should hide dismissed promo banners by session group", async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(AppComponent);

    await router.navigateByUrl("/");
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      ".promo-banner__close",
    ) as HTMLButtonElement;

    expect(closeButton).not.toBeNull();

    closeButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("app-promo-banner")).toBeNull();

    await router.navigateByUrl("/storages");
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("app-promo-banner")).toBeNull();

    await router.navigateByUrl("/advisor");
    fixture.detectChanges();

    const advisorBannerHost = fixture.nativeElement.querySelector(
      "app-promo-banner",
    ) as HTMLElement | null;

    expect(advisorBannerHost?.textContent).toContain(ADVISOR_PROMO_BANNER.body);
    expect(
      advisorBannerHost?.querySelector("#meeting-advisor-promo-banner"),
    ).not.toBeNull();

    await router.navigateByUrl("/server_prices");
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector("app-promo-banner"),
    ).not.toBeNull();

    const serverCloseButton = fixture.nativeElement.querySelector(
      ".promo-banner__close",
    ) as HTMLButtonElement;

    serverCloseButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("app-promo-banner")).toBeNull();

    await router.navigateByUrl("/");
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("app-promo-banner")).toBeNull();
  });

  it("should keep Advisor launch promos visible after dismissing the contact promo", async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(AppComponent);

    await router.navigateByUrl("/advisor");
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      ".promo-banner__close",
    ) as HTMLButtonElement;

    closeButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("app-promo-banner")).toBeNull();

    await router.navigateByUrl("/");
    fixture.detectChanges();

    const launchBannerHost = fixture.nativeElement.querySelector(
      "app-promo-banner",
    ) as HTMLElement | null;

    expect(launchBannerHost?.textContent).toContain(SITE_PROMO_BANNER.body);
    expect(launchBannerHost?.textContent).toContain(
      SITE_PROMO_BANNER.ctaLabel!,
    );
  });
});
