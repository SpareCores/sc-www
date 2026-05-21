import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AppComponent } from "./app.component";
import { sharedTestingProviders } from "../testing/testbed.providers";
import {
  ADVISOR_PROMO_BANNER,
  SITE_PROMO_BANNER,
} from "./components/promo-banner/promo-banner.constants";

@Component({
  template: "",
})
class TestRouteComponent {}

describe("AppComponent", () => {
  beforeEach(async () => {
    const [, ...nonRouterTestingProviders] = sharedTestingProviders;

    await TestBed.configureTestingModule({
      imports: [AppComponent, TestRouteComponent],
      providers: [
        ...nonRouterTestingProviders,
        provideRouter([
          { path: "", component: TestRouteComponent },
          { path: "advisor", component: TestRouteComponent },
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

  it("should render the site promo banner below the header", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const chrome = compiled.querySelector(".app-shell-chrome");
    const bannerHost = compiled.querySelector("app-promo-banner");
    const anchor = bannerHost?.querySelector("a") as HTMLAnchorElement | null;

    expect(bannerHost?.textContent).toContain(SITE_PROMO_BANNER.lead);
    expect(bannerHost?.textContent).toContain(SITE_PROMO_BANNER.body);
    expect(anchor?.getAttribute("href")).toContain("/advisor");
    expect(chrome?.firstElementChild?.tagName).toBe("HEADER");
    expect(
      chrome?.querySelector("header + .app-shell-banner app-promo-banner"),
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

  it("should hide the promo banner after dismissal until refresh", async () => {
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

    await router.navigateByUrl("/other");
    fixture.detectChanges();

    await router.navigateByUrl("/advisor");
    fixture.detectChanges();

    await router.navigateByUrl("/");
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("app-promo-banner")).toBeNull();
  });
});
