import { Injectable } from "@angular/core";

export type TooltipPlacement = {
  left: "anchor-left" | "anchor-right" | "fixed-left";
  top: "anchor-above" | "anchor-below";
};

@Injectable({
  providedIn: "root",
})
export class ChartTooltipService {
  private readonly viewportPadding = 16;
  private readonly tooltipOffset = 5;

  show(
    tooltipElement: HTMLElement,
    event: MouseEvent,
    placement: TooltipPlacement = {
      left: "anchor-right",
      top: "anchor-above",
    },
  ) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    const isFixedTooltip =
      window.getComputedStyle(tooltipElement).position === "fixed";
    const scrollPosition = isFixedTooltip
      ? 0
      : window.pageYOffset || document.documentElement.scrollTop;
    const targetRect = target.getBoundingClientRect();
    const baseLeft =
      placement.left === "fixed-left"
        ? 20
        : placement.left === "anchor-left"
          ? targetRect.left - 25
          : targetRect.right + 5;

    tooltipElement.style.display = "block";
    tooltipElement.style.opacity = "0";
    tooltipElement.style.left = `${this.clampLeftPosition(tooltipElement, baseLeft)}px`;

    const tooltipHeight = tooltipElement.offsetHeight;

    tooltipElement.style.top =
      placement.top === "anchor-below"
        ? `${targetRect.bottom + this.tooltipOffset + scrollPosition}px`
        : `${targetRect.top - tooltipHeight - this.tooltipOffset + scrollPosition}px`;

    tooltipElement.style.opacity = "1";
  }

  private clampLeftPosition(
    tooltipElement: HTMLElement,
    preferredLeft: number,
  ): number {
    const maxLeft = Math.max(
      this.viewportPadding,
      window.innerWidth - tooltipElement.offsetWidth - this.viewportPadding,
    );

    return Math.min(Math.max(preferredLeft, this.viewportPadding), maxLeft);
  }

  showIfPresent<T>(params: {
    tooltipElement: HTMLElement | undefined;
    event: MouseEvent;
    content: T | null | undefined | false | "";
    onShow: (content: T) => void;
    placement?: TooltipPlacement;
  }) {
    const { tooltipElement, event, content, onShow, placement } = params;

    if (!content || !tooltipElement) {
      return false;
    }

    onShow(content);
    this.show(tooltipElement, event, placement);
    return true;
  }

  hide(tooltipElement: HTMLElement | undefined) {
    if (!tooltipElement) {
      return;
    }

    tooltipElement.style.display = "none";
    tooltipElement.style.opacity = "0";
  }
}
