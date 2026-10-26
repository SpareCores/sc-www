import { Component, viewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InlineDropdown } from "./inline-dropdown";

@Component({
  template: `
    <button
      id="trigger"
      [scInlineDropdown]="panel"
      #dropdown="scInlineDropdown"
    >
      Open dropdown
    </button>
    <div #panel id="panel" [hidden]="!dropdown.isOpen()">
      <a id="first" href="/first">First</a>
    </div>
    <button id="outside">Outside</button>
  `,
  imports: [InlineDropdown],
})
class HostComponent {
  dropdown = viewChild.required<InlineDropdown>("dropdown");
}

describe("InlineDropdown", () => {
  let fixture: ComponentFixture<HostComponent>;
  let trigger: HTMLButtonElement;
  let panel: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    trigger = fixture.nativeElement.querySelector("#trigger");
    panel = fixture.nativeElement.querySelector("#panel");
  });

  function mouseClick(element: HTMLElement) {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 1 }),
    );
  }

  it("renders the panel hidden until the trigger is clicked", async () => {
    expect(panel.hidden).toBeTrue();

    mouseClick(trigger);
    await fixture.whenStable();

    expect(panel.hidden).toBeFalse();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBe("true");
  });

  it("closes on an outside click", async () => {
    mouseClick(trigger);
    mouseClick(fixture.nativeElement.querySelector("#outside"));
    await fixture.whenStable();

    expect(panel.hidden).toBeTrue();
  });

  it("closes on Escape and focuses the trigger", async () => {
    mouseClick(trigger);
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await fixture.whenStable();

    expect(panel.hidden).toBeTrue();
    expect(document.activeElement).toBe(trigger);
  });

  it("focuses the first item when opened from the keyboard", async () => {
    trigger.click();
    await fixture.whenStable();

    expect(document.activeElement?.id).toBe("first");
  });

  it("closes when focus leaves the trigger and panel", async () => {
    mouseClick(trigger);
    fixture.nativeElement.querySelector("#outside").focus();
    await fixture.whenStable();

    expect(fixture.componentInstance.dropdown().isOpen()).toBeFalse();
  });
});
