import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HeaderComponent } from "./header.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows Advisor before Resource Tracker in the mobile menu", () => {
    const menuLinks = (fixture.nativeElement as HTMLElement).querySelectorAll(
      "#menu_options .navbar_link",
    );
    const menuOptions = Array.from(menuLinks).map(
      (element) => (element as HTMLElement).textContent?.trim() ?? "",
    );

    expect(menuOptions.indexOf("Advisor")).toBeGreaterThan(-1);
    expect(menuOptions.indexOf("Resource Tracker")).toBeGreaterThan(-1);
    expect(menuOptions.indexOf("Advisor")).toBeLessThan(
      menuOptions.indexOf("Resource Tracker"),
    );
  });

  it("shows Partners in the about navigation", () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const aboutOptionsText =
      hostElement.querySelector("#about_options")?.textContent ?? "";
    const mobileMenuText =
      hostElement.querySelector("#menu_options")?.textContent ?? "";

    expect(aboutOptionsText).toContain("Partners");
    expect(mobileMenuText).toContain("Partners");
  });
});
