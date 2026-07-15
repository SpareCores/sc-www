import {
  formatCpuCacheSize,
  formatGpuCount,
  formatGpuMemory,
  formatIpv4Count,
  formatMemoryAmount,
  formatMonthlyTraffic,
  formatNetworkSpeed,
  formatStorageSize,
} from "../../../pipes/pipe-utils";

type BenchmarkValue = number | string | null | undefined;

type TableBenchmarkLike = {
  higher_is_better?: boolean | null;
};

type TableColumnLike = {
  id: string;
  unit?: string | null;
};

type TableServerLike = {
  memory_amount?: number | null;
  gpu_memory_min?: number | null;
  gpu_memory_total?: number | null;
  storage_size?: number | null;
};

const NETWORK_SPEED_PROPERTY_IDS = new Set([
  "network_speed_baseline",
  "network_speed_max",
  "network_speed_min",
]);

const CPU_CACHE_PROPERTY_IDS = new Set([
  "cpu_l1d_cache",
  "cpu_l2_cache",
  "cpu_l3_cache",
]);

const TRAFFIC_PROPERTY_IDS = new Set(["inbound_traffic", "outbound_traffic"]);

const LOWER_IS_BETTER_PROPERTY_IDS = new Set(["average_time_to_start"]);

const HIDDEN_COMPARE_METADATA_PROPERTY_IDS = new Set([
  "vendor_id",
  "server_id",
  "name",
  "api_reference",
  "display_name",
  "description",
  "observed_at",
]);

export function isCompareMetadataPropertyHidden(
  category: string,
  propertyId: string,
): boolean {
  return (
    category === "meta" && HIDDEN_COMPARE_METADATA_PROPERTY_IDS.has(propertyId)
  );
}

