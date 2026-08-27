import { ElementRef, Signal, WritableSignal } from "@angular/core";
import { COMPARE_STICKY_DEFERRED_UPDATE_DELAY_MS } from "./compare-sticky-layout.constants";
import { COMPARE_STICKY_VIEWPORT_TOP_PX } from "./compare-table-layout.constants";
import { resolveCompareStickyHeaderStyles } from "./compare-table-layout.utils";
import {
  ScrollbarMirrorController,
  ScrollbarMirrorOptions,
  ScrollbarMirrorState,
} from "./scrollbar-mirror.controller";

export type CompareStickyHeaderStyleState = {
  fixedDivStyle: WritableSignal<string>;
  mainTableStyle: WritableSignal<string>;
  firstColStyle: WritableSignal<{ width?: string }>;
  columnStyles: WritableSignal<string[]>;
};

export type CompareStickyLayoutIds = {
  tableId: string;
  tableHolderId: string;
  firstColId: string;
};

export type CompareStickyLayoutControllerOptions = {
  document: Document;
  isBrowser: () => boolean;
  tableHolder: () => ElementRef | undefined;
  bottomMirror: Signal<ElementRef | undefined>;
  scrollbarMirror: WritableSignal<ScrollbarMirrorState>;
  isTableOutsideViewport: WritableSignal<boolean>;
  stickyStyles: CompareStickyHeaderStyleState;
  ids: CompareStickyLayoutIds;
  itemCount: () => number;
  mirrorOptions?: ScrollbarMirrorOptions;
};

export class CompareStickyLayoutController {
  static readonly deferredUpdateDelayMs = COMPARE_STICKY_DEFERRED_UPDATE_DELAY_MS;

  private mirrorCtrl?: ScrollbarMirrorController;
  private layoutFrameId: number | null = null;
  private layoutTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: CompareStickyLayoutControllerOptions) {}

  init(): void {
    if (!this.options.isBrowser()) {
      return;
    }

    this.mirrorCtrl = new ScrollbarMirrorController(
      this.options.tableHolder,
      this.options.bottomMirror,
      this.options.scrollbarMirror,
      {
        ...this.options.mirrorOptions,
        tableId: this.options.ids.tableId,
        firstColId: this.options.ids.firstColId,
      },
    );

    window.addEventListener("scroll", this.scheduleUpdate);
    window.addEventListener("resize", this.scheduleUpdate);
    window.addEventListener("orientationchange", this.scheduleUpdate);
    this.scheduleUpdate();
  }

  destroy(): void {
    if (this.options.isBrowser()) {
      window.removeEventListener("scroll", this.scheduleUpdate);
      window.removeEventListener("resize", this.scheduleUpdate);
      window.removeEventListener("orientationchange", this.scheduleUpdate);

      if (this.layoutFrameId !== null) {
        cancelAnimationFrame(this.layoutFrameId);
        this.layoutFrameId = null;
      }

      if (this.layoutTimeoutId !== null) {
        clearTimeout(this.layoutTimeoutId);
        this.layoutTimeoutId = null;
      }
    }

    this.mirrorCtrl?.destroy();
    this.mirrorCtrl = undefined;
  }

  readonly scheduleUpdate = (): void => {
    if (!this.options.isBrowser() || this.layoutFrameId !== null) {
      return;
    }

    this.layoutFrameId = window.requestAnimationFrame(this.flushLayout);
  };

  scheduleDeferredUpdate(
    delayMs = CompareStickyLayoutController.deferredUpdateDelayMs,
  ): void {
    if (!this.options.isBrowser()) {
      return;
    }

    if (this.layoutTimeoutId !== null) {
      clearTimeout(this.layoutTimeoutId);
    }

    this.layoutTimeoutId = setTimeout(() => {
      this.layoutTimeoutId = null;
      this.scheduleUpdate();
    }, delayMs);
  }

  syncFromMirror(mirrorEl: HTMLElement): void {
    this.mirrorCtrl?.syncFromMirror(mirrorEl);
  }

  reset(): void {
    this.options.isTableOutsideViewport.set(false);
    this.clearStickyStyles();
  }

  private clearStickyStyles(): void {
    this.options.stickyStyles.fixedDivStyle.set("");
    this.options.stickyStyles.mainTableStyle.set("");
    this.options.stickyStyles.firstColStyle.set({});
    this.options.stickyStyles.columnStyles.set([]);
  }

  private readonly flushLayout = (): void => {
    this.layoutFrameId = null;

    const table = this.options.document.getElementById(this.options.ids.tableId);
    const isSticky = table
      ? table.getBoundingClientRect().top < COMPARE_STICKY_VIEWPORT_TOP_PX
      : false;

    this.options.isTableOutsideViewport.set(isSticky);

    if (!isSticky) {
      this.clearStickyStyles();
    } else {
      const styles = resolveCompareStickyHeaderStyles(
        this.options.document,
        this.options.tableHolder()?.nativeElement,
        this.options.ids,
        this.options.itemCount(),
      );
      this.options.stickyStyles.fixedDivStyle.set(styles.fixedDivStyle);
      this.options.stickyStyles.mainTableStyle.set(styles.mainTableStyle);
      this.options.stickyStyles.firstColStyle.set(styles.firstColStyle);
      this.options.stickyStyles.columnStyles.set(styles.columnStyles);
    }

    this.mirrorCtrl?.update();
  };
}
