import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser, DOCUMENT } from "@angular/common";

@Directive({
  selector: "[appDragToPan]",
  standalone: true,
  host: {
    "[class.cursor-grab]": "!isDragging",
    "[class.cursor-grabbing]": "isDragging",
    "[class.select-none]": "true",
  },
})
export class DragToPanDirective implements OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);

  isDragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;

  private readonly boundMove = (e: MouseEvent) => this.onMove(e);
  private readonly boundEnd = () => this.onEnd();

  @HostListener("mousedown", ["$event"])
  onStart(e: MouseEvent): void {
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.scrollLeft = this.el.nativeElement.scrollLeft;
    this.scrollTop = this.el.nativeElement.scrollTop;
    if (isPlatformBrowser(this.platformId)) {
      this.document.addEventListener("mousemove", this.boundMove);
      this.document.addEventListener("mouseup", this.boundEnd);
    }
  }

  private onMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    e.preventDefault();
    this.el.nativeElement.scrollLeft =
      this.scrollLeft - (e.clientX - this.startX);
    this.el.nativeElement.scrollTop =
      this.scrollTop - (e.clientY - this.startY);
  }

  private onEnd(): void {
    this.isDragging = false;
    this.removeListeners();
  }

  private removeListeners(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.removeEventListener("mousemove", this.boundMove);
      this.document.removeEventListener("mouseup", this.boundEnd);
    }
  }

  ngOnDestroy(): void {
    this.removeListeners();
  }
}
