import { DialogRef } from "@angular/cdk/dialog";
import {
  Component,
  computed,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { FilterModalTabs } from "../../services/filter-modal-tabs";
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
  private readonly filterModalTabs = inject(FilterModalTabs);
  private readonly pageKey = inject(Router).url.split("?")[0];

  readonly initialCategoryId = this.filterModalTabs.get(this.pageKey);

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
  applyDisabledReason = input<string | null>(null);
  showTopSection = input(true);
  AIAssistantType = input("servers");
  useTopSearchInput = input(false);
  topSearchPlaceholder = input("Search vendor or API reference");

  searchChanged = output<SearchBarQuery>();
  customControlChanged = output<SearchBarCustomControlChange>();
  clearAll = output<void>();

  readonly draftParameters = computed(() =>
    this.searchParameters().map((parameter) => ({ ...parameter })),
  );

  readonly draftFilterCount = computed(
    () => this.searchBar()?.activeFilterCount() ?? 0,
  );

  rememberCategory(categoryId: string) {
    this.filterModalTabs.set(this.pageKey, categoryId);
  }

  openSearchPrompt() {
    this.searchBar()?.openSearchPrompt();
  }

  clear() {
    this.searchBar()?.resetAll();
    this.clearAll.emit();
  }

  apply() {
    const searchBar = this.searchBar();

    if (searchBar?.hasDraftChanges()) {
      this.searchChanged.emit(searchBar.buildQuery());
    }

    this.dialogRef?.close(true);
  }

  focusCustomControl(name: string): boolean {
    return this.searchBar()?.focusCustomControl(name) ?? false;
  }
}
