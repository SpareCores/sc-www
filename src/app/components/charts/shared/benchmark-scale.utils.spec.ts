import {
  buildMajorTicks,
  legacyMemoryBlockSizeTicks,
  sortUniqueNumbers,
} from "./benchmark-scale.utils";

describe("benchmark-scale.utils", () => {
  it("should sort and deduplicate numeric values", () => {
    expect(sortUniqueNumbers([4, undefined, 2, 4, null, 1])).toEqual([1, 2, 4]);
  });

  it("should build major tick objects from numeric values", () => {
    expect(buildMajorTicks([1, 4])).toEqual([
      { value: 1, label: 1, major: true },
      { value: 4, label: 4, major: true },
    ]);
  });

  it("should expose the legacy memory block size tick set", () => {
    expect(legacyMemoryBlockSizeTicks).toEqual([
      0.016384, 0.262144, 1, 2, 4, 8, 16, 32, 64, 256, 512,
    ]);
  });
});
