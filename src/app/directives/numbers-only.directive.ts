import { Directive, HostListener, input } from "@angular/core";

const DECIMAL_PATTERN = /^\d*\.?\d*$/;
const INTEGER_PATTERN = /^\d*$/;

@Directive({
  selector: "[appNumbersOnly]",
})
export class NumbersOnlyDirective {
  allowDecimal = input(true);

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const key = event.key;
    if (key.length !== 1) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const nextValue = this.previewValue(input, key);
    if (!this.isAllowedValue(nextValue)) {
      event.preventDefault();
    }
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
}
