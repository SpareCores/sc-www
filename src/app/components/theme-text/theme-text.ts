import { ChangeDetectionStrategy, Component, input } from "@angular/core";

export type ThemeTextSize = "sm" | "md" | "lg";

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
}
