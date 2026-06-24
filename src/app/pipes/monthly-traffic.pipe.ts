import { Pipe, PipeTransform } from "@angular/core";
import { formatMonthlyTraffic } from "./pipe-utils";

@Pipe({
  name: "monthlyTraffic",
  standalone: true,
})
export class MonthlyTrafficPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatMonthlyTraffic(value);
  }
}
