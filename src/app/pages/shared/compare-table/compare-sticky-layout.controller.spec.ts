import { signal } from "@angular/core";
import { CompareStickyLayoutController } from "./compare-sticky-layout.controller";
import { INITIAL_SCROLLBAR_MIRROR_STATE } from "./scrollbar-mirror.controller";

describe("CompareStickyLayoutController", () => {
  let table: HTMLElement;
  let isTableOutsideViewport = signal(false);
  let scrollbarMirror = signal({ ...INITIAL_SCROLLBAR_MIRROR_STATE });
  let stickyFixedDivStyle = signal("");
  let stickyMainTableStyle = signal("");
  let stickyFirstColStyle = signal<{ width?: string }>({});
  let stickyColumnStyles = signal<string[]>([]);

  function createController() {
    return new CompareStickyLayoutController({
      document,
      isBrowser: () => true,
      tableHolder: () => undefined,
      bottomMirror: signal(undefined),
      scrollbarMirror,
      isTableOutsideViewport,
      stickyStyles: {
        fixedDivStyle: stickyFixedDivStyle,
        mainTableStyle: stickyMainTableStyle,
        firstColStyle: stickyFirstColStyle,
        columnStyles: stickyColumnStyles,
      },
      ids: {
        tableId: "main-table",
        tableHolderId: "table_holder",
        firstColId: "server-compare-table-first-col",
      },
      itemCount: () => 2,
    });
  }

  beforeEach(() => {
    isTableOutsideViewport = signal(false);
    scrollbarMirror = signal({ ...INITIAL_SCROLLBAR_MIRROR_STATE });
    stickyFixedDivStyle = signal("");
    stickyMainTableStyle = signal("");
    stickyFirstColStyle = signal({});
    stickyColumnStyles = signal([]);

    table = document.createElement("table");
    table.id = "main-table";
    document.body.appendChild(table);
    spyOn(table, "getBoundingClientRect").and.returnValue({
      x: 0,
      y: 120,
      left: 0,
      top: 120,
      right: 800,
      bottom: 160,
      width: 800,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);
  });

  afterEach(() => {
    table.remove();
  });

  it("coalesces layout updates into one animation frame and cleans up listeners", () => {
    const frameCallbacks: FrameRequestCallback[] = [];
    const requestAnimationFrame = spyOn(
      window,
      "requestAnimationFrame",
    ).and.callFake((callback: FrameRequestCallback): number => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
    const removeEventListener = spyOn(
      window,
      "removeEventListener",
    ).and.callThrough();

    const controller = createController();
    controller.init();

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    frameCallbacks.shift()?.(0);
    requestAnimationFrame.calls.reset();

    (table.getBoundingClientRect as jasmine.Spy).and.returnValue({
      x: 0,
      y: 60,
      left: 0,
      top: 60,
      right: 800,
      bottom: 100,
      width: 800,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);

    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("orientationchange"));

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(isTableOutsideViewport()).toBeFalse();

    frameCallbacks.shift()?.(0);

    expect(isTableOutsideViewport()).toBeTrue();

    controller.destroy();

    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      jasmine.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "resize",
      jasmine.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "orientationchange",
      jasmine.any(Function),
    );
  });

  it("keeps sticky state false while the table is not mounted", () => {
    const frameCallbacks: FrameRequestCallback[] = [];
    spyOn(window, "requestAnimationFrame").and.callFake(
      (callback: FrameRequestCallback): number => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      },
    );
    table.remove();

    const controller = createController();
    controller.init();
    frameCallbacks.shift()?.(0);

    expect(isTableOutsideViewport()).toBeFalse();
    expect(stickyFixedDivStyle()).toBe("");

    controller.destroy();
  });

  it("clears pending deferred update and animation frame on destroy", () => {
    const clearTimeoutSpy = spyOn(window, "clearTimeout").and.callThrough();
    const cancelAnimationFrame = spyOn(
      window,
      "cancelAnimationFrame",
    ).and.callThrough();
    spyOn(window, "requestAnimationFrame").and.returnValue(42);
    spyOn(window, "setTimeout").and.returnValue(
      99 as unknown as ReturnType<typeof setTimeout>,
    );

    const controller = createController();
    controller.init();
    controller.scheduleDeferredUpdate();
    controller.destroy();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(99);
  });
});
