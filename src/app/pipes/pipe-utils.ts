export function formatValue(value: number): string {
  let formatted: string;

  if (value < 10) formatted = value.toFixed(2);
  else if (value < 100) formatted = value.toFixed(1);
  else formatted = Math.round(value).toString();

  return parseFloat(formatted).toString();
}

export type BinaryMemoryUnit = "GiB" | "TiB";

export function formatNumberInputValue(
  value: number,
  maximumFractionDigits = 3,
): string {
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits,
  });
}

export function formatBinaryMemoryDisplay(valueInGiB: number): {
  value: string;
  unit: BinaryMemoryUnit;
} {
  if (valueInGiB >= 1024) {
    return {
      value: formatNumberInputValue(valueInGiB / 1024),
      unit: "TiB",
    };
  }

  return {
    value: formatNumberInputValue(valueInGiB),
    unit: "GiB",
  };
}

export function parseBinaryMemoryInput(
  rawValue: string,
  unit: BinaryMemoryUnit,
): number | null {
  const normalizedValue = rawValue.trim();

  if (
    !normalizedValue.length ||
    normalizedValue === "." ||
    !/^\d*\.?\d*$/.test(normalizedValue)
  ) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return unit === "TiB" ? parsedValue * 1024 : parsedValue;
}

const IEC_UNITS = ["Bytes", "KiB", "MiB", "GiB", "TiB"];

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const scaled = bytes / Math.pow(1024, index);
  return `${formatValue(scaled)} ${IEC_UNITS[index]}`;
}

export function formatStorageSize(
  sizeGb: number | null | undefined,
  emptyValue = "-",
): string {
  if (sizeGb === null || sizeGb === undefined || Number.isNaN(Number(sizeGb))) {
    return emptyValue;
  }

  const numericSize = Number(sizeGb);

  if (numericSize === 0) return "0 GB";
  if (numericSize < 1000) return `${numericSize} GB`;
  return `${formatValue(numericSize / 1000)} TB`;
}

export function formatGpuMemory(
  memoryMib: number | null | undefined,
  emptyValue = "-",
): string {
  if (
    memoryMib === null ||
    memoryMib === undefined ||
    Number.isNaN(Number(memoryMib))
  ) {
    return emptyValue;
  }
  return `${formatValue(memoryMib / 1024)} GiB`;
}

export function formatMemoryAmount(
  valueInMiB: number | null | undefined,
  emptyValue = "-",
): string {
  if (valueInMiB === null || valueInMiB === undefined) {
    return emptyValue;
  }

  const valueInGiB = valueInMiB / 1024;
  const formattedValue = Number.isInteger(valueInGiB)
    ? `${formatNumberInputValue(valueInGiB, 0)}.0`
    : formatNumberInputValue(valueInGiB, 1);

  return `${formattedValue} GiB`;
}

export function formatNetworkSpeed(
  value: number | null | undefined,
  emptyValue = "-",
): string {
  if (value === null || value === undefined) {
    return emptyValue;
  }

  if (value === 0) {
    return "0 Gbps";
  }

  if (value < 1) {
    const mbps = value * 1000;
    return `${formatValue(mbps)} Mbps`;
  }

  return `${formatValue(value)} Gbps`;
}

export function formatCpuCacheSize(
  kibibytes: number | null | undefined,
  emptyValue = "-",
): string {
  if (
    kibibytes === null ||
    kibibytes === undefined ||
    Number.isNaN(Number(kibibytes))
  ) {
    return emptyValue;
  }

  if (kibibytes === 0) {
    return "0 KiB";
  }

  const mibThreshold = 1024 * 1024;
  if (kibibytes * 1024 < mibThreshold) {
    return `${kibibytes} KiB`;
  }

  const mib = kibibytes / 1024;
  return `${formatValue(mib)} MiB`;
}

export function formatMonthlyTraffic(
  value: number | null | undefined,
  emptyValue = "-",
): string {
  if (value === null || value === undefined) {
    return emptyValue;
  }

  const isTiB = value >= 1024;
  const transformedValue = isTiB ? value / 1024 : value;
  const unit = isTiB ? "TiB/mo" : "GiB/mo";

  return `${formatValue(transformedValue)} ${unit}`;
}

export function formatGpuCount(
  gpuCount: number | null | undefined,
  emptyValue: string | null = null,
): number | string | null {
  if (gpuCount === null || gpuCount === undefined) {
    return emptyValue;
  }

  if (gpuCount >= 1) {
    return gpuCount;
  }

  switch (gpuCount) {
    case 0.5:
      return "½";
    case 0.3333:
      return "⅓";
    case 0.25:
      return "¼";
    case 0.1667:
      return "⅙";
    case 0.125:
      return "⅛";
    case 0.0833:
      return "1⁄12";
    case 0.0417:
      return "1⁄24";
    default:
      return gpuCount;
  }
}

export function formatIpv4Count(
  value: number | null | undefined,
  emptyValue = "-",
): number | string {
  return value === null || value === undefined ? emptyValue : value;
}
