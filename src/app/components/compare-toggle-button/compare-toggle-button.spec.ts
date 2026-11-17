import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CompareToggleButton } from "./compare-toggle-button";
import { CompareSelection } from "../../services/compare-selection";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("CompareToggleButton", () => {
  const isResourceSelected = jasmine.createSpy("isResourceSelected");
  const toggleResourceCompare = jasmine.createSpy("toggleResourceCompare");
  let component: CompareToggleButton;
  let fixture: ComponentFixture<CompareToggleButton>;

  beforeEach(async () => {
    isResourceSelected.calls.reset();
    toggleResourceCompare.calls.reset();
    isResourceSelected.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [CompareToggleButton],
      providers: [
        ...sharedTestingProviders,
        {
          provide: CompareSelection,
          useValue: { isResourceSelected, toggleResourceCompare },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareToggleButton);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("resource", "server");
    fixture.componentRef.setInput("vendorId", "aws");
    fixture.componentRef.setInput("entityId", "m5.large");
    fixture.componentRef.setInput("displayName", "m5.large");
    fixture.detectChanges();
  });

  it("labels the button by the selection state", () => {
    expect(component.label()).toBe("Compare");

    isResourceSelected.and.returnValue(true);

    expect(component.label()).toBe("Don't Compare");
  });

  it("toggles the resource in the compare selection", () => {
    component.toggle();

    expect(toggleResourceCompare).toHaveBeenCalledWith(
      "server",
      "aws",
      "m5.large",
      "m5.large",
    );
  });
});
