import {
  DetailsCardRow,
  DetailsCardTooltip,
  DetailsRowInput,
} from "./details-card.types";

export function toDetailsValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "check" : "x";
  }
  return String(value);
}

export function buildDetailsRows(
  items: DetailsRowInput[],
  describe: (id: string) => string | undefined = () => undefined,
): DetailsCardRow[] {
  return items
    .map((item) => {
      const description = item.description ?? describe(item.id);
      return {
        id: item.id,
        name: item.name,
        values: [toDetailsValue(item.value)],
        routerLink: item.routerLink,
        tooltips: description
          ? [{ key: item.id, content: description }]
          : undefined,
      };
    })
    .filter((row) => row.values[0] !== "");
}

export function dedupeIdentityRows(
  rows: DetailsCardRow[],
  identityIds: string[],
): DetailsCardRow[] {
  const nameRow = rows.find((row) => row.id === "name");
  if (!nameRow) {
    return rows;
  }

  const nameValue = normalizeComparableValue(nameRow.values[0]);
  const isDuplicate = (row: DetailsCardRow) =>
    row.id !== "name" &&
    identityIds.includes(row.id) &&
    normalizeComparableValue(row.values[0]) === nameValue;
  const duplicates = rows.filter(isDuplicate);
  const nameTooltips = duplicates.length
    ? uniqueTooltips(
        [nameRow, ...duplicates].flatMap((row) => row.tooltips || []),
      )
    : nameRow.tooltips || [];

  return rows
    .filter((row) => !isDuplicate(row))
    .map((row) =>
      row.id === "name" ? { ...row, tooltips: nameTooltips } : row,
    );
}

function uniqueTooltips(tooltips: DetailsCardTooltip[]): DetailsCardTooltip[] {
  const seen = new Set<string>();
  return tooltips.filter((tooltip) => {
    if (seen.has(tooltip.key)) {
      return false;
    }
    seen.add(tooltip.key);
    return true;
  });
}

function normalizeComparableValue(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .toLowerCase();
}
