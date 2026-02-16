import { Pipe, PipeTransform } from "@angular/core";
import { formatValue } from "./pipe-utils";

@Pipe({
  name: "cpuCacheSize",
  standalone: true,
})
export class CpuCacheSizePipe implements PipeTransform {
  private readonly KIB = 1024;
  private readonly MIB = 1024 * 1024;

  transform(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return "-";

    if (bytes < this.MIB) {
      return `${Math.round(bytes / this.KIB)} KiB`;
    }

    const mib = bytes / this.MIB;

    return `${formatValue(mib)} MiB`;
  }
}
