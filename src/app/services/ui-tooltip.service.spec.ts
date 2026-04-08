import { TestBed } from "@angular/core/testing";
import { UiTooltipService } from "./ui-tooltip.service";

describe("UiTooltipService", () => {
  let service: UiTooltipService;

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
    const target = document.createElement("button");
    spyOn(target, "getBoundingClientRect").and.returnValue({
      left: 80,
      right: 100,
      top: 50,
      bottom: 70,
    } as DOMRect);

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
});
