import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
} from "@angular/core";
import {
  LucideBookmark,
  LucideBookmarkOff,
  LucideBookmarkPlus,
} from "@lucide/angular";
import {
  CollectionsUiService,
  type BookmarkEntityKind,
} from "../../../collections/collections-ui.service";
import { FEATURE_REGISTER_HINT } from "../../../collections/collections.utils";
import { UiTooltipService } from "../../../services/ui-tooltip.service";

@Component({
  selector: "sc-bookmark-button",
  imports: [LucideBookmark, LucideBookmarkPlus, LucideBookmarkOff],
  templateUrl: "./bookmark-button.html",
  styleUrl: "./bookmark-button.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkButton {
  private collectionsUi = inject(CollectionsUiService);
  private uiTooltip = inject(UiTooltipService);
  private tooltip = viewChild<ElementRef<HTMLElement>>("tooltip");

  kind = input.required<BookmarkEntityKind>();
  vendorId = input.required<string>();
  entityId = input.required<string>();
  disabled = input(false);

  protected readonly registerHint = FEATURE_REGISTER_HINT;

  protected isAuthenticated = computed(() =>
    this.collectionsUi.isAuthenticated(),
  );

  protected isBookmarked = computed(() => {
    return this.collectionsUi.isFavorite(
      this.kind(),
      this.vendorId(),
      this.entityId(),
    );
  });

  protected isLoading = computed(() => {
    return this.collectionsUi.isFavoriteLoading(
      this.kind(),
      this.vendorId(),
      this.entityId(),
    );
  });

  protected canAdd = computed(
    () =>
      this.isAuthenticated() &&
      !this.isBookmarked() &&
      !this.disabled() &&
      !this.isLoading(),
  );

  protected canRemove = computed(
    () =>
      this.isAuthenticated() &&
      this.isBookmarked() &&
      !this.disabled() &&
      !this.isLoading(),
  );

  protected ariaLabel = computed(() => {
    if (!this.isAuthenticated()) {
      return this.registerHint;
    }
    const noun = this.kind() === "server" ? "server" : "database";
    return this.isBookmarked()
      ? "Remove from bookmarks"
      : `Bookmark this ${noun}`;
  });

  protected toggle(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isAuthenticated()) {
      this.hideTooltip();
      this.collectionsUi.promptRegisterForFeature();
      return;
    }

    if (this.disabled() || this.isLoading()) {
      return;
    }

    this.collectionsUi.toggleFavorite(
      this.kind(),
      this.vendorId(),
      this.entityId(),
    );
  }

  protected onMouseEnter(event: MouseEvent): void {
    if (this.isAuthenticated()) {
      return;
    }
    this.showTooltip(event);
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
