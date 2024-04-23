import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageHandlerService {

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }


  get(key: string): any {
    if(isPlatformBrowser(this.platformId) && localStorage) {
      return localStorage.getItem(key);
    }
  }

  set(key: string, value: any): void {
    if(isPlatformBrowser(this.platformId) && localStorage) {
      localStorage.setItem(key, value);
    }
  }
}
