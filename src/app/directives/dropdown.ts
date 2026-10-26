import {
  FlexibleConnectedPositionStrategy,
  OverlayContainer,
  OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
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
import { PageOverlayContainer } from "../services/overlay/page-overlay-container";
import { DropdownPlacement, toConnectedPositions } from "./dropdown-positions";
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

  constructor() {
    effect(() => {
      if (!this.dropdownEnabled()) {
        untracked(() => this.hide());
      }
    });

    afterNextRender(() => this.syncAria());

    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  open(focusPanel = false) {
    if (this.isOpen() || !this.dropdownEnabled()) {
      return;
    }

    const overlayRef = this.overlayRef ?? this.createOverlay();
    this.positionStrategy
      ?.withPositions(
        toConnectedPositions(this.dropdownPlacement(), this.dropdownFlip()),
      )
      .withPush(this.dropdownFlip());
    overlayRef.attach(
      new TemplatePortal(this.scDropdown(), this.viewContainerRef),
    );
    this.isOpen.set(true);
    this.syncAria();
    this.dropdownOpened.emit();

    if (focusPanel) {
      afterNextRender(() => focusFirst(overlayRef.overlayElement), {
        injector: this.injector,
      });
    }
  }

  hide() {
    if (!this.isOpen()) {
      return;
    }

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

  private createOverlay(): OverlayRef {
    const injector =
      this.layer === "page"
        ? Injector.create({
            providers: [
              { provide: OverlayContainer, useExisting: PageOverlayContainer },
            ],
            parent: this.injector,
          })
        : this.injector;

    this.positionStrategy = createFlexibleConnectedPositionStrategy(
      injector,
      this.host,
    ).withFlexibleDimensions(false);

    const overlayRef = createOverlayRef(injector, {
      positionStrategy: this.positionStrategy,
      scrollStrategy: createRepositionScrollStrategy(injector),
    });

    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!this.host.nativeElement.contains(event.target as Node | null)) {
        this.hide();
      }
    });

    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.hide();
        this.focusTarget().focus();
      } else if (event.key === "Tab") {
        this.onTab(event, overlayRef.overlayElement);
      }
    });

    this.overlayRef = overlayRef;
    return overlayRef;
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
