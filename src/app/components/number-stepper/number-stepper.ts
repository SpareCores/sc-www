import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  model,
} from "@angular/core";
import { Button } from "../button/button";
import { NumbersOnly } from "../../directives/numbers-only";

const REPEAT_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 75;

@Component({
  selector: "sc-number-stepper",
  imports: [Button, NumbersOnly],
  templateUrl: "./number-stepper.html",
  host: {
    class: "inline-flex items-stretch",
  },
})
export class NumberStepper {
  value = model.required<number>();
  label = input.required<string>();
  unit = input("");
  min = input(0);
  max = input(9999);
  step = input(1);
  inputId = input<string | null>(null);

  maxDigits = computed(() => String(this.max()).length);
  inputWidth = computed(() => `calc(${this.maxDigits()}ch + 2.5rem)`);

  canDecrement = computed(() => this.value() > this.min());
  canIncrement = computed(() => this.value() < this.max());

  private repeatDelay?: ReturnType<typeof setTimeout>;
  private repeatInterval?: ReturnType<typeof setInterval>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopRepeat());
  }

  decrement() {
    this.stepBy(-1);
  }

  increment() {
    this.stepBy(1);
  }

  startRepeat(direction: 1 | -1, event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }
    this.stopRepeat();
    this.stepBy(direction);
    this.repeatDelay = setTimeout(() => {
      this.repeatInterval = setInterval(() => {
        if (!this.stepBy(direction)) {
          this.stopRepeat();
        }
      }, REPEAT_INTERVAL_MS);
    }, REPEAT_DELAY_MS);
  }

  stopRepeat() {
    clearTimeout(this.repeatDelay);
    clearInterval(this.repeatInterval);
  }

  onKeyboardClick(direction: 1 | -1, event: MouseEvent) {
    if (event.detail === 0) {
      this.stepBy(direction);
    }
  }

  onInput(event: Event) {
    const { value } = event.target as HTMLInputElement;
    const next = Number(value);
    if (value && next >= this.min() && next <= this.max()) {
      this.value.set(next);
    }
  }

  commit(event: Event) {
    const field = event.target as HTMLInputElement;
    this.setClamped(field.value ? Number(field.value) : this.value());
    field.value = String(this.value());
  }

  private stepBy(direction: 1 | -1): boolean {
    const previous = this.value();
    this.setClamped(previous + direction * this.step());
    return this.value() !== previous;
  }

  private setClamped(next: number) {
    this.value.set(Math.min(this.max(), Math.max(this.min(), next)));
  }
}
