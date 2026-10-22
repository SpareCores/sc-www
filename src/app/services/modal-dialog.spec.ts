import { DialogRef } from "@angular/cdk/dialog";
import { OverlayContainer } from "@angular/cdk/overlay";
import { Component, TemplateRef, inject, viewChild } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from "@angular/core/testing";
import { Modal } from "../components/modal/modal";
import { ModalDialog } from "./modal-dialog";
import { sharedTestingProviders } from "../../testing/testbed.providers";

@Component({
  template: `
    <button id="opener" (click)="open()">Open</button>
    <ng-template #modalTemplate>
      <sc-modal id="test-modal" title="Test title">
        <p id="modal-body">Body</p>
      </sc-modal>
    </ng-template>
  `,
  imports: [Modal],
})
class HostComponent {
  private modalDialog = inject(ModalDialog);
  modalTemplate = viewChild.required<TemplateRef<unknown>>("modalTemplate");
  dialogRef: DialogRef | null = null;

  open() {
    this.dialogRef = this.modalDialog.open(this.modalTemplate());
  }
}

describe("ModalDialog", () => {
  let fixture: ComponentFixture<HostComponent>;
  let container: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    container = TestBed.inject(OverlayContainer).getContainerElement();
  });

  function openModal(): HTMLElement {
    const opener = fixture.nativeElement.querySelector(
      "#opener",
    ) as HTMLButtonElement;
    opener.focus();
    opener.click();
    fixture.detectChanges();
    return opener;
  }

  it("renders the modal shell in the top overlay layer", () => {
    openModal();

    expect(container.querySelector("#test-modal #modal-body")).not.toBeNull();
    expect(container.querySelector(".sc-modal-backdrop")).not.toBeNull();
    expect(container.classList).not.toContain("sc-page-overlay-container");
  });

  it("labels the dialog with the modal title", () => {
    openModal();

    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    const labelId = dialog.getAttribute("aria-labelledby");

    expect(labelId).toBeTruthy();
    expect(container.querySelector(`#${labelId}`)?.textContent).toContain(
      "Test title",
    );
  });

  it("closes from the shell close button", fakeAsync(() => {
    openModal();

    (
      container.querySelector(
        'sc-button[ariaLabel="Close modal"] button',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    flush();

    expect(container.querySelector("#test-modal")).toBeNull();
  }));

  it("closes on Escape and restores focus to the opener", fakeAsync(() => {
    const opener = openModal();
    flush();

    document.body.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        keyCode: 27,
        bubbles: true,
      }),
    );
    fixture.detectChanges();
    flush();

    expect(container.querySelector("#test-modal")).toBeNull();
    expect(document.activeElement).toBe(opener);
  }));

  it("closes on a backdrop click", fakeAsync(() => {
    openModal();

    (container.querySelector(".sc-modal-backdrop") as HTMLElement).click();
    fixture.detectChanges();
    flush();

    expect(container.querySelector("#test-modal")).toBeNull();
  }));

  it("keeps the modal open on Escape when close is disabled", fakeAsync(() => {
    const component = fixture.componentInstance;
    component.dialogRef = TestBed.inject(ModalDialog).open(
      component.modalTemplate(),
      { disableClose: true },
    );
    fixture.detectChanges();

    document.body.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        keyCode: 27,
        bubbles: true,
      }),
    );
    fixture.detectChanges();
    flush();

    expect(container.querySelector("#test-modal")).not.toBeNull();
    component.dialogRef.close();
    flush();
  }));
});
