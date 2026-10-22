import { DialogRef } from "@angular/cdk/dialog";
import { Component, computed, inject, input } from "@angular/core";
import { Button } from "../button/button";

export type ModalSize = "lg" | "xl" | "3xl" | "4xl" | "wide" | "full";

const SIZE_CLASSES: Record<ModalSize, string> = {
  lg: "max-w-lg",
  xl: "max-w-xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  wide: "max-w-350",
  full: "max-w-full",
};

export function modalTitleId(dialogId: string): string {
  return `${dialogId}-title`;
}

@Component({
  selector: "sc-modal",
  imports: [Button],
  templateUrl: "./modal.html",
  host: {
    class: "block",
  },
})
export class Modal {
  private dialogRef = inject(DialogRef, { optional: true });

  title = input("");
  size = input<ModalSize>("xl");
  showClose = input(true);
  closeCaptureEvent = input<string | null>(null);
  closeCaptureAction = input<string | null>(null);

  protected readonly titleId = this.dialogRef
    ? modalTitleId(this.dialogRef.id)
    : null;
  protected readonly sizeClass = computed(() => SIZE_CLASSES[this.size()]);

  close() {
    this.dialogRef?.close();
  }
}
