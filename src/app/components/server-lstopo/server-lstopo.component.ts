import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { CommonModule, isPlatformBrowser, DOCUMENT } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { LucideAngularModule } from "lucide-angular";
import { Modal, ModalOptions } from "flowbite";
import { Observable, shareReplay, catchError, of } from "rxjs";

const LSTOPO_CDN_BASE =
  "https://cdn.statically.io/gh/SpareCores/sc-inspector-data@main/data";
const LSTOPO_PATH_SUFFIX = "lstopo/lstopo.svg";

const lstopoModalOptions: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

const svgCache = new Map<string, Observable<string | null>>();

@Component({
  selector: "app-server-lstopo",
  imports: [CommonModule, LucideAngularModule],
  templateUrl: "./server-lstopo.component.html",
  styleUrl: "./server-lstopo.component.scss",
})
export class ServerLstopoComponent implements OnChanges, OnDestroy {
  @Input() vendorId: string = "";
  @Input() apiReference: string = "";

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);

  lstopoUrl: string = "";
  inlineSvg: SafeHtml | null = null;
  isLoading: boolean = false;
  hasError: boolean = false;
  isDragging: boolean = false;

  private modal: Modal | null = null;
  private dragScrollEl: HTMLElement | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragScrollLeft = 0;
  private dragScrollTop = 0;
  private readonly boundDragMove = (e: MouseEvent) => this.onDragMove(e);
  private readonly boundDragEnd = () => this.onDragEnd();

  ngOnChanges(): void {
    if (!this.vendorId || !this.apiReference) return;
    this.isLoading = true;
    this.hasError = false;
    this.inlineSvg = null;
    this.lstopoUrl = `${LSTOPO_CDN_BASE}/${this.vendorId}/${this.apiReference}/${LSTOPO_PATH_SUFFIX}`;

    if (!svgCache.has(this.lstopoUrl)) {
      svgCache.set(
        this.lstopoUrl,
        this.http.get(this.lstopoUrl, { responseType: "text" }).pipe(
          catchError(() => of(null)),
          shareReplay(1),
        ),
      );
    }

    svgCache.get(this.lstopoUrl)!.subscribe((svg) => {
      if (!svg) {
        this.hasError = true;
      } else {
        this.inlineSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            const el = this.document.getElementById("lstopo-modal");
            if (el) {
              this.modal = new Modal(el, lstopoModalOptions, {
                id: "lstopo-modal",
              });
            }
          }, 0);
        }
      }
      this.isLoading = false;
    });
  }

  openLstopoModal(): void {
    this.modal?.show();
  }

  closeLstopoModal(): void {
    this.modal?.hide();
  }

  ngOnDestroy(): void {
    this.removeDragListeners();
  }

  onDragStart(e: MouseEvent): void {
    this.dragScrollEl = e.currentTarget as HTMLElement;
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragScrollLeft = this.dragScrollEl.scrollLeft;
    this.dragScrollTop = this.dragScrollEl.scrollTop;
    if (isPlatformBrowser(this.platformId)) {
      this.document.addEventListener("mousemove", this.boundDragMove);
      this.document.addEventListener("mouseup", this.boundDragEnd);
    }
  }

  private onDragMove(e: MouseEvent): void {
    if (!this.isDragging || !this.dragScrollEl) return;
    e.preventDefault();
    this.dragScrollEl.scrollLeft =
      this.dragScrollLeft - (e.clientX - this.dragStartX);
    this.dragScrollEl.scrollTop =
      this.dragScrollTop - (e.clientY - this.dragStartY);
  }

  private onDragEnd(): void {
    this.isDragging = false;
    this.dragScrollEl = null;
    this.removeDragListeners();
  }

  private removeDragListeners(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.removeEventListener("mousemove", this.boundDragMove);
      this.document.removeEventListener("mouseup", this.boundDragEnd);
    }
  }
}
