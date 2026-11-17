import { Pipe, PipeTransform } from "@angular/core";
import { reduceUnitName } from "./pipe-utils";

@Pipe({
  name: "reduceUnitName",
  standalone: true,
})
export class ReduceUnitNamePipe implements PipeTransform {
  transform(value: string): unknown {
    return reduceUnitName(value);
  }
}
