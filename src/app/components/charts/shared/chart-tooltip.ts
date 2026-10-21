import { Injectable, inject } from "@angular/core";
import {
  TooltipPlacement,
  TooltipVariant,
  UiTooltip,
} from "../../../services/ui-tooltip";

@Injectable({
  providedIn: "root",
})
export class ChartTooltip {
  private uiTooltip = inject(UiTooltip);

  show(
    tooltipElement: HTMLElement,
    event: Event,
    placement?: TooltipPlacement,
    variant?: TooltipVariant,
  ) {
    this.uiTooltip.show(tooltipElement, event, placement, variant);
  }

  showIfPresent<T>(params: {
    tooltipElement: HTMLElement | undefined;
    event: Event;
    content: T | null | undefined | false | "";
    onShow: (content: T) => void;
    placement?: TooltipPlacement;
    variant?: TooltipVariant;
  }) {
    return this.uiTooltip.showIfPresent(params);
  }

  hide(tooltipElement: HTMLElement | undefined) {
    this.uiTooltip.hide(tooltipElement);
  }
}
