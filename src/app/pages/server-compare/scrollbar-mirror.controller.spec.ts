import { ElementRef, signal } from "@angular/core";

import {
  INITIAL_SCROLLBAR_MIRROR_STATE,
  ScrollbarMirrorController,
} from "./scrollbar-mirror.controller";

describe("ScrollbarMirrorController", () => {
  let tableHolder: HTMLElement;
  let mainTable: HTMLElement;
  let firstColumn: HTMLElement;
  let topMirror: HTMLElement;
  let bottomMirror: HTMLElement;
  let appendedElements: HTMLElement[];
  let mirrorState = signal({ ...INITIAL_SCROLLBAR_MIRROR_STATE });

  function setRect(
    element: HTMLElement,
    rect: Partial<DOMRect> & Pick<DOMRect, "width">,
  ): void {
    spyOn(element, "getBoundingClientRect").and.returnValue({
      x: rect.left ?? 0,
      y: rect.top ?? 0,
      left: rect.left ?? 0,
      top: rect.top ?? 0,
      right: (rect.left ?? 0) + rect.width,
      bottom: (rect.top ?? 0) + (rect.height ?? 0),
      width: rect.width,
      height: rect.height ?? 0,
      toJSON: () => ({}),
    } as DOMRect);
  }

  function setDimension(
    element: HTMLElement,
    property: "clientWidth" | "scrollWidth" | "scrollLeft",
    value: number,
  ): void {
    Object.defineProperty(element, property, {
      configurable: true,
      value,
      writable: property === "scrollLeft",
    });
  }

  function runNextAnimationFrame(frameCallbacks: FrameRequestCallback[]): void {
    const callback = frameCallbacks.shift();
    expect(callback).toBeDefined();
    callback?.(0);
  }

  beforeEach(() => {
    appendedElements = [];
    mirrorState = signal({ ...INITIAL_SCROLLBAR_MIRROR_STATE });
    tableHolder = document.createElement("div");
    mainTable = document.createElement("table");
    firstColumn = document.createElement("th");
    topMirror = document.createElement("div");
    bottomMirror = document.createElement("div");

    mainTable.id = "main-table";
    firstColumn.id = "server-compare-table-first-col";
    mainTable.innerHTML = "<thead></thead>";

    appendedElements.push(tableHolder, mainTable, firstColumn);
    appendedElements.forEach((element) => {
      document.body.appendChild(element);
    });

    setRect(tableHolder, { left: 25, top: 100, width: 501.8, height: 40 });
    setRect(firstColumn, { left: 25, top: 100, width: 101.4, height: 40 });
    setRect(mainTable.querySelector("thead") as HTMLElement, {
      left: 25,
      top: 100,
      width: 900,
      height: 36,
    });

    Object.defineProperty(mainTable, "scrollWidth", {
      configurable: true,
      value: 1200,
    });

    setDimension(tableHolder, "scrollWidth", 1200);
    setDimension(tableHolder, "clientWidth", 600);
    setDimension(tableHolder, "scrollLeft", 0);
    setDimension(topMirror, "scrollWidth", 1000);
    setDimension(topMirror, "clientWidth", 400);
    setDimension(topMirror, "scrollLeft", 0);
    setDimension(bottomMirror, "scrollWidth", 900);
    setDimension(bottomMirror, "clientWidth", 300);
    setDimension(bottomMirror, "scrollLeft", 0);
  });

  afterEach(() => {
    appendedElements.forEach((element) => {
      element.remove();
    });
  });

  it("uses floored mirror width and exact inner width offset from the fixed column", () => {
    const controller = new ScrollbarMirrorController(
      () => new ElementRef(tableHolder),
      signal(new ElementRef(topMirror)),
      signal(new ElementRef(bottomMirror)),
      mirrorState,
    );

    controller.update(false);

    expect(mirrorState().topPosition).toEqual(
      jasmine.objectContaining({
        left: 126.4,
        width: 400,
        top: 136,
      }),
    );
    expect(mirrorState().bottomPosition).toBeNull();
    expect(mirrorState().innerWidth).toBeCloseTo(1098.6, 3);

    controller.destroy();
  });

  it("keeps the sticky mirror positions aligned with the computed width", () => {
    const fixedThead = document.createElement("div");
    fixedThead.className = "fixed_thead";
    document.body.appendChild(fixedThead);
    appendedElements.push(fixedThead);
    setRect(fixedThead, { left: 25, top: 68, width: 900, height: 44 });

    const controller = new ScrollbarMirrorController(
      () => new ElementRef(tableHolder),
      signal(new ElementRef(topMirror)),
      signal(new ElementRef(bottomMirror)),
      mirrorState,
    );

    controller.update(true);

    expect(mirrorState().topPosition).toEqual({
      left: 126.4,
      width: 400,
      top: 112,
    });
    expect(mirrorState().bottomPosition).toEqual({
      left: 126.4,
      width: 400,
      bottom: 0,
    });

    controller.destroy();
  });

  it("hides mirror state when the scrollable table region fits without visible overflow", () => {
    Object.defineProperty(mainTable, "scrollWidth", {
      configurable: true,
      value: 501.4,
    });

    const fixedThead = document.createElement("div");
    fixedThead.className = "fixed_thead";
    document.body.appendChild(fixedThead);
    appendedElements.push(fixedThead);
    setRect(fixedThead, { left: 25, top: 68, width: 900, height: 44 });

    const controller = new ScrollbarMirrorController(
      () => new ElementRef(tableHolder),
      signal(new ElementRef(topMirror)),
      signal(new ElementRef(bottomMirror)),
      mirrorState,
    );

    controller.update(true);

    expect(mirrorState()).toEqual(INITIAL_SCROLLBAR_MIRROR_STATE);

    controller.destroy();
  });

  it("keeps the sync guard active until the queued frame after syncing from the table", () => {
    const frameCallbacks: FrameRequestCallback[] = [];
    spyOn(window, "requestAnimationFrame").and.callFake(
      (callback: FrameRequestCallback): number => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      },
    );

    const controller = new ScrollbarMirrorController(
      () => new ElementRef(tableHolder),
      signal(new ElementRef(topMirror)),
      signal(new ElementRef(bottomMirror)),
      mirrorState,
    );

    tableHolder.scrollLeft = 200;
    controller.syncFromTable();

    expect(topMirror.scrollLeft).toBe(200);
    expect(bottomMirror.scrollLeft).toBe(200);

    tableHolder.scrollLeft = 450;
    controller.syncFromTable();

    expect(topMirror.scrollLeft).toBe(200);
    expect(bottomMirror.scrollLeft).toBe(200);

    runNextAnimationFrame(frameCallbacks);

    controller.syncFromTable();

    expect(topMirror.scrollLeft).toBe(450);
    expect(bottomMirror.scrollLeft).toBe(450);

    controller.destroy();
  });

  it("keeps the sync guard active until the queued frame after syncing from a mirror", () => {
    const frameCallbacks: FrameRequestCallback[] = [];
    spyOn(window, "requestAnimationFrame").and.callFake(
      (callback: FrameRequestCallback): number => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      },
    );

    const controller = new ScrollbarMirrorController(
      () => new ElementRef(tableHolder),
      signal(new ElementRef(topMirror)),
      signal(new ElementRef(bottomMirror)),
      mirrorState,
    );

    topMirror.scrollLeft = 240;
    controller.syncFromMirror(topMirror);

    expect(tableHolder.scrollLeft).toBe(240);
    expect(bottomMirror.scrollLeft).toBe(240);

    topMirror.scrollLeft = 60;
    controller.syncFromMirror(topMirror);

    expect(tableHolder.scrollLeft).toBe(240);
    expect(bottomMirror.scrollLeft).toBe(240);

    runNextAnimationFrame(frameCallbacks);

    controller.syncFromMirror(topMirror);

    expect(tableHolder.scrollLeft).toBe(60);
    expect(bottomMirror.scrollLeft).toBe(60);

    controller.destroy();
  });
});
