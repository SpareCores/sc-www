import {
  Directive,
  ElementRef,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { UiTooltip } from "../services/ui-tooltip";

export type TooltipTriggerMode = "info" | "action";

type TooltipOpenSource = "hover" | "tap" | "focus";

const NATIVELY_FOCUSABLE_TAGS = new Set([
  "A",
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
]);

@Directive({
  selector: "[scTooltipTrigger]",
  host: {
    "[attr.tabindex]": "hostTabIndex()",
    "[attr.role]": "hostRole()",
    "[attr.aria-expanded]": "hostAriaExpanded()",
    "(pointerenter)": "onPointerEnter($event)",
    "(pointerleave)": "onPointerLeave($event)",
    "(click)": "onClick($event)",
    "(keydown.enter)": "onKeyboardActivate($event)",
    "(keydown.space)": "onKeyboardActivate($event)",
    "(focusin)": "onFocusIn()",
    "(focusout)": "onFocusOut()",
  },
})
export class TooltipTrigger {
  private readonly host = inject<ElementRef<Element>>(ElementRef);
  private readonly uiTooltip = inject(UiTooltip);
  private readonly isNativelyFocusable = NATIVELY_FOCUSABLE_TAGS.has(
    this.host.nativeElement.tagName.toUpperCase(),
  );
  private openedBy: TooltipOpenSource | null = null;

  readonly tooltipMode = input<TooltipTriggerMode>("info");

  readonly tooltipOpen = output<Element>();
  readonly tooltipClose = output<void>();

  private readonly isShown = computed(
    () => this.uiTooltip.shownAnchor() === this.host.nativeElement,
  );
  private readonly needsFocusability = computed(
    () => this.tooltipMode() === "info" && !this.isNativelyFocusable,
  );

  protected readonly hostTabIndex = computed(() =>
    this.needsFocusability() ? 0 : null,
  );
  protected readonly hostRole = computed(() =>
    this.needsFocusability() ? "button" : null,
  );
  protected readonly hostAriaExpanded = computed(() =>
    this.tooltipMode() === "info" ? String(this.isShown()) : null,
  );

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === "mouse") {
      this.open("hover");
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === "mouse" && this.openedBy === "hover") {
      this.close();
    }
  }

  protected onClick(event: MouseEvent): void {
    if (this.tooltipMode() === "action") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.toggle();
  }

  protected onKeyboardActivate(event: Event): void {
    if (this.tooltipMode() === "action" || this.isNativelyFocusable) {
      return;
    }

    event.preventDefault();
    this.toggle();
  }

  protected onFocusIn(): void {
    if (this.host.nativeElement.matches(":focus-visible")) {
      this.open("focus");
    }
  }

  protected onFocusOut(): void {
    if (this.openedBy !== null && this.openedBy !== "hover") {
      this.close();
    }
  }

  private toggle(): void {
    if (!this.isShown()) {
      this.open("tap");
      return;
    }

    if (this.openedBy !== "hover") {
      this.close();
    }
  }

  private open(source: TooltipOpenSource): void {
    this.openedBy = source;
    this.tooltipOpen.emit(this.host.nativeElement);
  }

  private close(): void {
    this.openedBy = null;
    this.tooltipClose.emit();
  }
}
