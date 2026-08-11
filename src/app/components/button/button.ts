import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideDynamicIcon } from "@lucide/angular";

export type ScButtonSize = "small" | "default" | "large";
export type ScButtonVariant =
  | "solid"
  | "outline"
  | "ghost"
  | "soft"
  | "white"
  | "link"
  | "dropdown"
  | "benchmark";
export type ScButtonIconPosition = "start" | "end";
export type ScButtonColor = "brand" | "neutral" | "danger" | "inverse";

@Component({
  selector: "sc-button",
  imports: [NgTemplateOutlet, RouterLink, LucideDynamicIcon],
  templateUrl: "./button.html",
  styleUrl: "./button.scss",
})
export class Button {
  size = input<ScButtonSize>("default");
  variant = input<ScButtonVariant>("solid");
  color = input<ScButtonColor>("brand");
  label = input<string>("");
  sublabel = input<string | null>(null);
  icon = input<string | null>(null);
  iconPosition = input<ScButtonIconPosition>("end");
  type = input<"button" | "submit" | "reset">("button");
  disabled = input(false);
  href = input<string | null>(null);
  routerLink = input<string | any[] | null>(null);
  queryParams = input<Record<string, any> | null>(null);
  target = input<string | null>(null);
  rel = input<string | null>(null);
  ariaLabel = input<string | null>(null);
  ariaExpanded = input<boolean | null>(null);
  ariaControls = input<string | null>(null);
  title = input<string | null>(null);
  buttonClass = input<string>("");
  badge = input<string | number | null>(null);
  badgePing = input(false);
  swatchColor = input<string | null>(null);

  buttonClick = output<MouseEvent>();

  isIconOnly = computed(
    () =>
      !!this.icon() &&
      !this.label() &&
      this.variant() !== "dropdown" &&
      this.variant() !== "benchmark",
  );

  isMultilineLabel = computed(() => this.label().includes("\n"));

  hasBadge = computed(
    () =>
      this.badge() !== null &&
      this.badge() !== undefined &&
      this.badge() !== "",
  );

  onClick(event: MouseEvent) {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.buttonClick.emit(event);
  }
}
