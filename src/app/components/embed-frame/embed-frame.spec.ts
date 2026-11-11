import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbedFrame } from "./embed-frame";
import { SeoHandler } from "../../services/seo-handler";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbedFrame", () => {
  let fixture: ComponentFixture<EmbedFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedFrame],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbedFrame);
  });

  it("should create without a footer link", () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector("a")).toBeNull();
  });

  it("links the footer to the page on the main site", () => {
    fixture.componentRef.setInput("path", "/server/aws/m5.large");
    fixture.componentRef.setInput("linkLabel", "m5.large");
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("href")).toBe(
      `${TestBed.inject(SeoHandler).getBaseURL()}/server/aws/m5.large`,
    );
    expect(link.textContent).toContain("m5.large");
  });
});
