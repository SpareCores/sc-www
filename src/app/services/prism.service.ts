import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Prism core
import 'prismjs';
// themes
import 'prismjs/themes/prism-tomorrow.css';
// languages
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
// plugins
import 'prismjs/plugins/line-highlight/prism-line-highlight';
import 'prismjs/plugins/line-highlight/prism-line-highlight.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/command-line/prism-command-line';
import 'prismjs/plugins/command-line/prism-command-line.css';
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/toolbar/prism-toolbar.css';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';
// custom styles (actually loaded in angular.json)
import '../../assets/prism-js-override.css';

@Injectable({
  providedIn: 'root'
})
export class PrismService {
  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // plugin configs
    if (isPlatformBrowser(this.platformId)) {
      const Prism = (window as any).Prism;
      if (Prism && Prism.plugins && Prism.plugins.NormalizeWhitespace) {
        Prism.plugins.NormalizeWhitespace.setDefaults({
          'remove-trailing': true,
          'remove-indent': true,
          'left-trim': true,
          'right-trim': true
        });
      }
    }
  }

  /**
   * Highlights all code blocks on the page
   */
  highlightAll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const Prism = (window as any).Prism;
      if (Prism) {
        Prism.highlightAll();
      } else {
        console.warn('Prism.js is not loaded. Code highlighting will not work.');
      }
    }
  }

  /**
   * Highlights a specific element
   * @param element The element to highlight
   */
  highlightElement(element: Element): void {
    if (isPlatformBrowser(this.platformId)) {
      const Prism = (window as any).Prism;
      if (Prism) {
        Prism.highlightElement(element);
      } else {
        console.warn('Prism.js is not loaded. Code highlighting will not work.');
      }
    }
  }
}
