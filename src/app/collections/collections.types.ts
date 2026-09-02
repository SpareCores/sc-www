import type { SearchBarQuery } from "../components/search-bar/search-bar.types";
import type {
  DatabaseCompare,
  ServerCompare,
} from "../services/server-compare.service";

export type SavedComparisonInstance = ServerCompare | DatabaseCompare;

export const COLLECTION_TYPES = {
  favoriteServers: "favorite_servers",
  favoriteDatabases: "favorite_databases",
  savedSearches: "saved_searches",
  savedComparisons: "saved_comparisons",
  savedAdvices: "saved_advices",
} as const;

export type CollectionType =
  (typeof COLLECTION_TYPES)[keyof typeof COLLECTION_TYPES];

export type CollectionItemBase = {
  id: string;
  note?: string;
  order?: number;
};

export type FavoriteServerItem = CollectionItemBase & {
  vendor_id: string;
  server_id: string;
};

export type FavoriteDatabaseItem = CollectionItemBase & {
  vendor_id: string;
  database_id: string;
};

export type SavedSearchPage = "servers" | "databases";

export type SavedNamedItem = CollectionItemBase & {
  name: string;
};

export type SavedSearchItem = SavedNamedItem & {
  page: SavedSearchPage;
  query: SearchBarQuery;
};

export type SavedComparisonItem = SavedNamedItem & {
  compare_url: string;
  instances: SavedComparisonInstance[];
};

export type SavedAdviceItem = SavedNamedItem & {
  query: SearchBarQuery;
};

export type CollectionItemMap = {
  [COLLECTION_TYPES.favoriteServers]: FavoriteServerItem;
  [COLLECTION_TYPES.favoriteDatabases]: FavoriteDatabaseItem;
  [COLLECTION_TYPES.savedSearches]: SavedSearchItem;
  [COLLECTION_TYPES.savedComparisons]: SavedComparisonItem;
  [COLLECTION_TYPES.savedAdvices]: SavedAdviceItem;
};

export type CollectionItemPayload<T extends CollectionType> = Omit<
  CollectionItemMap[T],
  "id"
>;

export type DashboardFilterKey =
  | "favoriteServers"
  | "favoriteDatabases"
  | "savedSearches"
  | "savedComparisons"
  | "savedAdvices";

export type DashboardFilters = Record<DashboardFilterKey, boolean>;

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  favoriteServers: true,
  favoriteDatabases: true,
  savedSearches: true,
  savedComparisons: true,
  savedAdvices: true,
};

export type DashboardCardKind = DashboardFilterKey;

export type DashboardCardDetailRow = {
  field: string;
  value: string;
};

export type DashboardCardDetailsKind = "filters" | "instances";

export type DashboardCardViewModel = {
  kind: DashboardCardKind;
  id: string;
  title: string;
  subtitle?: string;
  note?: string;
  order: number;
  href?: string | any[];
  icon?: string;
  detailsKind?: DashboardCardDetailsKind;
  details?: DashboardCardDetailRow[];
};

const COLLECTION_ID_PART_SEPARATOR = "\u001f";

function encodeCollectionItemId(parts: string[]): string {
  const raw = parts.join(COLLECTION_ID_PART_SEPARATOR);
  const bytes = new TextEncoder().encode(raw);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeCollectionItemId(id: string, partCount: number): string[] | null {
  try {
    const normalized = id.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(normalized + padding);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const raw = new TextDecoder().decode(bytes);
    const parts = raw.split(COLLECTION_ID_PART_SEPARATOR);
    if (parts.length !== partCount || parts.some((part) => !part)) {
      return null;
    }
    return parts;
  } catch {
    return null;
  }
}

function parseLegacyFavoriteId(
  id: string,
): { vendorId: string; entityId: string } | null {
  const separator = id.indexOf("~");
  if (separator <= 0 || separator === id.length - 1) {
    return null;
  }
  return {
    vendorId: id.slice(0, separator),
    entityId: id.slice(separator + 1),
  };
}

export function favoriteServerId(vendorId: string, serverId: string): string {
  return encodeCollectionItemId([vendorId, serverId]);
}

export function favoriteDatabaseId(
  vendorId: string,
  databaseId: string,
): string {
  return encodeCollectionItemId([vendorId, databaseId]);
}

export function parseFavoriteServerId(
  id: string,
): Pick<FavoriteServerItem, "vendor_id" | "server_id"> | null {
  const decoded = decodeCollectionItemId(id, 2);
  if (decoded) {
    return { vendor_id: decoded[0], server_id: decoded[1] };
  }

  const legacy = parseLegacyFavoriteId(id);
  if (!legacy) {
    return null;
  }

  return {
    vendor_id: legacy.vendorId,
    server_id: legacy.entityId,
  };
}

export function parseFavoriteDatabaseId(
  id: string,
): Pick<FavoriteDatabaseItem, "vendor_id" | "database_id"> | null {
  const decoded = decodeCollectionItemId(id, 2);
  if (decoded) {
    return { vendor_id: decoded[0], database_id: decoded[1] };
  }

  const legacy = parseLegacyFavoriteId(id);
  if (!legacy) {
    return null;
  }

  return {
    vendor_id: legacy.vendorId,
    database_id: legacy.entityId,
  };
}

export function resolveFavoriteServer(
  item: Partial<FavoriteServerItem> & { id?: string },
): FavoriteServerItem | null {
  const parsed = item.id ? parseFavoriteServerId(item.id) : null;
  const vendor_id = item.vendor_id || parsed?.vendor_id;
  const server_id = item.server_id || parsed?.server_id;
  if (!vendor_id || !server_id) {
    return null;
  }
  return {
    ...item,
    id: favoriteServerId(vendor_id, server_id),
    vendor_id,
    server_id,
    note: item.note,
    order: item.order,
  };
}

export function resolveFavoriteDatabase(
  item: Partial<FavoriteDatabaseItem> & { id?: string },
): FavoriteDatabaseItem | null {
  const parsed = item.id ? parseFavoriteDatabaseId(item.id) : null;
  const vendor_id = item.vendor_id || parsed?.vendor_id;
  const database_id = item.database_id || parsed?.database_id;
  if (!vendor_id || !database_id) {
    return null;
  }
  return {
    ...item,
    id: favoriteDatabaseId(vendor_id, database_id),
    vendor_id,
    database_id,
    note: item.note,
    order: item.order,
  };
}
