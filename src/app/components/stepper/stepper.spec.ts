import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Stepper } from "./stepper";

describe("Stepper", () => {
  let component: Stepper;
  let fixture: ComponentFixture<Stepper>;

  const buttons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll("button"));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stepper],
    }).compileComponents();

    fixture = TestBed.createComponent(Stepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("emits decrement and increment on click", () => {
    const decrement = jasmine.createSpy("decrement");
    const increment = jasmine.createSpy("increment");
    component.decrement.subscribe(decrement);
    component.increment.subscribe(increment);

    const [minus, plus] = buttons();
    minus.click();
    plus.click();

    expect(decrement).toHaveBeenCalledTimes(1);
    expect(increment).toHaveBeenCalledTimes(1);
  });

  it("disables the buttons at the limits", () => {
    fixture.componentRef.setInput("canDecrement", false);
    fixture.componentRef.setInput("canIncrement", false);
    fixture.detectChanges();

    const [minus, plus] = buttons();
    expect(minus.disabled).toBeTrue();
    expect(plus.disabled).toBeTrue();
  });

  it("repeats while pressed and stops on release", () => {
    jasmine.clock().install();
    const increment = jasmine.createSpy("increment");
    component.increment.subscribe(increment);
    const [, plus] = buttons();

    plus.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));
    expect(increment).toHaveBeenCalledTimes(1);

    jasmine.clock().tick(400 + 75 * 2);
    expect(increment).toHaveBeenCalledTimes(3);

    plus.dispatchEvent(new PointerEvent("pointerup"));
    jasmine.clock().tick(75 * 4);
    expect(increment).toHaveBeenCalledTimes(3);
    jasmine.clock().uninstall();
  });

  it("stops repeating at the limit", () => {
    jasmine.clock().install();
    const decrement = jasmine.createSpy("decrement");
    component.decrement.subscribe(decrement);
    const [minus] = buttons();

    minus.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));
    fixture.componentRef.setInput("canDecrement", false);
    jasmine.clock().tick(400 + 75 * 3);

    expect(decrement).toHaveBeenCalledTimes(1);
    jasmine.clock().uninstall();
  });
});
