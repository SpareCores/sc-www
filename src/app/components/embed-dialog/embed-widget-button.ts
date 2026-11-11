import { DialogRef } from "@angular/cdk/dialog";
import {
  Component,
  DestroyRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from "@angular/core";
import { ModalDialog } from "../../services/modal-dialog";
import { SeoHandler } from "../../services/seo-handler";
import { Button } from "../button/button";
import { Modal } from "../modal/modal";
import { EmbedDialog } from "./embed-dialog";
import { EmbedTarget, EmbedWidgetOption } from "./embed-dialog.types";
import { buildEmbedPreset, embedTargetKey } from "./embed-dialog.utils";

@Component({
  selector: "sc-embed-widget-button",
  imports: [Button, Modal, EmbedDialog],
  templateUrl: "./embed-widget-button.html",
})
export class EmbedWidgetButton {
  private modalDialog = inject(ModalDialog);
  private SEOHandler = inject(SeoHandler);

  target = input.required<EmbedTarget>();
  widgets = input<EmbedWidgetOption[]>([]);
  captureEvent = input<string | null>(null);

  opening = output<void>();

  readonly preset = computed(() =>
    buildEmbedPreset(this.target(), this.SEOHandler.getBaseURL()),
  );

  private modalTemplate =
    viewChild.required<TemplateRef<unknown>>("modalTemplate");
  private dialogRef: DialogRef | null = null;
  private targetKey = computed(() => embedTargetKey(this.target()));

  constructor() {
    effect(() => {
      this.targetKey();
      untracked(() => this.close());
    });

    inject(DestroyRef).onDestroy(() => this.close());
  }

  open() {
    if (this.dialogRef) {
      return;
    }

    this.opening.emit();
    this.dialogRef = this.modalDialog.open(this.modalTemplate());
    this.dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
    });
  }

  private close() {
    this.dialogRef?.close();
  }
}
