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
import { CommonModule, isPlatformBrowser, DOCUMENT } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { LucideAngularModule } from "lucide-angular";
import { Modal, ModalOptions } from "flowbite";
import { Observable, Subscription, shareReplay, catchError, of } from "rxjs";
import { DragToPanDirective } from "../../directives/drag-to-pan.directive";

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
  imports: [CommonModule, LucideAngularModule, DragToPanDirective],
  templateUrl: "./server-lstopo.component.html",
  styleUrl: "./server-lstopo.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ServerLstopoComponent implements OnChanges, OnDestroy {
  @Input() vendorId: string = "";
  @Input() apiReference: string = "";
  @Output() svgExists = new EventEmitter<boolean>();

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);
  private elRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  lstopoUrl: string = "";
  inlineSvg: SafeHtml | null = null;
  isLoading: boolean = false;
  hasError: boolean = false;

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
      this.hasError = false;
      this.inlineSvg = null;
      this.lstopoUrl = "";
      return;
    }
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

    const url = this.lstopoUrl;
    this.svgSub?.unsubscribe();
    this.svgSub = svgCache.get(url)!.subscribe((svg) => {
      if (!svg) {
        this.hasError = true;
        this.svgExists.emit(false);
      } else {
        this.svgExists.emit(true);
        this.inlineSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
        if (isPlatformBrowser(this.platformId)) {
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
    if (isPlatformBrowser(this.platformId) && this.modal) {
      this.modal.destroyAndRemoveInstance();
      this.modal = null;
    }
  }
}
