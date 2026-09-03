import type { SearchBarQuery } from "../components/search-bar/search-bar.types";
import {
  decodeBase64JsonUrlState,
  isBenchmarkUrlState,
} from "../tools/encoded-url-state";
import { encodeQueryParams } from "../tools/queryParamFunctions";
import type {
  SavedComparisonInstance,
  SavedSearchPage,
} from "./collections.types";
import openApiSpec from "../../../sdk/openapi.json";

export const SAVED_NAME_MIN_LENGTH = 3;
export const SAVED_NOTE_MAX_LENGTH = 2000;
export const GUEST_COMPARE_LIMIT = 4;
export const SAVED_ITEM_FALLBACK_NOTE =
  "You can change this short note when saving or editing this item.";

export function isValidSavedName(name: string): boolean {
  return name.trim().length >= SAVED_NAME_MIN_LENGTH;
}

export function sortByOrder<T extends { order?: number; id: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.id.localeCompare(b.id);
  });
}

type OpenApiParameter = {
  name?: string;
  schema?: {
    title?: string;
    type?: string;
    anyOf?: Array<{ title?: string; type?: string }>;
  };
};

const OPENAPI_QUERY_PATHS = [
  "/servers",
  "/databases",
  "/server_prices",
] as const;

function openApiParameterIsArray(parameter: OpenApiParameter): boolean {
  if (parameter.schema?.type === "array") {
    return true;
  }
  return (parameter.schema?.anyOf ?? []).some(
    (option) => option.type === "array",
  );
}

function openApiParameterTitle(parameter: OpenApiParameter): string | null {
  const schemaTitle = parameter.schema?.title?.trim();
  if (schemaTitle) {
    return schemaTitle;
  }

  for (const option of parameter.schema?.anyOf ?? []) {
    const optionTitle = option.title?.trim();
    if (optionTitle) {
      return optionTitle;
    }
  }

  return null;
}

function buildOpenApiQueryMetadata(): {
  arrayKeys: Set<string>;
  titles: Record<string, string>;
} {
  const arrayKeys = new Set<string>();
  const titles: Record<string, string> = {};

  for (const path of OPENAPI_QUERY_PATHS) {
    const parameters = (openApiSpec as any)?.paths?.[path]?.get?.parameters;
    if (!Array.isArray(parameters)) {
      continue;
    }

    for (const parameter of parameters as OpenApiParameter[]) {
      if (!parameter.name) {
        continue;
      }

      if (openApiParameterIsArray(parameter)) {
        arrayKeys.add(parameter.name);
      }

      if (!titles[parameter.name]) {
        const title = openApiParameterTitle(parameter);
        if (title) {
          titles[parameter.name] = title;
        }
      }
    }
  }

  return { arrayKeys, titles };
}

const { arrayKeys: OPENAPI_ARRAY_QUERY_KEYS, titles: OPENAPI_FILTER_TITLES } =
  buildOpenApiQueryMetadata();

function normalizeQueryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeQueryValue);
  }
  if (value && typeof value === "object") {
    return normalizeQueryObject(value as Record<string, unknown>);
  }
  return value;
}

function splitCommaSeparatedQueryValue(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeArrayQueryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) =>
        typeof entry === "string"
          ? splitCommaSeparatedQueryValue(entry)
          : [entry],
      )
      .map(normalizeQueryValue)
      .filter((entry) => entry !== undefined && entry !== null && entry !== "");
  }

  if (typeof value === "string") {
    return splitCommaSeparatedQueryValue(value);
  }

  return normalizeQueryValue(value);
}

function normalizeQueryObject(
  query: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(query).sort()) {
    const value = query[key];
    if (value === undefined || value === null || value === "") {
      continue;
    }
    const next = OPENAPI_ARRAY_QUERY_KEYS.has(key)
      ? normalizeArrayQueryValue(value)
      : normalizeQueryValue(value);
    if (
      next === undefined ||
      next === null ||
      next === "" ||
      (Array.isArray(next) && !next.length)
    ) {
      continue;
    }
    normalized[key] = next;
  }
  return normalized;
}

export function normalizeSearchQuery(
  query: SearchBarQuery | null | undefined,
): Record<string, unknown> {
  return normalizeQueryObject(
    query as Record<string, unknown> | null | undefined,
  );
}

export function stableSearchQueryKey(
  page: SavedSearchPage,
  query: SearchBarQuery,
): string {
  return `${page}:${listingSearchQueryIdentity(query)}`;
}

export function savedSearchIdFromQuery(
  page: SavedSearchPage,
  query: SearchBarQuery,
): string {
  const key = stableSearchQueryKey(page, query);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return `search-${page}-${Math.abs(hash).toString(36)}`;
}

export function queriesEqual(
  left: SearchBarQuery,
  right: SearchBarQuery,
): boolean {
  return (
    JSON.stringify(normalizeSearchQuery(left)) ===
    JSON.stringify(normalizeSearchQuery(right))
  );
}

