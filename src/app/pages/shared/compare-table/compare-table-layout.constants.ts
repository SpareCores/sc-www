/** Minimum section colspan: label column plus at least two value columns. */
export const COMPARE_SECTION_MIN_COLSPAN = 3;

/** Max colspan for the sticky pinned content cell when the table overflows. */
export const COMPARE_PINNED_CONTENT_MAX_COLSPAN = 3;

/** Minimum trailing filler colspan left beside a pinned content cell. */
export const COMPARE_PINNED_TRAILING_MIN_COLSPAN = 1;

/**
 * Fallback pin threshold when holder/header widths are unavailable:
 * pin rows once compared item count exceeds this value.
 */
export const COMPARE_PIN_FALLBACK_ITEM_THRESHOLD = 4;

/** Pixels of header overflow over the holder required before pinning rows. */
export const COMPARE_OVERFLOW_TOLERANCE_PX = 1;

/** Columns reserved for a section-header action button cell. */
export const COMPARE_SECTION_ACTION_COLSPAN = 1;

/** Leading columns (label + title) before a section header spacer. */
export const COMPARE_HEADER_LEADING_COLSPAN = 2;

/** Minimum colspan for a section header spacer cell. */
export const COMPARE_HEADER_SPACER_MIN_COLSPAN = 1;

/** Viewport top threshold (px) below which the compare table header becomes sticky. */
export const COMPARE_STICKY_VIEWPORT_TOP_PX = 70;

export const COMPARE_FULL_WIDTH_STYLE = "width: 100%; max-width: 100%;";
