import { DialogRef } from "@angular/cdk/dialog";
import { Component, inject, input, output, viewChild } from "@angular/core";
import { Button } from "../button/button";
import { Modal } from "../modals/modal/modal";
import { SearchBar } from "../search-bar/search-bar";
import type {
  SearchBarCurrency,
  SearchBarCustomControl,
  SearchBarCustomControlChange,
  SearchBarFilterCategory,
  SearchBarParameter,
  SearchBarParameterPlacement,
  SearchBarQuery,
} from "../search-bar/types/search-bar.types";

@Component({
  selector: "sc-filter-modal",
  imports: [Button, Modal, SearchBar],
  templateUrl: "./filter-modal.html",
  host: {
    class: "block",
  },
})
export class FilterModal {
  private dialogRef = inject(DialogRef, { optional: true });

  private readonly searchBar = viewChild(SearchBar);

  query = input<SearchBarQuery>({});
  searchParameters = input.required<SearchBarParameter[]>();
  extraParameters = input<SearchBarQuery>({});
  filterCategories = input<SearchBarFilterCategory[]>([]);
  selectedCurrency = input<SearchBarCurrency>(null);
  showParameterTitles = input(true);
  customControls = input<SearchBarCustomControl[]>([]);
  parameterPlacements = input<SearchBarParameterPlacement[]>([]);
  parameterWarnings = input<Record<string, string>>({});
  extraCategoryCounts = input<Record<string, number>>({});
  activeFilterCount = input(0);
  applyDisabledReason = input<string | null>(null);

  searchChanged = output<SearchBarQuery>();
  customControlChanged = output<SearchBarCustomControlChange>();
  clearAll = output<void>();

  apply() {
    this.dialogRef?.close();
  }

  focusCustomControl(name: string): boolean {
    return this.searchBar()?.focusCustomControl(name) ?? false;
  }
}
