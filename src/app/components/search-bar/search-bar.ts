import { DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LucideChevronDown, LucideDynamicIcon } from "@lucide/angular";
import { Subject, Subscription, debounceTime } from "rxjs";
import { KeeperAPI } from "../../services/keeper-api";
import { ModalDialog } from "../../services/modal-dialog";
import { TooltipVariant, UiTooltip } from "../../services/ui-tooltip";
import { FilterMetadataStore } from "../../shared/store/filter-metadata-store";
import { Button } from "../button/button";
import { Modal } from "../modals/modal/modal";
import {
  SearchBarCustomControls,
  SearchBarGeoFilters,
  SearchBarParameterField,
} from "./components";
import type {
  ContinentMetadata,
  CountryMetadata,
  SearchBarCurrency,
  SearchBarCustomControl,
  SearchBarCustomControlChange,
  SearchBarFilterCategory,
  SearchBarParameter,
  SearchBarParameterPlacement,
  SearchBarParameterType,
  SearchBarQuery,
} from "./types/search-bar.types";
import {
  countParameterFilters,
  draftValueFromUnknown,
  getParameterResetValue,
  getParameterType as getSearchBarParameterType,
  isDraftValueDirty,
  normalizeBenchmarkTriStateValue,
  normalizeCommittedCpuCacheRangeValue,
  parseNumericDraftValue,
  parseTextDraftValue,
} from "./utils/search-bar.utils";

export type {
  BenchmarkFilterOption,
  ComplianceFrameworkMetadata,
  ContinentMetadata,
  CountryMetadata,
  RegionMetadata,
  SearchBarBenchmarkConfigGroup,
  SearchBarBenchmarkConfigOption,
  SearchBarCurrency,
  SearchBarCustomControl,
  SearchBarCustomSelectOption,
  SearchBarFilterCategory,
  SearchBarParameter,
  SearchBarParameterPlacement,
  SearchBarParameterType,
  SearchBarQuery,
  SearchBarServerOption,
  StorageMetadata,
  VendorMetadata,
} from "./types/search-bar.types";

type ApiResponse<T> = {
  body?: T;
};

export type SearchBarLayout = "sidebar" | "modal";

@Component({
  selector: "sc-search-bar",
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Modal,
    LucideDynamicIcon,
    LucideChevronDown,
    SearchBarCustomControls,
    SearchBarGeoFilters,
    SearchBarParameterField,
  ],
  templateUrl: "./search-bar.html",
  styleUrl: "./search-bar.css",
  encapsulation: ViewEncapsulation.None,
})
export class SearchBar implements OnInit, OnDestroy {
  private keeperAPI = inject(KeeperAPI);
  private uiTooltip = inject(UiTooltip);
  private modalDialog = inject(ModalDialog);
  private filterMetadata = inject(FilterMetadataStore);

  query = input<SearchBarQuery>({});
  searchParameters = input.required<SearchBarParameter[]>();
  extraParameters = input<SearchBarQuery>({});

  filterCategories = input<SearchBarFilterCategory[]>([]);
  selectedCurrency = input<SearchBarCurrency>(null);
  AIAssistantType = input("servers");
  useTopSearchInput = input(false);
  topSearchParameterName = input("search");
  topSearchPlaceholder = input("Search vendor or API reference");
  showTopSection = input(true);
  initialCategoryId = input<string | null>(null);
  showParameterTitles = input(true);
  noTopPaddingCategoryIds = input<string[]>([]);
  customControls = input<SearchBarCustomControl[]>([]);
  parameterPlacements = input<SearchBarParameterPlacement[]>([]);
  parameterWarnings = input<Record<string, string>>({});
  layout = input<SearchBarLayout>("sidebar");
  idPrefix = input("");
  extraCategoryCounts = input<Record<string, number>>({});
  deferChanges = input(false);

  searchChanged = output<SearchBarQuery>();
  customControlChanged = output<SearchBarCustomControlChange>();
  categorySelected = output<string>();
  promptConfirmed = output<void>();

  tooltip = viewChild.required<ElementRef<HTMLElement>>("tooltipDefault");
  categoryTabs = viewChildren<ElementRef<HTMLButtonElement>>("categoryTab");
  customControlsComponents = viewChildren(SearchBarCustomControls);
  searchPromptModalTemplate = viewChild.required<TemplateRef<unknown>>(
    "searchPromptModalTemplate",
  );
  tooltipContent = "";