export function truncateNote(note: string | undefined, max = 160): string {
  if (!note) {
    return "";
  }
  if (note.length <= max) {
    return note;
  }
  return `${note.slice(0, max).trimEnd()}…`;
}

const LISTING_META_QUERY_KEYS = new Set(["page", "add_total_count_header"]);

export function listingSearchQuery(
  query: SearchBarQuery,
): Record<string, unknown> {
  const normalized = normalizeSearchQuery(query);
  for (const key of LISTING_META_QUERY_KEYS) {
    delete normalized[key];
  }
  return normalized;
}

function stringifyListingQueryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry))
      .sort((left, right) => left.localeCompare(right))
      .join(",");
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

export function listingSearchQueryIdentity(query: SearchBarQuery): string {
  const listing = listingSearchQuery(query);
  const shaped: Record<string, string> = {};

  for (const key of Object.keys(listing).sort()) {
    shaped[key] = stringifyListingQueryValue(listing[key]);
  }

  return JSON.stringify(shaped);
}

export function isDefaultListingQuery(query: SearchBarQuery): boolean {
  return Object.keys(listingSearchQuery(query)).length === 0;
}

const ADVICE_DASHBOARD_HIDDEN_KEYS = new Set([
  "page",
  "add_total_count_header",
]);

const ADVICE_NUMERIC_KEYS = new Set([
  "avg_cpu_utilization",
  "minimum_memory",
  "peak_gpu_memory",
  "limit",
  "page",
]);

const DASHBOARD_DETAIL_VALUE_MAX = 96;

const DASHBOARD_DETAIL_HIDDEN_KEYS = new Set([
  "columns",
  "limit",
  "currency",
  "best_price_allocation",
]);

const DASHBOARD_FILTER_LABELS: Record<string, string> = {
  workload_id: "Workload profile",
  baseline_vendor: "Baseline vendor",
  baseline_server: "Baseline server",
  avg_cpu_utilization: "Average utilization",
  minimum_memory: "Required memory (RAM)",
  peak_gpu_memory: "Required GPU memory (VRAM)",
  optimization_goal: "Optimization goal",
  limit_architecture: "CPU architecture",
  limit_cpu_allocation: "CPU allocation",
  price_allocation_enabled: "Price allocation",
  best_price_allocation: "Price allocation type",
  baseline_region_enabled: "Region",
  baseline_vendor_region: "Available region",
  workload_config: "Workload config",
  limit: "Results per page",
  columns: "Columns",
  benchmark: "Benchmark",
  order_dir: "Order direction",
};

const DASHBOARD_FILTER_VALUE_LABELS: Record<string, Record<string, string>> = {
  optimization_goal: {
    performance: "Performance",
    cost: "Cost",
    "cost-efficiency": "Cost-efficiency",
  },
};

function toDashboardTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z0-9]{2,}$/.test(word)) {
        return word;
      }

      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function humanizeFilterKey(key: string): string {
  return (
    DASHBOARD_FILTER_LABELS[key] ||
    OPENAPI_FILTER_TITLES[key] ||
    toDashboardTitleCase(key.replace(/[_-]+/g, " ").trim())
  );
}

function isEmptyWorkloadConfig(value: unknown): boolean {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return !trimmed.length || trimmed === "{}";
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }

  return false;
}

function formatWorkloadProfileValue(value: unknown): string {
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue) {
    return "—";
  }

  if (!normalizedValue.toLowerCase().startsWith("workload_profile")) {
    return toDashboardTitleCase(normalizedValue.replace(/[_-]+/g, " ").trim());
  }

  const [, ...segments] = normalizedValue.split(":");

  if (!segments.length) {
    return "—";
  }

  return (
    segments
      .map((segment) =>
        toDashboardTitleCase(segment.replace(/[_-]+/g, " ").trim()),
      )
      .filter(Boolean)
      .join(": ") || "—"
  );
}

function formatQueryDetailValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (!value.length) {
      return "—";
    }
    return value.map((entry) => formatQueryDetailValue(entry)).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function formatBenchmarkValue(value: unknown): string {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id : "";
    const config =
      typeof record.config === "string"
        ? record.config
        : record.config
          ? JSON.stringify(record.config)
          : "";
    if (id && config) {
      return `${id} (${config})`;
    }
    if (id) {
      return id;
    }
  }

  if (typeof value !== "string" || !value.trim()) {
    return "—";
  }

  const raw = value.trim();
  let decodedParam = raw;
  try {
    decodedParam = decodeURIComponent(raw);
  } catch {
    decodedParam = raw;
  }

  for (const candidate of [decodedParam, raw]) {
    const decoded = decodeBase64JsonUrlState(candidate, isBenchmarkUrlState);
    if (decoded.value) {
      const config = decoded.value.config?.trim();
      return config ? `${decoded.value.id} (${config})` : decoded.value.id;
    }
  }

  return value;
}

