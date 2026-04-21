import { TestBed } from "@angular/core/testing";
import { UiTooltipService } from "./ui-tooltip.service";

describe("UiTooltipService", () => {
  let service: UiTooltipService;

  function createTooltipTarget(): HTMLButtonElement {
    const target = document.createElement("button");
    spyOn(target, "getBoundingClientRect").and.returnValue({
      left: 80,
      right: 100,
      top: 50,
      bottom: 70,
    } as DOMRect);
    return target;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiTooltipService);
    spyOn(window, "requestAnimationFrame").and.callFake(
      (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    );
    spyOn(window, "cancelAnimationFrame");
  });

  it("shows a tooltip using viewport-aware placement", () => {
    const tooltip = document.createElement("div");
    const target = createTooltipTarget();

    service.show(tooltip, {
      currentTarget: target,
      target,
    } as unknown as MouseEvent);

    expect(tooltip.style.left).toBe("105px");
    expect(tooltip.style.top).toBe("75px");
    expect(tooltip.style.display).toBe("block");
    expect(tooltip.style.opacity).toBe("1");
  });

  it("hides a tooltip and resets inline positioning styles", () => {
    const tooltip = document.createElement("div");
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
    tooltip.style.left = "12px";
    tooltip.style.top = "18px";

    service.hide(tooltip);

    expect(tooltip.style.display).toBe("none");
    expect(tooltip.style.visibility).toBe("hidden");
    expect(tooltip.style.opacity).toBe("0");
    expect(tooltip.style.left).toBe("0px");
    expect(tooltip.style.top).toBe("0px");
  });

  it("does not cancel a pending frame when hiding a different tooltip", () => {
    const activeTooltip = document.createElement("div");
    const otherTooltip = document.createElement("div");
    const target = createTooltipTarget();

    (window.requestAnimationFrame as jasmine.Spy).and.returnValue(7);
    (window.cancelAnimationFrame as jasmine.Spy).calls.reset();

    service.show(activeTooltip, {
      currentTarget: target,
      target,
    } as unknown as MouseEvent);

    service.hide(otherTooltip);

    expect(window.cancelAnimationFrame).not.toHaveBeenCalled();
  });

  it("hides the active tooltip when the window scrolls", () => {
    const tooltip = document.createElement("div");
    const target = createTooltipTarget();

    service.show(tooltip, {
      currentTarget: target,
      target,
    } as unknown as MouseEvent);

    window.dispatchEvent(new Event("scroll"));

    expect(tooltip.style.display).toBe("none");
    expect(tooltip.style.opacity).toBe("0");
  });

  it("hides the active tooltip when a scrollable ancestor scrolls", () => {
    const tooltip = document.createElement("div");
    const scrollContainer = document.createElement("div");
    const target = createTooltipTarget();

    scrollContainer.appendChild(target);
    document.body.appendChild(scrollContainer);

    service.show(tooltip, {
      currentTarget: target,
      target,
    } as unknown as MouseEvent);

    scrollContainer.dispatchEvent(new Event("scroll"));

    expect(tooltip.style.display).toBe("none");

    scrollContainer.remove();
  });

  it("removes the scroll listener when the tooltip is hidden", () => {
    const tooltip = document.createElement("div");
    const target = createTooltipTarget();

    service.show(tooltip, {
      currentTarget: target,
      target,
    } as unknown as MouseEvent);

    service.hide(tooltip);
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";

    window.dispatchEvent(new Event("scroll"));

    expect(tooltip.style.display).toBe("block");
    expect(tooltip.style.opacity).toBe("1");
  });

  it("cleans up scroll dismissal after replacing and hiding the active tooltip", () => {
    const firstTooltip = document.createElement("div");
    const secondTooltip = document.createElement("div");
    const firstTarget = createTooltipTarget();
    const secondTarget = createTooltipTarget();

    service.show(firstTooltip, {
      currentTarget: firstTarget,
      target: firstTarget,
    } as unknown as MouseEvent);

    service.show(secondTooltip, {
      currentTarget: secondTarget,
      target: secondTarget,
    } as unknown as MouseEvent);

    service.hide(secondTooltip);
    secondTooltip.style.display = "block";
    secondTooltip.style.opacity = "1";

    window.dispatchEvent(new Event("scroll"));

    expect(secondTooltip.style.display).toBe("block");
    expect(secondTooltip.style.opacity).toBe("1");
  });
});
