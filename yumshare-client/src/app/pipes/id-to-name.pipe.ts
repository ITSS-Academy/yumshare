import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idToName'
})
export class IdToNamePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
