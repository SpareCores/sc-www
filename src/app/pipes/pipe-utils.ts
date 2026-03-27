export function formatValue(value: number): string {
  let formatted: string;

  if (value < 10) formatted = value.toFixed(2);
  else if (value < 100) formatted = value.toFixed(1);
  else formatted = Math.round(value).toString();

  return parseFloat(formatted).toString();
}

const IEC_UNITS = ["Bytes", "KiB", "MiB", "GiB", "TiB"];

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const scaled = bytes / Math.pow(1024, index);
  return `${formatValue(scaled)} ${IEC_UNITS[index]}`;
}
