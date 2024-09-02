import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Dropdown, DropdownOptions, initFlowbite } from 'flowbite';

const options: DropdownOptions = {
  placement: 'bottom',
  triggerType: 'click',
  offsetSkidding: 0,
  offsetDistance: 10,
  delay: 300
};

@Injectable({
  providedIn: 'root'
})
export class DropdownManagerService {

  inited = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();
      this.inited = true;
    }
  }

  async initDropdown(triggerID: string, targetID: string) {
    if (isPlatformBrowser(this.platformId)) {
      const {triggerEl, targetEl} = await this.waitForElements(triggerID, targetID);
      return new Dropdown(
        targetEl,
        triggerEl,
        options,
        {
          id: targetID,
          override: true
        }
      );
    } else {
      return undefined;
    }
  }

  private waitForElements(triggerID: string, targetID: string): Promise<any> {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const targetEl: HTMLElement | null = document.getElementById(targetID);
        const triggerEl: HTMLElement | null = document.getElementById(triggerID);
        if (this.inited && targetEl && triggerEl) {
          observer.disconnect();
          resolve({triggerEl, targetEl});
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }


}
