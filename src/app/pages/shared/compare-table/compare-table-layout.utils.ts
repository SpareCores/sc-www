import {
  COMPARE_FULL_WIDTH_STYLE,
  COMPARE_HEADER_LEADING_COLSPAN,
  COMPARE_HEADER_SPACER_MIN_COLSPAN,
  COMPARE_OVERFLOW_TOLERANCE_PX,
  COMPARE_PIN_FALLBACK_ITEM_THRESHOLD,
  COMPARE_PINNED_CONTENT_MAX_COLSPAN,
  COMPARE_PINNED_TRAILING_MIN_COLSPAN,
  COMPARE_SECTION_ACTION_COLSPAN,
  COMPARE_SECTION_MIN_COLSPAN,
} from "./compare-table-layout.constants";

export type ComparePinnedRowLayoutOptions = {
  document: Document;
  holderId: string;
  tableId: string;
  itemCount: number;
  isBrowser: boolean;
  isEmbedded?: boolean;
};

export type ComparePinnedRowLayout = {
  contentColSpan: number;
  trailingColSpan: number;
  actionSpacerColSpan: number;
  chartWidthStyle: string;
};

function getCompareColumnWidthStyle(
  document: Document,
  tableId: string,
  index: number,
  itemCount: number,
): string {
  const mainTable = document.getElementById(tableId);
  if (mainTable) {
    const headerCells = mainTable.querySelectorAll("thead th");
    if (headerCells?.[index + 1]) {
      const width = headerCells[index + 1].getBoundingClientRect().width;
      return `width: ${width}px; min-width: ${width}px; max-width: ${width}px;`;
    }
  }

  const fallback = 100 / (itemCount + 1);
  return `width: ${fallback}%; max-width: ${fallback}%;`;
}

function getCompareMainTableWidthStyle(
  document: Document,
  tableId: string,
  holderEl: HTMLElement | undefined | null,
): string {
  const thead = document.querySelector(`#${tableId} thead`);
  const rect = document.getElementById(tableId)?.getBoundingClientRect();
  const holderRect = holderEl?.getBoundingClientRect();
  const posLeft = rect && holderRect ? rect.x - holderRect.x : 0;
  return `width: ${thead?.clientWidth}px; left: ${posLeft}px`;
}

function getCompareFixedHolderStyle(
  document: Document,
  holderId: string,
): string {
  const div = document.getElementById(holderId);
  return `width: ${div?.clientWidth}px; overflow: hidden;`;
}

function getCompareStickyFirstColStyle(
  document: Document,
  firstColId: string,
): { width?: string } {
  const firstColumn = document.getElementById(firstColId);
  if (firstColumn) {
    const width = Math.ceil(firstColumn.getBoundingClientRect().width);
    return { width: `${width}px` };
  }
  return {};
}

export type CompareStickyHeaderStyles = {
  fixedDivStyle: string;
  mainTableStyle: string;
  firstColStyle: { width?: string };
  columnStyles: string[];
};

export function resolveCompareStickyHeaderStyles(
  document: Document,
  holderEl: HTMLElement | undefined | null,
  ids: {
    tableId: string;
    tableHolderId: string;
    firstColId: string;
  },
  itemCount: number,
): CompareStickyHeaderStyles {
  return {
    fixedDivStyle: getCompareFixedHolderStyle(document, ids.tableHolderId),
    mainTableStyle: getCompareMainTableWidthStyle(
      document,
      ids.tableId,
      holderEl,
    ),
    firstColStyle: getCompareStickyFirstColStyle(document, ids.firstColId),
    columnStyles: Array.from({ length: itemCount }, (_, index) =>
      getCompareColumnWidthStyle(document, ids.tableId, index, itemCount),
    ),
  };
}

export function getCompareSectionColSpan(itemCount: number): number {
  return Math.max(itemCount + 1, COMPARE_SECTION_MIN_COLSPAN);
}

