import { isBelowBreakpoint } from "./breakpoints";

describe("isBelowBreakpoint", () => {
  it("should query the viewport below the breakpoint width", () => {
    const matchMedia = spyOn(window, "matchMedia").and.returnValue({
      matches: true,
    } as MediaQueryList);

    expect(isBelowBreakpoint(window, "wide")).toBeTrue();
    expect(matchMedia).toHaveBeenCalledWith("(width < 75rem)");
  });

  it("should return false at or above the breakpoint", () => {
    spyOn(window, "matchMedia").and.returnValue({
      matches: false,
    } as MediaQueryList);

    expect(isBelowBreakpoint(window, "lg")).toBeFalse();
  });
});
