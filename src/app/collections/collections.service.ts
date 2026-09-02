import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, forkJoin, of } from "rxjs";
import {
  COLLECTION_TYPES,
  favoriteDatabaseId,
  favoriteServerId,
  type CollectionItemMap,
  type CollectionItemPayload,
  type CollectionType,
  type FavoriteDatabaseItem,
  type FavoriteServerItem,
  type SavedAdviceItem,
  type SavedComparisonItem,
  type SavedSearchItem,
} from "./collections.types";

export type {
  CollectionItemBase,
  CollectionItemMap,
  CollectionItemPayload,
  CollectionType,
  DashboardCardKind,
  DashboardCardViewModel,
  DashboardFilterKey,
  DashboardFilters,
  FavoriteDatabaseItem,
  FavoriteServerItem,
  SavedAdviceItem,
  SavedComparisonItem,
  SavedNamedItem,
  SavedSearchItem,
  SavedSearchPage,
} from "./collections.types";

export { DEFAULT_DASHBOARD_FILTERS } from "./collections.types";

export {
  COLLECTION_TYPES,
  favoriteDatabaseId,
  favoriteServerId,
  parseFavoriteDatabaseId,
  parseFavoriteServerId,
} from "./collections.types";

const WWW_API_BASE_URI =
  import.meta.env.NG_APP_WWW_API_BASE_URI?.replace(/\/$/, "") || "";

@Injectable({ providedIn: "root" })
export class CollectionsService {
  private readonly http = inject(HttpClient);

  listFavoriteServers(): Observable<FavoriteServerItem[]> {
    return this.list(COLLECTION_TYPES.favoriteServers);
  }

  getFavoriteServer(
    vendorId: string,
    serverId: string,
  ): Observable<FavoriteServerItem> {
    return this.get(
      COLLECTION_TYPES.favoriteServers,
      favoriteServerId(vendorId, serverId),
    );
  }

  addFavoriteServer(
    vendorId: string,
    serverId: string,
    body: CollectionItemPayload<typeof COLLECTION_TYPES.favoriteServers>,
  ): Observable<FavoriteServerItem> {
    return this.put(
      COLLECTION_TYPES.favoriteServers,
      favoriteServerId(vendorId, serverId),
      body,
    );
  }

  deleteFavoriteServer(vendorId: string, serverId: string): Observable<void> {
    return this.delete(
      COLLECTION_TYPES.favoriteServers,
      favoriteServerId(vendorId, serverId),
    );
  }

  deleteFavoriteServerById(id: string): Observable<void> {
    return this.delete(COLLECTION_TYPES.favoriteServers, id);
  }

  listFavoriteDatabases(): Observable<FavoriteDatabaseItem[]> {
    return this.list(COLLECTION_TYPES.favoriteDatabases);
  }

  getFavoriteDatabase(
    vendorId: string,
    databaseId: string,
  ): Observable<FavoriteDatabaseItem> {
    return this.get(
      COLLECTION_TYPES.favoriteDatabases,
      favoriteDatabaseId(vendorId, databaseId),
    );
  }

  addFavoriteDatabase(
    vendorId: string,
    databaseId: string,
    body: CollectionItemPayload<typeof COLLECTION_TYPES.favoriteDatabases>,
  ): Observable<FavoriteDatabaseItem> {
    return this.put(
      COLLECTION_TYPES.favoriteDatabases,
      favoriteDatabaseId(vendorId, databaseId),
      body,
    );
  }

  deleteFavoriteDatabase(
    vendorId: string,
    databaseId: string,
  ): Observable<void> {
    return this.delete(
      COLLECTION_TYPES.favoriteDatabases,
      favoriteDatabaseId(vendorId, databaseId),
    );
  }

  deleteFavoriteDatabaseById(id: string): Observable<void> {
    return this.delete(COLLECTION_TYPES.favoriteDatabases, id);
  }

  listSavedSearches(): Observable<SavedSearchItem[]> {
    return this.list(COLLECTION_TYPES.savedSearches);
  }

  getSavedSearch(id: string): Observable<SavedSearchItem> {
    return this.get(COLLECTION_TYPES.savedSearches, id);
  }

  saveSearch(
    id: string,
    body: CollectionItemPayload<typeof COLLECTION_TYPES.savedSearches>,
  ): Observable<SavedSearchItem> {
    return this.put(COLLECTION_TYPES.savedSearches, id, body);
  }

  deleteSavedSearch(id: string): Observable<void> {
    return this.delete(COLLECTION_TYPES.savedSearches, id);
  }

  listSavedComparisons(): Observable<SavedComparisonItem[]> {
    return this.list(COLLECTION_TYPES.savedComparisons);
  }

  getSavedComparison(id: string): Observable<SavedComparisonItem> {
    return this.get(COLLECTION_TYPES.savedComparisons, id);
  }

  saveComparison(
    id: string,
    body: CollectionItemPayload<typeof COLLECTION_TYPES.savedComparisons>,
  ): Observable<SavedComparisonItem> {
    return this.put(COLLECTION_TYPES.savedComparisons, id, body);
  }

  deleteSavedComparison(id: string): Observable<void> {
    return this.delete(COLLECTION_TYPES.savedComparisons, id);
  }

  listSavedAdvices(): Observable<SavedAdviceItem[]> {
    return this.list(COLLECTION_TYPES.savedAdvices);
  }

  getSavedAdvice(id: string): Observable<SavedAdviceItem> {
    return this.get(COLLECTION_TYPES.savedAdvices, id);
  }

  saveAdvice(
    id: string,
    body: CollectionItemPayload<typeof COLLECTION_TYPES.savedAdvices>,
  ): Observable<SavedAdviceItem> {
    return this.put(COLLECTION_TYPES.savedAdvices, id, body);
  }

  deleteSavedAdvice(id: string): Observable<void> {
    return this.delete(COLLECTION_TYPES.savedAdvices, id);
  }

  reorderCollectionItems(
    items: Array<{
      collectionType: CollectionType;
      id: string;
      body: object;
    }>,
  ): Observable<CollectionItemMap[CollectionType][]> {
    if (!items.length) {
      return of([]);
    }
    return forkJoin(
      items.map(({ collectionType, id, body }) =>
        this.put(
          collectionType,
          id,
          body as CollectionItemPayload<typeof collectionType>,
        ),
      ),
    );
  }

  private list<T extends CollectionType>(
    collectionType: T,
  ): Observable<CollectionItemMap[T][]> {
    return this.http.get<CollectionItemMap[T][]>(
      `${WWW_API_BASE_URI}/collections/${encodeSegment(collectionType)}`,
    );
  }

  private get<T extends CollectionType>(
    collectionType: T,
    id: string,
  ): Observable<CollectionItemMap[T]> {
    return this.http.get<CollectionItemMap[T]>(
      `${WWW_API_BASE_URI}/collections/${encodeSegment(collectionType)}/${encodeSegment(id)}`,
    );
  }

  private put<T extends CollectionType>(
    collectionType: T,
    id: string,
    body: CollectionItemPayload<T>,
  ): Observable<CollectionItemMap[T]> {
    return this.http.put<CollectionItemMap[T]>(
      `${WWW_API_BASE_URI}/collections/${encodeSegment(collectionType)}/${encodeSegment(id)}`,
      body,
    );
  }

  private delete(collectionType: CollectionType, id: string): Observable<void> {
    return this.http.delete<void>(
      `${WWW_API_BASE_URI}/collections/${encodeSegment(collectionType)}/${encodeSegment(id)}`,
    );
  }
}

function encodeSegment(value: string): string {
  return encodeURIComponent(value);
}
