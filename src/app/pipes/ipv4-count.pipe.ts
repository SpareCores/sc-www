import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "ipv4Count",
  standalone: true,
})
export class Ipv4CountPipe implements PipeTransform {
  transform(value: number | null | undefined): number | string {
    return !value || value <= 0 ? "-" : value;
  }
}
