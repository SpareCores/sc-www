import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "monthlyTraffic",
  standalone: true,
})
export class MonthlyTrafficPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (!value || value <= 0) return "-";

    const isTiB = value >= 1024;
    const transformedValue = isTiB ? value / 1024 : value;
    const unit = isTiB ? "TiB/mo" : "GiB/mo";

    return `${this.formatValue(transformedValue)} ${unit}`;
  }

  private formatValue(value: number): string {
    let formatted: string;

    if (value < 10) formatted = value.toFixed(2);
    else if (value < 100) formatted = value.toFixed(1);
    else formatted = Math.round(value).toString();

    return parseFloat(formatted).toString();
  }
}
