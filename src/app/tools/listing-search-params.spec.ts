import { areSearchParamsEqual, toSearchParams } from "./listing-search-params";

describe("listing-search-params", () => {
  it("strips presentation-only columns from search state", () => {
    expect(
      toSearchParams({
        vcpus_min: "105",
        columns: "123",
      }),
    ).toEqual({
      vcpus_min: "105",
    });
  });

  it("treats column-only changes as equal search state", () => {
    expect(
      areSearchParamsEqual(
        { vcpus_min: "105", columns: "1" },
        { vcpus_min: "105", columns: "2" },
      ),
    ).toBeTrue();
  });

  it("treats filter changes as different search state", () => {
    expect(
      areSearchParamsEqual({ vcpus_min: "105" }, { vcpus_min: "106" }),
    ).toBeFalse();
  });
});