  readonly complianceFrameworks = this.filterMetadata.complianceFrameworks;
  readonly vendors = this.filterMetadata.vendors;
  readonly storageIds = this.filterMetadata.storages;
  readonly regionMetadata = this.filterMetadata.regions;

  countryMetadata = signal<CountryMetadata[]>([]);
  continentMetadata: ContinentMetadata[] = [];

  vendorRegionCollapsedVendors: Record<string, boolean> = {};

  readonly sectionIdPrefix = computed(() =>
    this.layout() === "modal"
      ? this.idPrefix() + "accordion_"
      : this.idPrefix(),
  );

  private readonly draftVersion = signal(0);

  readonly activeFilterCount = computed(() => {
    this.draftVersion();

    return this.filterCategories().reduce(
      (count, category) => count + this.getCategoryActiveCount(category),
      0,
    );
  });

  readonly activeCategoryId = linkedSignal(() => this.initialCategoryId());
  readonly activeCategory = computed(() => {
    const categories = this.filterCategories();

    return (
      categories.find(
        (category) => category.category_id === this.activeCategoryId(),
      ) ?? categories[0]
    );
  });

  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: SearchBarQuery | null = null;
  modalResponseStr: string[] = [];

  private parameterDraftValues: Record<string, string> = {};
  private searchPromptDialogRef: DialogRef | null = null;

  private readonly valueChangeDebouncer = new Subject<number>();
  private valueChangeGeneration = 0;
  private hasDraftChange = false;
  private readonly subscription = new Subscription();
  private lastAppliedCountries: CountryMetadata[] | null = null;
  private lastSelectedCountryIdsKey: string | null = null;
  private lastSyncedExtraParameters: SearchBarQuery = {};

  constructor() {
    effect(() => {
      this.syncQueryInput(this.query());
    });

    effect(() => {
      const extraParameters = this.deferChanges()
        ? untracked(() => this.extraParameters())
        : this.extraParameters();

      this.valueChangeGeneration++;
      this.syncSearchParameters(
        this.searchParameters(),
        this.query(),
        extraParameters,
        this.filterCategories(),
      );
    });

    effect(() => {
      if (!this.deferChanges()) {
        return;
      }

      const extraParameters = this.extraParameters();
      const changedNames = new Set([
        ...Object.keys(this.lastSyncedExtraParameters),
        ...Object.keys(extraParameters),
      ]);
      this.lastSyncedExtraParameters = extraParameters;

      untracked(() =>
        this.syncSearchParameters(
          this.searchParameters().filter((parameter) =>
            changedNames.has(parameter.name),
          ),
          this.query(),
          extraParameters,
          this.filterCategories(),
        ),
      );
    });

    effect(() => {
      this.syncVendorRegionSelectionVisibility();
    });
  }

  ngOnInit() {
    void this.filterMetadata.load();

    this.subscription.add(
      this.valueChangeDebouncer
        .pipe(debounceTime(500))
        .subscribe((generation) => {
          if (generation !== this.valueChangeGeneration) {
            return;
          }
          this.filterServers();
        }),
    );
  }

  private syncQueryInput(query: SearchBarQuery) {
    const countries = query.countries;
    const selectedCountries =
      typeof countries === "string"
        ? countries
          ? countries.split(",")
          : []
        : Array.isArray(countries)
          ? countries.filter(
              (country): country is string => typeof country === "string",
            )
          : [];
    const countryRows = this.filterMetadata.countries();
    untracked(() => this.applyCountries(countryRows, selectedCountries));

    if (selectedCountries.length) {
      const regionCategory = this.filterCategories().find(
        (column) => column.category_id === "region",
      );

      if (regionCategory) {
        regionCategory.collapsed = false;
      }
    }
  }

