import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import type { Modifier, Obj } from "@popperjs/core";
import { Dropdown, DropdownOptions } from "flowbite";
import type { DropdownInterface } from "flowbite/lib/esm/components/dropdown/interface";

export interface DropdownBehaviorOptions {
  flip?: boolean;
  placement?:
    | "bottom"
    | "top"
    | "left"
    | "right"
    | "bottom-start"
    | "bottom-end"
    | "top-start"
    | "top-end";
  offsetDistance?: number;
}

const defaultBehavior: DropdownBehaviorOptions = {
  flip: false,
  placement: "bottom-end",
  offsetDistance: 10,
};

@Injectable({
  providedIn: "root",
})
export class DropdownManagerService {
  private platformId = inject(PLATFORM_ID);

  async initDropdown(
    triggerID: string,
    targetID: string,
    behavior?: DropdownBehaviorOptions,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const { triggerEl, targetEl } = await this.waitForElements(
        triggerID,
        targetID,
      );

      const merged = { ...defaultBehavior, ...behavior };

      const options: DropdownOptions = {
        placement: merged.placement || "bottom",
        triggerType: "click",
        offsetSkidding: 0,
        offsetDistance: merged.offsetDistance ?? 10,
        delay: 300,
      };

      const dropdown = new Dropdown(targetEl, triggerEl, options, {
        id: targetID,
        override: true,
      });

      this.configurePopper(dropdown, merged);

      return dropdown;
    } else {
      return undefined;
    }
  }

  private configurePopper(
    dropdown: Dropdown,
    behavior: DropdownBehaviorOptions,
  ) {
    const popper = (dropdown as unknown as DropdownInterface)._popperInstance;
    if (!popper) return;

    popper.setOptions((prev) => ({
      ...prev,
      modifiers: [
        ...(prev.modifiers || []).filter(
          (modifier: Partial<Modifier<string, Obj>>) =>
            modifier.name !== "flip" && modifier.name !== "preventOverflow",
        ),
        {
          name: "flip" as const,
          enabled: !!behavior.flip,
        },
        {
          name: "preventOverflow" as const,
          options: {
            mainAxis: !!behavior.flip,
          },
        },
      ],
    }));
  }

  private waitForElements(
    triggerID: string,
    targetID: string,
  ): Promise<{ triggerEl: HTMLElement; targetEl: HTMLElement }> {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const targetEl: HTMLElement | null = document.getElementById(targetID);
        const triggerEl: HTMLElement | null =
          document.getElementById(triggerID);
        if (targetEl && triggerEl) {
          observer.disconnect();
          resolve({ triggerEl, targetEl });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}
