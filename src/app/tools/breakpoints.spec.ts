import { DestroyRef } from "@angular/core";
import { isBelowBreakpoint, watchBelowBreakpoint } from "./breakpoints";

describe("isBelowBreakpoint", () => {
  it("should query the viewport below the breakpoint width", () => {
    const matchMedia = spyOn(window, "matchMedia").and.returnValue({
      matches: true,
    } as MediaQueryList);

    expect(isBelowBreakpoint(window, "lg")).toBeTrue();
    expect(matchMedia).toHaveBeenCalledWith("(width < 64rem)");
  });

  it("should return false at or above the breakpoint", () => {
    spyOn(window, "matchMedia").and.returnValue({
      matches: false,
    } as MediaQueryList);

    expect(isBelowBreakpoint(window, "lg")).toBeFalse();
  });
});

describe("watchBelowBreakpoint", () => {
  let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
  let destroyCallback: (() => void) | undefined;
  let query: jasmine.SpyObj<MediaQueryList>;
  let destroyRef: DestroyRef;

  beforeEach(() => {
    changeListener = undefined;
    destroyCallback = undefined;
    query = jasmine.createSpyObj<MediaQueryList>(
      "MediaQueryList",
      ["addEventListener", "removeEventListener"],
      { matches: true },
    );
    query.addEventListener.and.callFake(
      (_type: string, listener: EventListenerOrEventListenerObject) => {
        changeListener = listener as (event: MediaQueryListEvent) => void;
      },
    );
    destroyRef = {
      destroyed: false,
      onDestroy: (callback: () => void) => {
        destroyCallback = callback;
        return () => undefined;
      },
    };
  });

  it("should start with the current match and follow changes", () => {
    const matchMedia = spyOn(window, "matchMedia").and.returnValue(query);

    const isBelow = watchBelowBreakpoint(window, "lg", destroyRef);

    expect(matchMedia).toHaveBeenCalledWith("(width < 64rem)");
    expect(isBelow()).toBeTrue();

    changeListener?.({ matches: false } as MediaQueryListEvent);

    expect(isBelow()).toBeFalse();
  });

  it("should remove the listener on destroy", () => {
    spyOn(window, "matchMedia").and.returnValue(query);

    watchBelowBreakpoint(window, "lg", destroyRef);
    destroyCallback?.();

    expect(changeListener).toBeDefined();
    expect(query.removeEventListener).toHaveBeenCalledWith(
      "change",
      changeListener as EventListener,
    );
  });

  it("should return false without a view", () => {
    expect(watchBelowBreakpoint(null, "lg", destroyRef)()).toBeFalse();
  });
});
