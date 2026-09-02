import { Injectable, inject } from "@angular/core";
import { Auth } from "../services/auth/auth";
import { CollectionsStore } from "./collections.store";
import type { SavedSearchPage } from "./collections.types";
import type { SearchBarQuery } from "../components/search-bar/search-bar.types";
import {
  isDefaultListingQuery,
  listingSearchQuery,
  savedSearchIdFromQuery,
} from "./collections.utils";
import { mutationKey } from "../shared/store/with-mutation-status";

@Injectable({ providedIn: "root" })
export class CollectionsUiService {
  private auth = inject(Auth);
  readonly store = inject(CollectionsStore);

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  promptSignIn(): void {
    this.auth.signIn();
  }

  activeSavedSearch(page: SavedSearchPage, query: SearchBarQuery) {
    return this.store.savedSearchByQuery(page, query);
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
}
