import { DialogRef } from "@angular/cdk/dialog";

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";

import { FormsModule } from "@angular/forms";

import { Button } from "../../button/button";

import { Modal } from "../../modal/modal";

import { ModalDialog } from "../../../services/modal-dialog";

import {
  SAVED_NAME_MIN_LENGTH,
  SAVED_NOTE_MAX_LENGTH,
  isValidSavedName,
} from "../../../collections/collections.utils";

export type CollectionSaveModalMode = "create" | "edit";

@Component({
  selector: "sc-collection-save-modal",
  imports: [FormsModule, Button, Modal],
  templateUrl: "./collection-save-modal.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionSaveModal implements OnDestroy {
  modalId = input.required<string>();
  title = input.required<string>();
  nameLabel = input("Name");
  notesLabel = input("Notes");
  confirmLabel = input("Confirm");
  initialName = input("");
  initialNote = input("");
  saving = input(false);
  confirmed = output<{ name: string; note: string }>();
  closed = output<void>();

  protected name = signal("");
  protected note = signal("");
  protected nameTouched = signal(false);

  private modalDialog = inject(ModalDialog);
  private injector = inject(Injector);
  private dialogRef: DialogRef | null = null;
  private modalTemplate =
    viewChild.required<TemplateRef<unknown>>("modalTemplate");
  private nameInput = viewChild<ElementRef<HTMLInputElement>>("nameInput");

  protected readonly nameMinLength = SAVED_NAME_MIN_LENGTH;
  protected readonly noteMaxLength = SAVED_NOTE_MAX_LENGTH;

  protected canConfirm = (): boolean => isValidSavedName(this.name());

  protected showNameWarning = (): boolean =>
    this.nameTouched() && !isValidSavedName(this.name());

  ngOnDestroy(): void {
    this.dialogRef?.close();
  }

  open(initialName = "", initialNote = ""): void {
    this.name.set(initialName);
    this.note.set(initialNote ?? "");
    this.nameTouched.set(false);

    if (!this.dialogRef) {
      const dialogRef = this.modalDialog.open(this.modalTemplate(), {
        autoFocus: "input",
      });
      dialogRef.closed.subscribe(() => {
        this.dialogRef = null;
        this.closed.emit();
      });
      this.dialogRef = dialogRef;
    }

    this.selectNameInput();
  }

  close(): void {
    this.dialogRef?.close();
  }

  confirm(): void {
    this.nameTouched.set(true);
    if (!this.canConfirm() || this.saving()) {
      return;
    }

    this.confirmed.emit({
      name: this.name().trim(),
      note: this.note().trim(),
    });
  }

  protected onNameChange(value: string): void {
    this.nameTouched.set(true);
    this.name.set(value);
  }

  protected onNameEnter(event: Event): void {
    event.preventDefault();
    this.confirm();
  }

  private selectNameInput(): void {
    afterNextRender(
      () => {
        this.nameInput()?.nativeElement.focus();
        this.nameInput()?.nativeElement.select();
      },
      { injector: this.injector },
    );
  }
}
