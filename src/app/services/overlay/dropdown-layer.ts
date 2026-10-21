import { InjectionToken } from "@angular/core";

export type DropdownLayer = "page" | "top";

export const DROPDOWN_LAYER = new InjectionToken<DropdownLayer>(
  "DROPDOWN_LAYER",
  {
    factory: () => "page",
  },
);
