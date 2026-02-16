export function formatValue(value: number): string {
  let formatted: string;

  if (value < 10) formatted = value.toFixed(2);
  else if (value < 100) formatted = value.toFixed(1);
  else formatted = Math.round(value).toString();

  return parseFloat(formatted).toString();
}
