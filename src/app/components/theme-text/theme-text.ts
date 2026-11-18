import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type ThemeTextSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ThemeTextSize, string> = {
  sm: "text-xl",
  md: "text-2xl font-light sm:text-4xl",
  lg: "text-4xl font-bold sm:text-6xl",
};

@Component({
  selector: "sc-theme-text",
  templateUrl: "./theme-text.html",
  styleUrl: "./theme-text.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex",
  },
})
export class ThemeText {
  readonly text = input.required<string>();
  readonly size = input<ThemeTextSize>("sm");

  protected readonly sizeClasses = computed(() => SIZE_CLASSES[this.size()]);
}
