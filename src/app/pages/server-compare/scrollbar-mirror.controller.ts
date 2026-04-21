import { ElementRef, Signal, WritableSignal } from "@angular/core";

export interface ScrollbarMirrorPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

export interface ScrollbarMirrorState {
  topPosition: ScrollbarMirrorPosition | null;
  bottomPosition: ScrollbarMirrorPosition | null;
  innerWidth: number;
}

export const INITIAL_SCROLLBAR_MIRROR_STATE: ScrollbarMirrorState = {
  topPosition: null,
  bottomPosition: null,
  innerWidth: 0,
};

export class ScrollbarMirrorController {
  static readonly bottomAnchorRowId = "server-compare-view-server-row";
  static readonly mirrorContainerHeight = 8;
  static readonly mirrorZIndex = 41;
  static readonly mirrorViewportInset = 0;
  static readonly overflowVisibilityThreshold = 1;

  private isSyncing = false;
  private captureHandler: (e: Event) => void;
  private syncResetFrameId: number | null = null;

  constructor(
    private tableHolderGetter: () => ElementRef | undefined,
    private topMirrorSignal: Signal<ElementRef | undefined>,
    private bottomMirrorSignal: Signal<ElementRef | undefined>,
    private stateSignal: WritableSignal<ScrollbarMirrorState>,
  ) {
    this.captureHandler = (e: Event) => {
      const el = this.tableHolderGetter()?.nativeElement;
      if (el && e.target === el) {
        this.syncFromTable();
      }
    };
    document.addEventListener("scroll", this.captureHandler, true);
  }

  destroy(): void {
    document.removeEventListener("scroll", this.captureHandler, true);
    if (this.syncResetFrameId !== null) {
      cancelAnimationFrame(this.syncResetFrameId);
      this.syncResetFrameId = null;
    }
  }

  update(isSticky: boolean): void {
    const tableHolder = this.tableHolderGetter()?.nativeElement as
      | HTMLElement
      | undefined;
    const mainTable = document.getElementById(
      "main-table",
    ) as HTMLElement | null;
    if (!tableHolder || !mainTable) {
      this.stateSignal.set({ ...INITIAL_SCROLLBAR_MIRROR_STATE });
      return;
    }

    const tableHolderRect = tableHolder.getBoundingClientRect();
    const firstCol = document.getElementById("server-compare-table-first-col");
    const firstColWidth = firstCol ? firstCol.getBoundingClientRect().width : 0;
    const mirrorLeft = tableHolderRect.left + firstColWidth;
    const mirrorWidth = Math.max(
      0,
      Math.floor(tableHolderRect.width - firstColWidth),
    );
    const innerWidth = Math.max(0, mainTable.scrollWidth - firstColWidth);
    const hasVisibleHorizontalOverflow =
      mirrorWidth > 0 &&
      innerWidth - mirrorWidth >
        ScrollbarMirrorController.overflowVisibilityThreshold;

    if (!hasVisibleHorizontalOverflow) {
      this.stateSignal.set({ ...INITIAL_SCROLLBAR_MIRROR_STATE });
      return;
    }

    let topPosition: ScrollbarMirrorPosition | null = null;

    if (isSticky) {
      const top = this.getStickyTopBoundary();
      topPosition = { left: mirrorLeft, width: mirrorWidth, top };
    } else {
      const theadEl = mainTable.querySelector("thead");
      const theadRect = theadEl?.getBoundingClientRect();
      if (
        theadRect &&
        theadRect.bottom >= 0 &&
        theadRect.top <= window.innerHeight
      ) {
        topPosition = {
          left: mirrorLeft,
          width: mirrorWidth,
          top: theadRect.bottom,
        };
      }
    }

    const bottomPosition = isSticky
      ? this.getBottomMirrorPosition(mainTable, mirrorLeft, mirrorWidth)
      : null;

    this.stateSignal.set({ topPosition, bottomPosition, innerWidth });
  }

  syncFromTable(): void {
    if (this.isSyncing) return;
    const tableHolder = this.tableHolderGetter()?.nativeElement as
      | HTMLElement
      | undefined;
    if (!tableHolder) return;
    this.isSyncing = true;
    try {
      const tableMax = tableHolder.scrollWidth - tableHolder.clientWidth;
      this._applyToMirror(
        this.topMirrorSignal()?.nativeElement,
        tableHolder.scrollLeft,
        tableMax,
      );
      this._applyToMirror(
        this.bottomMirrorSignal()?.nativeElement,
        tableHolder.scrollLeft,
        tableMax,
      );
    } finally {
      this.scheduleSyncReset();
    }
  }

