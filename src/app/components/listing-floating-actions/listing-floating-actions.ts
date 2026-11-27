import { Component, input, output } from "@angular/core";
import { Button } from "../button/button";

@Component({
  selector: "sc-listing-floating-actions",
  imports: [Button],
  templateUrl: "./listing-floating-actions.html",
})
export class ListingFloatingActions {
  filterCount = input(0);
  sidebarCollapsed = input(false);

  openFilters = output<void>();
  clearFilters = output<void>();
}
