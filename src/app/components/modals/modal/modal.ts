import { DialogRef } from "@angular/cdk/dialog";
import { Component, inject, input } from "@angular/core";
import { Button } from "../../button/button";

export type ModalSize = "sm" | "lg" | "xl" | "3xl" | "4xl" | "wide";

export function modalTitleId(dialogId: string): string {
  return `${dialogId}-title`;
}

@Component({
  selector: "sc-modal",
  imports: [Button],
  templateUrl: "./modal.html",
  styleUrl: "./modal.css",
  host: {
    class: "block",
  },
})
export class Modal {
  private dialogRef = inject(DialogRef, { optional: true });

  modalTitle = input("");
  size = input<ModalSize>("xl");
  centerTitle = input(false);
  showClose = input(true);
  closeLabel = input("Close modal");
  closeDisabled = input(false);
  closeCaptureEvent = input<string | null>(null);
  closeCaptureAction = input<string | null>(null);

  protected readonly titleId = this.dialogRef
    ? modalTitleId(this.dialogRef.id)
    : null;

  close() {
    this.dialogRef?.close();
  }
}
