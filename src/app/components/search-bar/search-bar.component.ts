import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Modal, ModalOptions } from "flowbite";
import { LucideDynamicIcon, LucideChevronDown } from "@lucide/angular";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { Subject, Subscription, debounceTime } from "rxjs";
import { SearchBarCustomControlsComponent } from "./search-bar-custom-controls.component";
import { SearchBarGeoFiltersComponent } from "./search-bar-geo-filters.component";
import { SearchBarParameterFieldComponent } from "./search-bar-parameter-field.component";
import {
  draftValueFromUnknown,
  getParameterType as getSearchBarParameterType,
  normalizeBenchmarkTriStateValue,
  normalizeCommittedCpuCacheRangeValue,
  parseNumericDraftValue,
  parseTextDraftValue,
} from "./search-bar.utils";
import type {
  ComplianceFrameworkMetadata,
  ContinentMetadata,
  CountryMetadata,
  RegionMetadata,
  SearchBarCustomControl,
  SearchBarCustomControlChange,
  SearchBarFilterCategory,
  SearchBarCurrency,
  SearchBarParameter,
  SearchBarParameterPlacement,
  SearchBarParameterType,
  SearchBarQuery,
  StorageMetadata,
  VendorMetadata,
} from "./search-bar.types";

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
} from "./search-bar.types";

const optionsModal: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

type ApiResponse<T> = {
  body?: T;
};

@Component({
  selector: "app-search-bar",
  imports: [
    CommonModule,
    FormsModule,
    LucideDynamicIcon,
    LucideChevronDown,
    SearchBarCustomControlsComponent,
    SearchBarGeoFiltersComponent,
    SearchBarParameterFieldComponent,
  ],
  templateUrl: "./search-bar.component.html",
  styleUrl: "./search-bar.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class SearchBarComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private keeperAPI = inject(KeeperAPIService);
  private uiTooltip = inject(UiTooltipService);

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
  showParameterTitles = input(true);
  noTopPaddingCategoryIds = input<string[]>([]);
  customControls = input<SearchBarCustomControl[]>([]);
  parameterPlacements = input<SearchBarParameterPlacement[]>([]);

  searchChanged = output<SearchBarQuery>();
  customControlChanged = output<SearchBarCustomControlChange>();

  tooltip = viewChild.required<ElementRef<HTMLElement>>("tooltipDefault");
  customControlsComponents = viewChildren(SearchBarCustomControlsComponent);
  tooltipContent = "";

  complianceFrameworks: ComplianceFrameworkMetadata[] = [];
  vendors: VendorMetadata[] = [];
  storageIds: StorageMetadata[] = [];

  countryMetadata = signal<CountryMetadata[]>([]);
  continentMetadata: ContinentMetadata[] = [];
  regionMetadata = signal<RegionMetadata[]>([]);

  vendorRegionCollapsedVendors: Record<string, boolean> = {};

  isAuthenticated = input(true);

  modalSearch: Modal | undefined;
  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: SearchBarQuery | null = null;
  modalResponseStr: string[] = [];

  private parameterDraftValues: Record<string, string> = {};

  private readonly valueChangeDebouncer = new Subject<void>();
  private readonly subscription = new Subscription();

  constructor() {
    effect(() => {
      this.syncQueryInput(this.query());
    });

    effect(() => {
      this.syncSearchParameters(
        this.searchParameters(),
        this.query(),
        this.extraParameters(),
        this.filterCategories(),
      );
    });

    effect(() => {
      this.syncVendorRegionSelectionVisibility();
    });
  }

  ngOnInit() {
    this.keeperAPI
      .getComplianceFrameworks()
      .then((response: ApiResponse<ComplianceFrameworkMetadata[]>) => {
        this.complianceFrameworks = response.body ?? [];
      });

    this.keeperAPI
      .getStorages()
      .then((response: ApiResponse<StorageMetadata[]>) => {
        this.storageIds = response.body ?? [];
      });

    this.loadRegions();

    this.subscription.add(
      this.valueChangeDebouncer.pipe(debounceTime(500)).subscribe(() => {
        this.filterServers();
      }),
    );

    if (isPlatformBrowser(this.platformId)) {
      const targetElModal = document.getElementById("search-prompt-modal");

      this.modalSearch = new Modal(targetElModal, optionsModal, {
        id: "search-prompt-modal",
        override: true,
      });
    }
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
    this.loadCountries(selectedCountries);

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
        (parameterType === "enumArray" || parameterType === "vendor_regions") &&
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
        extraParameters[item.name] ||
        query[item.name] ||
        item.schema.default ||
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
        : Boolean(effectiveValue);

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

      if (!value && item.schema.null_value) {
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

    const queryObject = this.getQueryObject();
    const selectedCountryIds = this.countryMetadata()
      .filter((country) => country.selected)
      .map((country) => country.country_id);

    if (selectedCountryIds.length) {
      queryObject.countries = selectedCountryIds;
    } else {
      delete queryObject.countries;
    }

    this.searchChanged.emit(queryObject);
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
    this.valueChangeDebouncer.next();
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

  private loadCountries(selectedCountryIds: string[]) {
    this.keeperAPI
      .getCountries()
      .then((response: ApiResponse<CountryMetadata[]>) => {
        if (!response.body) {
          return;
        }

        const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
          type: "region",
        });
        this.countryMetadata.set(
          response.body
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
                  ?.localeCompare(
                    regionNamesInEnglish.of(b.country_id) || "",
                  ) || 0,
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
      });
  }

  private loadRegions() {
    const vendorsRequest: Promise<ApiResponse<VendorMetadata[]>> =
      this.keeperAPI.getVendors();
    const regionsRequest: Promise<ApiResponse<RegionMetadata[]>> =
      this.keeperAPI.getRegions();

    Promise.all([vendorsRequest, regionsRequest]).then(
      ([vendorResponse, regionResponse]) => {
        if (vendorResponse.body) {
          this.vendors = vendorResponse.body;
        }
        if (regionResponse.body) {
          this.regionMetadata.set(
            regionResponse.body.sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
      },
    );
  }

  openSearchPrompt() {
    this.modalSearch?.show();
  }

  closeModal(confirm: boolean) {
    const modalResponse = this.modalResponse;

    if (confirm && modalResponse) {
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

    this.modalSearch?.hide();
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
    event: MouseEvent | FocusEvent,
    content: string,
    autoHide = false,
  ) {
    this.tooltipContent = content;
    const tooltip = this.tooltip().nativeElement;
    this.uiTooltip.show(tooltip, event, {
      left: "anchor-right",
      top: "anchor-below",
    });

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
    this.subscription.unsubscribe();
    this.valueChangeDebouncer.complete();
  }
}
