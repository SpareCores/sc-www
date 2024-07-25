import { ElementRef, Renderer2 } from "@angular/core";

export function initGiscus(renderer: Renderer2, anchorElement: ElementRef, baseUrl: string) {
   const script = renderer.createElement('script');
   script.src = 'https://giscus.app/client.js';
   script.setAttribute('data-repo', 'SpareCores/sc-www');
   script.setAttribute('data-repo-id', 'R_kgDOLesFQA');
   script.setAttribute('data-category', 'Blog posts');
   script.setAttribute('data-category-id', 'DIC_kwDOLesFQM4CgusO');
   script.setAttribute('data-mapping', 'og:title');
   script.setAttribute('data-strict', '1');
   script.setAttribute('data-reactions-enabled', '1');
   script.setAttribute('data-emit-metadata', '0');
   script.setAttribute('data-input-position', 'bottom');
   script.setAttribute('data-theme', baseUrl + '/assets/giscus.css');
   script.setAttribute('data-lang', 'en');
   script.crossOrigin = 'anonymous';
   script.async = true;
   renderer.appendChild(anchorElement.nativeElement, script);
}
