import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideDynamicIcon } from "@lucide/angular";

export type ScButtonSize = "normal" | "large" | "x-large" | "xxx-large";
export type ScButtonVariant =
  | "primary"
  | "outline"
  | "dropdown"
  | "benchmark"
  | "danger"
  | "transparent";
export type ScButtonIconPosition = "start" | "end";
export type ScButtonColor = "brand" | "dark-grey" | "emerald";
export type ScButtonTextSize = "normal" | "large";
export type ScButtonFontWeight = "normal" | "bold";

@Component({
  selector: "sc-button",
  imports: [NgTemplateOutlet, RouterLink, LucideDynamicIcon],
  templateUrl: "./button.html",
  styleUrl: "./button.scss",
})
export class Button {
  size = input<ScButtonSize>("normal");
  variant = input<ScButtonVariant>("primary");
  color = input<ScButtonColor>("brand");
  textSize = input<ScButtonTextSize>("normal");
  fontWeight = input<ScButtonFontWeight>("normal");
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

  showSwatch = computed(() => !!this.swatchColor());

  showStartIcon = computed(
    () =>
      !!this.icon() &&
      this.iconPosition() === "start" &&
      this.variant() !== "dropdown" &&
      this.variant() !== "benchmark",
  );

  showEndIcon = computed(
    () =>
      !!this.icon() &&
      this.iconPosition() === "end" &&
      this.variant() !== "dropdown" &&
      this.variant() !== "benchmark",
  );

  showDropdownIcon = computed(
    () => this.variant() === "dropdown" && !!this.icon(),
  );

  hasBadge = computed(
    () =>
      this.badge() !== null &&
      this.badge() !== undefined &&
      this.badge() !== "",
  );

  buttonClasses = computed(() => {
    const classes = [
      "sc-button",
      `sc-button--${this.size()}`,
      `sc-button--${this.variant()}`,
      `sc-button--color-${this.color()}`,
      `sc-button--text-${this.textSize()}`,
      `sc-button--weight-${this.fontWeight()}`,
    ];

    if (this.variant() === "primary") {
      classes.push("btn-primary");
    } else if (this.variant() === "outline") {
      classes.push("btn-primary-outline");
    } else if (this.variant() === "dropdown") {
      classes.push("dropdown_button", "chart-selector-button");
      if (this.size() === "large") {
        classes.push("chart-selector-button--comfortable");
      }
    } else if (this.variant() === "benchmark") {
      classes.push("dropdown_button");
    } else if (this.variant() === "danger") {
      classes.push("sc-button--danger-fill");
    } else if (this.variant() === "transparent") {
      classes.push("sc-button--transparent-fill");
    }

    if (this.buttonClass()) {
      classes.push(this.buttonClass());
    }

    if (
      this.icon() &&
      !this.label() &&
      this.variant() !== "dropdown" &&
      this.variant() !== "benchmark"
    ) {
      classes.push("sc-button--icon-only");
    }

    return classes.join(" ");
  });

  onClick(event: MouseEvent) {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.buttonClick.emit(event);
  }
}
