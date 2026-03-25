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
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { LucideAngularModule } from "lucide-angular";
import { Modal, ModalOptions } from "flowbite";
import { Subscription } from "rxjs";
import { DragToPanDirective } from "../../directives/drag-to-pan.directive";
import { LstopoSvgService } from "../../services/lstopo-svg.service";

const LSTOPO_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/SpareCores/sc-inspector-data@main/data";
const LSTOPO_PATH_SUFFIX = "lstopo/lstopo.svg";

const lstopoModalOptions: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

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

  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private svgService = inject(LstopoSvgService);

  lstopoUrl: string = "";
  inlineSvg: SafeHtml | null = null;
  modalSvg: SafeHtml | null = null;
  isLoading: boolean = false;

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
      this.inlineSvg = null;
      this.modalSvg = null;
      this.lstopoUrl = "";
      this.svgExists.emit(false);
      this.svgWidth.emit(0);
      return;
    }
    this.isLoading = true;
    this.inlineSvg = null;
    this.svgWidth.emit(0);
    this.lstopoUrl = `${LSTOPO_CDN_BASE}/${this.vendorId}/${this.apiReference}/${LSTOPO_PATH_SUFFIX}`;

    const url = this.lstopoUrl;
    this.svgSub?.unsubscribe();
    this.svgSub = this.svgService.getSvg(url).subscribe({
      next: (svg) => {
        try {
          if (!svg) {
            this.svgExists.emit(false);
            this.inlineSvg = null;
            this.modalSvg = null;
            this.svgWidth.emit(0);
            this.removeSvgTooltips();
            return;
          }
          this.svgExists.emit(true);
          if (isPlatformBrowser(this.platformId)) {
            try {
              const { w, normalizedSvg } = this.svgService.processSvg(svg);
              if (w) setTimeout(() => this.svgWidth.emit(w), 0);
              const trustedSvg =
                this.sanitizer.bypassSecurityTrustHtml(normalizedSvg);
              this.inlineSvg = trustedSvg;
              this.modalSvg = trustedSvg;
            } catch (e) {
              console.warn("[lstopo] SVG processing failed", e);
              const trustedSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
              this.inlineSvg = trustedSvg;
              this.modalSvg = trustedSvg;
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
            this.inlineSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
            this.modalSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
          }
        } finally {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.warn("[lstopo] failed to load SVG", err);
        this.isLoading = false;
        this.svgExists.emit(false);
        this.modalSvg = null;
        this.inlineSvg = null;
        this.cdr.markForCheck();
      },
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
      host
        .querySelectorAll(
          `.lstopo-interactive ${selector}, .lstopo-modal-svg ${selector}`,
        )
        .forEach((el) => {
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
    this.tooltipListeners.forEach(({ el, type, fn }) => {
      el.removeEventListener(type, fn);
    });
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
