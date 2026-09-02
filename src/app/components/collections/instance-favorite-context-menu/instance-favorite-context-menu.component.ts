import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { OverlayModule } from "@angular/cdk/overlay";
import { LucideStar } from "@lucide/angular";
import { Auth } from "../../../services/auth/auth";
import { CollectionsStore } from "../../../collections/collections.store";
import { mutationKey } from "../../../shared/store/with-mutation-status";
import {
  favoriteDatabaseId,
  favoriteServerId,
} from "../../../collections/collections.types";
import type { FavoriteEntityKind } from "../favorite-star-button/favorite-star-button.component";

@Component({
  selector: "sc-instance-favorite-context-menu",
  imports: [OverlayModule, LucideStar],
  templateUrl: "./instance-favorite-context-menu.html",
  styleUrl: "./instance-favorite-context-menu.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstanceFavoriteContextMenuComponent {
  private auth = inject(Auth);
  private collectionsStore = inject(CollectionsStore);

  kind = input.required<FavoriteEntityKind>();
  vendorId = input.required<string>();
  entityId = input.required<string>();
  displayName = input<string>("");
  requireAuth = output<void>();

  protected menuOpen = signal(false);
  protected menuPosition = signal({ x: 0, y: 0 });
  protected trigger = viewChild<HTMLElement>("menuTrigger");

  protected isFavorite(): boolean {
    const vendorId = this.vendorId();
    const entityId = this.entityId();
    return this.kind() === "server"
      ? this.collectionsStore.isFavoriteServer(vendorId, entityId)
      : this.collectionsStore.isFavoriteDatabase(vendorId, entityId);
  }

  protected isLoading(): boolean {
    const key =
      this.kind() === "server"
        ? mutationKey(
            "favorite-server",
            favoriteServerId(this.vendorId(), this.entityId()),
          )
        : mutationKey(
            "favorite-database",
            favoriteDatabaseId(this.vendorId(), this.entityId()),
          );
    return this.collectionsStore.isMutating(key);
  }

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
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

    const vendorId = this.vendorId();
    const entityId = this.entityId();
    if (this.kind() === "server") {
      this.collectionsStore.toggleFavoriteServer({
        vendorId,
        serverId: entityId,
      });
    } else {
      this.collectionsStore.toggleFavoriteDatabase({
        vendorId,
        databaseId: entityId,
      });
    }
    this.closeMenu();
  }
}
