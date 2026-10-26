import { Pipe, PipeTransform } from "@angular/core";
import { formatAcceleratorMemory } from "./pipe-utils";

@Pipe({
  name: "acceleratorMemory",
  standalone: true,
})
export class AcceleratorMemoryPipe implements PipeTransform {
  transform(value: number | null | undefined, empty = "-"): string {
    if (value === null || value === undefined) return empty;
    return formatAcceleratorMemory(value);
  }
}
