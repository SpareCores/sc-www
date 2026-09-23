const PRESENTATION_ONLY_KEYS = new Set(["columns"]);

export function toSearchParams(
  query: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query || {})) {
    if (PRESENTATION_ONLY_KEYS.has(key)) {
      continue;
    }
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }

    result[key] = Array.isArray(value) ? [...value].map(String).sort() : value;
  }

  return Object.keys(result)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = result[key];
      return acc;
    }, {});
}

export function areSearchParamsEqual(
  previous: Record<string, unknown> | null | undefined,
  next: Record<string, unknown> | null | undefined,
): boolean {
  return (
    JSON.stringify(toSearchParams(previous)) ===
    JSON.stringify(toSearchParams(next))
  );
}
