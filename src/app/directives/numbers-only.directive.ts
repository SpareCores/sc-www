import { Directive, HostListener, input } from "@angular/core";

const DECIMAL_PATTERN = /^\d*\.?\d*$/;
const INTEGER_PATTERN = /^\d*$/;

@Directive({
  selector: "[appNumbersOnly]",
})
export class NumbersOnlyDirective {
  allowDecimal = input(true);
  private lastValidValue = "";

  @HostListener("beforeinput", ["$event"])
  onBeforeInput(event: InputEvent): void {
    const input = event.target as HTMLInputElement;
    this.syncLastValidValue(input);

    if (event.inputType.startsWith("delete")) {
      return;
    }

    const insertion = event.data;
    if (insertion === null) {
      return;
    }

    const nextValue = this.previewValue(input, insertion);
    if (!this.isAllowedValue(nextValue)) {
      event.preventDefault();
    }
  }

  @HostListener("input", ["$event"])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isAllowedValue(input.value)) {
      this.lastValidValue = input.value;
      return;
    }

    input.value = this.lastValidValue;
    const caretPosition = this.lastValidValue.length;
    input.setSelectionRange(caretPosition, caretPosition);
  }

  @HostListener("paste", ["$event"])
  onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData("text") ?? "";
    const input = event.target as HTMLInputElement;
    const nextValue = this.previewValue(input, pasted);
    if (!this.isAllowedValue(nextValue)) {
      event.preventDefault();
    }
  }

  @HostListener("drop", ["$event"])
  onDrop(event: DragEvent): void {
    const dropped = event.dataTransfer?.getData("text") ?? "";
    const input = event.target as HTMLInputElement;
    const nextValue = this.previewValue(input, dropped);
    if (!this.isAllowedValue(nextValue)) {
      event.preventDefault();
    }
  }

  private isAllowedValue(value: string): boolean {
    const pattern = this.allowDecimal() ? DECIMAL_PATTERN : INTEGER_PATTERN;
    return pattern.test(value);
  }

  private previewValue(input: HTMLInputElement, insertion: string): string {
    const value = input.value ?? "";
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    return value.slice(0, start) + insertion + value.slice(end);
  }

  private syncLastValidValue(input: HTMLInputElement): void {
    if (this.isAllowedValue(input.value)) {
      this.lastValidValue = input.value;
    }
  }
}
