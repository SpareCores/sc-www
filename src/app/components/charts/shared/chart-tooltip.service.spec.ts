import { TestBed } from "@angular/core/testing";
import { ChartTooltipService } from "./chart-tooltip.service";

describe("ChartTooltipService", () => {
  let service: ChartTooltipService;
  const originalInnerWidth = window.innerWidth;

  function setWindowInnerWidth(width: number): void {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: width,
      writable: true,
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartTooltipService);
  });

  afterEach(() => {
    setWindowInnerWidth(originalInnerWidth);
  });

  it("shows a tooltip anchored to the trigger", () => {
    const tooltip = document.createElement("div");
    const target = document.createElement("button");
    setWindowInnerWidth(1280);
    spyOn(target, "getBoundingClientRect").and.returnValue({
      left: 80,
      right: 100,
      top: 50,
      bottom: 70,
    } as DOMRect);

    service.show(tooltip, { target } as unknown as MouseEvent);

    expect(tooltip.style.left).toBe("105px");
    expect(tooltip.style.display).toBe("block");
    expect(tooltip.style.opacity).toBe("1");
  });

  it("shows a tooltip below and left of the trigger when requested", () => {
    const tooltip = document.createElement("div");
    const target = document.createElement("button");
    setWindowInnerWidth(1280);
    spyOn(target, "getBoundingClientRect").and.returnValue({
      left: 80,
      right: 100,
      top: 50,
      bottom: 70,
    } as DOMRect);

    service.show(tooltip, { target } as unknown as MouseEvent, {
      left: "anchor-left",
      top: "anchor-below",
    });

    expect(tooltip.style.left).toBe("55px");
    expect(tooltip.style.top).toBe("75px");
  });

  it("does not add page scroll offsets for fixed-position tooltips", () => {
    const tooltip = document.createElement("div");
    const target = document.createElement("button");
    tooltip.style.position = "fixed";
    setWindowInnerWidth(1280);
    spyOn(target, "getBoundingClientRect").and.returnValue({
      left: 80,
      right: 100,
      top: 50,
      bottom: 70,
    } as DOMRect);
    spyOn(window, "getComputedStyle").and.returnValue({
      position: "fixed",
    } as CSSStyleDeclaration);

    service.show(tooltip, { target } as unknown as MouseEvent, {
      left: "anchor-left",
      top: "anchor-below",
    });

    expect(tooltip.style.top).toBe("75px");
  });

  it("clamps anchored tooltips so they stay inside the viewport", () => {
    const tooltip = document.createElement("div");
    const target = document.createElement("button");
    setWindowInnerWidth(640);
    spyOnProperty(tooltip, "offsetWidth", "get").and.returnValue(500);
    spyOn(target, "getBoundingClientRect").and.returnValue({
      left: 420,
      right: 440,
      top: 50,
      bottom: 70,
    } as DOMRect);

    service.show(tooltip, { target } as unknown as MouseEvent, {
      left: "anchor-right",
      top: "anchor-below",
    });

    expect(tooltip.style.left).toBe("124px");
    expect(tooltip.style.top).toBe("75px");
  });

  it("shows a tooltip only when content and element are present", () => {
    const tooltip = document.createElement("div");
    const target = document.createElement("button");
    const onShow = jasmine.createSpy("onShow");
    spyOn(target, "getBoundingClientRect").and.returnValue({
      right: 100,
      top: 50,
      bottom: 70,
    } as DOMRect);

    const result = service.showIfPresent({
      tooltipElement: tooltip,
      event: { target } as unknown as MouseEvent,
      content: "tooltip text",
      onShow,
    });

    expect(result).toBeTrue();
    expect(onShow).toHaveBeenCalledOnceWith("tooltip text");
    expect(tooltip.style.display).toBe("block");
  });

  it("does not show a tooltip when content is missing", () => {
    const tooltip = document.createElement("div");
    const onShow = jasmine.createSpy("onShow");

    const result = service.showIfPresent({
      tooltipElement: tooltip,
      event: { target: tooltip } as unknown as MouseEvent,
      content: "",
      onShow,
    });

    expect(result).toBeFalse();
    expect(onShow).not.toHaveBeenCalled();
    expect(tooltip.style.display).toBe("");
  });

  it("hides a tooltip", () => {
    const tooltip = document.createElement("div");
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";

    service.hide(tooltip);

    expect(tooltip.style.display).toBe("none");
    expect(tooltip.style.opacity).toBe("0");
  });
});
