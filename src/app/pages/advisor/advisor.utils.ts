import { AdvisorBaselineServer } from "./advisor.types";

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([left], [right]) => left.localeCompare(right),
    );

    return `{${entries
      .map(
        ([key, entryValue]) =>
          `${JSON.stringify(key)}:${stableStringify(entryValue)}`,
      )
      .join(",")}}`;
  }

  return JSON.stringify(value ?? null);
}

export function normalizeBenchmarkConfig(config: unknown): string {
  if (typeof config === "string") {
    const trimmed = config.trim();

    if (!trimmed) {
      return stableStringify({});
    }

    try {
      return stableStringify(JSON.parse(trimmed));
    } catch {
      return trimmed;
    }
  }

  return stableStringify(config ?? {});
}

export function tokenizeAdvisorSearch(value: string): string[] {
  return value.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesAdvisorBaselineServer(
  server: Pick<AdvisorBaselineServer, "vendor_id" | "api_reference">,
  searchValue: string,
): boolean {
  const tokens = tokenizeAdvisorSearch(searchValue);

  if (!tokens.length) {
    return false;
  }

  const searchable =
    `${server.vendor_id} ${server.api_reference}`.toLowerCase();
  return tokens.every((token) => searchable.includes(token));
}
