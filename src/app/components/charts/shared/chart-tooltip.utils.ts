import { BenchmarkChartServerIdentity } from "./benchmark-data.types";

export const CHART_TOOLTIP_MAX_LINE_LENGTH = 64;

export function formatServerTooltipIdentity(
  server: BenchmarkChartServerIdentity & { display_name?: string },
): string {
  const vendor = server.vendor_name?.trim() || server.vendor_id?.trim();
  const apiReference = server.api_reference?.trim();

  if (vendor && apiReference) {
    return `${apiReference} by ${vendor}`;
  }

  if (vendor) {
    return vendor;
  }

  if (apiReference) {
    return apiReference;
  }

  return server.display_name?.trim() || "";
}

export function getDatasetTooltipIdentity(dataset: object | undefined): string {
  const identity = (dataset as { serverTooltipIdentity?: string } | undefined)
    ?.serverTooltipIdentity;

  return identity?.trim() || "";
}

export function buildCompareTooltipTitle(
  identity: string,
  context: string,
): string | string[] {
  const lines = [identity, context].filter(Boolean);

  return lines.length > 1 ? lines : lines[0] || "";
}

export function formatStaticWebFileSizeLabel(
  size: string | number | null | undefined,
): string {
  if (size == null) {
    return "";
  }

  const text = String(size).trim();
  const kibibyteSuffixMatch = text.match(/^(\d+)k$/i);

  if (kibibyteSuffixMatch) {
    return `${kibibyteSuffixMatch[1]} KiB`;
  }

  const numeric = Number(text);
  if (!Number.isNaN(numeric)) {
    return `${numeric} KiB`;
  }

  return text;
}

export function formatStaticWebFileSizeTooltipContext(
  size: string | number | null | undefined,
): string {
  const formattedSize = formatStaticWebFileSizeLabel(size);

  return formattedSize ? `${formattedSize} file size` : "file size";
}

export function withServerTooltipIdentity<T extends object>(
  dataset: T,
  server: BenchmarkChartServerIdentity & { display_name?: string },
): T & { serverTooltipIdentity: string } {
  return {
    ...dataset,
    serverTooltipIdentity: formatServerTooltipIdentity(server),
  };
}

export function wrapTextAtWordBoundaries(
  text: string,
  maxLineLength: number,
): string[] {
  const trimmed = text.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.length <= maxLineLength) {
    return [trimmed];
  }

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxLineLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