function formatFilterValue(key: string, value: unknown): string {
  if (key === "workload_id") {
    return formatWorkloadProfileValue(value);
  }

  if (key === "benchmark") {
    return formatBenchmarkValue(value);
  }

  const valueLabels = DASHBOARD_FILTER_VALUE_LABELS[key];
  if (valueLabels && (typeof value === "string" || typeof value === "number")) {
    const mapped = valueLabels[String(value)];
    if (mapped) {
      return mapped;
    }
  }

  if (key === "avg_cpu_utilization") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return `${numeric}%`;
    }
  }

  if (key === "minimum_memory" || key === "peak_gpu_memory") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return `${numeric} GiB`;
    }
  }

  if (typeof value === "boolean" || value === "true" || value === "false") {
    return value === true || value === "true" ? "yes" : "no";
  }

  return formatQueryDetailValue(value);
}

function truncateDetailValue(value: string): string {
  if (value.length <= DASHBOARD_DETAIL_VALUE_MAX) {
    return value;
  }
  return `${value.slice(0, DASHBOARD_DETAIL_VALUE_MAX).trimEnd()}…`;
}

function formatQueryDetailEntries(
  query: Record<string, unknown>,
): { field: string; value: string }[] {
  const remaining = { ...query };
  const rows: { field: string; value: string }[] = [];

  const baselineVendor = remaining.baseline_vendor;
  const baselineServer = remaining.baseline_server;
  if (baselineVendor !== undefined || baselineServer !== undefined) {
    rows.push({
      field: "Baseline server",
      value: truncateDetailValue(
        [baselineVendor, baselineServer]
          .filter((part) => part !== undefined && part !== null && part !== "")
          .map((part) => String(part))
          .join(" ") || "—",
      ),
    });
    delete remaining.baseline_vendor;
    delete remaining.baseline_server;
  }

  if (isEmptyWorkloadConfig(remaining.workload_config)) {
    delete remaining.workload_config;
  }

  for (const key of DASHBOARD_DETAIL_HIDDEN_KEYS) {
    delete remaining[key];
  }

  for (const [key, value] of Object.entries(remaining)) {
    rows.push({
      field: humanizeFilterKey(key),
      value: formatFilterValue(key, value),
    });
  }

  return rows;
}

export function savedSearchDetailEntries(
  query: SearchBarQuery,
): { field: string; value: string }[] {
  return formatQueryDetailEntries(listingSearchQuery(query));
}

export function savedAdviceDetailEntries(
  query: SearchBarQuery,
): { field: string; value: string }[] {
  return formatQueryDetailEntries(adviceComparableQuery(query));
}

export function savedComparisonDetailEntries(
  instances: SavedComparisonInstance[] | null | undefined,
): { field: string; value: string; fieldHref?: string; valueHref?: string }[] {
  if (!instances?.length) {
    return [];
  }
  return instances.map((instance) => {
    if ("server" in instance) {
      return {
        field: instance.vendor,
        value: instance.display_name || instance.server,
        fieldHref: `/vendors/${instance.vendor}`,
        valueHref: `/server/${instance.vendor}/${instance.server}`,
      };
    }

    return {
      field: instance.vendor,
      value: instance.display_name || instance.database,
      fieldHref: `/vendors/${instance.vendor}`,
      valueHref: `/database/${instance.vendor}/${instance.database}`,
    };
  });
}

export function collectionItemHref(
  path: string,
  query: SearchBarQuery,
): string {
  const normalized = normalizeSearchQuery(query);
  const serializable: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(normalized)) {
    if (Array.isArray(value)) {
      serializable[key] = value;
      continue;
    }

    if (value && typeof value === "object") {
      serializable[key] = JSON.stringify(value);
      continue;
    }

    serializable[key] = value;
  }

  const encoded = encodeQueryParams(serializable);
  return encoded ? `${path}?${encoded}` : path;
}

function coerceAdviceQueryValue(key: string, value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => coerceAdviceQueryValue(key, entry));
  }

  if (typeof value === "string" && ADVICE_NUMERIC_KEYS.has(key)) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (typeof value === "string") {
    try {
      if (
        (value.startsWith("{") && value.endsWith("}")) ||
        (value.startsWith("[") && value.endsWith("]"))
      ) {
        return normalizeQueryValue(JSON.parse(value));
      }
    } catch {
      return value;
    }
  }

  return value;
}

export function adviceComparableQuery(
  query: SearchBarQuery,
): Record<string, unknown> {
  const normalized = normalizeSearchQuery(query);
  const comparable: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(normalized)) {
    if (ADVICE_DASHBOARD_HIDDEN_KEYS.has(key)) {
      continue;
    }
    comparable[key] = coerceAdviceQueryValue(key, value);
  }

  return normalizeQueryObject(comparable);
}

export function adviceQueriesEqual(
  left: SearchBarQuery,
  right: SearchBarQuery,
): boolean {
  return (
    JSON.stringify(adviceComparableQuery(left)) ===
    JSON.stringify(adviceComparableQuery(right))
  );
}
