import { Component, DestroyRef, inject, input, output } from "@angular/core";
import { LucideMinus, LucidePlus } from "@lucide/angular";

const REPEAT_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 75;

type StepDirection = 1 | -1;

@Component({
  selector: "sc-stepper",
  imports: [LucideMinus, LucidePlus],
  templateUrl: "./stepper.html",
  host: {
    class: "sc-stepper",
  },
})
export class Stepper {
  canDecrement = input(true);
  canIncrement = input(true);
  dirty = input(false);
  controls = input<string | null>(null);
  decreaseLabel = input("Decrease value");
  increaseLabel = input("Increase value");
  captureEvent = input<string | null>(null);

  decrement = output<void>();
  increment = output<void>();

  private repeatDelay?: ReturnType<typeof setTimeout>;
  private repeatInterval?: ReturnType<typeof setInterval>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopRepeat());
  }

  startRepeat(direction: StepDirection, event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }
    this.stopRepeat();
    this.step(direction);
    this.repeatDelay = setTimeout(() => {
      this.repeatInterval = setInterval(() => {
        if (!this.step(direction)) {
          this.stopRepeat();
        }
      }, REPEAT_INTERVAL_MS);
    }, REPEAT_DELAY_MS);
  }

  stopRepeat() {
    clearTimeout(this.repeatDelay);
    clearInterval(this.repeatInterval);
  }

  onKeyboardClick(direction: StepDirection, event: MouseEvent) {
    if (event.detail === 0) {
      this.step(direction);
    }
  }

  private step(direction: StepDirection): boolean {
    if (direction === -1 && this.canDecrement()) {
      this.decrement.emit();
      return true;
    }
    if (direction === 1 && this.canIncrement()) {
      this.increment.emit();
      return true;
    }
    return false;
  }
}
