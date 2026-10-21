import { Pipe, PipeTransform } from "@angular/core";
import { formatIpv4Count } from "./pipe-utils";

@Pipe({
  name: "ipv4Count",
  standalone: true,
})
export class Ipv4CountPipe implements PipeTransform {
  transform(value: number | null | undefined): number | string {
    return formatIpv4Count(value);
  }
}
