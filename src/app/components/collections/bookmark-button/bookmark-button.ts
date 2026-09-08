import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
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

@Component({
  selector: "sc-bookmark-button",
  imports: [LucideBookmark, LucideBookmarkPlus, LucideBookmarkOff],
  templateUrl: "./bookmark-button.html",
  styleUrl: "./bookmark-button.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkButton {
  private collectionsUi = inject(CollectionsUiService);

  kind = input.required<BookmarkEntityKind>();
  vendorId = input.required<string>();
  entityId = input.required<string>();
  disabled = input(false);
  requireAuth = output<void>();

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
    () => !this.isBookmarked() && !this.disabled() && !this.isLoading(),
  );

  protected canRemove = computed(
    () => this.isBookmarked() && !this.disabled() && !this.isLoading(),
  );

  protected ariaLabel = computed(() => {
    const noun = this.kind() === "server" ? "server" : "database";
    return this.isBookmarked()
      ? "Remove from bookmarks"
      : `Bookmark this ${noun}`;
  });

  protected toggle(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled() || this.isLoading()) {
      return;
    }

    if (!this.isAuthenticated()) {
      this.requireAuth.emit();
      return;
    }

    this.collectionsUi.toggleFavorite(
      this.kind(),
      this.vendorId(),
      this.entityId(),
    );
  }
}