export function resolveCompareUnpinnedRowLayout(
  itemCount: number,
): ComparePinnedRowLayout {
  return {
    contentColSpan: getCompareSectionColSpan(itemCount),
    trailingColSpan: 0,
    actionSpacerColSpan: 0,
    chartWidthStyle: COMPARE_FULL_WIDTH_STYLE,
  };
}

export function shouldPinCompareRowsToViewport(
  options: ComparePinnedRowLayoutOptions,
): boolean {
  return resolveCompareTableOverflow(options).shouldPin;
}

function resolveCompareTableOverflow(options: ComparePinnedRowLayoutOptions): {
  shouldPin: boolean;
  holderWidthPx: number;
} {
  if (options.isEmbedded) {
    return { shouldPin: false, holderWidthPx: 0 };
  }

  if (!options.isBrowser) {
    return {
      shouldPin: options.itemCount > COMPARE_PIN_FALLBACK_ITEM_THRESHOLD,
      holderWidthPx: 0,
    };
  }

  const holderWidthPx =
    options.document.getElementById(options.holderId)?.clientWidth ?? 0;
  const tableHeaderWidth =
    options.document.querySelector(`#${options.tableId} thead`)?.scrollWidth ??
    0;

  if (holderWidthPx && tableHeaderWidth) {
    return {
      shouldPin:
        tableHeaderWidth - holderWidthPx > COMPARE_OVERFLOW_TOLERANCE_PX,
      holderWidthPx,
    };
  }

  return { shouldPin: false, holderWidthPx };
}

export function resolveComparePinnedRowLayout(
  options: ComparePinnedRowLayoutOptions,
): ComparePinnedRowLayout {
  const { shouldPin, holderWidthPx } = resolveCompareTableOverflow(options);
  if (!shouldPin) {
    return resolveCompareUnpinnedRowLayout(options.itemCount);
  }

  const sectionColSpan = getCompareSectionColSpan(options.itemCount);

  const contentColSpan = Math.min(
    sectionColSpan - COMPARE_PINNED_TRAILING_MIN_COLSPAN,
    COMPARE_PINNED_CONTENT_MAX_COLSPAN,
  );
  const trailingColSpan = Math.max(sectionColSpan - contentColSpan, 0);

  return {
    contentColSpan,
    trailingColSpan,
    actionSpacerColSpan: Math.max(
      trailingColSpan - COMPARE_SECTION_ACTION_COLSPAN,
      0,
    ),
    chartWidthStyle:
      options.isBrowser && holderWidthPx
        ? `width: ${holderWidthPx}px; max-width: ${holderWidthPx}px;`
        : COMPARE_FULL_WIDTH_STYLE,
  };
}

export function getCompareHeaderSpacerColSpan(itemCount: number): number {
  return Math.max(
    getCompareSectionColSpan(itemCount) - COMPARE_HEADER_LEADING_COLSPAN,
    COMPARE_HEADER_SPACER_MIN_COLSPAN,
  );
}

export function resolveCompareFirstColumnWidthPx(
  document: Document,
  tableId: string,
): number | null {
  const table = document.getElementById(tableId);
  if (!table) {
    return null;
  }

  const cells = table.querySelectorAll<HTMLTableCellElement>(
    "thead th:first-child, tbody > tr > td:first-child",
  );
  let maxWidth = 0;

  cells.forEach((cell) => {
    if (cell.colSpan > 1) {
      return;
    }

    maxWidth = Math.max(maxWidth, cell.scrollWidth);
  });

  return maxWidth > 0 ? Math.ceil(maxWidth) : null;
}

export function resetCompareTableHolderScroll(
  document: Document,
  holderId: string,
): void {
  const holder = document.getElementById(holderId);
  if (holder) {
    holder.scrollLeft = 0;
  }
}

export function applyCompareFirstColumnWidth(
  document: Document,
  tableId: string,
): void {
  const table = document.getElementById(tableId);
  if (!table) {
    return;
  }

  const widthPx = resolveCompareFirstColumnWidthPx(document, tableId);
  if (widthPx === null) {
    return;
  }

  table.style.setProperty("--compare-first-column-width", `${widthPx}px`);
}
