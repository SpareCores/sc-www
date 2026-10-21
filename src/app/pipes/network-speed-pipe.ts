import { Pipe, PipeTransform } from "@angular/core";
import { formatNetworkSpeed } from "./pipe-utils";

@Pipe({
  name: "networkSpeed",
  standalone: true,
})
export class NetworkSpeedPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatNetworkSpeed(value);
  }
}
