import { Injectable, inject } from "@angular/core";
import { AuthStateService } from "../core/auth";
import { CollectionsStore } from "./collections.store";
import {
  favoriteDatabaseId,
  favoriteServerId,
  type SavedSearchPage,
} from "./collections.types";
import type { SearchBarQuery } from "../components/search-bar/search-bar.types";
import {
  isDefaultListingQuery,
  listingSearchQuery,
  savedSearchIdFromQuery,
  FEATURE_REGISTER_SUBTITLE,
} from "./collections.utils";
import { mutationKey } from "../shared/store/with-mutation-status";

export type BookmarkEntityKind = "server" | "database";

@Injectable({ providedIn: "root" })
export class CollectionsUiService {
  private auth = inject(AuthStateService);
  readonly store = inject(CollectionsStore);

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  promptRegisterForFeature(): void {
    this.auth.signUp({
      subtitle: FEATURE_REGISTER_SUBTITLE,
    });
  }

  activeSavedSearch(page: SavedSearchPage, query: SearchBarQuery) {
    return this.store.savedSearchByQuery(page, query);
  }

  isFavorite(
    kind: BookmarkEntityKind,
    vendorId: string,
    entityId: string,
  ): boolean {
    return kind === "server"
      ? this.store.isFavoriteServer(vendorId, entityId)
      : this.store.isFavoriteDatabase(vendorId, entityId);
  }

  isFavoriteLoading(
    kind: BookmarkEntityKind,
    vendorId: string,
    entityId: string,
  ): boolean {
    return this.store.isMutating(
      this.favoriteMutationKey(kind, vendorId, entityId),
    );
  }

  toggleFavorite(
    kind: BookmarkEntityKind,
    vendorId: string,
    entityId: string,
  ): void {
    if (kind === "server") {
      this.store.toggleFavoriteServer({ vendorId, serverId: entityId });
      return;
    }

    this.store.toggleFavoriteDatabase({ vendorId, databaseId: entityId });
  }

  canSaveSearch(query: SearchBarQuery): boolean {
    return this.isAuthenticated() && !isDefaultListingQuery(query);
  }

  isSavingSearch(page: SavedSearchPage, query: SearchBarQuery): boolean {
    return this.store.isMutating(
      mutationKey("save-search", savedSearchIdFromQuery(page, query)),
    );
  }

  isUpdatingSearch(id: string): boolean {
    return this.store.isMutating(mutationKey("update-search", id));
  }

  isDeletingSearch(id: string): boolean {
    return this.store.isMutating(mutationKey("delete-search", id));
  }

  saveSearch(
    page: SavedSearchPage,
    query: SearchBarQuery,
    name: string,
    note?: string,
  ): void {
    this.store.saveSearch({
      page,
      query: listingSearchQuery(query),
      name,
      note,
    });
  }

  updateSearch(
    id: string,
    page: SavedSearchPage,
    query: SearchBarQuery,
    name: string,
    note?: string,
  ): void {
    this.store.updateSearch({
      id,
      page,
      query: listingSearchQuery(query),
      name,
      note,
    });
  }

  deleteSearch(id: string): void {
    this.store.deleteSearch(id);
  }

  private favoriteMutationKey(
    kind: BookmarkEntityKind,
    vendorId: string,
    entityId: string,
  ): string {
    return kind === "server"
      ? mutationKey("favorite-server", favoriteServerId(vendorId, entityId))
      : mutationKey(
          "favorite-database",
          favoriteDatabaseId(vendorId, entityId),
        );
  }
}
