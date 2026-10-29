import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { LucideTriangleAlert } from "@lucide/angular";
import { Button } from "../button/button";
import { ReduceUnitNamePipe } from "../../pipes/reduce-unit-name-pipe";
import {
  AvailabilityRegion,
  ServerSpecCards,
} from "../../services/server-spec-cards";
import { UiTooltip } from "../../services/ui-tooltip";

const COLLAPSED_REGION_LIMIT = 7;

@Component({
  selector: "sc-server-availability-card",
  imports: [Button, LucideTriangleAlert, ReduceUnitNamePipe],
  templateUrl: "./server-availability-card.html",
  styleUrl: "./server-availability-card.css",
})
export class ServerAvailabilityCard {
  private serverSpecCards = inject(ServerSpecCards);
  private uiTooltip = inject(UiTooltip);

  regions = input<AvailabilityRegion[]>([]);
  isOpen = input(false);
  expandable = input(true);

  toggleRequested = output<void>();

  warningTooltipRef = viewChild<ElementRef<HTMLElement>>("warningTooltip");
  warningTooltipContent = signal("");

  canExpand = computed(
    () => this.expandable() && this.regions().length > COLLAPSED_REGION_LIMIT,
  );

  getInactivePriceNote(observedAt: string | undefined): string {
    return this.serverSpecCards.getInactivePriceNote(observedAt);
  }

  showWarningTooltip(event: MouseEvent | FocusEvent, content: string) {
    this.uiTooltip.showIfPresent({
      tooltipElement: this.warningTooltipRef()?.nativeElement,
      event,
      content,
      variant: "warning",
      onShow: (tooltipContent) => {
        this.warningTooltipContent.set(tooltipContent);
      },
    });
  }

  hideWarningTooltip() {
    this.uiTooltip.hide(this.warningTooltipRef()?.nativeElement);
  }

  requestToggle() {
    this.toggleRequested.emit();
  }
}
