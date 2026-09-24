import { isPlatformBrowser } from "@angular/common";
import {
  Injectable,
  PLATFORM_ID,
  effect,
  inject,
  untracked,
} from "@angular/core";
import { AuthStateService } from "../core/auth";
import { CollectionsStore } from "./collections.store";
import {
  favoriteDatabaseId,
  favoriteServerId,
  type SavedSearchPage,
} from "./collections.types";
import type { SearchBarQuery } from "../components/search-bar/types/search-bar.types";
import {
  isDefaultListingQuery,
  listingSearchQuery,
  savedSearchIdFromQuery,
  FEATURE_REGISTER_SUBTITLE,
  PENDING_FEATURE_ACTION_KEY,
} from "./collections.utils";
import { mutationKey } from "../shared/store/with-mutation-status";

export type BookmarkEntityKind = "server" | "database";

export type PendingOpenSaveTarget =
  | "search-servers"
  | "search-databases"
  | "compare-servers"
  | "compare-databases"
  | "advice";

export type PendingFeatureAction =
  | {
      type: "favorite";
      kind: BookmarkEntityKind;
      vendorId: string;
      entityId: string;
    }
  | {
      type: "open-save";
      target: PendingOpenSaveTarget;
    };

@Injectable({ providedIn: "root" })
export class CollectionsUiService {
  private auth = inject(AuthStateService);
  private platformId = inject(PLATFORM_ID);
  readonly store = inject(CollectionsStore);

  private pendingConsumed = false;
  private authDialogWasOpen = false;

  constructor() {
    effect(() => {
      const dialogOpen =
        this.auth.signUpModalOpen() || this.auth.signInModalOpen();
      const authenticated = this.auth.isAuthenticated();

      if (
        this.authDialogWasOpen &&
        !dialogOpen &&
        !authenticated &&
        !this.auth.authInProgress()
      ) {
        untracked(() => this.clearPendingFeatureAction());
      }

      this.authDialogWasOpen = dialogOpen;
    });

    effect(() => {
      if (this.auth.authInProgress()) {
        return;
      }
      if (!this.auth.isAuthenticated()) {
        return;
      }
      if (!this.store.isLoaded()) {
        return;
      }

      const pending = this.peekPendingFeatureAction();
      if (!pending || pending.type !== "favorite") {
        return;
      }

      const action = this.takePendingFeatureAction();
      if (!action || action.type !== "favorite") {
        return;
      }

      untracked(() =>
        this.toggleFavorite(action.kind, action.vendorId, action.entityId),
      );
    });
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  promptRegisterForFeature(action?: PendingFeatureAction): void {
    if (action) {
      this.setPendingFeatureAction(action);
    } else {
      this.clearPendingFeatureAction();
    }

    this.auth.signUp({
      subtitle: FEATURE_REGISTER_SUBTITLE,
    });
  }

  takePendingFeatureAction(): PendingFeatureAction | null {
    if (this.pendingConsumed) {
      return null;
    }

    const action = this.readPendingFeatureAction();
    if (!action) {
      return null;
    }

    this.pendingConsumed = true;
    this.clearPendingStorage();
    return action;
  }

  takePendingOpenSave(target: PendingOpenSaveTarget): boolean {
    if (this.pendingConsumed) {
      return false;
    }

    const action = this.readPendingFeatureAction();
    if (!action || action.type !== "open-save" || action.target !== target) {
      return false;
    }

    this.pendingConsumed = true;
    this.clearPendingStorage();
    return true;
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

  private peekPendingFeatureAction(): PendingFeatureAction | null {
    if (this.pendingConsumed) {
      return null;
    }
    return this.readPendingFeatureAction();
  }

  private setPendingFeatureAction(action: PendingFeatureAction): void {
    this.pendingConsumed = false;
    this.writePendingStorage(action);
  }

  private clearPendingFeatureAction(): void {
    this.pendingConsumed = true;
    this.clearPendingStorage();
  }

  private readPendingFeatureAction(): PendingFeatureAction | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const raw = sessionStorage.getItem(PENDING_FEATURE_ACTION_KEY);
      if (!raw) {
        return null;
      }
      return this.parsePendingFeatureAction(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  private writePendingStorage(action: PendingFeatureAction): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      sessionStorage.setItem(
        PENDING_FEATURE_ACTION_KEY,
        JSON.stringify(action),
      );
    } catch {
      return;
    }
  }

  private clearPendingStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      sessionStorage.removeItem(PENDING_FEATURE_ACTION_KEY);
    } catch {
      return;
    }
  }

  private parsePendingFeatureAction(
    value: unknown,
  ): PendingFeatureAction | null {
    if (!value || typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    if (record["type"] === "favorite") {
      const kind = record["kind"];
      const vendorId = record["vendorId"];
      const entityId = record["entityId"];
      if (
        (kind === "server" || kind === "database") &&
        typeof vendorId === "string" &&
        typeof entityId === "string"
      ) {
        return { type: "favorite", kind, vendorId, entityId };
      }
      return null;
    }

    if (record["type"] === "open-save") {
      const target = record["target"];
      if (
        target === "search-servers" ||
        target === "search-databases" ||
        target === "compare-servers" ||
        target === "compare-databases" ||
        target === "advice"
      ) {
        return { type: "open-save", target };
      }
      return null;
    }

    return null;
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
