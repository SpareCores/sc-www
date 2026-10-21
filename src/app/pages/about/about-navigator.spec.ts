import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AboutNavigator } from "./about-navigator";
import { UiTooltip } from "../../services/ui-tooltip";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AboutNavigator", () => {
  let component: AboutNavigator;
  let fixture: ComponentFixture<AboutNavigator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutNavigator],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutNavigator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the shared tooltip service for the planned vendors tooltip", () => {
    const tooltipService = TestBed.inject(UiTooltip);
    const showSpy = spyOn(tooltipService, "show");
    const hideSpy = spyOn(tooltipService, "hide");
    const target = document.createElement("span");

    component.showTooltip({
      currentTarget: target,
      target,
    } as unknown as MouseEvent);

    expect(showSpy).toHaveBeenCalledOnceWith(
      component.tooltip.nativeElement,
      jasmine.any(Object),
      {
        left: "anchor-right",
        top: "anchor-above",
      },
    );

    component.hideTooltip();

    expect(hideSpy).toHaveBeenCalledOnceWith(component.tooltip.nativeElement);
  });
});
