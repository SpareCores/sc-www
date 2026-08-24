import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Modal, ModalOptions } from "flowbite";
import { Subscription } from "rxjs";
import { DragToPanDirective } from "../../directives/drag-to-pan.directive";
import { LstopoSvgService } from "../../services/lstopo-svg.service";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { Button } from "../button/button";

const LSTOPO_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/SpareCores/sc-inspector-data@main/data";
const LSTOPO_PATH_SUFFIX = "lstopo/lstopo.svg";

const lstopoModalOptions: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

@Component({
  selector: "sc-server-lstopo",
  imports: [Button, DragToPanDirective],
  templateUrl: "./server-lstopo.component.html",
  styleUrl: "./server-lstopo.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ServerLstopoComponent implements OnChanges {
  @Input() vendorId: string = "";
  @Input() apiReference: string = "";
  @Output() svgExists = new EventEmitter<boolean>();
  @Output() svgWidth = new EventEmitter<number>();

  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private svgService = inject(LstopoSvgService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.resetRenderedSvg());
  }
  private uiTooltip = inject(UiTooltipService);

  lstopoUrl: string = "";
  inlineSvg: SafeHtml | null = null;
  modalSvg: SafeHtml | null = null;
  isLoading: boolean = false;
  showFullscreen = false;

  @ViewChild("lstopoModal") private lstopoModalRef?: ElementRef<HTMLElement>;
  @ViewChild("lstopoTooltip") private tooltipRef?: ElementRef<HTMLElement>;

  tooltipContent = "";

  private modal: Modal | null = null;
  private svgSub?: Subscription;
  private resizeObserver?: ResizeObserver;
  private tooltipListeners: Array<{
    el: Element;
    type: string;
    fn: EventListener;
  }> = [];

  ngOnChanges(): void {
    if (!this.vendorId || !this.apiReference) {
      this.svgSub?.unsubscribe();
      this.svgSub = undefined;
      this.resetRenderedSvg();
      this.isLoading = false;
      this.lstopoUrl = "";
      this.svgExists.emit(false);
      this.svgWidth.emit(0);
      return;
    }
    this.isLoading = true;
    this.resetRenderedSvg();
    this.svgWidth.emit(0);
    this.lstopoUrl = `${LSTOPO_CDN_BASE}/${this.vendorId}/${this.apiReference}/${LSTOPO_PATH_SUFFIX}`;

    const url = this.lstopoUrl;
    this.svgSub?.unsubscribe();
    this.svgSub = this.svgService
      .getSvg(url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (svg) => {
          try {
            if (!svg) {
              this.svgExists.emit(false);
              this.resetRenderedSvg();
              this.svgWidth.emit(0);
              return;
            }
            if (isPlatformBrowser(this.platformId)) {
              try {
                const { w, normalizedSvg } = this.svgService.processSvg(svg);
                if (w) setTimeout(() => this.svgWidth.emit(w), 0);
                const trustedSvg =
                  this.sanitizer.bypassSecurityTrustHtml(normalizedSvg);
                this.inlineSvg = trustedSvg;
                this.modalSvg = trustedSvg;
                this.svgExists.emit(true);
              } catch (e) {
                console.warn("[lstopo] SVG processing failed", e);
                this.resetRenderedSvg();
                this.svgExists.emit(false);
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
                this.setupFullscreenCheck();
              }, 0);
            } else {
              // Skip inline SVG on server to avoid bloating SSR response
            }
          } finally {
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.warn("[lstopo] failed to load SVG", err);
          this.isLoading = false;
          this.svgExists.emit(false);
          this.resetRenderedSvg();
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
    const target =
      e.currentTarget instanceof Element
        ? e.currentTarget
        : (e.target as Element);
    const rect = target.getBoundingClientRect();
    tooltip.style.left = `${rect.left - 25}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
    this.tooltipContent = content;
    this.cdr.detectChanges();
    this.uiTooltip.show(tooltip, e);
  }

  hideTooltip(): void {
    const tooltip = this.tooltipRef?.nativeElement;
    if (!tooltip) return;

    this.uiTooltip.hide(tooltip);
  }

  private addSvgTooltips(): void {
    this.removeSvgTooltips();
    const host: HTMLElement = this.elRef.nativeElement;
    host
      .querySelectorAll(
        ".lstopo-interactive [data-description], .lstopo-modal-svg [data-description]",
      )
      .forEach((el) => {
        const content = el.getAttribute("data-description")?.trim();
        if (!content) {
          return;
        }
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

  private removeSvgTooltips(): void {
    this.tooltipListeners.forEach(({ el, type, fn }) => {
      el.removeEventListener(type, fn);
    });
    this.tooltipListeners = [];
  }

  private setupFullscreenCheck(): void {
    this.teardownFullscreenCheck();
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateFullscreenVisibility();
    this.resizeObserver = new ResizeObserver(() =>
      this.updateFullscreenVisibility(),
    );
    this.resizeObserver.observe(this.elRef.nativeElement);
  }

  private teardownFullscreenCheck(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  private updateFullscreenVisibility(): void {
    const svg = this.elRef.nativeElement.querySelector(
      ".lstopo-inline-svg svg",
    ) as SVGSVGElement | null;
    if (!svg) {
      if (this.showFullscreen) {
        this.showFullscreen = false;
        this.cdr.markForCheck();
      }
      return;
    }
    const intrinsicW = parseFloat(svg.getAttribute("width") ?? "0");
    const intrinsicH = parseFloat(svg.getAttribute("height") ?? "0");
    const needsFullscreen =
      !intrinsicW || !intrinsicH
        ? true
        : svg.clientWidth < intrinsicW - 1 || svg.clientHeight < intrinsicH - 1;
    if (needsFullscreen !== this.showFullscreen) {
      this.showFullscreen = needsFullscreen;
      this.cdr.markForCheck();
    }
  }

  private resetRenderedSvg(): void {
    this.removeSvgTooltips();
    this.teardownFullscreenCheck();
    this.showFullscreen = false;
    if (isPlatformBrowser(this.platformId) && this.modal) {
      this.modal.destroyAndRemoveInstance();
      this.modal = null;
    }
    this.inlineSvg = null;
    this.modalSvg = null;
  }
}
