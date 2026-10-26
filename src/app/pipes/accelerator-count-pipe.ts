import { Pipe, PipeTransform } from "@angular/core";
import { formatAcceleratorCount } from "./pipe-utils";

@Pipe({
  name: "acceleratorCount",
  standalone: true,
})
export class AcceleratorCountPipe implements PipeTransform {
  transform(
    acceleratorCount: number | null | undefined,
  ): number | string | null {
    return formatAcceleratorCount(acceleratorCount);
  }
}