  private syncSearchParameters(
    searchParameters: SearchBarParameter[],
    query: SearchBarQuery,
    extraParameters: SearchBarQuery,
    filterCategories: SearchBarFilterCategory[],
  ) {
    searchParameters.forEach((item) => {
      const parameterType = this.getParameterType(item);

      if (
        (parameterType === "enumArray" ||
          parameterType === "enumArraySearch" ||
          parameterType === "vendor_regions") &&
        !item.modelValue
      ) {
        item.modelValue = [];
      }

      if (
        parameterType === "benchmarkTriState" &&
        (!item.modelValue || typeof item.modelValue !== "object")
      ) {
        item.modelValue = {};
      }

      let value =
        extraParameters[item.name] ??
        query[item.name] ??
        item.schema.default ??
        null;

      if (typeof query[item.name] === "string") {
        const queryString = query[item.name] as string;
        value =
          queryString.indexOf(",") !== -1
            ? queryString.split(",")
            : queryString;
      }

      if (
        query[item.name] &&
        (parameterType === "enumArray" ||
          parameterType === "enumArraySearch" ||
          parameterType === "compliance_framework" ||
          parameterType === "vendor" ||
          parameterType === "vendor_regions") &&
        !Array.isArray(query[item.name])
      ) {
        value = [query[item.name]];
      }

      const queryValue = query[item.name];
      const effectiveValue =
        extraParameters[item.name] != null
          ? extraParameters[item.name]
          : queryValue;
      const resolvedCategory = this.getResolvedParameterCategory(item);
      const filterCategory = resolvedCategory
        ? filterCategories.find(
            (column) => column.category_id === resolvedCategory,
          )
        : undefined;
      const hasEffectiveValue = Array.isArray(effectiveValue)
        ? effectiveValue.length > 0
        : effectiveValue === false || Boolean(effectiveValue);

      if (hasEffectiveValue && filterCategory) {
        filterCategory.collapsed = false;
      }

      if (extraParameters[item.name]) {
        if (typeof extraParameters[item.name] === "string") {
          const extraString = extraParameters[item.name] as string;
          value =
            extraString.indexOf(",") !== -1
              ? extraString.split(",")
              : extraString;
        }

        if (
          extraParameters[item.name] &&
          (parameterType === "enumArray" ||
            parameterType === "enumArraySearch" ||
            parameterType === "compliance_framework" ||
            parameterType === "vendor" ||
            parameterType === "vendor_regions") &&
          !Array.isArray(extraParameters[item.name])
        ) {
          value = [extraParameters[item.name]];
        }
      }

      if (value === "true" || value === "false") {
        value = value === "true";
      }

      if (parameterType === "benchmarkTriState") {
        value = normalizeBenchmarkTriStateValue(value);
      }

      if (parameterType === "cpuCacheRange") {
        value = normalizeCommittedCpuCacheRangeValue(item, value);
      }

      if (!value && value !== false && item.schema.null_value) {
        value = item.schema.null_value;
      }

      item.modelValue = value;

      if (
        this.useTopSearchInput() &&
        item.name === this.topSearchParameterName()
      ) {
        this.syncParameterDraftValue(item);
      }
    });

    this.draftVersion.update((version) => version + 1);
  }

  private syncVendorRegionSelectionVisibility() {
    const vendorRegionValues = this.getActiveVendorRegionValues();

    if (!vendorRegionValues.length) {
      return;
    }

    [
      ...new Set(
        vendorRegionValues.map((vr) => vr.split("~")[0]).filter(Boolean),
      ),
    ].forEach((vendorId) => {
      if (this.vendorRegionCollapsedVendors[vendorId] === undefined) {
        this.vendorRegionCollapsedVendors[vendorId] = false;
      }
    });

    const regionCategory = this.filterCategories().find(
      (column) => column.category_id === "region",
    );

    if (regionCategory) {
      regionCategory.collapsed = false;
    }
  }

  private getActiveVendorRegionValues(): string[] {
    const extraParameters = this.extraParameters();
    const query = this.query();
    const vendorRegionValues =
      extraParameters.vendor_regions != null
        ? extraParameters.vendor_regions
        : query.vendor_regions;

    if (!vendorRegionValues) {
      return [];
    }

    const values = Array.isArray(vendorRegionValues)
      ? vendorRegionValues
      : [vendorRegionValues];

    return values
      .flatMap((value) => {
        return typeof value === "string"
          ? value.split(",").map((part) => part.trim())
          : [];
      })
      .filter(Boolean);
  }

  filterServers() {
    this.normalizeSearchParameterValues();
    this.draftVersion.update((version) => version + 1);

    if (this.deferChanges()) {
      this.hasDraftChange = true;
      return;
    }

    this.searchChanged.emit(this.getQueryWithCountries());
  }

