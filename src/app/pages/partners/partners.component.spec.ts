import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PartnersComponent } from "./partners.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("PartnersComponent", () => {
  let component: PartnersComponent;
  let fixture: ComponentFixture<PartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnersComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(PartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders anchorable top-level sections", () => {
    const headings = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll("h2"),
    ).map((heading) => heading.textContent ?? "");

    expect(
      headings.some((heading) =>
        heading.includes("Strategic & Ecosystem Partners"),
      ),
    ).toBeTrue();
    expect(
      headings.some((heading) =>
        heading.includes("Technology & Cloud Partners"),
      ),
    ).toBeTrue();
  });

  it("renders the contact CTA from structured content data", () => {
    const contactLink = (fixture.nativeElement as HTMLElement).querySelector(
      'a[href="/contact"]',
    );

    expect(contactLink?.textContent?.trim()).toBe("Contact us");
  });

  it("applies compact logo variants from the page data", () => {
    const compactRow = (fixture.nativeElement as HTMLElement).querySelector(
      ".partner-logos--compact",
    );
    const compactLogo = (fixture.nativeElement as HTMLElement).querySelector(
      ".partner-logo-image--compact",
    );

    expect(compactRow).not.toBeNull();
    expect(compactLogo).not.toBeNull();
  });

  it("marks multi-logo sections for the two-row mobile layout", () => {
    const multiLogoRows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        ".partner-logos--two-rows-mobile",
      ),
    );

    expect(multiLogoRows.length).toBe(3);
    expect(
      multiLogoRows.every(
        (row) =>
          row.getAttribute("style")?.includes("--partner-mobile-columns") ??
          false,
      ),
    ).toBeTrue();
  });
});
