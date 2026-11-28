import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideLucideIcons } from "@lucide/angular";

import { lucideIcons } from "../../lucide-icons";

import { FeatureCard } from "./feature-card";

describe("FeatureCard", () => {
  let fixture: ComponentFixture<FeatureCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureCard],
      providers: [provideLucideIcons(...lucideIcons)],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureCard);
    fixture.componentRef.setInput("heading", "Navigator");
    fixture.detectChanges();
  });

  it("should create with a bold heading and no badge", () => {
    const heading = fixture.nativeElement.querySelector("h3");
    expect(heading.textContent.trim()).toBe("Navigator");
    expect(heading.classList).toContain("font-bold");
    expect(fixture.nativeElement.querySelector(".rounded-full")).toBeNull();
    expect(fixture.nativeElement.querySelector("sc-button")).toBeNull();
  });

  it("renders the action button and emits its click", () => {
    fixture.componentRef.setInput("actionIcon", "message-square-more");
    fixture.componentRef.setInput("actionLabel", "Contact sales");
    fixture.componentRef.setInput("actionId", "meeting-test");
    fixture.detectChanges();

    const clicks = jasmine.createSpy("actionClick");
    fixture.componentInstance.actionClick.subscribe(clicks);
    const button = fixture.nativeElement.querySelector(
      "#meeting-test button",
    ) as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Contact sales");
    button.click();
    expect(clicks).toHaveBeenCalled();
  });

  it("renders the badge and the tag heading", () => {
    fixture.componentRef.setInput("badge", "Know");
    fixture.componentRef.setInput("headingVariant", "tag");
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector("h3");
    expect(heading.textContent.replace(/\s/g, "")).toBe("<Navigator>");
    expect(
      fixture.nativeElement.querySelector(".rounded-full").textContent,
    ).toContain("Know");
  });
});
