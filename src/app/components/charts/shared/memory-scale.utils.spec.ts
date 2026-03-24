import {
  collectMemoryBenchmarkScales,
  getMemoryBenchmarkScaleValue,
  normalizeMemoryBenchmarkScore,
} from "./memory-scale.utils";

describe("memory-scale.utils", () => {
  it("should read membench scale values from size_kb and convert them to MiB", () => {
    const option = { benchmarkId: "membench:bandwidth_copy" };

    expect(
      getMemoryBenchmarkScaleValue({ config: { size_kb: 1024 } }, option),
    ).toBe(1);
  });

  it("should read legacy bw_mem scale values from size", () => {
    const option = { benchmarkId: "bw_mem" };

    expect(getMemoryBenchmarkScaleValue({ config: { size: 4 } }, option)).toBe(
      4,
    );
  });

  it("should collect sorted unique memory scales", () => {
    const option = { benchmarkId: "membench:latency" };

    expect(
      collectMemoryBenchmarkScales(
        [
          { config: { size_kb: 4096 } },
          { config: { size_kb: 1024 } },
          { config: { size_kb: 4096 } },
        ],
        option,
      ),
    ).toEqual([1, 4]);
  });

  it("should normalize memory scores by core count only when per-core is enabled", () => {
    expect(normalizeMemoryBenchmarkScore(120, true, 4)).toBe(30);
    expect(normalizeMemoryBenchmarkScore(120, false, 4)).toBe(120);
    expect(normalizeMemoryBenchmarkScore(null, true, 4)).toBeNull();
  });
});
