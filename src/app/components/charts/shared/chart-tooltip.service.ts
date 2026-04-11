import { Injectable, inject } from "@angular/core";
import {
  TooltipPlacement,
  UiTooltipService,
} from "../../../services/ui-tooltip.service";

@Injectable({
  providedIn: "root",
})
export class ChartTooltipService {
  private uiTooltip = inject(UiTooltipService);

  show(
    tooltipElement: HTMLElement,
    event: MouseEvent,
    placement?: TooltipPlacement,
  ) {
    this.uiTooltip.show(tooltipElement, event, placement);
  }

  showIfPresent<T>(params: {
    tooltipElement: HTMLElement | undefined;
    event: MouseEvent;
    content: T | null | undefined | false | "";
    onShow: (content: T) => void;
    placement?: TooltipPlacement;
  }) {
    return this.uiTooltip.showIfPresent(params);
  }

  hide(tooltipElement: HTMLElement | undefined) {
    this.uiTooltip.hide(tooltipElement);
  }
}
