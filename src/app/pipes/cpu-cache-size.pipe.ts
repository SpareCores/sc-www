import { Pipe, PipeTransform } from "@angular/core";
import { formatValue } from "./pipe-utils";

@Pipe({
  name: "cpuCacheSize",
  standalone: true,
})
export class CpuCacheSizePipe implements PipeTransform {
  private readonly KIB = 1024;
  private readonly MIB = 1024 * 1024;

  transform(kibibytes: number | null | undefined): string {
    if (!kibibytes || kibibytes <= 0) return "-";
    if (kibibytes * 1024 < this.MIB) {
      return `${kibibytes} KiB`;
    }
    const mib = kibibytes / 1024;
    return `${formatValue(mib)} MiB`;
  }
}
