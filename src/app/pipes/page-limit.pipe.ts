import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "pageLimitLabel",
  standalone: true,
})
export class PageLimitPipe implements PipeTransform {
  transform(value: number): string {
    return value === 1 ? "All" : String(value);
  }
}
