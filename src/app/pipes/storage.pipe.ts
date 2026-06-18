import { Pipe, PipeTransform } from "@angular/core";
import { formatStorageSize } from "./pipe-utils";

@Pipe({
  name: "storage",
  standalone: true,
})
export class StoragePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatStorageSize(value);
  }
}
