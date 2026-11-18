import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionHeading } from "./section-heading";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("SectionHeading", () => {
  let fixture: ComponentFixture<SectionHeading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeading],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeading);
    fixture.componentRef.setInput("tag", "product");
    fixture.detectChanges();
  });

  it("should create with the tag only", () => {
    const title = fixture.nativeElement.querySelector("h2");
    expect(title.textContent.replace(/\s/g, "")).toBe("<product>");
    expect(fixture.nativeElement.querySelectorAll("p").length).toBe(1);
  });

  it("renders the attribute and the subtitle", () => {
    fixture.componentRef.setInput("attrName", "id");
    fixture.componentRef.setInput("attrValue", "sentinel");
    fixture.componentRef.setInput("subtitle", "For platform leads");
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector("h2");
    expect(title.textContent).toContain('product id="sentinel"');
    expect(fixture.nativeElement.textContent).toContain("For platform leads");
  });

  it("renders a header anchor in the title when anchorId is set", () => {
    expect(fixture.nativeElement.querySelector("sc-header-anchor")).toBeNull();

    fixture.componentRef.setInput("anchorId", "sentinel");
    fixture.componentRef.setInput("anchorLabel", "Sentinel");
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector("h2");
    expect(title.classList).toContain("sc-header-anchor-host");
    expect(title.querySelector("a.sc-header-anchor")).not.toBeNull();
  });
});