  syncFromMirror(mirrorEl: HTMLElement): void {
    if (this.isSyncing) return;
    const tableHolder = this.tableHolderGetter()?.nativeElement as
      | HTMLElement
      | undefined;
    if (!tableHolder) return;
    this.isSyncing = true;
    try {
      const mirrorMax = mirrorEl.scrollWidth - mirrorEl.clientWidth;
      const tableMax = tableHolder.scrollWidth - tableHolder.clientWidth;

      if (mirrorMax > 0) {
        tableHolder.scrollLeft = (mirrorEl.scrollLeft / mirrorMax) * tableMax;
      }

      const isTop =
        mirrorEl === (this.topMirrorSignal()?.nativeElement as HTMLElement);
      const otherEl = isTop
        ? (this.bottomMirrorSignal()?.nativeElement as HTMLElement)
        : (this.topMirrorSignal()?.nativeElement as HTMLElement);

      if (otherEl) {
        const otherMax = otherEl.scrollWidth - otherEl.clientWidth;
        if (mirrorMax > 0) {
          otherEl.scrollLeft = (mirrorEl.scrollLeft / mirrorMax) * otherMax;
        }
      }
    } finally {
      this.scheduleSyncReset();
    }
  }

  private getStickyTopBoundary(): number {
    const fixedThead = document.querySelector<HTMLElement>(".fixed_thead");
    if (fixedThead) {
      return fixedThead.getBoundingClientRect().bottom;
    }

    const stickyHeader = document.querySelector<HTMLElement>("header.sticky");
    if (stickyHeader) {
      return stickyHeader.getBoundingClientRect().bottom;
    }

    const appHeader = document.querySelector<HTMLElement>("app-header");
    if (appHeader) {
      return appHeader.getBoundingClientRect().bottom;
    }

    return 0;
  }

  private getBottomMirrorPosition(
    mainTable: HTMLElement,
    left: number,
    width: number,
  ): ScrollbarMirrorPosition | null {
    const bottomAnchor = this.getBottomAnchorRow(mainTable);
    const bottomAnchorRect = bottomAnchor?.getBoundingClientRect();
    if (!bottomAnchorRect) {
      return null;
    }

    if (bottomAnchorRect.bottom <= this.getStickyTopBoundary()) {
      return null;
    }

    return {
      left,
      width,
      bottom: Math.max(
        ScrollbarMirrorController.mirrorViewportInset,
        window.innerHeight -
          bottomAnchorRect.bottom -
          ScrollbarMirrorController.mirrorContainerHeight,
      ),
    };
  }

  private getBottomAnchorRow(mainTable: HTMLElement): HTMLElement | null {
    return (
      mainTable.querySelector<HTMLElement>(
        `#${ScrollbarMirrorController.bottomAnchorRowId}`,
      ) ?? mainTable.querySelector<HTMLElement>("tbody tr:last-of-type")
    );
  }

  private scheduleSyncReset(): void {
    if (this.syncResetFrameId !== null) {
      return;
    }

    this.syncResetFrameId = window.requestAnimationFrame(() => {
      this.syncResetFrameId = null;
      this.isSyncing = false;
    });
  }

  private _applyToMirror(
    mirrorEl: HTMLElement | undefined,
    sourceScrollLeft: number,
    sourceMax: number,
  ): void {
    if (!mirrorEl) return;
    const mirrorMax = mirrorEl.scrollWidth - mirrorEl.clientWidth;
    if (sourceMax > 0) {
      mirrorEl.scrollLeft = (sourceScrollLeft / sourceMax) * mirrorMax;
    }
  }

  static toStyle(pos: ScrollbarMirrorPosition): Record<string, string> {
    return {
      position: "fixed",
      left: `${pos.left}px`,
      width: `${pos.width}px`,
      ...(pos.top !== undefined ? { top: `${pos.top}px` } : {}),
      ...(pos.bottom !== undefined ? { bottom: `${pos.bottom}px` } : {}),
      "z-index": `${ScrollbarMirrorController.mirrorZIndex}`,
      "overflow-x": "auto",
      "overflow-y": "hidden",
      height: `${ScrollbarMirrorController.mirrorContainerHeight}px`,
    };
  }
}
