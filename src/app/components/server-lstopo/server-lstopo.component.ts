import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeHtml, SafeUrl } from "@angular/platform-browser";
import { LucideAngularModule } from "lucide-angular";
import { Modal, ModalOptions } from "flowbite";
import { Observable, Subscription, shareReplay, catchError, of } from "rxjs";
import { DragToPanDirective } from "../../directives/drag-to-pan.directive";
import { LstopoSvgService } from "./lstopo-svg.service";

const LSTOPO_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/SpareCores/sc-inspector-data@main/data";
const LSTOPO_PATH_SUFFIX = "lstopo/lstopo.svg";

const lstopoModalOptions: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

const svgCache = new Map<string, Observable<string | null>>();

@Component({
  selector: "app-server-lstopo",
  imports: [LucideAngularModule, DragToPanDirective],
  templateUrl: "./server-lstopo.component.html",
  styleUrl: "./server-lstopo.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ServerLstopoComponent implements OnChanges, OnDestroy {
  @Input() vendorId: string = "";
  @Input() apiReference: string = "";
  @Output() svgExists = new EventEmitter<boolean>();
  @Output() svgWidth = new EventEmitter<number>();

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private svgService = inject(LstopoSvgService);

  lstopoUrl: string = "";
  svgImgUrl: SafeUrl | null = null;
  tooltipSvg: SafeHtml | null = null;
  modalSvg: SafeHtml | null = null;
  isLoading: boolean = false;

  private blobUrl: string | null = null;

  @ViewChild("lstopoModal") private lstopoModalRef?: ElementRef<HTMLElement>;
  @ViewChild("lstopoTooltip") private tooltipRef?: ElementRef<HTMLElement>;

  tooltipContent = "";

  private modal: Modal | null = null;
  private svgSub?: Subscription;
  private tooltipListeners: Array<{
    el: Element;
    type: string;
    fn: EventListener;
  }> = [];

  private readonly SVG_TOOLTIP_MAP: Record<string, string> = {
    "text.HostBridge": "Host bridge speed",
    "text.PCIBridge": "PCI bridge speed",
    "rect.L1i": "CPU Level 1 (L1) instruction cache",
    "rect.L1d": "CPU Level 1 (L1) data cache",
    "rect.L2": "CPU Level 2 (L2) cache",
    "rect.L3": "CPU Level 3 (L3) cache",
    "rect.PU": "Processing Unit",
  };

  ngOnChanges(): void {
    if (!this.vendorId || !this.apiReference) {
      this.svgSub?.unsubscribe();
      this.svgSub = undefined;
      this.removeSvgTooltips();
      this.isLoading = false;
      this.svgImgUrl = null;
      this.tooltipSvg = null;
      this.modalSvg = null;
      this.revokeBlobUrl();
      this.lstopoUrl = "";
      return;
    }
    this.isLoading = true;
    this.svgImgUrl = null;
    this.svgWidth.emit(0);
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

    const url = this.lstopoUrl;
    this.svgSub?.unsubscribe();
    this.svgSub = svgCache.get(url)!.subscribe({
      next: (svg) => {
        try {
          if (!svg) {
            this.svgExists.emit(false);
            return;
          }
          this.svgExists.emit(true);
          try {
            const { w } = this.svgService.parseSvg(svg);
            if (w) this.svgWidth.emit(w);
          } catch {
            // width extraction is best-effort; continue without emitting
          }
          this.modalSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
          if (isPlatformBrowser(this.platformId)) {
            try {
              const coloredSvg = this.svgService.buildColoredSvg(svg);
              const blob = new Blob([coloredSvg], { type: "image/svg+xml" });
              this.revokeBlobUrl();
              this.blobUrl = URL.createObjectURL(blob);
              this.svgImgUrl = this.sanitizer.bypassSecurityTrustUrl(
                this.blobUrl,
              );
            } catch (e) {
              console.warn(
                "[lstopo] blob build failed, falling back to CDN URL",
                e,
              );
              this.svgImgUrl = this.sanitizer.bypassSecurityTrustUrl(
                this.lstopoUrl,
              );
            }
            try {
              this.tooltipSvg = this.sanitizer.bypassSecurityTrustHtml(
                this.svgService.buildTooltipSvg(svg),
              );
            } catch (e) {
              console.warn("[lstopo] tooltip SVG build failed", e);
              this.tooltipSvg = null;
            }
            this.cdr.markForCheck();
            setTimeout(() => {
              const el = this.lstopoModalRef?.nativeElement;
              if (el) {
                if (this.modal) {
                  this.modal.destroyAndRemoveInstance();
                  this.modal = null;
                }
                this.modal = new Modal(el, lstopoModalOptions);
              }
              this.addSvgTooltips();
            }, 0);
          } else {
            this.tooltipSvg = null;
          }
        } finally {
          this.isLoading = false;
        }
      },
    });
  }

  private revokeBlobUrl(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  openLstopoModal(): void {
    this.modal?.show();
  }

  closeLstopoModal(): void {
    this.modal?.hide();
  }

  showTooltip(e: Event, content: string): void {
    const tooltip = this.tooltipRef?.nativeElement;
    if (!tooltip) return;
    const target = e.target as Element;
    const rect = target.getBoundingClientRect();
    tooltip.style.left = `${rect.left - 25}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
    this.tooltipContent = content;
    this.cdr.detectChanges();
  }

  hideTooltip(): void {
    const tooltip = this.tooltipRef?.nativeElement;
    if (!tooltip) return;
    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
  }

  private addSvgTooltips(): void {
    this.removeSvgTooltips();
    const host: HTMLElement = this.elRef.nativeElement;
    for (const [selector, content] of Object.entries(this.SVG_TOOLTIP_MAP)) {
      host.querySelectorAll(selector).forEach((el) => {
        const mouseenter: EventListener = (e) => this.showTooltip(e, content);
        const mouseleave: EventListener = () => this.hideTooltip();
        el.addEventListener("mouseenter", mouseenter);
        el.addEventListener("mouseleave", mouseleave);
        this.tooltipListeners.push(
          { el, type: "mouseenter", fn: mouseenter },
          { el, type: "mouseleave", fn: mouseleave },
        );
      });
    }
  }

  private removeSvgTooltips(): void {
    this.tooltipListeners.forEach(({ el, type, fn }) =>
      el.removeEventListener(type, fn),
    );
    this.tooltipListeners = [];
  }

  ngOnDestroy(): void {
    this.svgSub?.unsubscribe();
    this.removeSvgTooltips();
    this.revokeBlobUrl();
    if (isPlatformBrowser(this.platformId) && this.modal) {
      this.modal.destroyAndRemoveInstance();
      this.modal = null;
    }
  }
}
