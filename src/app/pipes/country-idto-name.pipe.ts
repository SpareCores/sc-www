import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "countryIdtoName",
  standalone: true,
})
export class CountryIdtoNamePipe implements PipeTransform {
  transform(countryId: string): unknown {
    const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
      type: "region",
    });
    return regionNamesInEnglish.of(countryId);
  }
}
