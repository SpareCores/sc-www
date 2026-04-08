import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchBarComponent } from "./search-bar.component";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("SearchBarComponent", () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the shared tooltip service for parameter descriptions", () => {
    const tooltipService = TestBed.inject(UiTooltipService);
    const showSpy = spyOn(tooltipService, "show");
    const hideSpy = spyOn(tooltipService, "hide");
    const target = document.createElement("button");

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
        top: "anchor-below",
      },
    );

    component.hideTooltip();

    expect(hideSpy).toHaveBeenCalledOnceWith(component.tooltip.nativeElement);
  });
});
