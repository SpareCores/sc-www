import { DatabasePrice, Region } from "../../../sdk/data-contracts";

export function attachDatabasePrices(
  prices: DatabasePrice[],
  regions: Region[],
): (DatabasePrice & { region?: Region })[] {
  return prices
    .map((price) => ({
      ...price,
      region: regions.find(
        (region) =>
          region.vendor_id === price.vendor_id &&
          region.region_id === price.region_id,
      ),
    }))
    .sort((a, b) => a.price - b.price);
}

export function formatSpecBoolean(
  value: boolean | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value ? "check" : "x";
}

export function formatSpecList(value: unknown): string | null {
  if (!Array.isArray(value) || !value.length) {
    return null;
  }
  return value.join(", ");
}
