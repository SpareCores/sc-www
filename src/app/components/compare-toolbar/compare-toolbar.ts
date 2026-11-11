import { Component, computed, input, output, viewChild } from "@angular/core";
import { Dropdown } from "../../directives/dropdown";
import { CurrencyOption, availableCurrencies } from "../../tools/shared_data";
import { Button } from "../button/button";
import { CompareToolbarItem } from "./compare-toolbar.types";

@Component({
  selector: "sc-compare-toolbar",
  imports: [Button, Dropdown],
  templateUrl: "./compare-toolbar.html",
  host: { class: "flex flex-wrap gap-4 items-center justify-end w-full" },
})
export class CompareToolbar<T extends CompareToolbarItem> {
  resource = input.required<"server" | "database">();
  items = input<T[]>([]);
  baseline = input<T | null>(null);
  currency = input.required<CurrencyOption>();

  baselineSelected = output<T | null>();
  currencySelected = output<CurrencyOption>();

  readonly availableCurrencies = availableCurrencies;
  private baselineDropdown = viewChild<Dropdown>("baselineDropdown");
  private currencyDropdown = viewChild<Dropdown>("currencyDropdown");

  readonly baselineLabel = computed(() => {
    const baseline = this.baseline();
    return baseline
      ? `${baseline.display_name} (${baseline.vendor_id})`
      : `Baseline ${this.resource()}`;
  });

  selectBaseline(item: T | null) {
    this.baselineDropdown()?.hide();
    this.baselineSelected.emit(item);
  }

  selectCurrency(currency: CurrencyOption) {
    this.currencyDropdown()?.hide();
    this.currencySelected.emit(currency);
  }
}
