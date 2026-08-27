import { ElementRef, Signal, WritableSignal } from "@angular/core";
import {
  SCROLLBAR_MIRROR_CONTAINER_HEIGHT_PX,
  SCROLLBAR_MIRROR_DEFAULT_BOTTOM_ANCHOR_ROW_ID,
  SCROLLBAR_MIRROR_DEFAULT_FIRST_COL_ID,
  SCROLLBAR_MIRROR_DEFAULT_TABLE_ID,
  SCROLLBAR_MIRROR_OVERFLOW_VISIBILITY_THRESHOLD_PX,
  SCROLLBAR_MIRROR_VIEWPORT_INSET_PX,
  SCROLLBAR_MIRROR_Z_INDEX,
} from "./scrollbar-mirror.constants";

export interface ScrollbarMirrorPosition {
  left: number;
  width: number;
  bottom?: number;
}

export interface ScrollbarMirrorState {
  bottomPosition: ScrollbarMirrorPosition | null;
  innerWidth: number;
}

export interface ScrollbarMirrorOptions {
  tableId?: string;
  firstColId?: string;
  bottomAnchorRowId?: string;
}

export const INITIAL_SCROLLBAR_MIRROR_STATE: ScrollbarMirrorState = {
  bottomPosition: null,
  innerWidth: 0,
};

export class ScrollbarMirrorController {
  static readonly bottomAnchorRowId =
    SCROLLBAR_MIRROR_DEFAULT_BOTTOM_ANCHOR_ROW_ID;
  static readonly mirrorContainerHeight = SCROLLBAR_MIRROR_CONTAINER_HEIGHT_PX;
  static readonly mirrorZIndex = SCROLLBAR_MIRROR_Z_INDEX;
  static readonly mirrorViewportInset = SCROLLBAR_MIRROR_VIEWPORT_INSET_PX;
  static readonly overflowVisibilityThreshold =
    SCROLLBAR_MIRROR_OVERFLOW_VISIBILITY_THRESHOLD_PX;

  private syncingFrom: "table" | "mirror" | null = null;
  private captureHandler: (e: Event) => void;
  private syncResetFrameId: number | null = null;
  private readonly tableId: string;
  private readonly firstColId: string;
  private readonly bottomAnchorId: string;

  constructor(
    private tableHolderGetter: () => ElementRef | undefined,
    private bottomMirrorSignal: Signal<ElementRef | undefined>,
    private stateSignal: WritableSignal<ScrollbarMirrorState>,
    options: ScrollbarMirrorOptions = {},
  ) {
    this.tableId = options.tableId ?? SCROLLBAR_MIRROR_DEFAULT_TABLE_ID;
    this.firstColId =
      options.firstColId ?? SCROLLBAR_MIRROR_DEFAULT_FIRST_COL_ID;
    this.bottomAnchorId =
      options.bottomAnchorRowId ??
      SCROLLBAR_MIRROR_DEFAULT_BOTTOM_ANCHOR_ROW_ID;
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

  update(): void {
    const tableHolder = this.tableHolderGetter()?.nativeElement as
      | HTMLElement
      | undefined;
    const mainTable = document.getElementById(
      this.tableId,
    ) as HTMLElement | null;
    if (!tableHolder || !mainTable) {
      this.stateSignal.set({ ...INITIAL_SCROLLBAR_MIRROR_STATE });
      return;
    }

    const tableHolderRect = tableHolder.getBoundingClientRect();
    const firstCol = document.getElementById(this.firstColId);
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

    this.stateSignal.set({
      bottomPosition: this.getBottomMirrorPosition(
        mainTable,
        mirrorLeft,
        mirrorWidth,
      ),
      innerWidth,
    });
  }

  syncFromTable(): void {
    if (this.syncingFrom === "mirror") return;
    const tableHolder = this.tableHolderGetter()?.nativeElement as
      | HTMLElement
      | undefined;
    if (!tableHolder) return;
    this.syncingFrom = "table";
    try {
      const tableMax = tableHolder.scrollWidth - tableHolder.clientWidth;
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
    if (this.syncingFrom === "table") return;
    const tableHolder = this.tableHolderGetter()?.nativeElement as
      | HTMLElement
      | undefined;
    if (!tableHolder) return;
    this.syncingFrom = "mirror";
    try {
      const mirrorMax = mirrorEl.scrollWidth - mirrorEl.clientWidth;
      const tableMax = tableHolder.scrollWidth - tableHolder.clientWidth;

      if (mirrorMax > 0) {
        tableHolder.scrollLeft = (mirrorEl.scrollLeft / mirrorMax) * tableMax;
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

    const appHeader = document.querySelector<HTMLElement>("sc-header");
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
      mainTable.querySelector<HTMLElement>(`#${this.bottomAnchorId}`) ??
      mainTable.querySelector<HTMLElement>("tbody tr:last-of-type")
    );
  }

  private scheduleSyncReset(): void {
    if (this.syncResetFrameId !== null) {
      return;
    }

    this.syncResetFrameId = window.requestAnimationFrame(() => {
      this.syncResetFrameId = null;
      this.syncingFrom = null;
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
      ...(pos.bottom !== undefined ? { bottom: `${pos.bottom}px` } : {}),
      "z-index": `${ScrollbarMirrorController.mirrorZIndex}`,
      "overflow-x": "auto",
      "overflow-y": "hidden",
      height: `${ScrollbarMirrorController.mirrorContainerHeight}px`,
    };
  }
}
