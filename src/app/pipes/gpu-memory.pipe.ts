import { Pipe, PipeTransform } from "@angular/core";
import { formatGpuMemory } from "./pipe-utils";

@Pipe({
  name: "gpuMemory",
  standalone: true,
})
export class GpuMemoryPipe implements PipeTransform {
  transform(value: number | null | undefined, empty = "-"): string {
    if (value === null || value === undefined) return empty;
    return formatGpuMemory(value);
  }
}
