import { Pipe, PipeTransform } from "@angular/core";
import { formatCpuCacheSize } from "./pipe-utils";

@Pipe({
  name: "cpuCacheSize",
  standalone: true,
})
export class CpuCacheSizePipe implements PipeTransform {
  transform(kibibytes: number | null | undefined): string {
    return formatCpuCacheSize(kibibytes);
  }
}
