import { Pipe, PipeTransform } from "@angular/core";

const formatterCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatterSmall = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  maximumSignificantDigits: 4,
});

@Pipe({
  name: "compactNumber",
  standalone: true,
})
export class CompactNumberPipe implements PipeTransform {
  transform(value: number | string): string {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!isFinite(num) || num <= 0) return "-";
    return (num < 1 ? formatterSmall : formatterCompact).format(num);
  }
}
