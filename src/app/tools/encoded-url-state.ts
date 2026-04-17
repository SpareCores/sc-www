import type { ServerCompare } from "../services/server-compare.service";

export type BenchmarkUrlState = {
  id: string;
  config: string;
};

export type DecodedBase64JsonUrlState<T> = {
  value: T | null;
  error: unknown | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isZoneAndRegion(
  value: unknown,
): value is ServerCompare["zonesRegions"][number] {
  return (
    isRecord(value) &&
    typeof value.region === "string" &&
    typeof value.zone === "string"
  );
}

export function isServerCompareUrlState(
  value: unknown,
): value is ServerCompare[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.vendor === "string" &&
        typeof item.server === "string" &&
        isOptionalString(item.display_name) &&
        (item.zonesRegions === undefined ||
          (Array.isArray(item.zonesRegions) &&
            item.zonesRegions.every(isZoneAndRegion))),
    )
  );
}

export function isBenchmarkUrlState(
  value: unknown,
): value is BenchmarkUrlState {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.config === "string"
  );
}

export function decodeBase64JsonUrlState<T>(
  encoded: string,
  isValid: (value: unknown) => value is T,
): DecodedBase64JsonUrlState<T> {
  try {
    const decodedValue: unknown = JSON.parse(atob(encoded));

    if (!isValid(decodedValue)) {
      return {
        value: null,
        error: new Error("Decoded URL state has an unexpected shape."),
      };
    }

    return {
      value: decodedValue,
      error: null,
    };
  } catch (error) {
    return {
      value: null,
      error,
    };
  }
}
