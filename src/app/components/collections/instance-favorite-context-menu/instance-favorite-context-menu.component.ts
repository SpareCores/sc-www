import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { OverlayModule } from "@angular/cdk/overlay";
import { LucideBookmarkOff, LucideBookmarkPlus } from "@lucide/angular";
import {
  CollectionsUiService,
  type BookmarkEntityKind,
} from "../../../collections/collections-ui.service";

@Component({
  selector: "sc-instance-favorite-context-menu",
  imports: [OverlayModule, LucideBookmarkPlus, LucideBookmarkOff],
  templateUrl: "./instance-favorite-context-menu.html",
  styleUrl: "./instance-favorite-context-menu.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstanceFavoriteContextMenuComponent {
  private collectionsUi = inject(CollectionsUiService);

  kind = input.required<BookmarkEntityKind>();
  vendorId = input.required<string>();
  entityId = input.required<string>();
  requireAuth = output<void>();

  protected menuOpen = signal(false);
  protected menuPosition = signal({ x: 0, y: 0 });

  protected isBookmarked(): boolean {
    return this.collectionsUi.isFavorite(
      this.kind(),
      this.vendorId(),
      this.entityId(),
    );
  }

  protected isLoading(): boolean {
    return this.collectionsUi.isFavoriteLoading(
      this.kind(),
      this.vendorId(),
      this.entityId(),
    );
  }

  protected menuLabel(): string {
    if (this.isBookmarked()) {
      return "Remove from bookmarks";
    }
    return this.kind() === "server"
      ? "Bookmark this server"
      : "Bookmark this database";
  }

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.collectionsUi.isAuthenticated()) {
      this.requireAuth.emit();
      return;
    }

    this.menuPosition.set({ x: event.clientX, y: event.clientY });
    this.menuOpen.set(true);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleFavorite(): void {
    if (this.isLoading()) {
      return;
    }

    this.collectionsUi.toggleFavorite(
      this.kind(),
      this.vendorId(),
      this.entityId(),
    );
    this.closeMenu();
  }
}
