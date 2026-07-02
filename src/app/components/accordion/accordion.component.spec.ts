import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AccordionComponent } from "./accordion.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AccordionComponent", () => {
  let fixture: ComponentFixture<AccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionComponent);
    fixture.componentRef.setInput("items", [
      { title: "Title", content: "Content" },
    ]);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("does not render FAQ schema attributes by default", () => {
    const wrapper = fixture.nativeElement.querySelector(
      "[itemtype='https://schema.org/FAQPage']",
    );
    expect(wrapper).toBeNull();
  });

  it("renders FAQ schema attributes when useFaqSchema is true", () => {
    fixture.componentRef.setInput("useFaqSchema", true);
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector(
      "[itemtype='https://schema.org/FAQPage']",
    );
    expect(wrapper).not.toBeNull();
  });

  it("marks the active item as expanded", () => {
    fixture.componentRef.setInput("activeIndex", 0);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      "button[aria-expanded='true']",
    );
    expect(button).not.toBeNull();
  });
});
