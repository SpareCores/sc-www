import {
  formatNumberWithCommas,
  getBestBenchmarkCellStyle,
  getBestPropertyCellStyle,
  getServerPropertyValue,
} from "./server-compare-table.utils";

type PropertyValueServer = Parameters<typeof getServerPropertyValue>[1];
type BestPropertyServer = Parameters<typeof getBestPropertyCellStyle>[1];

describe("server compare table utils", () => {
  it("formats numbers with commas", () => {
    expect(formatNumberWithCommas(1234567)).toBe("1,234,567");
  });

  it("flags the best benchmark value when higher is better", () => {
    expect(
      getBestBenchmarkCellStyle(
        20,
        [10, 20, 15],
        { higher_is_better: true },
        "best",
      ),
    ).toBe("best");
  });

  it("flags the best benchmark value when lower is better", () => {
    expect(
      getBestBenchmarkCellStyle(
        10,
        [10, 20, 15],
        { higher_is_better: false },
        "best",
      ),
    ).toBe("best");
  });

  it("formats instance property values", () => {
    expect(
      getServerPropertyValue({ id: "memory_amount" }, { memory_amount: 2048 }),
    ).toBe("2 GiB");
  });

  it("formats byte-valued columns with binary units", () => {
    const server: PropertyValueServer & { disk_bytes: number } = {
      disk_bytes: 2048,
    };

    expect(
      getServerPropertyValue({ id: "disk_bytes", unit: "byte" }, server),
    ).toBe("2 KiB");
  });

  it("returns undefined for array properties containing nested objects", () => {
    const server: PropertyValueServer & { gpus: Array<{ name: string }> } = {
      gpus: [{ name: "A100" }],
    };

    expect(getServerPropertyValue({ id: "gpus" }, server)).toBeUndefined();
  });

  it("flags the best numeric property", () => {
    const server: BestPropertyServer & { vcpu_count: number } = {
      vcpu_count: 8,
    };
    const servers: Array<BestPropertyServer & { vcpu_count: number }> = [
      { vcpu_count: 4 },
      { vcpu_count: 8 },
    ];

    expect(
      getBestPropertyCellStyle("vcpu_count", server, servers, "best"),
    ).toBe("best");
  });
});
