import { Dialog, DialogRef } from "@angular/cdk/dialog";
import { Injectable, TemplateRef, inject } from "@angular/core";
import { modalTitleId } from "../components/modal/modal";
import { DROPDOWN_LAYER } from "./overlay/dropdown-layer";

export interface ModalDialogOptions<D> {
  data?: D;
  ariaLabel?: string;
  autoFocus?: string;
  disableClose?: boolean;
  panelClass?: string;
}

let nextModalId = 0;

@Injectable({
  providedIn: "root",
})
export class ModalDialog {
  private dialog = inject(Dialog);

  open<R = unknown, D = unknown, C = unknown>(
    templateRef: TemplateRef<C>,
    options: ModalDialogOptions<D> = {},
  ): DialogRef<R, C> {
    const id = `sc-modal-${nextModalId++}`;

    return this.dialog.open<R, D, C>(templateRef, {
      id,
      data: options.data,
      disableClose: options.disableClose ?? false,
      hasBackdrop: true,
      backdropClass: "sc-modal-backdrop",
      panelClass: options.panelClass ?? "",
      ariaLabel: options.ariaLabel ?? null,
      ariaLabelledBy: options.ariaLabel ? null : modalTitleId(id),
      autoFocus: options.autoFocus ?? "dialog",
      restoreFocus: true,
      providers: [{ provide: DROPDOWN_LAYER, useValue: "top" }],
    });
  }
}
