import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AboutNavigatorComponent } from "./navigator.component";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AboutNavigatorComponent", () => {
  let component: AboutNavigatorComponent;
  let fixture: ComponentFixture<AboutNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutNavigatorComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the shared tooltip service for the planned vendors tooltip", () => {
    const tooltipService = TestBed.inject(UiTooltipService);
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