  buildQuery(): SearchBarQuery {
    this.searchParameters().forEach((parameter) => {
      if (this.isParameterDraftDirty(parameter)) {
        this.commitParameterValue(parameter);
      }
    });
    this.normalizeSearchParameterValues();

    return this.getQueryWithCountries();
  }

  hasDraftChanges(): boolean {
    return (
      this.hasDraftChange ||
      this.searchParameters().some((parameter) =>
        this.isParameterDraftDirty(parameter),
      )
    );
  }

  resetAll() {
    this.filterCategories().forEach((category) => {
      this.resetCategoryValues(category);
    });
    this.filterServers();
  }

  private getQueryWithCountries(): SearchBarQuery {
    const queryObject = this.getQueryObject();
    const selectedCountryIds = this.countryMetadata()
      .filter((country) => country.selected)
      .map((country) => country.country_id);

    if (selectedCountryIds.length) {
      queryObject.countries = selectedCountryIds;
    } else {
      delete queryObject.countries;
    }

    return queryObject;
  }

  private normalizeSearchParameterValues() {
    const vcpu_max = this.searchParameters().find(
      (param) => param.name === "vcpus_max",
    );
    const vcpu_min = this.searchParameters().find(
      (param) => param.name === "vcpus_min",
    );
    const vcpuMaxValue = Number(vcpu_max?.modelValue);
    const vcpuMinValue = Number(vcpu_min?.modelValue);
    if (
      Number.isFinite(vcpuMinValue) &&
      Number.isFinite(vcpuMaxValue) &&
      vcpuMinValue > 0 &&
      vcpuMaxValue > 0 &&
      vcpuMinValue > vcpuMaxValue &&
      vcpu_max
    ) {
      vcpu_max.modelValue = vcpuMinValue;
    }

    this.searchParameters().forEach((param) => {
      const rawModelValue = param.modelValue;
      const modelValue = Number(rawModelValue);
      const rangeMin = param.schema.range_min;
      const rangeMax = param.schema.range_max;

      if (
        rawModelValue !== null &&
        rawModelValue !== undefined &&
        rawModelValue !== "" &&
        Number.isFinite(modelValue) &&
        rangeMin !== undefined &&
        rangeMax !== undefined
      ) {
        if (modelValue < rangeMin) {
          param.modelValue = rangeMin;
        }

        if (modelValue > rangeMax) {
          param.modelValue = rangeMax;
        }
      }
    });
  }

  getQueryObject(): SearchBarQuery {
    return this.searchParameters()
      .filter((item) => !this.isParameterDisabled(item.name))
      .map((param) => {
        if (this.getParameterType(param) === "singleRadio") {
          return param.modelValue ? { [param.name]: param.modelValue } : {};
        }

        if (this.getParameterType(param) === "benchmarkTriState") {
          const benchmarkTriStateValue = normalizeBenchmarkTriStateValue(
            param.modelValue,
          );
          const activeEntries = Object.entries(benchmarkTriStateValue).filter(
            ([, value]) => value === "yes" || value === "no",
          );

          return activeEntries.length > 0
            ? {
                [param.name]: Object.fromEntries(activeEntries),
              }
            : {};
        }

        return (param.modelValue || param.modelValue === false) &&
          param.schema.category_id &&
          param.schema.default !== param.modelValue &&
          param.schema.null_value !== param.modelValue
          ? { [param.name]: param.modelValue }
          : {};
      })
      .reduce<SearchBarQuery>((acc, curr) => {
        return { ...acc, ...curr };
      }, {});
  }

  isCategoryExpanded(category: SearchBarFilterCategory): boolean {
    return (
      category.alwaysExpanded === true ||
      category.hideHeader === true ||
      !category.collapsed
    );
  }

  toggleCategory(category: SearchBarFilterCategory) {
    if (category.alwaysExpanded || category.hideHeader) {
      return;
    }

    category.collapsed = !category.collapsed;
  }

  selectCategory(category: SearchBarFilterCategory) {
    this.activeCategoryId.set(category.category_id);
    this.categorySelected.emit(category.category_id);
  }

  onCategoryTabKeydown(event: KeyboardEvent, index: number) {
    const categories = this.filterCategories();
    const lastIndex = categories.length - 1;
    const nextIndex =
      event.key === "ArrowDown"
        ? index === lastIndex
          ? 0
          : index + 1
        : event.key === "ArrowUp"
          ? index === 0
            ? lastIndex
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? lastIndex
              : null;

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    this.selectCategory(categories[nextIndex]);
    this.categoryTabs()[nextIndex]?.nativeElement.focus();
  }

