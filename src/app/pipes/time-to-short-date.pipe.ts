import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeToShortDate',
  standalone: true
})
export class TimeToShortDatePipe implements PipeTransform {

  transform(value: Date): unknown {
    if(!value) {
      return '';
    }
    const date = new Date(value);
    const formattedDate = date.toLocaleDateString('en-US', {dateStyle: 'medium'});
    return formattedDate;
  }

}
