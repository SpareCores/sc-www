import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";

import { NumberStepper } from "./number-stepper";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("NumberStepper", () => {
  let component: NumberStepper;
  let fixture: ComponentFixture<NumberStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberStepper],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberStepper);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("value", 50);
    fixture.componentRef.setInput("label", "width");
    fixture.componentRef.setInput("min", 10);
    fixture.componentRef.setInput("max", 100);
    fixture.componentRef.setInput("step", 5);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should increment and decrement by step within bounds", () => {
    component.increment();
    expect(component.value()).toBe(55);
    component.decrement();
    component.decrement();
    expect(component.value()).toBe(45);

    fixture.componentRef.setInput("value", 98);
    component.increment();
    expect(component.value()).toBe(100);
  });

  it("should reject non-digit input", () => {
    const field: HTMLInputElement =
      fixture.nativeElement.querySelector("input");
    const typed = new InputEvent("beforeinput", {
      data: "a",
      inputType: "insertText",
      cancelable: true,
    });

    field.dispatchEvent(typed);

    expect(typed.defaultPrevented).toBeTrue();
  });

  it("should apply in-range input and clamp on commit", () => {
    const field: HTMLInputElement =
      fixture.nativeElement.querySelector("input");

    field.value = "70";
    field.dispatchEvent(new Event("input"));
    expect(component.value()).toBe(70);

    field.value = "250";
    field.dispatchEvent(new Event("input"));
    expect(component.value()).toBe(70);
    field.dispatchEvent(new Event("blur"));
    expect(component.value()).toBe(100);
    expect(field.value).toBe("100");
  });

  it("should keep stepping while a button is held down", fakeAsync(() => {
    const [, increase]: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll("sc-button"),
    );

    increase.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));
    tick(400 + 75 * 2);
    increase.dispatchEvent(new PointerEvent("pointerup", { button: 0 }));
    tick(1000);

    expect(component.value()).toBe(65);
  }));
});
