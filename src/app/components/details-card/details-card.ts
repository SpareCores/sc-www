import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  LucideDynamicIcon,
  LucideInfo,
  LucideTriangleAlert,
} from "@lucide/angular";
import { Button } from "../button/button";
import { UiTooltip } from "../../services/ui-tooltip";
import { DetailsCardSection } from "./details-card.types";

@Component({
  selector: "sc-details-card",
  imports: [
    LucideDynamicIcon,
    LucideInfo,
    LucideTriangleAlert,
    Button,
    RouterLink,
  ],
  templateUrl: "./details-card.html",
  styleUrl: "./details-card.css",
})
export class DetailsCard {
  private uiTooltip = inject(UiTooltip);
  private destroyRef = inject(DestroyRef);

  cardTitle = input.required<string>();
  cardId = input.required<string>();
  sections = input<DetailsCardSection[]>([]);
  fixedRows = input(true);
  fullWidthBelowWide = input(false);
  rowClass = input("");
  moreLabel = input("View more details");
  lessLabel = input("Show less");
  captureEventPrefix = input<string | null>(null);
  isOpen = input(false);
  expandable = input(true);
  linkTarget = input<string>();

  toggleRequested = output<void>();

  cardRoot = viewChild<ElementRef<HTMLDivElement>>("cardRoot");
  tooltip = viewChild<ElementRef<HTMLElement>>("tooltip");
  warningTooltip = viewChild<ElementRef<HTMLElement>>("warningTooltip");

  tooltipContent = signal("");
  warningTooltipContent = signal("");
  canExpand = signal(false);
  private overflowCheckTimeout?: ReturnType<typeof setTimeout>;

  hasExpandableContent = computed(() => this.expandable() && this.canExpand());

  visibleSections = computed(() =>
    this.sections().filter(
      (section) => section.rows.length > 0 || !!section.columns,
    ),
  );

  constructor() {
    effect(() => {
      this.sections();
      this.isOpen();
      this.scheduleOverflowCheck();
    });

    afterNextRender(() => {
      this.scheduleOverflowCheck();
    });

    this.destroyRef.onDestroy(() => {
      if (this.overflowCheckTimeout) {
        clearTimeout(this.overflowCheckTimeout);
      }
    });
  }

  @HostListener("window:resize")
  onResize() {
    this.scheduleOverflowCheck();
  }

  captureEvent(action: "more" | "less"): string | null {
    const prefix = this.captureEventPrefix();
    return prefix ? `${prefix} show ${action} ${this.cardId()}` : null;
  }

  showTooltip(event: Event, content: string | undefined) {
    this.uiTooltip.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent.set(tooltipContent);
      },
    });
  }

  hideTooltip() {
    this.uiTooltip.hide(this.tooltip()?.nativeElement);
  }

  showWarningTooltip(event: Event, content: string) {
    this.uiTooltip.showIfPresent({
      tooltipElement: this.warningTooltip()?.nativeElement,
      event,
      content,
      variant: "warning",
      onShow: (tooltipContent) => {
        this.warningTooltipContent.set(tooltipContent);
      },
    });
  }

  hideWarningTooltip() {
    this.uiTooltip.hide(this.warningTooltip()?.nativeElement);
  }

  requestToggle() {
    this.toggleRequested.emit();
  }

  private scheduleOverflowCheck() {
    if (this.overflowCheckTimeout) {
      clearTimeout(this.overflowCheckTimeout);
    }

    this.overflowCheckTimeout = setTimeout(() => {
      this.updateOverflowState();
    }, 0);
  }

  private updateOverflowState() {
    const cardElement = this.cardRoot()?.nativeElement;
    if (!cardElement) {
      return;
    }

    const hadOpenClass = cardElement.classList.contains("sc-chart-block--open");
    if (hadOpenClass) {
      cardElement.classList.remove("sc-chart-block--open");
    }

    this.canExpand.set(cardElement.scrollHeight > cardElement.clientHeight + 1);

    if (hadOpenClass) {
      cardElement.classList.add("sc-chart-block--open");
    }
  }
}
