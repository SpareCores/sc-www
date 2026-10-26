import { OverlayContainer } from "@angular/cdk/overlay";
import { Component, signal, viewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PageOverlayContainer } from "../services/overlay/page-overlay-container";
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

describe("Dropdown", () => {
  let fixture: ComponentFixture<HostComponent>;
  let trigger: HTMLButtonElement;
  let pageContainer: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector("#trigger");
    pageContainer = TestBed.inject(PageOverlayContainer).getContainerElement();
  });

  function panel(): HTMLElement | null {
    return pageContainer.querySelector("#panel");
  }

  it("opens the panel in the page overlay container on click", () => {
    trigger.click();
    fixture.detectChanges();

    expect(panel()).not.toBeNull();
    expect(pageContainer.classList).toContain("sc-page-overlay-container");
    expect(
      TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector("#panel"),
    ).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBe("true");
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
