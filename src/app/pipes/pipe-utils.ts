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
