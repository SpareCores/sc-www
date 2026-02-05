import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StorageHandlerService {
  private platformId = inject(PLATFORM_ID);

  disabled = true;

  get(key: string): any {
    if (!this.disabled && isPlatformBrowser(this.platformId) && localStorage) {
      return localStorage.getItem(key);
    }
  }

  set(key: string, value: any): void {
    if (!this.disabled && isPlatformBrowser(this.platformId) && localStorage) {
      localStorage.setItem(key, value);
    }
  }
}
