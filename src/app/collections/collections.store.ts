import { isPlatformBrowser } from "@angular/common";
import { PLATFORM_ID, computed, effect, inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  addEntity,
  entityConfig,
  removeAllEntities,
  removeEntity,
  setAllEntities,
  updateEntity,
  upsertEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import * as Sentry from "@sentry/angular";
import {
  exhaustMap,
  filter,
  finalize,
  forkJoin,
  map,
  mergeMap,
  of,
  pipe,
  switchMap,
  tap,
} from "rxjs";
import { Auth } from "../services/auth/auth";
import {
  mutationKey,
  withMutationStatus,
} from "../shared/store/with-mutation-status";
import {
  setError,
  setIdle,
  setLoaded,
  setLoading,
  withRequestStatus,
} from "../shared/store/with-request-status";
import { CollectionsService } from "./collections.service";
import {
  COLLECTION_TYPES,
  DEFAULT_DASHBOARD_FILTERS,
  favoriteDatabaseId,
  favoriteServerId,
  resolveFavoriteDatabase,
  resolveFavoriteServer,
  type DashboardCardViewModel,
  type DashboardFilters,
  type FavoriteDatabaseItem,
  type FavoriteServerItem,
  type SavedAdviceItem,
  type SavedComparisonItem,
  type SavedComparisonInstance,
  type SavedSearchItem,
  type SavedSearchPage,
} from "./collections.types";
import {
  adviceQueriesEqual,
  collectionItemHref,
  savedAdviceDetailEntries,
  savedComparisonDetailEntries,
  savedSearchDetailEntries,
  savedSearchIdFromQuery,
  sortByOrder,
  stableSearchQueryKey,
} from "./collections.utils";
import type { SearchBarQuery } from "../components/search-bar/search-bar.types";

type CollectionsState = {
  dashboardFilters: DashboardFilters;
};

const serversConfig = entityConfig({
  entity: type<FavoriteServerItem>(),
  collection: "servers",
  selectId: (entity) =>
    entity.vendor_id && entity.server_id
      ? favoriteServerId(entity.vendor_id, entity.server_id)
      : entity.id,
});

const databasesConfig = entityConfig({
  entity: type<FavoriteDatabaseItem>(),
  collection: "databases",
  selectId: (entity) =>
    entity.vendor_id && entity.database_id
      ? favoriteDatabaseId(entity.vendor_id, entity.database_id)
      : entity.id,
});

const searchesConfig = entityConfig({
  entity: type<SavedSearchItem>(),
  collection: "searches",
  selectId: (entity) => entity.id,
});

const comparisonsConfig = entityConfig({
  entity: type<SavedComparisonItem>(),
  collection: "comparisons",
  selectId: (entity) => entity.id,
});

const advicesConfig = entityConfig({
  entity: type<SavedAdviceItem>(),
  collection: "advices",
  selectId: (entity) => entity.id,
});

function mutationError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function normalizedCollectionNote(note?: string): string {
  return note?.trim() ?? "";
}

function withCollectionNote<T extends { note?: string }>(
  saved: T,
  note?: string,
): T {
  return {
    ...saved,
    note: normalizedCollectionNote(note),
  };
}

function comparisonSecondaryIcon(item: SavedComparisonItem): string {
  if (item.compare_url.includes("/databases/compare")) {
    return "database";
  }
  if (item.compare_url.includes("/servers/compare")) {
    return "pc-case";
  }
  const first = item.instances?.[0];
  if (first && "database" in first) {
    return "database";
  }
  return "pc-case";
}

export const CollectionsStore = signalStore(
  { providedIn: "root" },
  withState<CollectionsState>({
    dashboardFilters: { ...DEFAULT_DASHBOARD_FILTERS },
  }),
  withRequestStatus(),
  withMutationStatus(),
  withEntities(serversConfig),
  withEntities(databasesConfig),
  withEntities(searchesConfig),
  withEntities(comparisonsConfig),
  withEntities(advicesConfig),
  withComputed((store) => ({
    favoriteServers: computed(() => sortByOrder(store.serversEntities())),
    favoriteDatabases: computed(() => sortByOrder(store.databasesEntities())),
    savedSearches: computed(() => sortByOrder(store.searchesEntities())),
    savedComparisons: computed(() => sortByOrder(store.comparisonsEntities())),
    savedAdvices: computed(() => sortByOrder(store.advicesEntities())),
    favoriteServerIds: computed(() => new Set(store.serversIds())),
    favoriteDatabaseIds: computed(() => new Set(store.databasesIds())),
    dashboardStats: computed(() => ({
      favoriteServers: store.serversEntities().length,
      favoriteDatabases: store.databasesEntities().length,
      savedSearches: store.searchesEntities().length,
      savedComparisons: store.comparisonsEntities().length,
      savedAdvices: store.advicesEntities().length,
    })),
    dashboardCards: computed((): DashboardCardViewModel[] => {
      const filters = store.dashboardFilters();
      const cards: DashboardCardViewModel[] = [];

      if (filters.favoriteServers) {
        for (const item of sortByOrder(store.serversEntities())) {
          const resolved = resolveFavoriteServer(item);
          const vendorId = resolved?.vendor_id;
          const serverId = resolved?.server_id;
          cards.push({
            kind: "favoriteServers",
            id: resolved?.id || item.id,
            title: serverId || item.id || "Unknown server",
            subtitle: vendorId,
            note: item.note,
            order: item.order ?? cards.length,
            href:
              vendorId && serverId
                ? ["/server", vendorId, serverId]
                : undefined,
            icon: "pc-case",
          });
        }
      }

      if (filters.favoriteDatabases) {
        for (const item of sortByOrder(store.databasesEntities())) {
          const resolved = resolveFavoriteDatabase(item);
          const vendorId = resolved?.vendor_id;
          const databaseId = resolved?.database_id;
          cards.push({
            kind: "favoriteDatabases",
            id: resolved?.id || item.id,
            title: databaseId || item.id || "Unknown database",
            subtitle: vendorId,
            note: item.note,
            order: item.order ?? cards.length,
            href:
              vendorId && databaseId
                ? ["/database", vendorId, databaseId]
                : undefined,
            icon: "database",
          });
        }
      }

      if (filters.savedSearches) {
        for (const item of sortByOrder(store.searchesEntities())) {
          const path = item.page === "servers" ? "/servers" : "/databases";
          cards.push({
            kind: "savedSearches",
            id: item.id,
            title: item.name,
            note: item.note,
            order: item.order ?? cards.length,
            href: collectionItemHref(path, item.query),
            icon: "search",
            secondaryIcon: item.page === "servers" ? "pc-case" : "database",
            detailsKind: "filters",
            details: savedSearchDetailEntries(item.query),
          });
        }
      }

      if (filters.savedComparisons) {
        for (const item of sortByOrder(store.comparisonsEntities())) {
          cards.push({
            kind: "savedComparisons",
            id: item.id,
            title: item.name,
            note: item.note,
            order: item.order ?? cards.length,
            href: item.compare_url,
            icon: "scale",
            secondaryIcon: comparisonSecondaryIcon(item),
            detailsKind: "instances",
            details: savedComparisonDetailEntries(item.instances),
          });
        }
      }

      if (filters.savedAdvices) {
        for (const item of sortByOrder(store.advicesEntities())) {
          cards.push({
            kind: "savedAdvices",
            id: item.id,
            title: item.name,
            note: item.note,
            order: item.order ?? cards.length,
            href: collectionItemHref("/advisor", item.query),
            icon: "bot",
            detailsKind: "filters",
            details: savedAdviceDetailEntries(item.query),
          });
        }
      }

      return sortByOrder(cards);
    }),
  })),
  withMethods((store, collections = inject(CollectionsService)) => ({
    isFavoriteServer(vendorId: string, serverId: string): boolean {
      return !!store.serversEntityMap()[favoriteServerId(vendorId, serverId)];
    },
    isFavoriteDatabase(vendorId: string, databaseId: string): boolean {
      return !!store.databasesEntityMap()[
        favoriteDatabaseId(vendorId, databaseId)
      ];
    },
    savedSearchByQuery(
      page: SavedSearchPage,
      query: SearchBarQuery,
    ): SavedSearchItem | null {
      const targetKey = stableSearchQueryKey(page, query);
      return (
        store.searchesEntities().find((item) => {
          return stableSearchQueryKey(item.page, item.query) === targetKey;
        }) ?? null
      );
    },
    savedComparisonByUrl(compareUrl: string): SavedComparisonItem | null {
      return (
        store
          .comparisonsEntities()
          .find((item) => item.compare_url === compareUrl) ?? null
      );
    },
    savedComparisonById(id: string): SavedComparisonItem | null {
      return store.comparisonsEntityMap()[id] ?? null;
    },
    savedAdviceByQuery(query: SearchBarQuery): SavedAdviceItem | null {
      return (
        store
          .advicesEntities()
          .find((item) => adviceQueriesEqual(item.query, query)) ?? null
      );
    },
    savedAdviceById(id: string): SavedAdviceItem | null {
      return store.advicesEntityMap()[id] ?? null;
    },
    setDashboardFilter(key: keyof DashboardFilters, enabled: boolean): void {
      patchState(store, {
        dashboardFilters: {
          ...store.dashboardFilters(),
          [key]: enabled,
        },
      });
    },
    clear(): void {
      patchState(
        store,
        removeAllEntities(serversConfig),
        removeAllEntities(databasesConfig),
        removeAllEntities(searchesConfig),
        removeAllEntities(comparisonsConfig),
        removeAllEntities(advicesConfig),
        {
          dashboardFilters: { ...DEFAULT_DASHBOARD_FILTERS },
        },
        setIdle(),
      );
    },
    removeFavoriteServerById: rxMethod<string>(
      pipe(
        filter((id) => !store.isMutating(mutationKey("favorite-server", id))),
        map((id) => {
          const previous = store.serversEntityMap()[id] ?? null;
          store.startMutation(mutationKey("favorite-server", id));
          if (previous) {
            patchState(store, removeEntity(id, serversConfig));
          }
          return { id, previous };
        }),
        mergeMap(({ id, previous }) =>
          collections.deleteFavoriteServerById(id).pipe(
            finalize(() => {
              store.finishMutation(mutationKey("favorite-server", id));
            }),
            tapResponse({
              next: () => undefined,
              error: (error: unknown) => {
                Sentry.captureException(error);
                if (previous) {
                  patchState(store, addEntity(previous, serversConfig));
                }
              },
            }),
          ),
        ),
      ),
    ),
    removeFavoriteDatabaseById: rxMethod<string>(
      pipe(
        filter((id) => !store.isMutating(mutationKey("favorite-database", id))),
        map((id) => {
          const previous = store.databasesEntityMap()[id] ?? null;
          store.startMutation(mutationKey("favorite-database", id));
          if (previous) {
            patchState(store, removeEntity(id, databasesConfig));
          }
          return { id, previous };
        }),
        mergeMap(({ id, previous }) =>
          collections.deleteFavoriteDatabaseById(id).pipe(
            finalize(() => {
              store.finishMutation(mutationKey("favorite-database", id));
            }),
            tapResponse({
              next: () => undefined,
              error: (error: unknown) => {
                Sentry.captureException(error);
                if (previous) {
                  patchState(store, addEntity(previous, databasesConfig));
                }
              },
            }),
          ),
        ),
      ),
    ),
    loadAll: rxMethod<void>(
      pipe(
        exhaustMap(() => {
          patchState(store, setLoading());
          return forkJoin({
            servers: collections.listFavoriteServers(),
            databases: collections.listFavoriteDatabases(),
            searches: collections.listSavedSearches(),
            comparisons: collections.listSavedComparisons(),
            advices: collections.listSavedAdvices(),
          }).pipe(
            tapResponse({
              next: ({
                servers,
                databases,
                searches,
                comparisons,
                advices,
              }) => {
                const normalizedServers = servers
                  .map((item) => {
                    return (
                      resolveFavoriteServer(item) ??
                      (item.id
                        ? {
                            id: item.id,
                            vendor_id: item.vendor_id || "",
                            server_id: item.server_id || "",
                            note: item.note,
                            order: item.order,
                          }
                        : null)
                    );
                  })
                  .filter((item): item is FavoriteServerItem => !!item);
                const normalizedDatabases = databases
                  .map((item) => {
                    return (
                      resolveFavoriteDatabase(item) ??
                      (item.id
                        ? {
                            id: item.id,
                            vendor_id: item.vendor_id || "",
                            database_id: item.database_id || "",
                            note: item.note,
                            order: item.order,
                          }
                        : null)
                    );
                  })
                  .filter((item): item is FavoriteDatabaseItem => !!item);

                patchState(
                  store,
                  setAllEntities(normalizedServers, serversConfig),
                  setAllEntities(normalizedDatabases, databasesConfig),
                  setAllEntities(searches, searchesConfig),
                  setAllEntities(comparisons, comparisonsConfig),
                  setAllEntities(advices, advicesConfig),
                  setLoaded(),
                );
              },
              error: (error: unknown) => {
                Sentry.captureException(error);
                patchState(
                  store,
                  setError(mutationError(error, "Failed to load collections")),
                );
              },
            }),
          );
        }),
      ),
    ),
    toggleFavoriteServer: rxMethod<{
      vendorId: string;
      serverId: string;
      note?: string;
    }>(
      pipe(
        filter(({ vendorId, serverId }) => {
          const id = favoriteServerId(vendorId, serverId);
          return !store.isMutating(mutationKey("favorite-server", id));
        }),
        map(({ vendorId, serverId, note }) => {
          const id = favoriteServerId(vendorId, serverId);
          const previous = store.serversEntityMap()[id] ?? null;
          const wasFavorite = !!previous;
          store.startMutation(mutationKey("favorite-server", id));

          if (wasFavorite) {
            patchState(store, removeEntity(id, serversConfig));
          } else {
            const optimistic: FavoriteServerItem = {
              id,
              vendor_id: vendorId,
              server_id: serverId,
              order: store.serversEntities().length,
            };
            if (note !== undefined) {
              optimistic.note = note;
            }
            patchState(store, addEntity(optimistic, serversConfig));
          }

          return { vendorId, serverId, note, id, previous, wasFavorite };
        }),
        mergeMap(({ vendorId, serverId, note, id, previous, wasFavorite }) => {
          const finish = () =>
            store.finishMutation(mutationKey("favorite-server", id));
          const rollback = () => {
            if (wasFavorite && previous) {
              patchState(store, addEntity(previous, serversConfig));
              return;
            }
            if (!wasFavorite) {
              patchState(store, removeEntity(id, serversConfig));
            }
          };

          if (wasFavorite) {
            return collections.deleteFavoriteServer(vendorId, serverId).pipe(
              finalize(finish),
              tapResponse({
                next: () => undefined,
                error: (error: unknown) => {
                  Sentry.captureException(error);
                  rollback();
                },
              }),
            );
          }

          return collections
            .addFavoriteServer(vendorId, serverId, {
              vendor_id: vendorId,
              server_id: serverId,
              note,
              order:
                store.serversEntityMap()[id]?.order ??
                store.serversEntities().length,
            })
            .pipe(
              finalize(finish),
              tapResponse({
                next: (saved) => {
                  patchState(store, upsertEntity(saved, serversConfig));
                },
                error: (error: unknown) => {
                  Sentry.captureException(error);
                  rollback();
                },
              }),
            );
        }),
      ),
    ),
    toggleFavoriteDatabase: rxMethod<{
      vendorId: string;
      databaseId: string;
      note?: string;
    }>(
      pipe(
        filter(({ vendorId, databaseId }) => {
          const id = favoriteDatabaseId(vendorId, databaseId);
          return !store.isMutating(mutationKey("favorite-database", id));
        }),
        map(({ vendorId, databaseId, note }) => {
          const id = favoriteDatabaseId(vendorId, databaseId);
          const previous = store.databasesEntityMap()[id] ?? null;
          const wasFavorite = !!previous;
          store.startMutation(mutationKey("favorite-database", id));

          if (wasFavorite) {
            patchState(store, removeEntity(id, databasesConfig));
          } else {
            const optimistic: FavoriteDatabaseItem = {
              id,
              vendor_id: vendorId,
              database_id: databaseId,
              order: store.databasesEntities().length,
            };
            if (note !== undefined) {
              optimistic.note = note;
            }
            patchState(store, addEntity(optimistic, databasesConfig));
          }

          return { vendorId, databaseId, note, id, previous, wasFavorite };
        }),
        mergeMap(
          ({ vendorId, databaseId, note, id, previous, wasFavorite }) => {
            const finish = () =>
              store.finishMutation(mutationKey("favorite-database", id));
            const rollback = () => {
              if (wasFavorite && previous) {
                patchState(store, addEntity(previous, databasesConfig));
                return;
              }
              if (!wasFavorite) {
                patchState(store, removeEntity(id, databasesConfig));
              }
            };

            if (wasFavorite) {
              return collections
                .deleteFavoriteDatabase(vendorId, databaseId)
                .pipe(
                  finalize(finish),
                  tapResponse({
                    next: () => undefined,
                    error: (error: unknown) => {
                      Sentry.captureException(error);
                      rollback();
                    },
                  }),
                );
            }

            return collections
              .addFavoriteDatabase(vendorId, databaseId, {
                vendor_id: vendorId,
                database_id: databaseId,
                note,
                order:
                  store.databasesEntityMap()[id]?.order ??
                  store.databasesEntities().length,
              })
              .pipe(
                finalize(finish),
                tapResponse({
                  next: (saved) => {
                    patchState(store, upsertEntity(saved, databasesConfig));
                  },
                  error: (error: unknown) => {
                    Sentry.captureException(error);
                    rollback();
                  },
                }),
              );
          },
        ),
      ),
    ),
    saveSearch: rxMethod<{
      page: SavedSearchPage;
      query: SearchBarQuery;
      name: string;
      note?: string;
    }>(
      pipe(
        tap(({ page, query }) => {
          store.startMutation(
            mutationKey("save-search", savedSearchIdFromQuery(page, query)),
          );
        }),
        switchMap(({ page, query, name, note }) => {
          const id = savedSearchIdFromQuery(page, query);
          const normalizedNote = normalizedCollectionNote(note);
          return collections
            .saveSearch(id, {
              page,
              query,
              name: name.trim(),
              note: normalizedNote,
              order: store.savedSearches().length,
            })
            .pipe(
              tapResponse({
                next: (saved) => {
                  patchState(
                    store,
                    upsertEntity(
                      withCollectionNote(saved, normalizedNote),
                      searchesConfig,
                    ),
                  );
                  store.finishMutation(mutationKey("save-search", id));
                },
                error: (error: unknown) => {
                  Sentry.captureException(error);
                  store.finishMutation(mutationKey("save-search", id));
                },
              }),
            );
        }),
      ),
    ),
    updateSearch: rxMethod<{
      id: string;
      page: SavedSearchPage;
      query: SearchBarQuery;
      name: string;
      note?: string;
    }>(
      pipe(
        tap(({ id }) => store.startMutation(mutationKey("update-search", id))),
        switchMap(({ id, page, query, name, note }) => {
          const normalizedNote = normalizedCollectionNote(note);
          return collections
            .saveSearch(id, {
              page,
              query,
              name: name.trim(),
              note: normalizedNote,
              order: store.searchesEntityMap()[id]?.order,
            })
            .pipe(
              tapResponse({
                next: (saved) => {
                  patchState(
                    store,
                    updateEntity(
                      {
                        id,
                        changes: withCollectionNote(saved, normalizedNote),
                      },
                      searchesConfig,
                    ),
                  );
                  store.finishMutation(mutationKey("update-search", id));
                },
                error: (error: unknown) => {
                  Sentry.captureException(error);
                  store.finishMutation(mutationKey("update-search", id));
                },
              }),
            );
        }),
      ),
    ),
    deleteSearch: rxMethod<string>(
      pipe(
        tap((id) => store.startMutation(mutationKey("delete-search", id))),
        switchMap((id) =>
          collections.deleteSavedSearch(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id, searchesConfig));
                store.finishMutation(mutationKey("delete-search", id));
              },
              error: (error: unknown) => {
                Sentry.captureException(error);
                store.finishMutation(mutationKey("delete-search", id));
              },
            }),
          ),
        ),
      ),
    ),
    saveComparison: rxMethod<{
      id: string;
      compareUrl: string;
      instances: SavedComparisonInstance[];
      name: string;
      note?: string;
    }>(
      pipe(
        tap(({ id }) =>
          store.startMutation(mutationKey("save-comparison", id)),
        ),
        switchMap(({ id, compareUrl, instances, name, note }) => {
          const normalizedNote = normalizedCollectionNote(note);
          return collections
            .saveComparison(id, {
              compare_url: compareUrl,
              instances,
              name: name.trim(),
              note: normalizedNote,
              order: store.savedComparisons().length,
            })
            .pipe(
              tapResponse({
                next: (saved) => {
                  patchState(
                    store,
                    upsertEntity(
                      withCollectionNote(saved, normalizedNote),
                      comparisonsConfig,
                    ),
                  );
                  store.finishMutation(mutationKey("save-comparison", id));
                },
                error: (error: unknown) => {
                  Sentry.captureException(error);
                  store.finishMutation(mutationKey("save-comparison", id));
                },
              }),
            );
        }),
      ),
    ),
    updateComparison: rxMethod<{
      id: string;
      compareUrl: string;
      instances: SavedComparisonInstance[];
      name: string;
      note?: string;
    }>(
      pipe(
        tap(({ id }) =>
          store.startMutation(mutationKey("update-comparison", id)),
        ),
        switchMap(({ id, compareUrl, instances, name, note }) => {
          const normalizedNote = normalizedCollectionNote(note);
          return collections
            .saveComparison(id, {
              compare_url: compareUrl,
              instances,
              name: name.trim(),
              note: normalizedNote,
              order: store.comparisonsEntityMap()[id]?.order,
            })
            .pipe(
              tapResponse({
                next: (saved) => {
                  patchState(
                    store,
                    updateEntity(
                      {
                        id,
                        changes: withCollectionNote(saved, normalizedNote),
                      },
                      comparisonsConfig,
                    ),
                  );
                  store.finishMutation(mutationKey("update-comparison", id));
                },
                error: (error: unknown) => {
                  Sentry.captureException(error);
                  store.finishMutation(mutationKey("update-comparison", id));
                },
              }),
            );
        }),
      ),
    ),
    deleteComparison: rxMethod<string>(
      pipe(
        tap((id) => store.startMutation(mutationKey("delete-comparison", id))),
        switchMap((id) =>
          collections.deleteSavedComparison(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id, comparisonsConfig));
                store.finishMutation(mutationKey("delete-comparison", id));
              },
              error: (error: unknown) => {
                Sentry.captureException(error);
                store.finishMutation(mutationKey("delete-comparison", id));
              },
            }),
          ),
        ),
      ),
    ),
    saveAdvice: rxMethod<{
      id: string;
      query: SearchBarQuery;
      name: string;
      note?: string;
    }>(
      pipe(
        tap(({ id }) => store.startMutation(mutationKey("save-advice", id))),
        switchMap(({ id, query, name, note }) => {
          const normalizedNote = normalizedCollectionNote(note);
          return collections
            .saveAdvice(id, {
              query,
              name: name.trim(),
              note: normalizedNote,
              order: store.savedAdvices().length,
            })
            .pipe(
              tapResponse({
                next: (saved) => {
                  patchState(
                    store,
                    upsertEntity(
                      withCollectionNote(saved, normalizedNote),
                      advicesConfig,
                    ),
                  );
                  store.finishMutation(mutationKey("save-advice", id));
                },
                error: (error: unknown) => {
                  Sentry.captureException(error);
                  store.finishMutation(mutationKey("save-advice", id));
                },
              }),
            );
        }),
      ),
    ),
    updateAdvice: rxMethod<{
      id: string;
      query: SearchBarQuery;
      name: string;
      note?: string;
    }>(
      pipe(
        tap(({ id }) => store.startMutation(mutationKey("update-advice", id))),
        switchMap(({ id, query, name, note }) => {
          const normalizedNote = normalizedCollectionNote(note);
          return collections
            .saveAdvice(id, {
              query,
              name: name.trim(),
              note: normalizedNote,
              order: store.advicesEntityMap()[id]?.order,
            })
            .pipe(
              tapResponse({
                next: (saved) => {
                  patchState(
                    store,
                    updateEntity(
                      {
                        id,
                        changes: withCollectionNote(saved, normalizedNote),
                      },
                      advicesConfig,
                    ),
                  );
                  store.finishMutation(mutationKey("update-advice", id));
                },
                error: (error: unknown) => {
                  Sentry.captureException(error);
                  store.finishMutation(mutationKey("update-advice", id));
                },
              }),
            );
        }),
      ),
    ),
    deleteAdvice: rxMethod<string>(
      pipe(
        tap((id) => store.startMutation(mutationKey("delete-advice", id))),
        switchMap((id) =>
          collections.deleteSavedAdvice(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id, advicesConfig));
                store.finishMutation(mutationKey("delete-advice", id));
              },
              error: (error: unknown) => {
                Sentry.captureException(error);
                store.finishMutation(mutationKey("delete-advice", id));
              },
            }),
          ),
        ),
      ),
    ),
    reorderDashboardCards: rxMethod<DashboardCardViewModel[]>(
      pipe(
        map((cards) => {
          const snapshot = {
            servers: store.serversEntities().slice(),
            databases: store.databasesEntities().slice(),
            searches: store.searchesEntities().slice(),
            comparisons: store.comparisonsEntities().slice(),
            advices: store.advicesEntities().slice(),
          };
          store.startMutation(mutationKey("reorder-dashboard"));
          cards.forEach((card, index) => {
            const changes = { order: index };
            switch (card.kind) {
              case "favoriteServers":
                patchState(
                  store,
                  updateEntity({ id: card.id, changes }, serversConfig),
                );
                break;
              case "favoriteDatabases":
                patchState(
                  store,
                  updateEntity({ id: card.id, changes }, databasesConfig),
                );
                break;
              case "savedSearches":
                patchState(
                  store,
                  updateEntity({ id: card.id, changes }, searchesConfig),
                );
                break;
              case "savedComparisons":
                patchState(
                  store,
                  updateEntity({ id: card.id, changes }, comparisonsConfig),
                );
                break;
              case "savedAdvices":
                patchState(
                  store,
                  updateEntity({ id: card.id, changes }, advicesConfig),
                );
                break;
            }
          });
          return { cards, snapshot };
        }),
        switchMap(({ cards, snapshot }) => {
          const updates: Array<{
            collectionType: (typeof COLLECTION_TYPES)[keyof typeof COLLECTION_TYPES];
            id: string;
            body: object;
          }> = [];

          for (const card of cards) {
            const collectionType = COLLECTION_TYPES[card.kind];
            switch (card.kind) {
              case "favoriteServers": {
                const item =
                  store.serversEntityMap()[card.id] ??
                  store.serversEntities().find((entry) => entry.id === card.id);
                const resolved = item ? resolveFavoriteServer(item) : null;
                if (!resolved) {
                  break;
                }
                const { id, ...body } = resolved;
                updates.push({ collectionType, id, body });
                break;
              }
              case "favoriteDatabases": {
                const item =
                  store.databasesEntityMap()[card.id] ??
                  store
                    .databasesEntities()
                    .find((entry) => entry.id === card.id);
                const resolved = item ? resolveFavoriteDatabase(item) : null;
                if (!resolved) {
                  break;
                }
                const { id, ...body } = resolved;
                updates.push({ collectionType, id, body });
                break;
              }
              case "savedSearches": {
                const item = store.searchesEntityMap()[card.id];
                if (!item) {
                  break;
                }
                const { id, ...body } = item;
                updates.push({ collectionType, id, body });
                break;
              }
              case "savedComparisons": {
                const item = store.comparisonsEntityMap()[card.id];
                if (!item) {
                  break;
                }
                const { id, ...body } = item;
                updates.push({ collectionType, id, body });
                break;
              }
              case "savedAdvices": {
                const item = store.advicesEntityMap()[card.id];
                if (!item) {
                  break;
                }
                const { id, ...body } = item;
                updates.push({ collectionType, id, body });
                break;
              }
            }
          }

          if (!updates.length) {
            store.finishMutation(mutationKey("reorder-dashboard"));
            return of(null);
          }

          return collections.reorderCollectionItems(updates).pipe(
            finalize(() => {
              store.finishMutation(mutationKey("reorder-dashboard"));
            }),
            tapResponse({
              next: (savedItems) => {
                for (const item of savedItems) {
                  if ("server_id" in item) {
                    patchState(
                      store,
                      updateEntity(
                        {
                          id: favoriteServerId(item.vendor_id, item.server_id),
                          changes: item,
                        },
                        serversConfig,
                      ),
                    );
                  } else if ("database_id" in item) {
                    patchState(
                      store,
                      updateEntity(
                        {
                          id: favoriteDatabaseId(
                            item.vendor_id,
                            item.database_id,
                          ),
                          changes: item,
                        },
                        databasesConfig,
                      ),
                    );
                  } else if ("page" in item) {
                    patchState(
                      store,
                      updateEntity(
                        { id: item.id, changes: item },
                        searchesConfig,
                      ),
                    );
                  } else if ("compare_url" in item) {
                    patchState(
                      store,
                      updateEntity(
                        { id: item.id, changes: item },
                        comparisonsConfig,
                      ),
                    );
                  } else {
                    patchState(
                      store,
                      updateEntity(
                        { id: item.id, changes: item },
                        advicesConfig,
                      ),
                    );
                  }
                }
              },
              error: (error: unknown) => {
                Sentry.captureException(error);
                patchState(
                  store,
                  setAllEntities(snapshot.servers, serversConfig),
                  setAllEntities(snapshot.databases, databasesConfig),
                  setAllEntities(snapshot.searches, searchesConfig),
                  setAllEntities(snapshot.comparisons, comparisonsConfig),
                  setAllEntities(snapshot.advices, advicesConfig),
                );
              },
            }),
          );
        }),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) {
        return;
      }

      const auth = inject(Auth);
      effect(() => {
        if (auth.isAuthenticated()) {
          store.loadAll();
        } else {
          store.clear();
        }
      });
    },
  }),
);
