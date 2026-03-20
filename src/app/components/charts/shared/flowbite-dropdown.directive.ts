import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Directive,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { Dropdown } from "flowbite";
import { DropdownManagerService } from "../../../services/dropdown-manager.service";

@Directive({
  selector: "[appFlowbiteDropdown]",
  standalone: true,
  exportAs: "appFlowbiteDropdown",
})
export class FlowbiteDropdownDirective implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef<HTMLElement>);
  private dropdownManager = inject(DropdownManagerService);
  private viewReady = signal(false);

  appFlowbiteDropdown = input.required<string>();
  dropdownEnabled = input(true);

  dropdown: Dropdown | undefined;
  private initializedKey = "";

  constructor() {
    effect(() => {
      if (!this.viewReady()) {
        return;
      }

      if (!this.dropdownEnabled()) {
        this.dropdown?.hide();
        return;
      }

      const triggerId = this.elementRef.nativeElement.id;
      const targetId = this.appFlowbiteDropdown();
      const key = `${triggerId}:${targetId}`;
      if (this.initializedKey === key) {
        this.dropdown?.show();
        return;
      }

      this.initializeDropdown();
    });
  }

  ngAfterViewInit() {
    this.viewReady.set(true);
  }

  hide() {
    this.dropdown?.hide();
  }

  private initializeDropdown() {
    if (!isPlatformBrowser(this.platformId) || !this.dropdownEnabled()) {
      return;
    }

    const triggerId = this.elementRef.nativeElement.id;
    const targetId = this.appFlowbiteDropdown();
    if (!triggerId || !targetId) {
      return;
    }

    const key = `${triggerId}:${targetId}`;
    if (this.initializedKey === key) {
      return;
    }

    this.initializedKey = key;
    this.dropdownManager
      .initDropdown(triggerId, targetId)
      .then((dropdown) => {
        this.dropdown = dropdown;
      })
      .catch((error) => {
        console.error("Failed to initialize Flowbite dropdown:", error);
      });
  }
}
