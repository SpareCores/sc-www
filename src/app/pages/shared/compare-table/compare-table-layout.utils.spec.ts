import {
  COMPARE_PIN_FALLBACK_ITEM_THRESHOLD,
  COMPARE_PINNED_CONTENT_MAX_COLSPAN,
  COMPARE_SECTION_MIN_COLSPAN,
} from "./compare-table-layout.constants";
import {
  getCompareHeaderSpacerColSpan,
  getCompareSectionColSpan,
  resolveComparePinnedRowLayout,
  resolveCompareStickyHeaderStyles,
  shouldPinCompareRowsToViewport,
  type ComparePinnedRowLayoutOptions,
} from "./compare-table-layout.utils";

describe("compare-table-layout.utils pinned rows", () => {
  const HOLDER_ID = "table_holder";
  const TABLE_ID = "main-table";

  let holder: HTMLElement;
  let table: HTMLElement;
  let thead: HTMLElement;

  function options(
    overrides: Partial<ComparePinnedRowLayoutOptions> = {},
  ): ComparePinnedRowLayoutOptions {
    return {
      document,
      holderId: HOLDER_ID,
      tableId: TABLE_ID,
      itemCount: 3,
      isBrowser: true,
      ...overrides,
    };
  }

  beforeEach(() => {
    holder = document.createElement("div");
    holder.id = HOLDER_ID;
    Object.defineProperty(holder, "clientWidth", {
      configurable: true,
      value: 800,
    });

    table = document.createElement("table");
    table.id = TABLE_ID;
    thead = document.createElement("thead");
    Object.defineProperty(thead, "scrollWidth", {
      configurable: true,
      value: 800,
    });
    table.appendChild(thead);

    document.body.append(holder, table);
  });

  afterEach(() => {
    holder.remove();
    table.remove();
  });

  it("computes section and header spacer colspans", () => {
    expect(getCompareSectionColSpan(1)).toBe(COMPARE_SECTION_MIN_COLSPAN);
    expect(getCompareSectionColSpan(5)).toBe(6);
    expect(getCompareHeaderSpacerColSpan(5)).toBe(4);
  });

  it("pins only when the header overflows the holder", () => {
    expect(
      shouldPinCompareRowsToViewport(options({ isEmbedded: true })),
    ).toBeFalse();
    expect(shouldPinCompareRowsToViewport(options())).toBeFalse();

    Object.defineProperty(thead, "scrollWidth", {
      configurable: true,
      value: 1200,
    });
    expect(shouldPinCompareRowsToViewport(options())).toBeTrue();

    expect(
      shouldPinCompareRowsToViewport(
        options({
          isBrowser: false,
          itemCount: COMPARE_PIN_FALLBACK_ITEM_THRESHOLD + 1,
        }),
      ),
    ).toBeTrue();
    expect(
      shouldPinCompareRowsToViewport(
        options({
          isBrowser: false,
          itemCount: COMPARE_PIN_FALLBACK_ITEM_THRESHOLD,
        }),
      ),
    ).toBeFalse();
  });

  it("resolves pinned chart width and colspans when overflowing", () => {
    Object.defineProperty(thead, "scrollWidth", {
      configurable: true,
      value: 1200,
    });

    const pinned = resolveComparePinnedRowLayout(options({ itemCount: 9 }));
    expect(pinned.chartWidthStyle).toBe("width: 800px; max-width: 800px;");
    expect(pinned.contentColSpan).toBe(COMPARE_PINNED_CONTENT_MAX_COLSPAN);
    expect(pinned.trailingColSpan).toBe(7);
    expect(pinned.actionSpacerColSpan).toBe(6);

    Object.defineProperty(thead, "scrollWidth", {
      configurable: true,
      value: 800,
    });
    const unpinned = resolveComparePinnedRowLayout(options({ itemCount: 3 }));
    expect(unpinned.chartWidthStyle).toBe("width: 100%; max-width: 100%;");
    expect(unpinned.contentColSpan).toBe(4);
    expect(unpinned.trailingColSpan).toBe(0);
    expect(unpinned.actionSpacerColSpan).toBe(0);

    const embedded = resolveComparePinnedRowLayout(
      options({ itemCount: 9, isEmbedded: true }),
    );
    expect(embedded.contentColSpan).toBe(10);
    expect(embedded.trailingColSpan).toBe(0);
    expect(embedded.actionSpacerColSpan).toBe(0);
  });

  it("keeps pinned rows unpinned until browser measurements are available", () => {
    Object.defineProperty(thead, "scrollWidth", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(holder, "clientWidth", {
      configurable: true,
      value: 0,
    });

    const unmeasured = resolveComparePinnedRowLayout(
      options({ itemCount: 9, isBrowser: true, isEmbedded: false }),
    );
    expect(unmeasured.chartWidthStyle).toBe("width: 100%; max-width: 100%;");
    expect(unmeasured.contentColSpan).toBe(10);
    expect(unmeasured.trailingColSpan).toBe(0);
    expect(unmeasured.actionSpacerColSpan).toBe(0);
  });
});

describe("compare-table-layout.utils sticky header styles", () => {
  it("resolves fixed thead styles from table and holder geometry", () => {
    const holder = document.createElement("div");
    holder.id = "table_holder";
    Object.defineProperty(holder, "clientWidth", {
      configurable: true,
      value: 900,
    });

    const table = document.createElement("table");
    table.id = "main-table";
    const thead = document.createElement("thead");
    Object.defineProperty(thead, "clientWidth", {
      configurable: true,
      value: 1200,
    });
    const firstCol = document.createElement("th");
    firstCol.id = "first-col";
    thead.append(firstCol, document.createElement("th"));
    table.appendChild(thead);
    document.body.append(holder, table);

    spyOn(table, "getBoundingClientRect").and.returnValue({
      x: 10,
      y: 0,
      left: 10,
      top: 0,
      right: 1210,
      bottom: 40,
      width: 1200,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);
    spyOn(holder, "getBoundingClientRect").and.returnValue({
      x: 40,
      y: 0,
      left: 40,
      top: 0,
      right: 940,
      bottom: 40,
      width: 900,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);
    spyOn(firstCol, "getBoundingClientRect").and.returnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 120,
      bottom: 40,
      width: 120.4,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);

    try {
      const styles = resolveCompareStickyHeaderStyles(
        document,
        holder,
        {
          tableId: "main-table",
          tableHolderId: "table_holder",
          firstColId: "first-col",
        },
        1,
      );

      expect(styles.fixedDivStyle).toContain("width: 900px");
      expect(styles.mainTableStyle).toBe("width: 1200px; left: -30px");
      expect(styles.firstColStyle).toEqual({ width: "121px" });
      expect(styles.columnStyles.length).toBe(1);
    } finally {
      holder.remove();
      table.remove();
    }
  });
});
