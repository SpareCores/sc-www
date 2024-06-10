import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reduceUnitName',
  standalone: true
})
export class ReduceUnitNamePipe implements PipeTransform {

  transform(value: string): unknown {
    if(!value) return null;
    switch(value) {
      case 'hour': return 'h';
      case 'year': return 'y';
      case 'month': return 'm';
      default: return value;
    }
  }

}
