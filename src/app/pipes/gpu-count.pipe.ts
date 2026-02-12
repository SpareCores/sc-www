import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "gpuCount",
  standalone: true,
})
export class GpuCountPipe implements PipeTransform {
  transform(gpuCount: number | null | undefined): number | string | null {
    if (gpuCount === null || gpuCount === undefined) return null;
    if (gpuCount >= 1) return gpuCount;

    switch (gpuCount) {
      case 0.5:
        return "½";
      case 0.3333:
        return "⅓";
      case 0.25:
        return "¼";
      case 0.1667:
        return "⅙";
      case 0.125:
        return "⅛";
      case 0.0833:
        return "1⁄12";
      default:
        return gpuCount;
    }
  }
}
