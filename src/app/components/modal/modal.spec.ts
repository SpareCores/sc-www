import { DialogRef } from "@angular/cdk/dialog";
import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Modal } from "./modal";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

@Component({
  template: `
    <sc-modal
      title="Shell title"
      size="3xl"
      closeCaptureEvent="test close"
      [closeDisabled]="closeDisabled()"
    >
      @if (withSidebar()) {
        <nav modalSidebar id="sidebar">Sidebar</nav>
      }
      <p id="body">Body</p>
      @if (withFooter()) {
        <div modalFooter id="footer">Footer</div>
      }
    </sc-modal>
  `,
  imports: [Modal],
})
class HostComponent {
  closeDisabled = signal(false);
  withSidebar = signal(true);
  withFooter = signal(true);
}

describe("Modal", () => {
  let fixture: ComponentFixture<HostComponent>;
  let close: jasmine.Spy;

  beforeEach(async () => {
    close = jasmine.createSpy("close");

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        ...sharedTestingProviders,
        { provide: DialogRef, useValue: { id: "dialog-1", close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function closeButton(): HTMLButtonElement {
    return element().querySelector(
      'sc-button[data-ph-capture-attribute-sc-event="test close"] button',
    ) as HTMLButtonElement;
  }

  it("renders the title, sidebar, body and footer", () => {
    expect(element().querySelector("#dialog-1-title")?.textContent).toContain(
      "Shell title",
    );
    expect(element().querySelector("#sidebar")).not.toBeNull();
    expect(element().querySelector("#body")).not.toBeNull();
    expect(element().querySelector("#footer")).not.toBeNull();
    expect(element().querySelector(".max-w-3xl")).not.toBeNull();
  });

  it("projects the sidebar next to the body instead of into it", () => {
    const sidebarSlot = element().querySelector("#sidebar")?.parentElement;
    const bodySlot = element().querySelector("#body")?.parentElement;

    expect(sidebarSlot).toBeTruthy();
    expect(sidebarSlot).not.toBe(bodySlot);
    expect(sidebarSlot?.parentElement).toBe(bodySlot?.parentElement ?? null);
  });

  it("leaves the sidebar and footer slots empty without content", () => {
    const sidebarSlot = element().querySelector("#sidebar")?.parentElement;
    const footerSlot = element().querySelector("#footer")?.parentElement;

    fixture.componentInstance.withSidebar.set(false);
    fixture.componentInstance.withFooter.set(false);
    fixture.detectChanges();

    expect(sidebarSlot?.children.length).toBe(0);
    expect(footerSlot?.children.length).toBe(0);
  });

  it("closes the surrounding dialog from the close button", () => {
    closeButton().click();

    expect(close).toHaveBeenCalled();
  });

  it("disables the close button when closing is disabled", () => {
    fixture.componentInstance.closeDisabled.set(true);
    fixture.detectChanges();

    expect(closeButton().disabled).toBeTrue();
  });
});
