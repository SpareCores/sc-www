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
      case 'byte': return 'B';
      case 'kilobyte': return 'KB';
      case 'megabyte': return 'MB';
      case 'gigabyte': return 'GB';
      case 'terabyte': return 'TB';
      default: return value;
    }
  }

}
