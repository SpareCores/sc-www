import { Injectable, inject } from "@angular/core";
import {
  TooltipPlacement,
  TooltipVariant,
  UiTooltipService,
} from "../../../services/ui-tooltip.service";

@Injectable({
  providedIn: "root",
})
export class ChartTooltipService {
  private uiTooltip = inject(UiTooltipService);

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
