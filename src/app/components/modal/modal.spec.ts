import { DialogRef } from "@angular/cdk/dialog";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Modal } from "./modal";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

@Component({
  template: `
    <sc-modal title="Shell title" size="3xl" closeCaptureEvent="test close">
      <p id="body">Body</p>
      <div modalFooter id="footer">Footer</div>
    </sc-modal>
  `,
  imports: [Modal],
})
class HostComponent {}

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

  it("renders the title, body and footer", () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector("#dialog-1-title")?.textContent).toContain(
      "Shell title",
    );
    expect(element.querySelector("#body")).not.toBeNull();
    expect(element.querySelector("#footer")).not.toBeNull();
    expect(element.querySelector(".max-w-3xl")).not.toBeNull();
  });

  it("closes the surrounding dialog from the close button", () => {
    const element = fixture.nativeElement as HTMLElement;
    const closeButton = element.querySelector(
      'sc-button[data-ph-capture-attribute-sc-event="test close"] button',
    ) as HTMLButtonElement;

    closeButton.click();

    expect(close).toHaveBeenCalled();
  });
});
