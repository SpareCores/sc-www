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
    if (value < 10) return this.trimZeros(value.toFixed(2));
    if (value < 100) return this.trimZeros(value.toFixed(1));
    return Math.round(value).toString();
  }

  private trimZeros(value: string): string {
    if (value.includes(".")) {
      return value.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
    }
    return value;
  }
}
