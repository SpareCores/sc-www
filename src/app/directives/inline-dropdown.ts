import {
  Directive,
  ElementRef,
  Injector,
  Renderer2,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import {
  focusFirst,
  focusTarget,
  isKeyboardActivation,
} from "./dropdown-focus";

@Directive({
  selector: "[scInlineDropdown]",
  exportAs: "scInlineDropdown",
  host: {
    "(click)": "onHostClick($event)",
    "(document:click)": "onDocumentClick($event)",
    "(document:focusin)": "onDocumentFocusIn($event)",
    "(document:keydown.escape)": "onEscape()",
  },
})
export class InlineDropdown {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(Renderer2);
  private injector = inject(Injector);

  scInlineDropdown = input.required<HTMLElement>();
  dropdownEnabled = input(true);

  dropdownOpened = output<void>();

  readonly isOpen = signal(false);

  constructor() {
    effect(() => {
      if (!this.dropdownEnabled()) {
        untracked(() => this.hide());
      }
    });

    afterNextRender(() => this.syncAria());
  }

  open(focusPanel = false) {
    if (this.isOpen() || !this.dropdownEnabled()) {
      return;
    }

    this.isOpen.set(true);
    this.syncAria();
    this.dropdownOpened.emit();

    if (focusPanel) {
      afterNextRender(() => focusFirst(this.scInlineDropdown()), {
        injector: this.injector,
      });
    }
  }

  hide() {
    if (!this.isOpen()) {
      return;
    }

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
    if (!this.dropdownEnabled()) {
      return;
    }

    this.toggle(isKeyboardActivation(event));
  }

  protected onDocumentClick(event: MouseEvent) {
    if (this.isOpen() && !this.containsTarget(event.target)) {
      this.hide();
    }
  }

  protected onDocumentFocusIn(event: FocusEvent) {
    if (this.isOpen() && !this.containsTarget(event.target)) {
      this.hide();
    }
  }

  protected onEscape() {
    if (!this.isOpen()) {
      return;
    }

    this.hide();
    focusTarget(this.host.nativeElement).focus();
  }

  private containsTarget(target: EventTarget | null): boolean {
    const node = target as Node | null;
    return (
      this.host.nativeElement.contains(node) ||
      this.scInlineDropdown().contains(node)
    );
  }

  private syncAria() {
    const target = focusTarget(this.host.nativeElement);
    this.renderer.setAttribute(target, "aria-haspopup", "true");
    this.renderer.setAttribute(target, "aria-expanded", String(this.isOpen()));
  }
}
