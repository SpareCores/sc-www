import { Component, inject, input } from "@angular/core";
import { CompareSelection } from "../../services/compare-selection";
import { Button } from "../button/button";

@Component({
  selector: "sc-compare-toggle-button",
  imports: [Button],
  templateUrl: "./compare-toggle-button.html",
})
export class CompareToggleButton {
  private compareSelection = inject(CompareSelection);

  resource = input.required<"server" | "database">();
  vendorId = input.required<string>();
  entityId = input.required<string>();
  displayName = input.required<string>();

  label(): string {
    return this.isSelected() ? "Don't Compare" : "Compare";
  }

  isSelected(): boolean {
    return this.compareSelection.isResourceSelected(
      this.resource(),
      this.vendorId(),
      this.entityId(),
    );
  }

  toggle() {
    this.compareSelection.toggleResourceCompare(
      this.resource(),
      this.vendorId(),
      this.entityId(),
      this.displayName(),
    );
  }
}
