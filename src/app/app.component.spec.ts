import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AppComponent } from "./app.component";
import { sharedTestingProviders } from "../testing/testbed.providers";
import { HOME_HEADER_ANNOUNCEMENT } from "./components/announcement-ticker/announcement-ticker.constants";

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

  it("should render the home announcement ticker before the header", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const shell = compiled.querySelector(".app-shell");
    const chrome = compiled.querySelector(".app-shell-chrome");
    const tickerHost = compiled.querySelector("app-announcement-ticker");

    expect(tickerHost?.textContent).toContain(
      HOME_HEADER_ANNOUNCEMENT.question,
    );
    expect(tickerHost?.textContent).toContain(
      HOME_HEADER_ANNOUNCEMENT.bodySegments[1].text,
    );
    expect(tickerHost?.textContent).toContain(
      HOME_HEADER_ANNOUNCEMENT.ctaLabel,
    );
    expect(shell?.firstElementChild).toBe(chrome);
    expect(chrome?.firstElementChild?.tagName).toBe("APP-ANNOUNCEMENT-TICKER");
  });

  it("should hide the home announcement after dismissal until refresh", async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(AppComponent);

    await router.navigateByUrl("/");
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      ".announcement-ticker__close",
    ) as HTMLButtonElement;

    expect(closeButton).not.toBeNull();

    closeButton.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector("app-announcement-ticker"),
    ).toBeNull();

    await router.navigateByUrl("/other");
    fixture.detectChanges();

    await router.navigateByUrl("/");
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector("app-announcement-ticker"),
    ).toBeNull();
  });
});
