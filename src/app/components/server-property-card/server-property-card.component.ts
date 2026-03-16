import {
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  output,
  viewChild,
  signal,
  effect,
  afterNextRender,
  inject,
  DestroyRef,
} from "@angular/core";
import { LucideAngularModule } from "lucide-angular";

export interface ServerPropertyTooltip {
  key: string;
  content: string;
}

export interface ServerPropertyRow {
  id: string;
  name: string;
  value: string;
  tooltips?: ServerPropertyTooltip[];
}

export interface ServerPropertySection {
  name: string;
  properties: ServerPropertyRow[];
}

@Component({
  selector: "app-server-property-card",
  imports: [LucideAngularModule],
  templateUrl: "./server-property-card.component.html",
  styleUrl: "./server-property-card.component.scss",
})
export class ServerPropertyCardComponent {
  title = input.required<string>();
  cardId = input.required<string>();
  sections = input<ServerPropertySection[]>([]);
  showSectionHeaders = input(true);
  sectionHeaderVariant = input<"default" | "availability">("default");
  moreLabel = input("View more details");
  lessLabel = input("Show less");
  isOpen = input(false);

  toggleRequested = output<void>();

  cardRoot = viewChild<ElementRef<HTMLDivElement>>("cardRoot");

  tooltipContent = signal("");
  canExpand = signal(false);
  private overflowCheckTimeout?: ReturnType<typeof setTimeout>;
  private destroyRef = inject(DestroyRef);

  hasExpandableContent = computed(() => this.canExpand());

  visibleSections = computed(() =>
    this.sections().filter((section) => section.properties.length > 0),
  );

  constructor() {
    effect(() => {
      this.sections();
      this.showSectionHeaders();
      this.sectionHeaderVariant();
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

  sectionHeading(sectionName: string): string {
    return this.sectionHeaderVariant() === "availability"
      ? sectionName.toUpperCase()
      : sectionName;
  }

  showTooltip(event: MouseEvent, content: string | undefined) {
    if (!content) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const tooltip = document.getElementById(`${this.cardId()}_tooltip`);
    if (!target || !tooltip) {
      return;
    }

    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    this.tooltipContent.set(content);
    tooltip.style.left = `${target.getBoundingClientRect().right + 5}px`;
    tooltip.style.top = `${target.getBoundingClientRect().top - 45 + scrollPosition}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
  }

  hideTooltip() {
    const tooltip = document.getElementById(`${this.cardId()}_tooltip`);
    if (!tooltip) {
      return;
    }

    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
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

    const hadOpenClass = cardElement.classList.contains("open");
    if (hadOpenClass) {
      cardElement.classList.remove("open");
    }

    this.canExpand.set(cardElement.scrollHeight > cardElement.clientHeight + 1);

    if (hadOpenClass) {
      cardElement.classList.add("open");
    }
  }
}
