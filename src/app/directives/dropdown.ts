import {
  FlexibleConnectedPositionStrategy,
  OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from "@angular/cdk/overlay";
import { DomPortalOutlet, TemplatePortal } from "@angular/cdk/portal";
import { DOCUMENT } from "@angular/common";
import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { DROPDOWN_LAYER } from "../services/overlay/dropdown-layer";
import {
  DropdownPlacement,
  placePanel,
  toConnectedPositions,
} from "./dropdown-positions";
import {
  focusFirst,
  focusTarget,
  focusableItems,
  isKeyboardActivation,
} from "./dropdown-focus";

@Directive({
  selector: "[scDropdown]",
  exportAs: "scDropdown",
  host: {
    "(click)": "onHostClick($event)",
  },
})
export class Dropdown {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(Renderer2);
  private viewContainerRef = inject(ViewContainerRef);
  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  private layer = inject(DROPDOWN_LAYER);

  scDropdown = input.required<TemplateRef<unknown>>();
  dropdownEnabled = input(true);
  dropdownFlip = input(false);
  dropdownPlacement = input<DropdownPlacement>("bottom-end");
  dropdownTriggerType = input<"click" | "none">("click");

  dropdownOpened = output<void>();

  readonly isOpen = signal(false);

  private overlayRef: OverlayRef | undefined;
  private positionStrategy: FlexibleConnectedPositionStrategy | undefined;
  private pagePanel: HTMLElement | undefined;
  private pageOutlet: DomPortalOutlet | undefined;
  private pageListeners: (() => void)[] = [];

  constructor() {
    effect(() => {
      if (!this.dropdownEnabled()) {
        untracked(() => this.hide());
      }
    });

    afterNextRender(() => this.syncAria());

    inject(DestroyRef).onDestroy(() => {
      this.closePagePanel();
      this.overlayRef?.dispose();
    });
  }

  open(focusPanel = false) {
    if (this.isOpen() || !this.dropdownEnabled()) {
      return;
    }

    const panel =
      this.layer === "page" ? this.openPagePanel() : this.openOverlay();
    this.isOpen.set(true);
    this.syncAria();
    this.dropdownOpened.emit();

    if (focusPanel) {
      afterNextRender(() => focusFirst(panel), { injector: this.injector });
    }
  }

  hide() {
    if (!this.isOpen()) {
      return;
    }

    this.closePagePanel();
    this.overlayRef?.detach();
    this.isOpen.set(false);
    this.syncAria();
  }

  toggle(focusPanel = false) {
    if (this.isOpen()) {
      this.hide();
    } else {
      this.open(focusPanel);
    }
  }

  protected onHostClick(event: MouseEvent) {
    if (this.dropdownTriggerType() !== "click" || !this.dropdownEnabled()) {
      return;
    }

    this.toggle(isKeyboardActivation(event));
  }

  private openPagePanel(): HTMLElement {
    const panel: HTMLElement = this.renderer.createElement("div");
    this.renderer.addClass(panel, "sc-dropdown-panel");
    this.renderer.appendChild(this.document.body, panel);

    const outlet = new DomPortalOutlet(panel);
    outlet
      .attachTemplatePortal(
        new TemplatePortal(this.scDropdown(), this.viewContainerRef),
      )
      .detectChanges();

    this.pagePanel = panel;
    this.pageOutlet = outlet;
    this.positionPagePanel();
    afterNextRender(() => this.positionPagePanel(), {
      injector: this.injector,
    });

    this.pageListeners = [
      this.renderer.listen("document", "click", (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (
          !this.host.nativeElement.contains(target) &&
          !panel.contains(target)
        ) {
          this.hide();
        }
      }),
      this.renderer.listen("document", "keydown", (event: KeyboardEvent) =>
        this.onKeydown(event, panel),
      ),
      this.renderer.listen("window", "resize", () => this.positionPagePanel()),
    ];

    return panel;
  }

  private positionPagePanel() {
    const panel = this.pagePanel;
    const view = this.document.defaultView;
    if (!panel || !view) {
      return;
    }

    const { top, left } = placePanel(
      this.host.nativeElement.getBoundingClientRect(),
      panel.getBoundingClientRect(),
      {
        width: this.document.documentElement.clientWidth,
        height: view.innerHeight,
      },
      this.dropdownPlacement(),
      this.dropdownFlip(),
    );
    this.renderer.setStyle(panel, "top", `${top + view.scrollY}px`);
    this.renderer.setStyle(panel, "left", `${left + view.scrollX}px`);
  }

  private closePagePanel() {
    this.pageListeners.forEach((unlisten) => unlisten());
    this.pageListeners = [];
    this.pageOutlet?.dispose();
    this.pageOutlet = undefined;
    this.pagePanel?.remove();
    this.pagePanel = undefined;
  }

  private openOverlay(): HTMLElement {
    const overlayRef = this.overlayRef ?? this.createOverlay();
    this.positionStrategy
      ?.withPositions(
        toConnectedPositions(this.dropdownPlacement(), this.dropdownFlip()),
      )
      .withPush(this.dropdownFlip());
    overlayRef.attach(
      new TemplatePortal(this.scDropdown(), this.viewContainerRef),
    );
    return overlayRef.overlayElement;
  }

  private createOverlay(): OverlayRef {
    this.positionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      this.host,
    ).withFlexibleDimensions(false);

    const overlayRef = createOverlayRef(this.injector, {
      positionStrategy: this.positionStrategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });

    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!this.host.nativeElement.contains(event.target as Node | null)) {
        this.hide();
      }
    });

    overlayRef
      .keydownEvents()
      .subscribe((event) => this.onKeydown(event, overlayRef.overlayElement));

    this.overlayRef = overlayRef;
    return overlayRef;
  }

  private onKeydown(event: KeyboardEvent, panel: HTMLElement) {
    if (event.key === "Escape") {
      event.preventDefault();
      this.hide();
      this.focusTarget().focus();
    } else if (event.key === "Tab") {
      this.onTab(event, panel);
    }
  }

  private onTab(event: KeyboardEvent, panel: HTMLElement) {
    const items = focusableItems(panel);
    const target = event.target as Node | null;

    if (!panel.contains(target)) {
      const fromTrigger = this.host.nativeElement.contains(target);
      if (fromTrigger && !event.shiftKey && items.length > 0) {
        event.preventDefault();
        items[0].focus();
      } else {
        this.hide();
      }
      return;
    }

    if (target !== (event.shiftKey ? items[0] : items[items.length - 1])) {
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();
    }
    this.hide();
    this.focusTarget().focus();
  }

  private focusTarget(): HTMLElement {
    return focusTarget(this.host.nativeElement);
  }

  private syncAria() {
    const target = this.focusTarget();
    this.renderer.setAttribute(target, "aria-haspopup", "true");
    this.renderer.setAttribute(target, "aria-expanded", String(this.isOpen()));
  }
}
