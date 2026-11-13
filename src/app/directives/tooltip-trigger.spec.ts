import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { UiTooltip } from "../services/ui-tooltip";
import { TooltipTrigger, TooltipTriggerMode } from "./tooltip-trigger";

@Component({
  imports: [TooltipTrigger],
  template: `
    <div (click)="parentClicks.set(parentClicks() + 1)">
      <span
        id="trigger"
        scTooltipTrigger
        [tooltipMode]="mode()"
        (tooltipOpen)="open($event)"
        (tooltipClose)="close()"
      ></span>
    </div>
  `,
})
class TooltipHost {
  readonly mode = signal<TooltipTriggerMode>("info");
  readonly parentClicks = signal(0);
  readonly opens: Element[] = [];
  closes = 0;
  private panel = document.createElement("div");
  private uiTooltip: UiTooltip | null = null;

  setTooltip(uiTooltip: UiTooltip) {
    this.uiTooltip = uiTooltip;
  }

  open(anchor: Element) {
    this.opens.push(anchor);
    this.uiTooltip?.show(this.panel, anchor);
  }

  close() {
    this.closes++;
    this.uiTooltip?.hide(this.panel);
  }
}

function pointer(type: string, pointerType: string): PointerEvent {
  return new PointerEvent(type, { pointerType });
}

describe("TooltipTrigger", () => {
  let fixture: ComponentFixture<TooltipHost>;
  let host: TooltipHost;
  let trigger: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TooltipHost] });
    fixture = TestBed.createComponent(TooltipHost);
    host = fixture.componentInstance;
    host.setTooltip(TestBed.inject(UiTooltip));
    fixture.detectChanges();
    trigger = fixture.debugElement.query(By.css("#trigger")).nativeElement;
  });

  afterEach(() => {
    host.close();
  });

  it("makes non-focusable info hosts focusable buttons", () => {
    expect(trigger.getAttribute("tabindex")).toBe("0");
    expect(trigger.getAttribute("role")).toBe("button");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens and closes on mouse hover", () => {
    trigger.dispatchEvent(pointer("pointerenter", "mouse"));
    expect(host.opens).toEqual([trigger]);

    trigger.dispatchEvent(pointer("pointerleave", "mouse"));
    expect(host.closes).toBe(1);
  });

  it("ignores touch hover and toggles on tap", () => {
    trigger.dispatchEvent(pointer("pointerenter", "touch"));
    expect(host.opens.length).toBe(0);

    trigger.click();
    fixture.detectChanges();
    expect(host.opens.length).toBe(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    trigger.dispatchEvent(pointer("pointerleave", "touch"));
    expect(host.closes).toBe(0);

    trigger.click();
    expect(host.closes).toBe(1);
  });

  it("keeps a hover-opened tooltip open on click", () => {
    trigger.dispatchEvent(pointer("pointerenter", "mouse"));
    trigger.click();

    expect(host.opens.length).toBe(1);
    expect(host.closes).toBe(0);
  });

  it("stops info clicks from reaching ancestors", () => {
    trigger.click();

    expect(host.parentClicks()).toBe(0);
  });

  it("leaves clicks alone in action mode", () => {
    host.mode.set("action");
    fixture.detectChanges();

    trigger.click();

    expect(host.opens.length).toBe(0);
    expect(host.parentClicks()).toBe(1);
    expect(trigger.hasAttribute("tabindex")).toBeFalse();
    expect(trigger.hasAttribute("aria-expanded")).toBeFalse();
  });
});
