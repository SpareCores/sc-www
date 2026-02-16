import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "cpuCacheSize",
  standalone: true,
})
export class CpuCacheSizePipe implements PipeTransform {
  private readonly KIB = 1024;
  private readonly MIB = 1024 * 1024;

  transform(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined) return "-";

    if (bytes < this.MIB) {
      return `${Math.round(bytes / this.KIB)} KiB`;
    }

    const mib = bytes / this.MIB;

    if (mib < 10) return `${mib.toFixed(2)} MiB`;
    return `${mib.toFixed(1)} MiB`;
  }
}
