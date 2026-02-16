import { Pipe, PipeTransform } from "@angular/core";
import { formatValue } from "./pipe-utils";

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

    return `${formatValue(transformedValue)} ${unit}`;
  }
}
