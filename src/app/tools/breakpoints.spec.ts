import { TestBed } from "@angular/core/testing";
import { watchBelowBreakpoint } from "./breakpoints";

describe("watchBelowBreakpoint", () => {
  let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
  let query: jasmine.SpyObj<MediaQueryList>;

  beforeEach(() => {
    changeListener = undefined;
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
  });

  it("should start false and read the viewport after the first render", () => {
    const matchMedia = spyOn(window, "matchMedia").and.returnValue(query);

    const isBelow = TestBed.runInInjectionContext(() =>
      watchBelowBreakpoint("lg"),
    );

    expect(isBelow()).toBeFalse();
    expect(matchMedia).not.toHaveBeenCalled();

    TestBed.tick();

    expect(matchMedia).toHaveBeenCalledWith("(width < 64rem)");
    expect(isBelow()).toBeTrue();

    changeListener?.({ matches: false } as MediaQueryListEvent);

    expect(isBelow()).toBeFalse();
  });

  it("should remove the listener on destroy", () => {
    spyOn(window, "matchMedia").and.returnValue(query);

    TestBed.runInInjectionContext(() => watchBelowBreakpoint("lg"));
    TestBed.tick();
    TestBed.resetTestingModule();

    expect(changeListener).toBeDefined();
    expect(query.removeEventListener).toHaveBeenCalledWith(
      "change",
      changeListener as EventListener,
    );
  });
});
