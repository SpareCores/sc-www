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
  LucideDynamicIcon,
  LucideSquarePen,
} from "@lucide/angular";
import { Button, ScButtonVariant } from "../button/button";
import { FEATURE_REGISTER_HINT } from "../../collections/collections.utils";
import { UiTooltipService } from "../../services/ui-tooltip.service";

@Component({
  selector: "sc-page-header",
  imports: [
    Button,
    LucideDynamicIcon,
    LucideBookmark,
    LucideBookmarkOff,
    LucideBookmarkPlus,
    LucideSquarePen,
  ],
  templateUrl: "./page-header.html",
  styleUrl: "./page-header.scss",
})
export class PageHeader {
  private uiTooltip = inject(UiTooltipService);
  private tooltip = viewChild<ElementRef<HTMLElement>>("tooltip");

  icon = input.required<string>();
  title = input.required<string>();
  showBookmark = input(false);
  bookmarkActive = input(false);
  bookmarkDisabled = input(false);
  bookmarkLoading = input(false);
  bookmarkGuestLocked = input(false);
  showEdit = input(false);
  editAriaLabel = input("Edit bookmark");
  showShare = input(false);
  shareIcon = input("clipboard");
  shareVariant = input<ScButtonVariant>("outline");
  shareButtonId = input<string | null>(null);
  shareClick = output<MouseEvent>();
  bookmarkClick = output<MouseEvent>();
  editClick = output<MouseEvent>();

  protected readonly registerHint = FEATURE_REGISTER_HINT;

  protected onBookmarkMouseEnter(event: MouseEvent): void {
    if (!this.bookmarkGuestLocked()) {
      return;
    }
    this.showTooltip(event);
  }

  protected onBookmarkClick(event: MouseEvent): void {
    if (this.bookmarkGuestLocked()) {
      this.hideTooltip();
    }
    this.bookmarkClick.emit(event);
  }

  protected showTooltip(event: MouseEvent): void {
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
}
