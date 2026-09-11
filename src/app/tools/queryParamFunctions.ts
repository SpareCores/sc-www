export function decodeQueryParams(search: string) {
  if (!search.length) {
    return {};
  }

  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const object: Record<string, string | string[]> = {};

  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    object[key] = values.length > 1 ? values : values[0];
  }

  return object;
}

export function encodeQueryParams(params: any): string | null {
  if (!params || params?.length == 0) {
    return null;
  }

  const parts: string[] = [];

  for (const key of Object.keys(params)) {
    const value = params[key];

    if (Array.isArray(value)) {
      if (!value.length) {
        continue;
      }

      for (const entry of value) {
        if (entry === undefined || entry === null || entry === "") {
          continue;
        }
        parts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(entry))}`,
        );
      }
      continue;
    }

    if (value === undefined || value === null || value === "") {
      continue;
    }

    parts.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  }

  return parts.length ? parts.join("&") : null;
}
