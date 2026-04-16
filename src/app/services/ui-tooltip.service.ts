import { Injectable } from "@angular/core";

export type TooltipPlacement = {
  left: "anchor-left" | "anchor-right" | "fixed-left";
  top: "anchor-above" | "anchor-below";
};

@Injectable({
  providedIn: "root",
})
export class UiTooltipService {
  private readonly viewportPadding = 16;
  private readonly tooltipOffset = 5;
  private readonly defaultPlacement: TooltipPlacement = {
    left: "anchor-right",
    top: "anchor-below",
  };
  private activeTooltipElement?: HTMLElement;
  private activeAnchorElement?: Element;
  private animationFrameId?: number;
  private dismissScrollListeners?: () => void;
  private readonly hideActiveTooltip = () => {
    if (!this.activeTooltipElement) {
      return;
    }

    this.hide(this.activeTooltipElement);
  };

  show(
    tooltipElement: HTMLElement,
    event: Event,
    placement: TooltipPlacement = this.defaultPlacement,
  ) {
    const anchorElement = this.resolveAnchorElement(event);
    if (!anchorElement) {
      return;
    }

    this.cancelPendingFrame();
    this.unregisterDismissListeners();
    this.activeTooltipElement = tooltipElement;
    this.activeAnchorElement = anchorElement;
    this.registerDismissListeners();

    tooltipElement.style.display = "block";
    tooltipElement.style.visibility = "hidden";
    tooltipElement.style.opacity = "0";
    tooltipElement.style.left = "0px";
    tooltipElement.style.top = "0px";

    this.animationFrameId = window.requestAnimationFrame(() => {
      this.animationFrameId = undefined;

      if (
        this.activeTooltipElement !== tooltipElement ||
        this.activeAnchorElement !== anchorElement
      ) {
        return;
      }

      this.positionTooltip(tooltipElement, anchorElement, placement);
      tooltipElement.style.visibility = "visible";
      tooltipElement.style.opacity = "1";
    });
  }

  showIfPresent<T>(params: {
    tooltipElement: HTMLElement | undefined;
    event: Event;
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

    if (this.activeTooltipElement === tooltipElement) {
      this.cancelPendingFrame();
      this.unregisterDismissListeners();
      this.activeTooltipElement = undefined;
      this.activeAnchorElement = undefined;
    }

    tooltipElement.style.display = "none";
    tooltipElement.style.visibility = "hidden";
    tooltipElement.style.opacity = "0";
    tooltipElement.style.left = "0px";
    tooltipElement.style.top = "0px";
  }

  private positionTooltip(
    tooltipElement: HTMLElement,
    anchorElement: Element,
    placement: TooltipPlacement,
  ): void {
    const isFixedTooltip =
      window.getComputedStyle(tooltipElement).position === "fixed";
    const scrollLeft = isFixedTooltip
      ? 0
      : window.pageXOffset || document.documentElement.scrollLeft || 0;
    const scrollTop = isFixedTooltip
      ? 0
      : window.pageYOffset || document.documentElement.scrollTop || 0;
    const targetRect = anchorElement.getBoundingClientRect();
    const tooltipWidth = tooltipElement.offsetWidth;
    const tooltipHeight = tooltipElement.offsetHeight;

    const anchorLeft = targetRect.left + scrollLeft;
    const anchorRight = targetRect.right + scrollLeft;
    const anchorTop = targetRect.top + scrollTop;
    const anchorBottom = targetRect.bottom + scrollTop;
    const minLeft = this.viewportPadding + scrollLeft;
    const maxLeft = Math.max(
      minLeft,
      scrollLeft + window.innerWidth - tooltipWidth - this.viewportPadding,
    );
    const minTop = this.viewportPadding + scrollTop;
    const maxTop = Math.max(
      minTop,
      scrollTop + window.innerHeight - tooltipHeight - this.viewportPadding,
    );

    const rightPreferred = anchorRight + this.tooltipOffset;
    const leftPreferred = anchorLeft - tooltipWidth - this.tooltipOffset;
    const belowPreferred = anchorBottom + this.tooltipOffset;
    const abovePreferred = anchorTop - tooltipHeight - this.tooltipOffset;

    const preferredLeft =
      placement.left === "fixed-left"
        ? 20 + scrollLeft
        : placement.left === "anchor-left"
          ? leftPreferred
          : rightPreferred;
    const fallbackLeft =
      placement.left === "anchor-left" ? rightPreferred : leftPreferred;
    const resolvedLeft = this.resolveCoordinate({
      preferred: preferredLeft,
      fallback: fallbackLeft,
      min: minLeft,
      max: maxLeft,
    });

    const preferredTop =
      placement.top === "anchor-below" ? belowPreferred : abovePreferred;
    const fallbackTop =
      placement.top === "anchor-below" ? abovePreferred : belowPreferred;
    const resolvedTop = this.resolveCoordinate({
      preferred: preferredTop,
      fallback: fallbackTop,
      min: minTop,
      max: maxTop,
    });

    tooltipElement.style.left = `${resolvedLeft}px`;
    tooltipElement.style.top = `${resolvedTop}px`;
  }

  private resolveCoordinate(params: {
    preferred: number;
    fallback: number;
    min: number;
    max: number;
  }): number {
    const { preferred, fallback, min, max } = params;
    if (preferred >= min && preferred <= max) {
      return preferred;
    }

    if (fallback >= min && fallback <= max) {
      return fallback;
    }

    return Math.min(Math.max(preferred, min), max);
  }

  private resolveAnchorElement(event: Event): Element | null {
    const currentTarget = event.currentTarget;
    if (currentTarget instanceof Element) {
      return currentTarget;
    }

    const target = event.target;
    return target instanceof Element ? target : null;
  }

  private cancelPendingFrame(): void {
    if (this.animationFrameId !== undefined) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  private registerDismissListeners(): void {
    const options: AddEventListenerOptions = { capture: true };
    document.addEventListener("scroll", this.hideActiveTooltip, options);
    window.addEventListener("scroll", this.hideActiveTooltip, options);
    this.dismissScrollListeners = () => {
      document.removeEventListener("scroll", this.hideActiveTooltip, options);
      window.removeEventListener("scroll", this.hideActiveTooltip, options);
      this.dismissScrollListeners = undefined;
    };
  }

  private unregisterDismissListeners(): void {
    this.dismissScrollListeners?.();
    this.dismissScrollListeners = undefined;
  }
}
