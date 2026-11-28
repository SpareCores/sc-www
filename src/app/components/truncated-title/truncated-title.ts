import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
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
  private readonly label = viewChild.required<ElementRef<HTMLElement>>("label");

  readonly text = input.required<string>();
  readonly isTruncated = signal(false);

  constructor() {
    afterRenderEffect((onCleanup) => {
      this.text();
      const label = this.label().nativeElement;
      const observer = new ResizeObserver(() =>
        this.isTruncated.set(this.isOverflowing(label)),
      );
      observer.observe(label);
      onCleanup(() => observer.disconnect());
    });

    inject(DestroyRef).onDestroy(() => this.hideTooltip());
  }

  showIfTruncated(el: Element): void {
    if (this.isOverflowing(el)) {
      this.uiTooltip.showText(el, this.text());
    }
  }

  hideTooltip(): void {
    this.uiTooltip.hideText(this.label().nativeElement);
  }

  private isOverflowing(el: Element): boolean {
    return el.scrollWidth > el.clientWidth;
  }
}