export function formatNumberWithCommas(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getBestBenchmarkCellStyle(
  value: BenchmarkValue,
  values: BenchmarkValue[],
  benchmark: TableBenchmarkLike | null | undefined,
  bestCellStyle: string,
) {
  const numericValue = toFiniteNumber(value);
  if (value === "-" || numericValue === undefined || numericValue === 0) {
    return "";
  }

  let isBest = true;
  values.forEach((candidate) => {
    const numericCandidate = toFiniteNumber(candidate);
    if (numericCandidate !== undefined) {
      if (benchmark?.higher_is_better === false) {
        if (numericCandidate < numericValue) {
          isBest = false;
        }
      } else if (numericCandidate > numericValue) {
        isBest = false;
      }
    }
  });

  return isBest ? bestCellStyle : "";
}

export function getBestPropertyCellStyle(
  name: string,
  server: TableServerLike,
  servers: TableServerLike[],
  bestCellStyle: string,
) {
  const prop = getServerFieldValue(server, name);
  if (prop === undefined || prop === null || prop === 0 || !servers?.length) {
    return "";
  }

  if (typeof prop !== "number") {
    return "";
  }

  const values = servers
    .map((item) => getServerFieldValue(item, name))
    .filter(isFiniteNumber);

  if (values.length === 0) {
    return "";
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const best = LOWER_IS_BETTER_PROPERTY_IDS.has(name) ? min : max;
  return prop === best && max > min ? bestCellStyle : "";
}

export function getServerPropertyValue(
  column: TableColumnLike,
  server: TableServerLike,
) {
  const name = column.id;
  const prop = getServerFieldValue(server, name);

  if (name === "hw_virt") {
    if (prop === true) {
      return formatBooleanIconHtml(true);
    }

    if (prop === false) {
      return formatBooleanIconHtml(false);
    }

    if (prop === undefined || prop === null) {
      return "-";
    }

    if (typeof prop === "string" && prop.trim().toLowerCase() === "none") {
      return "-";
    }
  }

  if (typeof prop === "boolean") {
    return "-";
  }

  if (prop === undefined || prop === null) {
    return "-";
  }

  if (
    typeof prop === "string" &&
    (prop.trim() === "" || prop.trim().toLowerCase() === "none")
  ) {
    return "-";
  }

  if (name === "memory_amount") {
    return formatMemoryAmount(server.memory_amount);
  }

  if (name === "storage_size") {
    return formatStorageSize(server.storage_size);
  }

  if (name === "gpu_memory_min") {
    return formatGpuMemory(server.gpu_memory_min);
  }

  if (name === "gpu_memory_total") {
    return formatGpuMemory(server.gpu_memory_total);
  }

  if (NETWORK_SPEED_PROPERTY_IDS.has(name)) {
    return formatNetworkSpeed(prop as number);
  }

  if (CPU_CACHE_PROPERTY_IDS.has(name)) {
    return formatCpuCacheSize(prop as number);
  }

  if (TRAFFIC_PROPERTY_IDS.has(name)) {
    return formatMonthlyTraffic(prop as number);
  }

  if (name === "ipv4") {
    return formatIpv4Count(prop as number);
  }

  if (name === "gpu_count") {
    return formatGpuCount(prop as number, "-") ?? "-";
  }

  if (typeof prop === "number") {
    if (column.unit === "byte") {
      return formatBytesToSize(prop);
    }

    return column.unit ? `${prop} ${column.unit}` : `${prop}`;
  }

  if (typeof prop === "string") {
    return prop;
  }

  if (Array.isArray(prop)) {
    if (prop.some((value) => value !== null && typeof value === "object")) {
      return "-";
    }

    const joined = prop
      .filter((value): value is string | number | boolean =>
        ["string", "number", "boolean"].includes(typeof value),
      )
      .join(", ");

    return joined || "-";
  }

  return "-";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getServerFieldValue(server: TableServerLike, name: string) {
  return (server as Record<string, unknown> | null | undefined)?.[name];
}

function toFiniteNumber(value: unknown): number | undefined {
  if (isFiniteNumber(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }

  return undefined;
}

function formatBytesToSize(bytes: number) {
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Bytes";
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(0)} ${sizes[index]}`;
}

export function formatBooleanIconHtml(value: boolean): string {
  return value ? "check" : "x";
}

export type CompareMetricDeltaTone = "positive" | "negative" | "neutral";

export type CompareMetricDelta = {
  baselineValue: number | null;
  candidateValue: number | null;
  percentageDelta: number | null;
  tone: CompareMetricDeltaTone;
};

export function isCompareBaselineServer<
  T extends { vendor_id: string; api_reference: string },
>(server: T, baseline: T | null | undefined): boolean {
  if (!baseline) {
    return false;
  }

  return (
    server.vendor_id === baseline.vendor_id &&
    server.api_reference === baseline.api_reference
  );
}

export function isCompareLowerIsBetterProperty(propertyId: string): boolean {
  return LOWER_IS_BETTER_PROPERTY_IDS.has(propertyId);
}

export function getCompareRawNumericPropertyValue(
  server: TableServerLike,
  propertyId: string,
): number | null {
  const prop = getServerFieldValue(server, propertyId);

  if (typeof prop === "number" && Number.isFinite(prop)) {
    return prop;
  }

  if (propertyId === "storage_size") {
    return 0;
  }

  return null;
}

export function isComparePropertyDeltaEligible(
  propertyId: string,
  server: TableServerLike,
): boolean {
  return getCompareRawNumericPropertyValue(server, propertyId) !== null;
}

export function invertCompareDeltaTone(
  tone: CompareMetricDeltaTone,
): CompareMetricDeltaTone {
  if (tone === "positive") {
    return "negative";
  }

  if (tone === "negative") {
    return "positive";
  }

  return "neutral";
}

function formatComparePercentageDelta(
  delta: CompareMetricDelta,
  isNegative: boolean,
): string | null {
  if (delta.candidateValue === null) {
    return null;
  }

  if (delta.percentageDelta === null) {
    return "";
  }

  const roundedPercentage = Math.round(Math.abs(delta.percentageDelta));

  if (roundedPercentage === 0) {
    return "0%";
  }

  return isNegative ? `-${roundedPercentage}%` : `+${roundedPercentage}%`;
}

export function formatCompareDeltaLabel(
  delta: CompareMetricDelta,
): string | null {
  return formatComparePercentageDelta(delta, delta.tone === "negative");
}

export function formatCompareSignedPercentageDeltaLabel(
  delta: CompareMetricDelta,
): string | null {
  return formatComparePercentageDelta(delta, (delta.percentageDelta ?? 0) < 0);
}

export function formatCompareDeltaDisplayLabel(
  delta: CompareMetricDelta,
  formatter: (
    delta: CompareMetricDelta,
  ) => string | null = formatCompareDeltaLabel,
): string | null {
  const label = formatter(delta);
  return label === "0%" ? null : label;
}
