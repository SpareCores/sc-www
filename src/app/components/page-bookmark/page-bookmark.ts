import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import {
  LucideBookmark,
  LucideBookmarkOff,
  LucideBookmarkPlus,
} from "@lucide/angular";
import { FEATURE_REGISTER_HINT } from "../../collections/collections.utils";
import { UiTooltip } from "../../services/ui-tooltip";
import { TooltipTrigger } from "../../directives/tooltip-trigger";

@Component({
  selector: "sc-page-bookmark",
  imports: [
    TooltipTrigger,
    LucideBookmark,
    LucideBookmarkOff,
    LucideBookmarkPlus,
  ],
  templateUrl: "./page-bookmark.html",
  styleUrl: "./page-bookmark.css",
  host: {
    "[class.page-bookmark--locked]": "guestLocked()",
  },
})
export class PageBookmark {
  private uiTooltip = inject(UiTooltip);
  private tooltip = viewChild<ElementRef<HTMLElement>>("tooltip");

  active = input(false);
  disabled = input(false);
  loading = input(false);
  guestLocked = input(false);
  bookmarkClick = output<MouseEvent>();

  protected readonly registerHint = FEATURE_REGISTER_HINT;

  protected onMouseEnter(event: Element | Event): void {
    if (!this.guestLocked()) {
      return;
    }
    const tooltip = this.tooltip()?.nativeElement;
    if (!tooltip) {
      return;
    }
    this.uiTooltip.show(tooltip, event, {
      left: "anchor-right",
      top: "anchor-below",
    });
  }

  protected hideTooltip(): void {
    const tooltip = this.tooltip()?.nativeElement;
    if (!tooltip) {
      return;
    }
    this.uiTooltip.hide(tooltip);
  }

  protected onClick(event: MouseEvent): void {
    if (this.guestLocked()) {
      this.hideTooltip();
    }
    this.bookmarkClick.emit(event);
  }
}
