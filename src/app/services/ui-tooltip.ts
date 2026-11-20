import { Injectable, NgZone, inject, signal } from "@angular/core";

export type TooltipPlacement = {
  left: "anchor-left" | "anchor-right" | "fixed-left";
  top: "anchor-above" | "anchor-below";
};

export type TooltipVariant = "default" | "warning" | "warning-wide";

@Injectable({
  providedIn: "root",
})
export class UiTooltip {
  private readonly ngZone = inject(NgZone);
  private readonly activeAnchor = signal<Element | null>(null);
  readonly shownAnchor = this.activeAnchor.asReadonly();
  private readonly viewportPadding = 16;
  private readonly tooltipOffset = 5;
  private readonly dismissListenerOptions: AddEventListenerOptions = {
    capture: true,
  };
  private readonly defaultPlacement: TooltipPlacement = {
    left: "anchor-right",
    top: "anchor-below",
  };
  private activeTooltipElement?: HTMLElement;
  private activeAnchorElement?: Element;
  private animationFrameId?: number;
  private readonly hideActiveTooltip = () => {
    if (!this.activeTooltipElement) {
      return;
    }

    this.hide(this.activeTooltipElement);
  };
  private readonly hideOnOutsidePointer = (event: PointerEvent) => {
    const target = event.target;
    if (
      target instanceof Node &&
      (this.activeAnchorElement?.contains(target) ||
        this.activeTooltipElement?.contains(target))
    ) {
      return;
    }

    this.hideActiveTooltip();
  };
  private readonly hideOnEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.hideActiveTooltip();
    }
  };

  show(
    tooltipElement: HTMLElement,
    anchor: Element | Event,
    placement: TooltipPlacement = this.defaultPlacement,
    variant: TooltipVariant = "default",
  ) {
    const anchorElement = this.resolveAnchorElement(anchor);
    if (!anchorElement) {
      return;
    }

    this.cancelPendingFrame();
    this.unregisterDismissListeners();
    this.activeTooltipElement = tooltipElement;
    this.activeAnchorElement = anchorElement;
    this.activeAnchor.set(anchorElement);
    this.registerDismissListeners();

    this.applyVariant(tooltipElement, variant);
    this.prepareTooltipForPositioning(tooltipElement);

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
    anchor: Element | Event;
    content: T | null | undefined | false | "";
    onShow: (content: T) => void;
    placement?: TooltipPlacement;
    variant?: TooltipVariant;
  }) {
    const { tooltipElement, anchor, content, onShow, placement, variant } =
      params;

    if (!content || !tooltipElement) {
      return false;
    }

    onShow(content);
    this.show(tooltipElement, anchor, placement, variant ?? "default");
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
      this.activeAnchor.set(null);
    }

    this.resetTooltipStyles(tooltipElement);
    this.applyVariant(tooltipElement, "default");
  }

  private applyVariant(
    tooltipElement: HTMLElement,
    variant: TooltipVariant,
  ): void {
    tooltipElement.classList.toggle(
      "tooltip-panel--warning",
      variant === "warning" || variant === "warning-wide",
    );
    tooltipElement.classList.toggle(
      "tooltip-panel--warning-wide",
      variant === "warning-wide",
    );
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

  private resolveAnchorElement(anchor: Element | Event): Element | null {
    if (anchor instanceof Element) {
      return anchor;
    }

    const event = anchor;
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

  private prepareTooltipForPositioning(tooltipElement: HTMLElement): void {
    tooltipElement.style.display = "block";
    tooltipElement.style.visibility = "hidden";
    tooltipElement.style.opacity = "0";
    tooltipElement.style.left = "0px";
    tooltipElement.style.top = "0px";
  }

  private resetTooltipStyles(tooltipElement: HTMLElement): void {
    tooltipElement.style.display = "none";
    tooltipElement.style.visibility = "hidden";
    tooltipElement.style.opacity = "0";
    tooltipElement.style.left = "0px";
    tooltipElement.style.top = "0px";
  }

  private registerDismissListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener(
        "scroll",
        this.hideActiveTooltip,
        this.dismissListenerOptions,
      );
      window.addEventListener(
        "scroll",
        this.hideActiveTooltip,
        this.dismissListenerOptions,
      );
      document.addEventListener(
        "pointerdown",
        this.hideOnOutsidePointer,
        this.dismissListenerOptions,
      );
      document.addEventListener("keydown", this.hideOnEscape);
    });
  }

  private unregisterDismissListeners(): void {
    document.removeEventListener(
      "scroll",
      this.hideActiveTooltip,
      this.dismissListenerOptions,
    );
    window.removeEventListener(
      "scroll",
      this.hideActiveTooltip,
      this.dismissListenerOptions,
    );
    document.removeEventListener(
      "pointerdown",
      this.hideOnOutsidePointer,
      this.dismissListenerOptions,
    );
    document.removeEventListener("keydown", this.hideOnEscape);
  }
}
