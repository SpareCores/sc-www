export function getCompareColumnWidthStyle(
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

export function getCompareMainTableWidthStyle(
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

export function getCompareFixedHolderStyle(
  document: Document,
  holderId: string,
): string {
  const div = document.getElementById(holderId);
  return `width: ${div?.clientWidth}px; overflow: hidden;`;
}

export function getCompareStickyFirstColStyle(
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
