import { DialogRef } from "@angular/cdk/dialog";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { FilterModal } from "./filter-modal";

describe("FilterModal", () => {
  let component: FilterModal;
  let fixture: ComponentFixture<FilterModal>;
  let close: jasmine.Spy;

  beforeEach(async () => {
    close = jasmine.createSpy("close");

    await TestBed.configureTestingModule({
      imports: [FilterModal],
      providers: [
        ...sharedTestingProviders,
        { provide: DialogRef, useValue: { id: "dialog-1", close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("searchParameters", []);
    fixture.componentRef.setInput("activeFilterCount", 2);
    fixture.detectChanges();
  });

  function button(event: string): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector(
      `sc-button[data-ph-capture-attribute-sc-event="${event}"] button`,
    ) as HTMLButtonElement;
  }

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("closes the dialog on Apply", () => {
    button("filter modal apply").click();

    expect(close).toHaveBeenCalled();
  });

  it("emits clearAll on Clear all", () => {
    const clearAll = spyOn(component.clearAll, "emit");

    button("filter modal clear").click();

    expect(clearAll).toHaveBeenCalled();
  });

  it("disables Apply with the reason when one is given", () => {
    fixture.componentRef.setInput(
      "applyDisabledReason",
      "Fill in the required fields first.",
    );
    fixture.detectChanges();

    expect(button("filter modal apply").disabled).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "Fill in the required fields first.",
    );
  });
});
