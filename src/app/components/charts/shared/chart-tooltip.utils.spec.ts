import {
  wrapTextAtWordBoundaries,
  CHART_TOOLTIP_MAX_LINE_LENGTH,
  buildCompareTooltipTitle,
  formatBenchmarkNoteTooltip,
  formatServerTooltipIdentity,
  formatStaticWebFileSizeLabel,
  formatStaticWebFileSizeTooltipContext,
  getBenchmarkMetaNote,
  getBenchmarkMetaNotes,
  getDatasetTooltipIdentity,
  withServerTooltipIdentity,
} from "./chart-tooltip.utils";

describe("formatBenchmarkNoteTooltip", () => {
  it("prefixes notes with the benchmark name after the category prefix", () => {
    expect(
      formatBenchmarkNoteTooltip(
        "Geekbench: Text Processing",
        "This benchmark uses a fixed workload size.",
      ),
    ).toBe("- Text Processing: This benchmark uses a fixed workload size.");
  });

  it("returns the note without the benchmark name when requested", () => {
    expect(
      formatBenchmarkNoteTooltip(
        "PassMark: Memory Write",
        "This benchmark score is largely independent of vCPU count.",
        { includeBenchmarkName: false },
      ),
    ).toBe("This benchmark score is largely independent of vCPU count.");
  });
});

describe("getBenchmarkMetaNote", () => {
  it("returns a formatted note tooltip for matching benchmark metadata", () => {
    expect(
      getBenchmarkMetaNote(
        [
          {
            benchmark_id: "stress_ng:div16",
            name: "Stress-ng: Div16",
            note: "Scores may plateau above 32 vCPUs.",
          },
        ],
        "stress_ng:div16",
      ),
    ).toBe("- Div16: Scores may plateau above 32 vCPUs.");
  });

  it("omits the benchmark name when the label is already visible", () => {
    expect(
      getBenchmarkMetaNote(
        [
          {
            benchmark_id: "passmark:memory_write",
            name: "PassMark: Memory Write",
            note: "This benchmark score is largely independent of vCPU count.",
          },
        ],
        "passmark:memory_write",
        { includeBenchmarkName: false },
      ),
    ).toBe("This benchmark score is largely independent of vCPU count.");
  });
});

describe("getBenchmarkMetaNotes", () => {
  it("joins unique benchmark metadata notes", () => {
    expect(
      getBenchmarkMetaNotes(
        [
          {
            benchmark_id: "geekbench:crypto",
            name: "Geekbench: Crypto",
            note: "Uses a fixed dataset.",
          },
          {
            benchmark_id: "geekbench:text",
            name: "Geekbench: Text",
            note: "Uses a fixed dataset.",
          },
          {
            benchmark_id: "geekbench:clang",
            name: "Geekbench: Clang",
            note: "Limited by dependency graph width.",
          },
        ],
        ["geekbench:crypto", "geekbench:text", "geekbench:clang"],
        { includeBenchmarkName: false },
      ),
    ).toBe("Uses a fixed dataset.\nLimited by dependency graph width.");
  });
});

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

describe("formatServerTooltipIdentity", () => {
  it("prefers vendor_name over vendor_id with api_reference", () => {
    expect(
      formatServerTooltipIdentity({
        vendor_name: "Amazon Web Services",
        vendor_id: "aws",
        api_reference: "m7g.large",
      }),
    ).toBe("m7g.large by Amazon Web Services");
  });

  it("falls back to vendor_id when vendor_name is missing", () => {
    expect(
      formatServerTooltipIdentity({
        vendor_id: "aws",
        api_reference: "m7g.large",
      }),
    ).toBe("m7g.large by aws");
  });

  it("falls back to display_name when vendor and api_reference are missing", () => {
    expect(
      formatServerTooltipIdentity({
        display_name: "Server A",
      }),
    ).toBe("Server A");
  });
});

describe("buildCompareTooltipTitle", () => {
  it("returns a multi-line title when identity and context are present", () => {
    expect(buildCompareTooltipTitle("m7g.large by aws", "4 vCPUs")).toEqual([
      "m7g.large by aws",
      "4 vCPUs",
    ]);
  });
});

describe("formatStaticWebFileSizeLabel", () => {
  it("formats k-suffixed benchmark sizes as KiB", () => {
    expect(formatStaticWebFileSizeLabel("16k")).toBe("16 KiB");
    expect(formatStaticWebFileSizeLabel("1k")).toBe("1 KiB");
  });

  it("formats numeric sizes as KiB", () => {
    expect(formatStaticWebFileSizeLabel(64)).toBe("64 KiB");
  });

  it("returns an empty label for blank values", () => {
    expect(formatStaticWebFileSizeLabel("")).toBe("");
    expect(formatStaticWebFileSizeLabel("   ")).toBe("");
  });
});

describe("formatStaticWebFileSizeTooltipContext", () => {
  it("builds tooltip context without duplicating units", () => {
    expect(formatStaticWebFileSizeTooltipContext("16k")).toBe(
      "16 KiB file size",
    );
  });

  it("falls back to file size when the label is blank", () => {
    expect(formatStaticWebFileSizeTooltipContext("")).toBe("file size");
  });
});

describe("withServerTooltipIdentity", () => {
  it("attaches formatted identity to datasets", () => {
    const dataset = withServerTooltipIdentity(
      { label: "Display Name" },
      {
        display_name: "Display Name",
        vendor_id: "aws",
        api_reference: "m7g.large",
      },
    );

    expect(dataset.label).toBe("Display Name");
    expect(dataset.serverTooltipIdentity).toBe("m7g.large by aws");
    expect(getDatasetTooltipIdentity(dataset)).toBe("m7g.large by aws");
  });
});
