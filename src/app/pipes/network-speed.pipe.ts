import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "networkSpeed",
  standalone: true,
})
export class NetworkSpeedPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (!value || value <= 0) return "-";

    if (value < 1) {
      const mbps = value * 1000;
      return `${this.formatValue(mbps)} Mbps`;
    }

    return `${this.formatValue(value)} Gbps`;
  }

  private formatValue(value: number): string {
    let formatted: string;

    if (value < 10) formatted = value.toFixed(2);
    else if (value < 100) formatted = value.toFixed(1);
    else formatted = Math.round(value).toString();

    return parseFloat(formatted).toString();
  }
}
