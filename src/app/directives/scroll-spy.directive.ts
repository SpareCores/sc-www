import {
  Directive,
  OnDestroy,
  input,
  output,
  effect,
  PLATFORM_ID,
  inject,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Directive({
  selector: "[appScrollSpy]",
  standalone: true,
})
export class ScrollSpyDirective implements OnDestroy {
  appScrollSpy = input<string[]>();
  rootMargin = input("-180px 0px 0px 0px");
  threshold = input([0, 0.1, 0.5, 0.9, 1]);
  activeItemId = output<string>();

  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;
  private scrollPositionMap = new Map<string, number>();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupObserver();
    }

    effect(() => {
      const ids = this.appScrollSpy() || [];
      if (this.observer && isPlatformBrowser(this.platformId)) {
        this.observer.disconnect();

        setTimeout(() => {
          ids.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
              this.observer?.observe(element);
            }
          });
        });
      }
    });
  }

  private setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        let activeId = "";
        let minTop = Number.POSITIVE_INFINITY;

        entries.forEach((entry) => {
          const id = entry.target.id;

          if (entry.isIntersecting) {
            const top = Math.abs(entry.boundingClientRect.top);
            this.scrollPositionMap.set(id, top);
          } else {
            this.scrollPositionMap.delete(id);
          }
        });

        this.scrollPositionMap.forEach((top, id) => {
          if (top < minTop) {
            minTop = top;
            activeId = id;
          }
        });

        if (activeId) {
          this.activeItemId.emit(activeId);
        }
      },
      {
        rootMargin: this.rootMargin(),
        threshold: this.threshold(),
      },
    );
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
