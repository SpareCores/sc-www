import { formatBytes, formatValue } from "./pipe-utils";

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
