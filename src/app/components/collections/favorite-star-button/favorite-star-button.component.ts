import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { LucideStar } from "@lucide/angular";
import { Auth } from "../../../services/auth/auth";
import { CollectionsStore } from "../../../collections/collections.store";
import { mutationKey } from "../../../shared/store/with-mutation-status";
import { favoriteDatabaseId, favoriteServerId } from "../../../collections/collections.types";
import { LoadingSpinnerComponent } from "../../loading-spinner/loading-spinner.component";

export type FavoriteEntityKind = "server" | "database";

@Component({
  selector: "sc-favorite-star-button",
  imports: [LucideStar, LoadingSpinnerComponent],
  templateUrl: "./favorite-star-button.html",
  styleUrl: "./favorite-star-button.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteStarButtonComponent {
  private auth = inject(Auth);
  private collectionsStore = inject(CollectionsStore);

  kind = input.required<FavoriteEntityKind>();
  vendorId = input.required<string>();
  entityId = input.required<string>();
  disabled = input(false);
  requireAuth = output<void>();

  protected isAuthenticated = computed(() => this.auth.isAuthenticated());

  protected isFavorite = computed(() => {
    const vendorId = this.vendorId();
    const entityId = this.entityId();
    return this.kind() === "server"
      ? this.collectionsStore.isFavoriteServer(vendorId, entityId)
      : this.collectionsStore.isFavoriteDatabase(vendorId, entityId);
  });

  protected isLoading = computed(() => {
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

    const vendorId = this.vendorId();
    const entityId = this.entityId();
    if (this.kind() === "server") {
      this.collectionsStore.toggleFavoriteServer({ vendorId, serverId: entityId });
      return;
    }

    this.collectionsStore.toggleFavoriteDatabase({
      vendorId,
      databaseId: entityId,
    });
  }
}
