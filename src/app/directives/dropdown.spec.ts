import { OverlayContainer } from "@angular/cdk/overlay";
import { Component, signal, viewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DROPDOWN_LAYER } from "../services/overlay/dropdown-layer";
import { Dropdown } from "./dropdown";

@Component({
  template: `
    <button
      id="trigger"
      [scDropdown]="panel"
      [dropdownEnabled]="enabled()"
      #dropdown="scDropdown"
    >
      Open dropdown
    </button>
    <button id="outside">Outside</button>
    <ng-template #panel>
      <div id="panel">
        <a id="first" href="/first">First</a>
        <a id="last" href="/last">Last</a>
      </div>
    </ng-template>
  `,
  imports: [Dropdown],
})
class HostComponent {
  enabled = signal(true);
  dropdown = viewChild.required<Dropdown>("dropdown");
}

@Component({
  template: `
    <button id="top_trigger" [scDropdown]="panel">Open dropdown</button>
    <ng-template #panel><div id="top_panel">Panel</div></ng-template>
  `,
  imports: [Dropdown],
  providers: [{ provide: DROPDOWN_LAYER, useValue: "top" }],
})
class TopLayerHostComponent {}

describe("Dropdown", () => {
  let fixture: ComponentFixture<HostComponent>;
  let trigger: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector("#trigger");
  });

  function panel(): HTMLElement | null {
    return document.querySelector("#panel");
  }

  it("opens the panel in a page-level panel host on click", () => {
    trigger.click();
    fixture.detectChanges();

    expect(panel()?.parentElement?.classList).toContain("sc-dropdown-panel");
    expect(panel()?.closest(".cdk-overlay-container")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBe("true");
  });

  it("positions the panel below the trigger in page coordinates", () => {
    fixture.componentInstance.dropdown().open();

    const host = panel()!.parentElement!;
    const triggerRect = trigger.getBoundingClientRect();

    expect(parseFloat(host.style.top)).toBeCloseTo(
      triggerRect.bottom + 10 + window.scrollY,
      0,
    );
  });

  it("keeps the top layer on the CDK overlay", () => {
    const topFixture = TestBed.createComponent(TopLayerHostComponent);
    topFixture.detectChanges();

    topFixture.nativeElement.querySelector("#top_trigger").click();
    topFixture.detectChanges();

    expect(
      TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector("#top_panel"),
    ).not.toBeNull();
  });

  it("closes on a second trigger click", () => {
    trigger.click();
    trigger.click();
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on an outside click", () => {
    trigger.click();
    fixture.detectChanges();

    const outside = fixture.nativeElement.querySelector("#outside");
    outside.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    fixture.detectChanges();

    expect(panel()).toBeNull();
  });

  it("closes on Escape and focuses the trigger", () => {
    trigger.click();
    fixture.detectChanges();

    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("does not open while disabled", () => {
    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();

    expect(panel()).toBeNull();
  });

  it("closes when it becomes disabled", () => {
    trigger.click();
    fixture.detectChanges();

    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();

    expect(panel()).toBeNull();
  });

  it("supports programmatic hide and toggle", () => {
    const dropdown = fixture.componentInstance.dropdown();

    dropdown.toggle();
    fixture.detectChanges();
    expect(dropdown.isOpen()).toBeTrue();
    expect(panel()).not.toBeNull();

    dropdown.hide();
    fixture.detectChanges();
    expect(dropdown.isOpen()).toBeFalse();
    expect(panel()).toBeNull();
  });

  it("focuses the first item when opened from the keyboard", async () => {
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement?.id).toBe("first");
  });

  it("keeps focus on the trigger when opened with the mouse", async () => {
    trigger.focus();
    trigger.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 1 }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(panel()).not.toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes and focuses the trigger on Tab from the last item", async () => {
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const last = panel()!.querySelector<HTMLElement>("#last")!;
    last.focus();
    last.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("emits dropdownOpened when the panel opens", () => {
    const dropdown = fixture.componentInstance.dropdown();
    const opened = jasmine.createSpy("opened");
    dropdown.dropdownOpened.subscribe(opened);

    dropdown.open();

    expect(opened).toHaveBeenCalledTimes(1);
  });
});