  getCategoryActiveCount(category: SearchBarFilterCategory): number {
    const selectedCountryCount = this.countryMetadata().filter(
      (country) => country.selected,
    ).length;

    return this.searchParameters().reduce((count, parameter) => {
      if (
        this.getResolvedParameterCategory(parameter) !== category.category_id ||
        this.isParameterDisabled(parameter.name)
      ) {
        return count;
      }

      return (
        count +
        (this.getParameterType(parameter) === "country"
          ? selectedCountryCount
          : countParameterFilters(parameter, parameter.modelValue))
      );
    }, this.extraCategoryCounts()[category.category_id] ?? 0);
  }

  hasCustomControls(category: SearchBarFilterCategory): boolean {
    return this.getCustomControlsByCategory(category.category_id).length > 0;
  }

  hasRequiredCustomControls(category: SearchBarFilterCategory): boolean {
    return this.getCustomControlsByCategory(category.category_id).some(
      (control) => control.required,
    );
  }

  isWideParameter(parameter: SearchBarParameter): boolean {
    const type = this.getParameterType(parameter);

    return type === "text" || type === "enumArraySearch";
  }

  resetCategory(category: SearchBarFilterCategory) {
    this.resetCategoryValues(category);
    this.filterServers();
  }

  private resetCategoryValues(category: SearchBarFilterCategory) {
    this.searchParameters().forEach((parameter) => {
      if (
        this.getResolvedParameterCategory(parameter) !== category.category_id ||
        this.isParameterDisabled(parameter.name)
      ) {
        return;
      }

      if (this.getParameterType(parameter) === "country") {
        this.countryMetadata.update((countries) =>
          countries.map((country) => ({ ...country, selected: false })),
        );
        this.continentMetadata.forEach((continent) => {
          continent.selected = false;
        });
      }

      parameter.modelValue = getParameterResetValue(parameter);
      delete this.parameterDraftValues[parameter.name];
    });
  }

  getParameterTrackId(parameter: SearchBarParameter): string {
    return `${parameter.name}_${String(parameter.schema.title || "")}`;
  }

  getParametersByCategory(category: string) {
    return this.searchParameters().filter((param) => {
      if (this.getResolvedParameterCategory(param) !== category) {
        return false;
      }

      if (
        this.useTopSearchInput() &&
        param.name === this.topSearchParameterName()
      ) {
        return false;
      }

      return true;
    });
  }

  getTrailingParametersByCategory(category: string) {
    return this.sortParametersByPlacement(
      this.getParametersByCategory(category).filter((parameter) => {
        const afterControlName = this.getParameterPlacement(
          parameter.name,
        )?.afterControlName;

        return (
          !afterControlName ||
          !this.hasCustomControlInCategory(category, afterControlName)
        );
      }),
    );
  }

  getCustomControlsByCategory(category: string) {
    return this.customControls().filter(
      (control) => control.category_id === category,
    );
  }

  getTopSearchParameter() {
    return this.searchParameters().find(
      (param) => param.name === this.topSearchParameterName(),
    );
  }

  isParameterDisabled(parameterName: string): boolean {
    return this.extraParameters()[parameterName] != null;
  }

  focusCustomControl(name: string): boolean {
    return this.customControlsComponents().some((component) =>
      component.focusControl(name),
    );
  }

  private getParameterPlacement(
    parameterName: string,
  ): SearchBarParameterPlacement | undefined {
    const parameterPlacements = this.parameterPlacements();

    for (let index = parameterPlacements.length - 1; index >= 0; index--) {
      const placement = parameterPlacements[index];

      if (placement.parameterName === parameterName) {
        return placement;
      }
    }

    return undefined;
  }

  private getResolvedParameterCategory(
    parameter: SearchBarParameter,
  ): string | undefined {
    return (
      this.getParameterPlacement(parameter.name)?.categoryId ||
      parameter.schema?.category_id
    );
  }

  private hasCustomControlInCategory(
    category: string,
    controlName: string,
  ): boolean {
    return this.getCustomControlsByCategory(category).some((control) => {
      return control.name === controlName;
    });
  }

