import { Pipe, PipeTransform } from "@angular/core";
import { formatValue } from "./pipe-utils";

@Pipe({
  name: "networkSpeed",
  standalone: true,
})
export class NetworkSpeedPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (!value || value <= 0) return "-";

    if (value < 1) {
      const mbps = value * 1000;
      return `${formatValue(mbps)} Mbps`;
    }

    return `${formatValue(value)} Gbps`;
  }
}
