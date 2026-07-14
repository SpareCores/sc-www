import type { ChartType, TooltipItem } from "chart.js";
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
  if (!text) {
    return "";
  }

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

type BenchmarkMetaNoteSource = {
  benchmark_id: string;
  name?: string | null;
  note?: string | null;
};

type BenchmarkMetaNoteOptions = {
  includeBenchmarkName?: boolean;
};

function formatBenchmarkShortName(name: string): string {
  const trimmed = name.trim();
  const colonIndex = trimmed.indexOf(": ");

  return colonIndex === -1 ? trimmed : trimmed.slice(colonIndex + 2).trim();
}

export function formatBenchmarkNoteTooltip(
  name: string | null | undefined,
  note: string,
  options?: BenchmarkMetaNoteOptions,
): string {
  const trimmedNote = note.trim();
  const includeBenchmarkName = options?.includeBenchmarkName ?? true;

  if (!includeBenchmarkName) {
    return trimmedNote;
  }

  const shortName = name?.trim() ? formatBenchmarkShortName(name) : "";

  if (!shortName) {
    return `- ${trimmedNote}`;
  }

  return `- ${shortName}: ${trimmedNote}`;
}

export function getBenchmarkMetaNote(
  benchmarkMeta: BenchmarkMetaNoteSource[] | undefined,
  benchmarkId: string,
  options?: BenchmarkMetaNoteOptions,
): string | undefined {
  const benchmark = benchmarkMeta?.find(
    (item) => item.benchmark_id === benchmarkId,
  );
  const note = benchmark?.note?.trim();

  if (!note) {
    return undefined;
  }

  return formatBenchmarkNoteTooltip(benchmark?.name, note, options);
}

export function getBenchmarkMetaNotes(
  benchmarkMeta: BenchmarkMetaNoteSource[] | undefined,
  benchmarkIds: ReadonlyArray<string | null | undefined>,
  options?: BenchmarkMetaNoteOptions,
): string {
  const notes = new Set<string>();

  for (const benchmarkId of benchmarkIds) {
    if (!benchmarkId) {
      continue;
    }

    const note = getBenchmarkMetaNote(benchmarkMeta, benchmarkId, options);
    if (note) {
      notes.add(note);
    }
  }

  return [...notes].join("\n");
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

export function chartTooltipLabelColor(tooltipItem: TooltipItem<ChartType>) {
  const style = tooltipItem.chart
    .getDatasetMeta(tooltipItem.datasetIndex)
    .controller.getStyle(tooltipItem.dataIndex, false);
  const color = tooltipItem.dataset.borderColor
    ? style.borderColor
    : style.backgroundColor;

  const tooltip = tooltipItem.chart.tooltip;
  if (tooltip) {
    tooltip.options.multiKeyBackground = color;
  }

  return {
    backgroundColor: color,
    borderColor: color,
    borderWidth: 0,
    borderRadius: 0,
  };
}

export const chartTooltipDefaults = {
  plugins: {
    tooltip: {
      multiKeyBackground: "transparent",
      callbacks: {
        labelColor: chartTooltipLabelColor,
      },
    },
  },
};