  private sortParametersByPlacement(
    parameters: SearchBarParameter[],
  ): SearchBarParameter[] {
    const placementOrder = this.parameterPlacements().reduce(
      (order, placement, index) => {
        order.set(placement.parameterName, index);

        return order;
      },
      new Map<string, number>(),
    );

    return [...parameters].sort((left, right) => {
      const leftIndex = placementOrder.get(left.name);
      const rightIndex = placementOrder.get(right.name);

      if (leftIndex === undefined && rightIndex === undefined) {
        return 0;
      }

      if (leftIndex === undefined) {
        return 1;
      }

      if (rightIndex === undefined) {
        return -1;
      }

      return leftIndex - rightIndex;
    });
  }

  getParameterType(parameter: SearchBarParameter): SearchBarParameterType {
    return getSearchBarParameterType(parameter);
  }

  valueChanged() {
    this.draftVersion.update((version) => version + 1);

    if (this.deferChanges()) {
      this.hasDraftChange = true;
      return;
    }

    this.valueChangeDebouncer.next(this.valueChangeGeneration);
  }

  getParameterDraftValue(
    parameter: SearchBarParameter,
  ): string | number | null {
    if (this.parameterDraftValues[parameter.name] !== undefined) {
      return this.parameterDraftValues[parameter.name];
    }

    if (
      parameter.modelValue === null ||
      parameter.modelValue === undefined ||
      parameter.modelValue === ""
    ) {
      return null;
    }

    return parameter.modelValue as string | number;
  }

  setParameterDraftValue(parameter: SearchBarParameter, rawValue: unknown) {
    this.parameterDraftValues[parameter.name] = draftValueFromUnknown(rawValue);
  }

  isParameterDraftDirty(parameter: SearchBarParameter): boolean {
    return isDraftValueDirty(
      this.parameterDraftValues[parameter.name],
      parameter.modelValue,
    );
  }

  commitParameterInput(parameter: SearchBarParameter, event: Event) {
    this.commitParameterValue(
      parameter,
      (event.target as HTMLInputElement | null)?.value,
    );
  }

  commitParameterValue(parameter: SearchBarParameter, rawValue?: unknown) {
    const previousValue = parameter.modelValue;
    const type = this.getParameterType(parameter);
    const source =
      rawValue ?? this.parameterDraftValues[parameter.name] ?? previousValue;

    if (type === "text") {
      parameter.modelValue = parseTextDraftValue(source);
    } else {
      const parsed = parseNumericDraftValue(source);
      if (
        parsed === null &&
        source !== null &&
        source !== undefined &&
        source !== ""
      ) {
        this.syncParameterDraftValue(parameter);
        return;
      }
      parameter.modelValue = parsed;
    }

    this.syncParameterDraftValue(parameter);

    if (previousValue === parameter.modelValue) {
      return;
    }

    this.filterServers();
  }

  syncParameterDraftValue(parameter: SearchBarParameter) {
    if (
      parameter.modelValue === null ||
      parameter.modelValue === undefined ||
      parameter.modelValue === ""
    ) {
      delete this.parameterDraftValues[parameter.name];
      return;
    }

    this.parameterDraftValues[parameter.name] = String(parameter.modelValue);
  }

  triggerTopSearch() {
    const parameter = this.getTopSearchParameter();
    if (parameter) {
      this.commitParameterValue(
        parameter,
        this.parameterDraftValues[parameter.name] ?? parameter.modelValue,
      );
    }
    this.filterServers();
  }

  topSearchHasValue(parameter: SearchBarParameter | null | undefined): boolean {
    if (!parameter) {
      return false;
    }
    const draft = this.parameterDraftValues[parameter.name];
    if (draft !== undefined) {
      return Boolean(draft.toString().trim());
    }
    return Boolean((parameter.modelValue ?? "").toString().trim());
  }

  clearTopSearch(parameter: SearchBarParameter) {
    parameter.modelValue = "";
    delete this.parameterDraftValues[parameter.name];
    this.filterServers();
  }

  setCountryMetadata(countryMetadata: CountryMetadata[]) {
    this.countryMetadata.set(countryMetadata);
  }

  setContinentMetadata(continentMetadata: ContinentMetadata[]) {
    this.continentMetadata = continentMetadata;
  }

  setVendorRegionCollapsedVendors(
    vendorRegionCollapsedVendors: Record<string, boolean>,
  ) {
    this.vendorRegionCollapsedVendors = vendorRegionCollapsedVendors;
  }

