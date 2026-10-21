import { DialogRef } from "@angular/cdk/dialog";
import { isPlatformBrowser } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Subscription, of, switchMap } from "rxjs";
import { DragToPan } from "../../directives/drag-to-pan";
import { LstopoSvg } from "../../services/lstopo-svg";
import { ModalDialog } from "../../services/modal-dialog";
import { UiTooltip } from "../../services/ui-tooltip";
import { Button } from "../button/button";
import { Modal } from "../modal/modal";

const LSTOPO_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/SpareCores/sc-inspector-data@main/data";
const LSTOPO_PATH_SUFFIX = "0/lstopo/lstopo.svg";
// TODO: drop the legacy fallback once the sc-inspector-data backend rollout
// moving lstopo under the "0" variant folder has completed (~2026-10-23)
const LSTOPO_LEGACY_PATH_SUFFIX = "lstopo/lstopo.svg";

type TooltipListener = {
  el: Element;
  type: string;
  fn: EventListener;
};

@Component({
  selector: "sc-server-lstopo",
  imports: [Button, DragToPan, Modal],
  templateUrl: "./server-lstopo.html",
  styleUrl: "./server-lstopo.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ServerLstopo implements OnChanges {
  @Input() vendorId: string = "";
  @Input() apiReference: string = "";
  @Output() svgExists = new EventEmitter<boolean>();
  @Output() svgWidth = new EventEmitter<number>();

  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private svgService = inject(LstopoSvg);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private modalDialog = inject(ModalDialog);

  constructor() {
    this.destroyRef.onDestroy(() => this.resetRenderedSvg());
  }
  private uiTooltip = inject(UiTooltip);

  lstopoUrl: string = "";
  inlineSvg: SafeHtml | null = null;
  modalSvg: SafeHtml | null = null;
  isLoading: boolean = false;
  showFullscreen = false;

  @ViewChild("lstopoModalTemplate")
  private lstopoModalTemplate?: TemplateRef<unknown>;
  @ViewChild("lstopoTooltip") private tooltipRef?: ElementRef<HTMLElement>;

  tooltipContent = "";

  private dialogRef: DialogRef | null = null;
  private svgSub?: Subscription;
  private resizeObserver?: ResizeObserver;
  private renderTimeout?: ReturnType<typeof setTimeout>;
  private tooltipListeners: TooltipListener[] = [];
  private modalTooltipListeners: TooltipListener[] = [];

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
    const serverBase = `${LSTOPO_CDN_BASE}/${this.vendorId}/${this.apiReference}`;
    const url = `${serverBase}/${LSTOPO_PATH_SUFFIX}`;
    const legacyUrl = `${serverBase}/${LSTOPO_LEGACY_PATH_SUFFIX}`;
    this.lstopoUrl = url;

    this.svgSub?.unsubscribe();
    this.svgSub = this.svgService
      .getSvg(url)
      .pipe(
        // getSvg maps 404 and other errors to null, so retry the legacy path
        switchMap((svg) => {
          if (svg) return of(svg);
          this.lstopoUrl = legacyUrl;
          return this.svgService.getSvg(legacyUrl);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
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
                this.cdr.markForCheck();
                this.renderTimeout = setTimeout(() => {
                  this.renderTimeout = undefined;
                  if (!this.inlineSvg) return;
                  this.addSvgTooltips();
                  this.setupFullscreenCheck();
                }, 0);
              } catch (e) {
                console.warn("[lstopo] SVG processing failed", e);
                this.resetRenderedSvg();
                this.svgExists.emit(false);
                this.cdr.markForCheck();
              }
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
    if (this.dialogRef || !this.modalSvg || !this.lstopoModalTemplate) {
      return;
    }

    const dialogRef = this.modalDialog.open(this.lstopoModalTemplate);
    dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
      this.removeListeners(this.modalTooltipListeners);
      this.modalTooltipListeners = [];
      this.hideTooltip();
    });
    this.dialogRef = dialogRef;

    afterNextRender(
      () => {
        if (this.dialogRef !== dialogRef) {
          return;
        }
        this.modalTooltipListeners = this.bindSvgTooltips(
          dialogRef.overlayRef.overlayElement,
          ".lstopo-modal-svg [data-description]",
        );
      },
      { injector: this.injector },
    );
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
    this.tooltipListeners = this.bindSvgTooltips(
      this.elRef.nativeElement,
      ".lstopo-interactive [data-description]",
    );
  }

  private bindSvgTooltips(
    root: ParentNode,
    selector: string,
  ): TooltipListener[] {
    const listeners: TooltipListener[] = [];
    root.querySelectorAll(selector).forEach((el) => {
      const content = el.getAttribute("data-description")?.trim();
      if (!content) {
        return;
      }
      const mouseenter: EventListener = (e) => this.showTooltip(e, content);
      const mouseleave: EventListener = () => this.hideTooltip();
      el.addEventListener("mouseenter", mouseenter);
      el.addEventListener("mouseleave", mouseleave);
      listeners.push(
        { el, type: "mouseenter", fn: mouseenter },
        { el, type: "mouseleave", fn: mouseleave },
      );
    });
    return listeners;
  }

  private removeSvgTooltips(): void {
    this.removeListeners(this.tooltipListeners);
    this.tooltipListeners = [];
  }

  private removeListeners(listeners: TooltipListener[]): void {
    listeners.forEach(({ el, type, fn }) => {
      el.removeEventListener(type, fn);
    });
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
    if (this.renderTimeout !== undefined) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = undefined;
    }
    this.removeSvgTooltips();
    this.teardownFullscreenCheck();
    this.showFullscreen = false;
    this.dialogRef?.close();
    this.inlineSvg = null;
    this.modalSvg = null;
  }
}
