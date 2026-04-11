import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerListingComponent } from "./server-listing.component";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerListingComponent", () => {
  let component: ServerListingComponent;
  let fixture: ComponentFixture<ServerListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerListingComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the shared tooltip service for column info tooltips", () => {
    const tooltipService = TestBed.inject(UiTooltipService);
    const showSpy = spyOn(tooltipService, "show");
    const hideSpy = spyOn(tooltipService, "hide");
    const target = document.createElement("span");

    component.showTooltip(
      { currentTarget: target, target } as unknown as MouseEvent,
      "Tooltip content",
    );

    expect(component.tooltipContent).toBe("Tooltip content");
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