  private applyCountries(
    countries: CountryMetadata[],
    selectedCountryIds: string[],
  ) {
    const selectedKey = [...selectedCountryIds].sort().join(",");
    if (
      !countries.length ||
      (this.lastAppliedCountries === countries &&
        this.lastSelectedCountryIdsKey === selectedKey)
    ) {
      return;
    }
    this.lastAppliedCountries = countries;
    this.lastSelectedCountryIdsKey = selectedKey;

    const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
      type: "region",
    });
    this.countryMetadata.set(
      countries
        .map((item) => {
          return {
            ...item,
            selected: selectedCountryIds.indexOf(item.country_id) !== -1,
          };
        })
        .sort(
          (a, b) =>
            regionNamesInEnglish
              .of(a.country_id)
              ?.localeCompare(regionNamesInEnglish.of(b.country_id) || "") || 0,
        ),
    );

    const previousContinents = new Map(
      this.continentMetadata.map((continent) => [
        continent.continent,
        continent,
      ]),
    );

    this.continentMetadata = [];
    this.countryMetadata().forEach((country) => {
      const continent = this.continentMetadata.find(
        (item) => item.continent === country.continent,
      );
      if (!continent) {
        const previous = previousContinents.get(country.continent);
        const hasSelectedCountry = this.countryMetadata().some(
          (item) => item.continent === country.continent && item.selected,
        );
        this.continentMetadata.push({
          continent: country.continent,
          selected: false,
          collapsed: previous ? previous.collapsed : !hasSelectedCountry,
        });
      }
    });

    this.continentMetadata.sort((a, b) =>
      a.continent.localeCompare(b.continent),
    );

    this.continentMetadata.forEach((continent) => {
      continent.selected =
        this.countryMetadata().find(
          (country) =>
            country.continent === continent.continent && !country.selected,
        ) === undefined;
    });
  }

  openSearchPrompt() {
    if (this.searchPromptDialogRef) {
      return;
    }

    this.searchPromptDialogRef = this.modalDialog.open(
      this.searchPromptModalTemplate(),
      { autoFocus: "textarea" },
    );
    this.searchPromptDialogRef.closed.subscribe(() => {
      this.searchPromptDialogRef = null;
    });
  }

  closeModal(confirm: boolean) {
    const modalResponse = this.modalResponse;
    const applied = confirm && !!modalResponse;

    if (applied) {
      const searchParameters = this.searchParameters();

      searchParameters.forEach((param) => {
        param.modelValue = param.schema.default;
      });

      Object.entries(modalResponse).forEach(([key, value]) => {
        const param = searchParameters.find((item) => item.name === key);
        if (param) {
          param.modelValue = value;
        }
      });

      this.filterServers();

      this.freetextSearchInput = "";
      this.modalResponse = null;
    }

    this.searchPromptDialogRef?.close();

    if (applied) {
      this.promptConfirmed.emit();
    }
  }

  async submitFreetextSearch() {
    this.modalSubmitted = true;
    this.modalResponse = null;

    if (this.freetextSearchInput) {
      try {
        const response: ApiResponse<SearchBarQuery> =
          await this.keeperAPI.parsePromptFor(this.AIAssistantType(), {
            text: this.freetextSearchInput,
          });
        const modalResponse = response.body ?? {};

        this.modalResponse = response.body ?? null;
        this.modalResponseStr = Object.entries(modalResponse).map(
          ([key, value]) => `${key}: ${String(value)}`,
        );
      } catch (err) {
        console.error(err);
      } finally {
        this.modalSubmitted = false;
      }
    }
  }

  showTooltip(
    event: Element | Event,
    content: string,
    autoHide = false,
    variant: TooltipVariant = "default",
  ) {
    this.tooltipContent = content;
    const tooltip = this.tooltip().nativeElement;
    this.uiTooltip.show(
      tooltip,
      event,
      {
        left: "anchor-right",
        top: "anchor-below",
      },
      variant,
    );

    if (autoHide) {
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
  }

  hideTooltip() {
    this.uiTooltip.hide(this.tooltip().nativeElement);
  }

  ngOnDestroy() {
    this.searchPromptDialogRef?.close();
    this.subscription.unsubscribe();
    this.valueChangeDebouncer.complete();
  }
}
