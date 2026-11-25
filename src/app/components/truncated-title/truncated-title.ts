import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { TooltipTrigger } from "../../directives/tooltip-trigger";
import { UiTooltip } from "../../services/ui-tooltip";

@Component({
  selector: "sc-truncated-title",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipTrigger],
  templateUrl: "./truncated-title.html",
  host: { class: "min-w-0" },
})
export class TruncatedTitle {
  private readonly uiTooltip = inject(UiTooltip);
  private readonly tooltip =
    viewChild.required<ElementRef<HTMLElement>>("tooltip");

  readonly text = input.required<string>();
  readonly tooltipText = signal("");

  showIfTruncated(el: Element): void {
    if (el.scrollWidth > el.clientWidth) {
      this.tooltipText.set(this.text());
      this.uiTooltip.show(this.tooltip().nativeElement, el);
    }
  }

  hideTooltip(): void {
    this.uiTooltip.hide(this.tooltip().nativeElement);
    this.tooltipText.set("");
  }
}
