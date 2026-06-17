import {
  formatBinaryMemoryDisplay,
  formatBytes,
  formatGpuMemory,
  formatStorageSize,
  formatValue,
  parseBinaryMemoryInput,
} from "./pipe-utils";

describe("formatValue", () => {
  it("formats values below 10 with 2 decimals", () => {
    expect(formatValue(1.234)).toBe("1.23");
  });

  it("formats values between 10 and 100 with 1 decimal", () => {
    expect(formatValue(12.34)).toBe("12.3");
  });

  it("rounds values above 100", () => {
    expect(formatValue(123.4)).toBe("123");
  });
});

describe("formatBytes", () => {
  it("formats 0 as '0 Bytes'", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats small values as Bytes", () => {
    expect(formatBytes(512)).toBe("512 Bytes");
  });

  it("formats KiB values", () => {
    expect(formatBytes(1024)).toBe("1 KiB");
  });

  it("formats MiB values", () => {
    expect(formatBytes(1048576)).toBe("1 MiB");
  });

  it("formats GiB values", () => {
    expect(formatBytes(1073741824)).toBe("1 GiB");
  });

  it("formats fractional MiB values", () => {
    expect(formatBytes(1572864)).toBe("1.5 MiB");
  });
});

describe("formatBinaryMemoryDisplay", () => {
  it("keeps sub-TiB values in GiB", () => {
    expect(formatBinaryMemoryDisplay(1.25)).toEqual({
      value: "1.25",
      unit: "GiB",
    });
  });

  it("promotes 1024 GiB and above to TiB", () => {
    expect(formatBinaryMemoryDisplay(1536)).toEqual({
      value: "1.5",
      unit: "TiB",
    });
  });
});

describe("formatStorageSize", () => {
  it("returns empty value for null and undefined", () => {
    expect(formatStorageSize(null)).toBe("-");
    expect(formatStorageSize(undefined)).toBe("-");
    expect(formatStorageSize(null, "0 GB")).toBe("0 GB");
  });

  it("formats zero and sub-threshold values as GB", () => {
    expect(formatStorageSize(0)).toBe("0 GB");
    expect(formatStorageSize(500)).toBe("500 GB");
  });

  it("promotes values at or above 1000 GB to TB via formatValue", () => {
    expect(formatStorageSize(1500)).toBe("1.5 TB");
    expect(formatStorageSize(1536)).toBe("1.54 TB");
  });
});

describe("formatGpuMemory", () => {
  it("returns empty value for null and undefined", () => {
    expect(formatGpuMemory(null)).toBe("-");
    expect(formatGpuMemory(undefined)).toBe("-");
  });

  it("converts MiB to GiB via formatValue", () => {
    expect(formatGpuMemory(512)).toBe("0.5 GiB");
    expect(formatGpuMemory(16384)).toBe("16 GiB");
    expect(formatGpuMemory(0)).toBe("0 GiB");
  });
});

describe("parseBinaryMemoryInput", () => {
  it("parses GiB values", () => {
    expect(parseBinaryMemoryInput("1536", "GiB")).toBe(1536);
  });

  it("parses TiB values back into GiB", () => {
    expect(parseBinaryMemoryInput("1.5", "TiB")).toBe(1536);
  });

  it("rejects invalid numeric strings", () => {
    expect(parseBinaryMemoryInput(".", "GiB")).toBeNull();
    expect(parseBinaryMemoryInput("1e3", "GiB")).toBeNull();
  });
});
