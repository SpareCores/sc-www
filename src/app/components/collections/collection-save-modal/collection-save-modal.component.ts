import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Modal, ModalOptions } from "flowbite";
import { Button } from "../../button/button";
import {
  SAVED_NOTE_MAX_LENGTH,
  isValidSavedName,
} from "../../../collections/collections.utils";

export type CollectionSaveModalMode = "create" | "edit";

const modalOptions: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

@Component({
  selector: "sc-collection-save-modal",
  imports: [FormsModule, Button],
  templateUrl: "./collection-save-modal.html",
  styleUrl: "./collection-save-modal.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionSaveModalComponent implements OnDestroy {
  modalId = input.required<string>();
  title = input.required<string>();
  nameLabel = input("Name");
  notesLabel = input("Notes");
  confirmLabel = input("Confirm");
  initialName = input("");
  initialNote = input("");
  saving = input(false);

  confirmed = output<{ name: string; note?: string }>();
  closed = output<void>();

  protected name = signal("");
  protected note = signal("");

  private platformId = inject(PLATFORM_ID);
  private flowbiteModal: Modal | null = null;
  private modalElement = viewChild<ElementRef<HTMLElement>>("modalRoot");

  protected readonly noteMaxLength = SAVED_NOTE_MAX_LENGTH;

  protected canConfirm = (): boolean => isValidSavedName(this.name());

  ngOnDestroy(): void {
    this.flowbiteModal?.hide();
    this.flowbiteModal = null;
  }

  open(initialName = "", initialNote = ""): void {
    this.name.set(initialName);
    this.note.set(initialNote ?? "");
    this.ensureModal()?.show();
  }

  close(): void {
    this.flowbiteModal?.hide();
  }

  confirm(): void {
    if (!this.canConfirm() || this.saving()) {
      return;
    }

    const trimmedNote = this.note().trim();
    this.confirmed.emit({
      name: this.name().trim(),
      note: trimmedNote ? trimmedNote : undefined,
    });
  }

  private ensureModal(): Modal | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    if (!this.flowbiteModal) {
      const modalElement = this.modalElement()?.nativeElement;
      if (!modalElement) {
        return null;
      }

      this.flowbiteModal = new Modal(
        modalElement,
        {
          ...modalOptions,
          onHide: () => {
            this.closed.emit();
          },
        },
        {
          id: this.modalId(),
          override: true,
        },
      );
    }

    return this.flowbiteModal;
  }
}
