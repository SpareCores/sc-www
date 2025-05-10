import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NeetoCalService {
  private isScriptLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  initialize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    (window as any).neetoCal = (window as any).neetoCal || {
      embed: function() {
        ((window as any).neetoCal.q = (window as any).neetoCal.q || []).push(arguments);
      }
    };
    if (!this.isScriptLoaded) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cdn.neetocal.com/javascript/embed.js';
      script.onload = () => {
        this.isScriptLoaded = true;
        this.initializeButtons();
      };
      document.head.appendChild(script);
    } else {
      this.initializeButtons();
    }
  }

  private initializeButtons(): void {
    // need to call the embed function for each button
    const buttonSelectors = [
      '#header-demo-button',
      '#landing-demo-button'
    ];
    buttonSelectors.forEach(selector => {
      if (document.querySelector(selector)) {
        (window as any).neetoCal.embed({
          type: "elementClick",
          id: "7c3c0ad8-812b-423f-b064-0ea44d527368",
          organization: "sparecores",
          elementSelector: selector,
        });
      }
    });
  }
}
