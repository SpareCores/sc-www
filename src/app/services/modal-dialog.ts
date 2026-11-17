import { Dialog, DialogRef } from "@angular/cdk/dialog";
import {
  DestroyRef,
  Injectable,
  Signal,
  TemplateRef,
  effect,
  inject,
  untracked,
} from "@angular/core";
import { modalTitleId } from "../components/modals/modal/modal";
import { DROPDOWN_LAYER } from "./overlay/dropdown-layer";

export interface ModalDialogOptions<D> {
  data?: D;
  ariaLabel?: string;
  autoFocus?: string;
  disableClose?: boolean;
  closeOnNavigation?: boolean;
  panelClass?: string;
}

export interface ModalDialogBinding {
  open: Signal<boolean>;
  template: Signal<TemplateRef<unknown> | undefined>;
  canClose: () => boolean;
  closed: () => void;
  reset?: () => void;
  closeOnNavigation?: boolean;
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
      closeOnNavigation: options.closeOnNavigation ?? true,
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

  bind(binding: ModalDialogBinding): void {
    let dialogRef: DialogRef | null = null;

    const requestClose = () => {
      if (binding.canClose()) {
        dialogRef?.close();
      }
    };

    effect(() => {
      const open = binding.open();
      const template = binding.template();
      untracked(() => {
        if (!open) {
          dialogRef?.close();
          binding.reset?.();
          return;
        }
        if (!template || dialogRef) {
          return;
        }
        const ref = this.open(template, {
          disableClose: true,
          closeOnNavigation: binding.closeOnNavigation,
        });
        ref.backdropClick.subscribe(requestClose);
        ref.keydownEvents.subscribe((event) => {
          if (event.key === "Escape") {
            requestClose();
          }
        });
        ref.closed.subscribe(() => {
          dialogRef = null;
          if (binding.open()) {
            binding.closed();
          }
        });
        dialogRef = ref;
      });
    });

    inject(DestroyRef).onDestroy(() => dialogRef?.close());
  }
}
