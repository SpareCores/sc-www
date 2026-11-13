import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
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
import { HeaderAnchor } from "../header-anchor/header-anchor";
import { UiTooltip } from "../../services/ui-tooltip";
import { DetailsCardSection } from "./details-card.types";
import { TooltipTrigger } from "../../directives/tooltip-trigger";

@Component({
  selector: "sc-details-card",
  imports: [
    TooltipTrigger,
    LucideDynamicIcon,
    LucideInfo,
    LucideTriangleAlert,
    Button,
    RouterLink,
    HeaderAnchor,
  ],
  templateUrl: "./details-card.html",
  styleUrl: "./details-card.css",
})
export class DetailsCard {
  private uiTooltip = inject(UiTooltip);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);

  cardTitle = input.required<string>();
  cardId = input.required<string>();
  anchorId = input<string | null>(null);
  sections = input<DetailsCardSection[]>([]);
  fixedRows = input(true);
  halfFromXl = input(false);
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
      this.observeCardResize();
    });

    this.destroyRef.onDestroy(() => {
      if (this.overflowCheckTimeout) {
        clearTimeout(this.overflowCheckTimeout);
      }
    });
  }

  captureEvent(action: "more" | "less"): string | null {
    const prefix = this.captureEventPrefix();
    return prefix ? `${prefix} show ${action} ${this.cardId()}` : null;
  }

  showTooltip(event: Element | Event, content: string | undefined) {
    this.uiTooltip.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      anchor: event,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent.set(tooltipContent);
      },
    });
  }

  hideTooltip() {
    this.uiTooltip.hide(this.tooltip()?.nativeElement);
  }

  showWarningTooltip(event: Element | Event, content: string) {
    this.uiTooltip.showIfPresent({
      tooltipElement: this.warningTooltip()?.nativeElement,
      anchor: event,
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

  private observeCardResize() {
    const cardElement = this.cardRoot()?.nativeElement;
    if (!cardElement || typeof ResizeObserver === "undefined") {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const observer = new ResizeObserver(() => this.updateOverflowState());
      observer.observe(cardElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
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

    const canExpand = cardElement.scrollHeight > cardElement.clientHeight + 1;

    if (hadOpenClass) {
      cardElement.classList.add("sc-chart-block--open");
    }

    if (canExpand !== this.canExpand()) {
      this.ngZone.run(() => this.canExpand.set(canExpand));
    }
  }
}
