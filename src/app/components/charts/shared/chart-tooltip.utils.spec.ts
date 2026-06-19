import {
  wrapTextAtWordBoundaries,
  CHART_TOOLTIP_MAX_LINE_LENGTH,
} from "./chart-tooltip.utils";

describe("wrapTextAtWordBoundaries", () => {
  it("returns an empty array for blank text", () => {
    expect(wrapTextAtWordBoundaries("   ", 10)).toEqual([]);
  });

  it("returns a single line when text fits", () => {
    expect(wrapTextAtWordBoundaries("short note", 20)).toEqual(["short note"]);
  });

  it("wraps at word boundaries without splitting words", () => {
    const text =
      "Partial coverage: missing component benchmark(s): Geekbench Clang compilation";

    expect(
      wrapTextAtWordBoundaries(text, CHART_TOOLTIP_MAX_LINE_LENGTH),
    ).toEqual([
      "Partial coverage: missing component benchmark(s): Geekbench",
      "Clang compilation",
    ]);
  });

  it("keeps an oversized word on its own line", () => {
    const longWord = "a".repeat(60);

    expect(wrapTextAtWordBoundaries(`before ${longWord} after`, 20)).toEqual([
      "before",
      longWord,
      "after",
    ]);
  });
});
