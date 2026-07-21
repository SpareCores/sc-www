import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NumbersOnlyDirective } from "./numbers-only.directive";

@Component({
  template: `
    <input id="decimal" appNumbersOnly />
    <input id="integer" appNumbersOnly [allowDecimal]="false" />
  `,
  imports: [NumbersOnlyDirective],
})
class HostComponent {}

describe("NumbersOnlyDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let decimalInput: HTMLInputElement;
  let integerInput: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    decimalInput = fixture.nativeElement.querySelector("#decimal");
    integerInput = fixture.nativeElement.querySelector("#integer");
  });

  function dispatchKey(input: HTMLInputElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    return event;
  }

  it("allows digits", () => {
    const event = dispatchKey(decimalInput, "5");
    expect(event.defaultPrevented).toBeFalse();
  });

  it("allows one decimal point when decimals are enabled", () => {
    decimalInput.value = "12";
    decimalInput.setSelectionRange(2, 2);
    const event = dispatchKey(decimalInput, ".");
    expect(event.defaultPrevented).toBeFalse();
  });

  it("rejects a second decimal point", () => {
    decimalInput.value = "12.3";
    decimalInput.setSelectionRange(4, 4);
    const event = dispatchKey(decimalInput, ".");
    expect(event.defaultPrevented).toBeTrue();
  });

  it("rejects exponential and alphabetical characters", () => {
    expect(dispatchKey(decimalInput, "e").defaultPrevented).toBeTrue();
    expect(dispatchKey(decimalInput, "E").defaultPrevented).toBeTrue();
    expect(dispatchKey(decimalInput, "a").defaultPrevented).toBeTrue();
    expect(dispatchKey(decimalInput, "+").defaultPrevented).toBeTrue();
    expect(dispatchKey(decimalInput, "-").defaultPrevented).toBeTrue();
  });

  it("rejects decimal points when decimals are disabled", () => {
    integerInput.value = "12";
    integerInput.setSelectionRange(2, 2);
    expect(dispatchKey(integerInput, ".").defaultPrevented).toBeTrue();
  });

  it("blocks invalid paste content", () => {
    const event = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: new DataTransfer(),
    });
    event.clipboardData?.setData("text", "1e2");
    decimalInput.dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
  });

  it("allows valid paste content", () => {
    const event = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: new DataTransfer(),
    });
    event.clipboardData?.setData("text", "12.5");
    decimalInput.dispatchEvent(event);
    expect(event.defaultPrevented).toBeFalse();
  });
});
