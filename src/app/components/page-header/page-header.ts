import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
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
import { ShareLink } from "../../services/share-link";
import { UiTooltip } from "../../services/ui-tooltip";

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
  styleUrl: "./page-header.css",
})
export class PageHeader {
  private uiTooltip = inject(UiTooltip);
  private shareLink = inject(ShareLink);
  private tooltip = viewChild<ElementRef<HTMLElement>>("tooltip");
  private copiedTimeout?: ReturnType<typeof setTimeout>;
  private readonly linkCopied = signal(false);

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
  shareIcon = input("share-2");
  shareVariant = input<ScButtonVariant>("outline");
  shareButtonId = input<string | null>(null);
  copyLink = input(false);
  shareClick = output<MouseEvent>();
  bookmarkClick = output<MouseEvent>();
  editClick = output<MouseEvent>();

  protected readonly registerHint = FEATURE_REGISTER_HINT;
  protected readonly resolvedShareIcon = computed(() =>
    this.copyLink()
      ? this.linkCopied()
        ? "check"
        : "share-2"
      : this.shareIcon(),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimeout));
  }

  protected onShareClick(event: MouseEvent): void {
    if (this.copyLink()) {
      void this.shareLink.copyCurrentUrl().then((copied) => {
        if (!copied) {
          return;
        }
        this.linkCopied.set(true);
        clearTimeout(this.copiedTimeout);
        this.copiedTimeout = setTimeout(() => this.linkCopied.set(false), 3000);
      });
    }
    this.shareClick.emit(event);
  }

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
