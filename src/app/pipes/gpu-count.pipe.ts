import { Pipe, PipeTransform } from "@angular/core";
import { formatGpuCount } from "./pipe-utils";

@Pipe({
  name: "gpuCount",
  standalone: true,
})
export class GpuCountPipe implements PipeTransform {
  transform(gpuCount: number | null | undefined): number | string | null {
    return formatGpuCount(gpuCount);
  }
}
