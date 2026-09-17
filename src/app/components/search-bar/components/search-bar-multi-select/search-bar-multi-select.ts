import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LucideX } from "@lucide/angular";

@Component({
  selector: "sc-search-bar-multi-select",
  imports: [CommonModule, FormsModule, LucideX],
  templateUrl: "./search-bar-multi-select.html",
  styleUrl: "./search-bar-multi-select.scss",
})
export class SearchBarMultiSelect {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>("searchInput");
  private readonly optionsPanel =
    viewChild<ElementRef<HTMLElement>>("optionsPanel");

  options = input.required<string[]>();
  selected = input<string[]>([]);
  disabled = input(false);
  placeholder = input("Search…");
  parameterName = input("");
  filterCategoryId = input("");

  selectionChange = output<string[]>();

  searchQuery = signal("");
  dropdownOpen = signal(false);
  activeIndex = signal(-1);

  filteredOptions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const selectedSet = new Set(this.selected());
    const options = this.options().filter((option) => !selectedSet.has(option));

    if (!query) {
      return options;
    }

    return options.filter((option) => option.toLowerCase().startsWith(query));
  });

  @HostListener("document:mousedown", ["$event"])
  onDocumentMouseDown(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target || this.host.nativeElement.contains(target)) {
      return;
    }
    this.dropdownOpen.set(false);
    this.activeIndex.set(-1);
  }

  openDropdown() {
    if (this.disabled()) {
      return;
    }
    this.dropdownOpen.set(true);
  }

  focusSearch() {
    if (this.disabled()) {
      return;
    }
    this.dropdownOpen.set(true);
    queueMicrotask(() => this.searchInput()?.nativeElement.focus());
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.activeIndex.set(-1);
    this.dropdownOpen.set(true);
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (this.disabled()) {
      return;
    }

    const options = this.filteredOptions();
    const key = event.key;

    if (key === "Backspace") {
      if (this.searchQuery() || !this.selected().length) {
        return;
      }
      event.preventDefault();
      const selected = this.selected();
      this.removeOption(selected[selected.length - 1]);
      return;
    }

    if (key === "ArrowDown" || key === "Down") {
      event.preventDefault();
      event.stopPropagation();
      this.dropdownOpen.set(true);
      if (!options.length) {
        return;
      }
      const current = this.activeIndex();
      const nextIndex = current < options.length - 1 ? current + 1 : 0;
      this.activeIndex.set(nextIndex);
      this.scrollActiveOptionIntoView();
      return;
    }

    if (key === "ArrowUp" || key === "Up") {
      event.preventDefault();
      event.stopPropagation();
      this.dropdownOpen.set(true);
      if (!options.length) {
        return;
      }
      const current = this.activeIndex();
      const nextIndex = current <= 0 ? options.length - 1 : current - 1;
      this.activeIndex.set(nextIndex);
      this.scrollActiveOptionIntoView();
      return;
    }

    if (key === "Enter") {
      if (!this.dropdownOpen() || !options.length) {
        return;
      }
      const index = this.activeIndex() >= 0 ? this.activeIndex() : 0;
      const option = options[index];
      if (!option) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.selectOption(option);
      return;
    }

    if (key === "Escape" || key === "Esc") {
      if (!this.dropdownOpen()) {
        return;
      }
      event.preventDefault();
      this.dropdownOpen.set(false);
      this.activeIndex.set(-1);
    }
  }

  isSelected(option: string): boolean {
    return this.selected().includes(option);
  }

  selectOption(option: string) {
    if (this.disabled() || this.isSelected(option)) {
      return;
    }

    this.selectionChange.emit([...this.selected(), option]);
    this.searchQuery.set("");
    this.activeIndex.set(-1);
    this.dropdownOpen.set(true);
    queueMicrotask(() => this.searchInput()?.nativeElement.focus());
  }

  removeOption(option: string, event?: Event) {
    event?.stopPropagation();
    if (this.disabled()) {
      return;
    }

    this.selectionChange.emit(
      this.selected().filter((selected) => selected !== option),
    );
  }

  private scrollActiveOptionIntoView() {
    requestAnimationFrame(() => {
      const panel = this.optionsPanel()?.nativeElement;
      const active = panel?.querySelector<HTMLElement>(
        ".search-bar-multi-select__option--active",
      );
      active?.scrollIntoView({ block: "nearest" });
    });
  }
}
