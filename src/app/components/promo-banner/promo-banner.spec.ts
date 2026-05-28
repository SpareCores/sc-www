import { importProvidersFrom } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";

import {
  ADVISOR_PROMO_BANNER,
  SITE_PROMO_BANNER,
} from "./promo-banner.constants";
import { PromoBanner } from "./promo-banner";
import { lucideIcons } from "../../lucide-icons";

describe("PromoBanner", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoBanner],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick(lucideIcons)),
      ],
    }).compileComponents();
  });

  it("renders a site banner with a separate CTA link", () => {
    const fixture = TestBed.createComponent(PromoBanner);
    fixture.componentRef.setInput("message", SITE_PROMO_BANNER);
    fixture.componentRef.setInput("dismissible", true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const ctaLink = host.querySelector(
      ".promo-banner__cta",
    ) as HTMLAnchorElement | null;

    expect(host.querySelector(".promo-banner__lead")?.textContent).toContain(
      SITE_PROMO_BANNER.lead,
    );
    expect(host.querySelector(".promo-banner__body")?.textContent).toContain(
      SITE_PROMO_BANNER.body,
    );
    expect(ctaLink?.textContent).toContain(SITE_PROMO_BANNER.ctaLabel!);
    expect(ctaLink?.getAttribute("href")).toContain(SITE_PROMO_BANNER.ctaHref!);
    expect(ctaLink?.querySelector("lucide-icon")).not.toBeNull();
    expect(host.querySelector("#meeting-advisor-promo-banner")).toBeNull();
    expect(host.querySelector(".promo-banner__close")).not.toBeNull();
  });

  it("renders the advisor scheduler button for the advisor variant", () => {
    const fixture = TestBed.createComponent(PromoBanner);
    fixture.componentRef.setInput("message", ADVISOR_PROMO_BANNER);
    fixture.componentRef.setInput("dismissible", true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const ctaButton = host.querySelector(
      "#meeting-advisor-promo-banner",
    ) as HTMLButtonElement | null;

    expect(host.querySelector("a")).toBeNull();
    expect(ctaButton?.textContent).toContain(ADVISOR_PROMO_BANNER.ctaLabel!);
    expect(ctaButton?.querySelector("lucide-icon")).not.toBeNull();
  });
});
