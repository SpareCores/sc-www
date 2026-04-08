import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Modal, ModalOptions } from "flowbite";
import { LucideAngularModule } from "lucide-angular";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { Subject, Subscription, debounceTime } from "rxjs";
import {
  CountryMetadata,
  ContinentMetadata,
  RegionMetadata,
} from "../../pages/server-listing/server-listing.component";
import { CountryIdtoNamePipe } from "../../pipes/country-idto-name.pipe";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";
import {
  Benchmark,
  BenchmarkConfig,
  Server,
} from "../../../../sdk/data-contracts";

const optionsModal: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

export type SearchBarParameter = {
  name: string;
  modelValue: unknown;
  schema: {
    category_id?: string;
    description?: string;
    default?: unknown;
    null_value?: unknown;
    filter_mode?: string;
    enum?: BenchmarkFilterOption[];
    type?: string;
    anyOf?: Array<{ type?: string }>;
    title?: string;
    unit?: string;
    step?: number;
    range_min?: number;
    range_max?: number;
    [key: string]: unknown;
  };
};

export type SearchBarCustomControl = {
  name: string;
  category_id: string;
  type: "serverAutocomplete" | "benchmarkConfigSelect" | "singleSelect";
  title: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  minCharacters?: number;
  inputValue?: string;
  selectedServer?: Server | null;
  options?: Server[];
  emptyMessage?: string;
  selectedBenchmarkConfig?: SearchBarBenchmarkConfigOption | null;
  benchmarkOptions?: SearchBarBenchmarkConfigOption[];
  benchmarkGroups?: SearchBarBenchmarkConfigGroup[];
  selectedValue?: string | null;
  selectOptions?: SearchBarCustomSelectOption[];
};

export type SearchBarCustomSelectOption = {
  value: string;
  label: string;
};

export type SearchBarBenchmarkConfigOption = BenchmarkConfig & {
  benchmarkTemplate?: Benchmark | null;
  configTitle: string;
  displayName: string;
  framework: string;
};

export type SearchBarBenchmarkConfigGroup = {
  name: string;
  options: SearchBarBenchmarkConfigOption[];
};

type SearchBarParameterType =
  | "text"
  | "country"
  | "vendor_regions"
  | "compliance_framework"
  | "vendor"
  | "storage_id"
  | "singleRadio"
  | "benchmarkTriState"
  | "range"
  | "cpuCacheRange"
  | "price"
  | "number"
  | "checkbox"
  | "enumArray";

type BenchmarkFilterOption = string | number | { key?: string; value?: string };

type CpuCacheRangeFocusLossSkip = {
  target: HTMLInputElement | null;
  timeoutId: ReturnType<typeof setTimeout>;
};

@Component({
  selector: "app-search-bar",
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CountryIdtoNamePipe,
    BenchmarkIconPipe,
  ],
  templateUrl: "./search-bar.component.html",
  styleUrl: "./search-bar.component.scss",
})
export class SearchBarComponent implements OnInit, OnChanges, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private keeperAPI = inject(KeeperAPIService);
  private toastService = inject(ToastService);

  @Input() query: any = {};
  @Input() searchParameters: any[] = [];
  @Input() extraParameters: any = {};
  @Input() filterCategories: any[] = [];
  @Input() selectedCurrency: any | null = null;
  @Input() AIAssistantType = "servers";
  @Input() useTopSearchInput = false;
  @Input() topSearchParameterName = "search";
  @Input() topSearchPlaceholder = "Search vendor or API reference";
  @Input() showParameterTitles = true;
  @Input() noTopPaddingCategoryIds: string[] = [];
  @Input() customControls: SearchBarCustomControl[] = [];

  @Output() searchChanged = new EventEmitter<any>();
  @Output() customControlChanged = new EventEmitter<{
    name: string;
    value: unknown;
  }>();

  @ViewChild("tooltipDefault") tooltip!: ElementRef;
  clipboardIcon = "clipboard";
  tooltipContent = "";

  complianceFrameworks: any[] = [];
  vendors: any[] = [];
  storageIds: any[] = [];

  countryMetadata = signal<CountryMetadata[]>([]);
  continentMetadata: ContinentMetadata[] = [];
  regionMetadata = signal<RegionMetadata[]>([]);
  selectedCountries: string[] = [];

  vendorMetadata: any[] = [];

  vendorRegionCollapsedVendors: Record<string, boolean> = {};

  readonly MAX_VENDOR_REGIONS = 3;

  // TODO: replace with real auth check once authentication is implemented
  @Input() isAuthenticated = true;

  modalSearch: any;
  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: any;
  modalResponseStr: string[] = [];
  private readonly cpuCacheRangeErrorToastId = "cpu-cache-input-error";

  cpuCacheRangeDraftValues: Record<string, string> = {};
  private cpuCacheRangeSkipNextFocusLossCommit: Record<
    string,
    CpuCacheRangeFocusLossSkip | undefined
  > = {};

  valueChangeDebouncer: Subject<number> = new Subject<number>();
  private subscription = new Subscription();
  benchmarkGroupExpansion: Record<string, Record<string, boolean>> = {};

  ngOnInit() {
    this.keeperAPI.getComplianceFrameworks().then((response: any) => {
      this.complianceFrameworks = response.body;
    });

    this.keeperAPI.getVendors().then((response: any) => {
      this.vendors = response.body;
    });

    this.keeperAPI.getStorages().then((response: any) => {
      this.storageIds = response.body;
    });

    this.subscription.add(
      this.valueChangeDebouncer.pipe(debounceTime(500)).subscribe(() => {
        let vcpu_max = this.searchParameters.find(
          (param: any) => param.name === "vcpus_max",
        );
        let vcpu_min = this.searchParameters.find(
          (param: any) => param.name === "vcpus_min",
        );
        if (
          vcpu_min?.modelValue > 0 &&
          vcpu_max?.modelValue > 0 &&
          vcpu_min.modelValue > vcpu_max.modelValue
        ) {
          vcpu_max.modelValue = vcpu_min.modelValue;
        }

        // fix min-max range values
        this.searchParameters.forEach((param: any) => {
          if (param.schema.range_min && param.schema.range_max) {
            if (param.modelValue < param.schema.range_min) {
              param.modelValue = param.schema.range_min;
            }

            if (param.modelValue > param.schema.range_max) {
              param.modelValue = param.schema.range_max;
            }
          }
        });

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

  ngOnChanges(changes: SimpleChanges) {
    for (let change of Object.keys(changes)) {
      if (change === "query") {
        this.selectedCountries = this.query.countries
          ? this.query.countries
          : [];
        this.loadCountries(this.selectedCountries);
        this.loadRegions();

        const vendorRegionValues = this.query.vendor_regions;
        if (vendorRegionValues) {
          const values: string[] = Array.isArray(vendorRegionValues)
            ? vendorRegionValues
            : [vendorRegionValues];
          [
            ...new Set(
              values.map((vr: string) => vr.split("~")[0]).filter(Boolean),
            ),
          ].forEach((vendorId) => {
            this.vendorRegionCollapsedVendors[vendorId] = false;
          });
        }

        if (this.selectedCountries?.length) {
          if (
            this.filterCategories.find(
              (column) => column.category_id === "region",
            )
          ) {
            this.filterCategories.find(
              (column) => column.category_id === "region",
            )!.collapsed = false;
          }
        }
      }
    }

    this.searchParameters?.forEach((item: SearchBarParameter) => {
      if (
        (this.getParameterType(item) === "enumArray" ||
          this.getParameterType(item) === "vendor_regions") &&
        !item.modelValue
      ) {
        item.modelValue = [];
      }

      if (
        this.getParameterType(item) === "benchmarkTriState" &&
        (!item.modelValue || typeof item.modelValue !== "object")
      ) {
        item.modelValue = {};
      }

      let value =
        this.extraParameters[item.name] ||
        this.query[item.name] ||
        item.schema.default ||
        null;

      // if type is a string try split by ,
      if (typeof this.query[item.name] === "string") {
        value =
          this.query[item.name].indexOf(",") !== -1
            ? this.query[item.name].split(",")
            : this.query[item.name];
      }

      // if only one value is selected as query parameter, it is parsed as string, so we need to convert it to array
      if (
        this.query[item.name] &&
        (this.getParameterType(item) === "enumArray" ||
          this.getParameterType(item) === "compliance_framework" ||
          this.getParameterType(item) === "vendor" ||
          this.getParameterType(item) === "vendor_regions") &&
        !Array.isArray(this.query[item.name])
      ) {
        value = [this.query[item.name]];
      }

      const queryValue = this.query[item.name];
      const hasQueryValue = Array.isArray(queryValue)
        ? queryValue.length > 0
        : Boolean(queryValue);

      if (hasQueryValue) {
        if (
          this.filterCategories.find(
            (column) => column.category_id === item.schema.category_id,
          )
        ) {
          this.filterCategories.find(
            (column) => column.category_id === item.schema.category_id,
          )!.collapsed = false;
        }
      }

      if (this.extraParameters[item.name]) {
        if (typeof this.extraParameters[item.name] === "string") {
          value =
            this.extraParameters[item.name].indexOf(",") !== -1
              ? this.extraParameters[item.name].split(",")
              : this.extraParameters[item.name];
        }

        // if only one value is selected as query parameter, it is parsed as string, so we need to convert it to array
        if (
          this.extraParameters[item.name] &&
          (this.getParameterType(item) === "enumArray" ||
            this.getParameterType(item) === "compliance_framework" ||
            this.getParameterType(item) === "vendor" ||
            this.getParameterType(item) === "vendor_regions") &&
          !Array.isArray(this.extraParameters[item.name])
        ) {
          value = [this.extraParameters[item.name]];
        }
      }

      if (value === "true" || value === "false") {
        value = value === "true";
      }

      if (this.getParameterType(item) === "benchmarkTriState") {
        value = this.normalizeBenchmarkTriStateValue(value);
      }

      if (this.getParameterType(item) === "cpuCacheRange") {
        value = this.normalizeCommittedCpuCacheRangeValue(item, value);
      }

      if (!value && item.schema.null_value) {
        value = item.schema.null_value;
      }

      item.modelValue = value;

      if (this.getParameterType(item) === "cpuCacheRange") {
        this.syncCpuCacheRangeDraftValue(item);
      }
    });
  }

  filterServers() {
    const queryObject: any = this.getQueryObject() || {};

    if (this.countryMetadata().find((country) => country.selected)) {
      queryObject.countries = [];
      this.countryMetadata().forEach((country) => {
        if (country.selected) {
          queryObject.countries.push(country.country_id);
        }
      });
    } else {
      if (queryObject.countries) delete queryObject.countries;
    }

    this.searchChanged.emit(queryObject);
  }

  getQueryObject() {
    const paramObject = (this.searchParameters as SearchBarParameter[])
      ?.filter((item) => !this.isParameterDisabled(item.name))
      .map((param) => {
        if (this.getParameterType(param) === "singleRadio") {
          return param.modelValue ? { [param.name]: param.modelValue } : {};
        }

        if (this.getParameterType(param) === "benchmarkTriState") {
          const benchmarkTriStateValue = this.normalizeBenchmarkTriStateValue(
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
      .reduce(
        (acc, curr) => {
          return { ...acc, ...curr };
        },
        {} as Record<string, unknown>,
      );

    return paramObject || {};
  }

  getComplianceFrameworkName(id: BenchmarkFilterOption) {
    const normalizedId = this.normalizeOptionId(id);
    return (
      this.complianceFrameworks.find(
        (item) => item.compliance_framework_id === normalizedId,
      )?.abbreviation || normalizedId
    );
  }

  getVendorName(id: BenchmarkFilterOption) {
    const normalizedId = this.normalizeOptionId(id);
    return (
      this.vendors.find((item) => item.vendor_id === normalizedId)?.name ||
      normalizedId
    );
  }

  getStorageName(id: BenchmarkFilterOption) {
    const normalizedId = this.normalizeOptionId(id);
    return (
      this.storageIds.find((item) => item.storage_id === normalizedId)?.name ||
      normalizedId
    );
  }

  getStep(parameter: SearchBarParameter) {
    return parameter.schema.step || 1;
  }

  toggleCategory(category: any) {
    category.collapsed = !category.collapsed;
  }

  getParametersByCategory(category: string) {
    if (!this.searchParameters) return [];

    return (this.searchParameters as SearchBarParameter[])?.filter((param) => {
      if (param.schema?.category_id !== category) {
        return false;
      }

      if (
        this.useTopSearchInput &&
        param.name === this.topSearchParameterName
      ) {
        return false;
      }

      return true;
    });
  }

  getCustomControlsByCategory(category: string) {
    return (this.customControls || []).filter(
      (control) => control.category_id === category,
    );
  }

  getTopSearchParameter() {
    return (this.searchParameters as SearchBarParameter[])?.find(
      (param) => param.name === this.topSearchParameterName,
    );
  }

  isParameterDisabled(parameterName: string): boolean {
    return this.extraParameters?.[parameterName] != null;
  }

  getCustomControlMinCharacters(control: SearchBarCustomControl): number {
    return control.minCharacters || 3;
  }

  customControlHasEnoughInput(control: SearchBarCustomControl): boolean {
    return (
      (control.inputValue || "").trim().length >=
      this.getCustomControlMinCharacters(control)
    );
  }

  onCustomControlInput(control: SearchBarCustomControl, value: string) {
    this.customControlChanged.emit({
      name: control.name,
      value: { inputValue: value },
    });
  }

  isBenchmarkGroupExpanded(
    control: SearchBarCustomControl,
    groupName: string,
  ): boolean {
    const controlExpansion = this.benchmarkGroupExpansion[control.name] || {};
    return controlExpansion[groupName] ?? true;
  }

  toggleBenchmarkGroup(control: SearchBarCustomControl, groupName: string) {
    if (!this.benchmarkGroupExpansion[control.name]) {
      this.benchmarkGroupExpansion[control.name] = {};
    }

    const current =
      this.benchmarkGroupExpansion[control.name][groupName] ?? true;
    this.benchmarkGroupExpansion[control.name][groupName] = !current;
  }

  selectServerAutocompleteOption(
    control: SearchBarCustomControl,
    server: Server,
  ) {
    this.customControlChanged.emit({
      name: control.name,
      value: {
        inputValue: `${server.vendor_id} ${server.api_reference}`,
        selectedServer: server,
      },
    });
  }

  clearServerAutocompleteSelection(control: SearchBarCustomControl) {
    this.customControlChanged.emit({
      name: control.name,
      value: { inputValue: "", selectedServer: null },
    });
  }

  selectBenchmarkConfigOption(
    control: SearchBarCustomControl,
    benchmarkOption: SearchBarBenchmarkConfigOption,
  ) {
    this.customControlChanged.emit({
      name: control.name,
      value: {
        inputValue: benchmarkOption.displayName,
        selectedBenchmarkConfig: benchmarkOption,
      },
    });
  }

  clearBenchmarkConfigSelection(control: SearchBarCustomControl) {
    this.customControlChanged.emit({
      name: control.name,
      value: { inputValue: "", selectedBenchmarkConfig: null },
    });
  }

  selectCustomControlOption(
    control: SearchBarCustomControl,
    option: SearchBarCustomSelectOption,
  ) {
    this.customControlChanged.emit({
      name: control.name,
      value: { selectedValue: option.value },
    });
  }

  formatBenchmarkConfigDescription(
    benchmarkOption: SearchBarBenchmarkConfigOption,
  ): string {
    const descriptionParts = [benchmarkOption.framework];

    if (benchmarkOption.configTitle) {
      descriptionParts.push(benchmarkOption.configTitle);
    }

    if (benchmarkOption.benchmarkTemplate?.unit) {
      descriptionParts.push(String(benchmarkOption.benchmarkTemplate.unit));
    }

    return descriptionParts.filter(Boolean).join(" | ");
  }

  formatServerAutocompleteDescription(server: Server): string {
    const secondaryParts: string[] = [];

    if (server.vcpus) {
      secondaryParts.push(`${server.vcpus} vCPU`);
    }

    if (server.memory_amount) {
      secondaryParts.push(
        `${(server.memory_amount / 1024).toFixed(1)} GiB RAM`,
      );
    }

    if (server.storage_size) {
      secondaryParts.push(`${server.storage_size} GB storage`);
    }

    if (server.gpu_memory_total) {
      secondaryParts.push(
        `${(server.gpu_memory_total / 1024).toFixed(1)} GiB GPU`,
      );
    }

    return secondaryParts.join(" | ");
  }

  selectedCountriesCount = computed(
    () => this.countryMetadata().filter((c) => c.selected).length,
  );

  isCountryCheckboxDisabled(country: CountryMetadata): boolean {
    if (this.isAuthenticated) return false;
    return !country.selected && this.selectedCountriesCount() >= 1;
  }

  isContinentCheckboxDisabled(
    parameter: SearchBarParameter,
    continent: ContinentMetadata,
  ): boolean {
    if (this.isParameterDisabled(parameter.name)) return true;
    if (this.isAuthenticated) return false;
    return !continent.selected && this.selectedCountriesCount() >= 1;
  }

  getParameterType(parameter: SearchBarParameter): SearchBarParameterType {
    const type =
      parameter.schema.type ||
      parameter.schema.anyOf?.find((item) => item.type !== "null")?.type ||
      "text";
    const name = parameter.name;

    if (name === "countries") {
      return "country";
    }

    if (name === "vendor_regions") {
      return "vendor_regions";
    }

    if (name === "compliance_framework") {
      return "compliance_framework";
    }

    if (name === "vendor") {
      return "vendor";
    }

    if (name === "storage_id") {
      return "storage_id";
    }

    if (
      parameter.schema.filter_mode === "single_radio" &&
      parameter.schema.enum
    ) {
      return "singleRadio";
    }

    if (
      parameter.schema.filter_mode === "tri_state_boolean" &&
      type === "array" &&
      parameter.schema.enum
    ) {
      return "benchmarkTriState";
    }

    if (
      (type === "integer" || type === "number") &&
      (parameter.schema.range_min || parameter.schema.range_min === 0) &&
      parameter.schema.range_max
    ) {
      return "range";
    }

    if (this.isCpuCacheRangeParameter(parameter, type)) {
      return "cpuCacheRange";
    }

    if (type === "integer" || type === "number") {
      if (parameter.schema.category_id === "price") return "price";
      else return "number";
    }

    if (type === "boolean") {
      return "checkbox";
    }

    if (type === "array" && parameter.schema.enum) {
      return "enumArray";
    }

    return "text";
  }

  benchmarkFilterOptionKey(valueOrObj: BenchmarkFilterOption) {
    if (typeof valueOrObj === "string" || typeof valueOrObj === "number") {
      return valueOrObj;
    }

    return valueOrObj?.key;
  }

  benchmarkFilterOptionLabel(valueOrObj: BenchmarkFilterOption) {
    if (typeof valueOrObj === "string" || typeof valueOrObj === "number") {
      return String(valueOrObj);
    }

    return valueOrObj?.value || valueOrObj?.key || "";
  }

  benchmarkFilterSelection(
    param: SearchBarParameter,
    valueOrObj: BenchmarkFilterOption,
  ): "all" | "yes" | "no" {
    const key = this.benchmarkFilterOptionKey(valueOrObj);

    if (!key) {
      return "all";
    }

    const modelValue = this.normalizeBenchmarkTriStateValue(param?.modelValue);
    const selection = modelValue[key];

    if (selection === "yes" || selection === "no") {
      return selection;
    }

    return "all";
  }

  setBenchmarkFilterSelection(
    param: SearchBarParameter,
    valueOrObj: BenchmarkFilterOption,
    selection: "all" | "yes" | "no",
  ) {
    const key = this.benchmarkFilterOptionKey(valueOrObj);

    if (!key) {
      return;
    }

    const next = {
      ...this.normalizeBenchmarkTriStateValue(param?.modelValue),
    };

    if (selection === "all") {
      delete next[key];
    } else {
      next[key] = selection;
    }

    param.modelValue = next;
    this.filterServers();
  }

  private normalizeBenchmarkTriStateValue(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {} as Record<string, "all" | "yes" | "no">;
    }

    const normalized: Record<string, "all" | "yes" | "no"> = {};

    Object.entries(value as Record<string, unknown>).forEach(([key, raw]) => {
      if (raw === "yes" || raw === true || raw === "true") {
        normalized[key] = "yes";
        return;
      }

      if (raw === "no" || raw === false || raw === "false") {
        normalized[key] = "no";
      }
    });

    return normalized;
  }

  valueChanged() {
    this.valueChangeDebouncer.next(0);
  }

  getCpuCacheRangeStops(parameter: SearchBarParameter): number[] {
    const values = (parameter.schema.enum || [])
      .map((value) => {
        if (typeof value === "number") {
          return value;
        }

        const numericValue = Number(
          typeof value === "string" ? value : value?.key || value?.value,
        );

        return Number.isFinite(numericValue) ? numericValue : null;
      })
      .filter((value): value is number => value !== null);

    return [...new Set(values)].sort((left, right) => left - right);
  }

  getCpuCacheRangeMaxIndex(parameter: SearchBarParameter): number {
    return Math.max(this.getCpuCacheRangeStops(parameter).length - 1, 0);
  }

  getCpuCacheRangeIndex(parameter: SearchBarParameter): number {
    const values = this.getCpuCacheRangeStops(parameter);

    if (!values.length) {
      return 0;
    }

    const normalizedValue = this.normalizeCommittedCpuCacheRangeValue(
      parameter,
      parameter.modelValue,
    );

    if (normalizedValue === null) {
      return 0;
    }

    return values.reduce(
      (closestIndex, candidate, index) =>
        Math.abs(candidate - normalizedValue) <
        Math.abs(values[closestIndex] - normalizedValue)
          ? index
          : closestIndex,
      0,
    );
  }

  setCpuCacheRangeIndex(parameter: SearchBarParameter, rawIndex: unknown) {
    const values = this.getCpuCacheRangeStops(parameter);

    if (!values.length) {
      return;
    }

    const numericIndex = Number(rawIndex);
    const boundedIndex = Number.isFinite(numericIndex)
      ? Math.min(Math.max(Math.round(numericIndex), 0), values.length - 1)
      : 0;

    parameter.modelValue = values[boundedIndex];
    this.syncCpuCacheRangeDraftValue(parameter);
    this.toastService.removeToast(this.cpuCacheRangeErrorToastId);
    this.valueChanged();
  }

  getCpuCacheRangeInputValue(
    parameter: SearchBarParameter,
  ): string | number | null {
    if (this.cpuCacheRangeDraftValues[parameter.name] !== undefined) {
      return this.cpuCacheRangeDraftValues[parameter.name];
    }

    return typeof parameter.modelValue === "number"
      ? parameter.modelValue
      : null;
  }

  getCpuCacheRangeMin(parameter: SearchBarParameter): number | null {
    const values = this.getCpuCacheRangeStops(parameter);
    return values.length ? values[0] : null;
  }

  getCpuCacheRangeMax(parameter: SearchBarParameter): number | null {
    const values = this.getCpuCacheRangeStops(parameter);
    return values.length ? values[values.length - 1] : null;
  }

  setCpuCacheRangeDraftValue(parameter: SearchBarParameter, rawValue: unknown) {
    this.cpuCacheRangeDraftValues[parameter.name] =
      rawValue === null || rawValue === undefined ? "" : String(rawValue);
  }

  setCpuCacheRangeValue(parameter: SearchBarParameter, rawValue: unknown) {
    this.setCpuCacheRangeDraftValue(parameter, rawValue);
  }

  commitCpuCacheRangeInput(parameter: SearchBarParameter, event: Event) {
    this.commitCpuCacheRangeValue(
      parameter,
      (event.target as HTMLInputElement | null)?.value,
    );
  }

  commitCpuCacheRangeFromEnter(parameter: SearchBarParameter, event: Event) {
    const target = this.getCpuCacheRangeInputElement(event);
    const existingSkip =
      this.cpuCacheRangeSkipNextFocusLossCommit[parameter.name];

    if (existingSkip) {
      clearTimeout(existingSkip.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      delete this.cpuCacheRangeSkipNextFocusLossCommit[parameter.name];
    }, 250);

    this.cpuCacheRangeSkipNextFocusLossCommit[parameter.name] = {
      target,
      timeoutId,
    };
    this.commitCpuCacheRangeInput(parameter, event);
  }

  commitCpuCacheRangeAfterFocusLoss(
    parameter: SearchBarParameter,
    event: Event,
  ) {
    const pendingSkip =
      this.cpuCacheRangeSkipNextFocusLossCommit[parameter.name];
    const target = this.getCpuCacheRangeInputElement(event);

    if (pendingSkip && pendingSkip.target === target) {
      clearTimeout(pendingSkip.timeoutId);
      delete this.cpuCacheRangeSkipNextFocusLossCommit[parameter.name];
      return;
    }

    this.commitCpuCacheRangeInput(parameter, event);
  }

  commitCpuCacheRangeValue(parameter: SearchBarParameter, rawValue?: unknown) {
    const previousValue = parameter.modelValue;
    const normalizedValue = this.normalizeCommittedCpuCacheRangeValue(
      parameter,
      rawValue ?? this.cpuCacheRangeDraftValues[parameter.name],
    );

    if (
      normalizedValue === null &&
      rawValue !== null &&
      rawValue !== undefined &&
      rawValue !== ""
    ) {
      this.syncCpuCacheRangeDraftValue(parameter);
      this.showCpuCacheRangeValidationError(parameter);
      return;
    }

    parameter.modelValue = normalizedValue;
    this.syncCpuCacheRangeDraftValue(parameter);
    this.toastService.removeToast(this.cpuCacheRangeErrorToastId);

    if (previousValue === parameter.modelValue) {
      return;
    }

    this.valueChanged();
  }

  getCpuCacheRangeInputStyle(parameter: SearchBarParameter) {
    const value = this.getCpuCacheRangeInputValue(parameter);

    if (value === null || value === "") {
      return { "max-width": "3ch" };
    }

    return { "max-width": `${value.toString().length + 2}ch` };
  }

  getCpuCacheRangeLabelValues(parameter: SearchBarParameter): number[] {
    const values = this.getCpuCacheRangeStops(parameter);

    if (values.length <= 6) {
      return values;
    }

    const maxIndex = values.length - 1;
    const step = Math.max(1, Math.ceil(maxIndex / 4));
    const labelIndexes = new Set<number>([0, maxIndex]);

    for (let index = step; index < maxIndex; index += step) {
      labelIndexes.add(index);
    }

    return [...labelIndexes]
      .sort((left, right) => left - right)
      .map((index) => values[index]);
  }

  getCpuCacheRangeLabelPosition(
    parameter: SearchBarParameter,
    value: number,
  ): number {
    const values = this.getCpuCacheRangeStops(parameter);
    const maxIndex = values.length - 1;

    if (maxIndex <= 0) {
      return 0;
    }

    return (Math.max(values.indexOf(value), 0) / maxIndex) * 100;
  }

  triggerTopSearch() {
    this.filterServers();
  }

  topSearchHasValue(parameter: SearchBarParameter | null | undefined): boolean {
    return Boolean((parameter?.modelValue ?? "").toString().trim());
  }

  clearTopSearch(parameter: SearchBarParameter) {
    parameter.modelValue = "";
    this.filterServers();
  }

  isEnumSelected(param: SearchBarParameter, valueOrObj: BenchmarkFilterOption) {
    const value =
      typeof valueOrObj === "string" || typeof valueOrObj === "number"
        ? valueOrObj
        : valueOrObj.key;

    if (value === undefined) {
      return false;
    }

    const normalizedValue = this.normalizeOptionId(value);

    return (
      Array.isArray(param.modelValue) &&
      param.modelValue
        .map((selectedValue) =>
          this.normalizeOptionId(selectedValue as BenchmarkFilterOption),
        )
        .includes(normalizedValue)
    );
  }

  selectEnumItem(param: SearchBarParameter, valueOrObj: BenchmarkFilterOption) {
    if (!Array.isArray(param.modelValue)) {
      param.modelValue = [];
    }

    const selectedValues = param.modelValue as BenchmarkFilterOption[];

    const value =
      typeof valueOrObj === "string" || typeof valueOrObj === "number"
        ? valueOrObj
        : valueOrObj.key;

    if (value === undefined) {
      return;
    }

    const normalizedValue = this.normalizeOptionId(value);
    const normalizedValues = selectedValues.map((selectedValue) =>
      this.normalizeOptionId(selectedValue),
    );
    const index = normalizedValues.indexOf(normalizedValue);

    if (index !== -1) {
      param.modelValue = selectedValues.filter(
        (_, selectedIndex) => selectedIndex !== index,
      );
    } else {
      param.modelValue = [...selectedValues, value];
    }

    this.valueChanged();
  }

  loadCountries(selectedCountries: string | string[] | undefined) {
    let selectedCountryIds = selectedCountries ? selectedCountries : [];

    if (typeof selectedCountries === "string") {
      selectedCountryIds = selectedCountries.split(",");
    }

    this.keeperAPI.getCountries().then((response) => {
      if (response?.body) {
        const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
          type: "region",
        });
        this.countryMetadata.set(
          response.body
            .map((item: any) => {
              return {
                ...item,
                selected: selectedCountryIds.indexOf(item.country_id) !== -1,
              };
            })
            .sort(
              (a: any, b: any) =>
                regionNamesInEnglish
                  .of(a.country_id)
                  ?.localeCompare(
                    regionNamesInEnglish.of(b.country_id) || "",
                  ) || 0,
            ),
        );

        this.continentMetadata = [];
        this.countryMetadata().forEach((country) => {
          const continent = this.continentMetadata.find(
            (item) => item.continent === country.continent,
          );
          if (!continent) {
            this.continentMetadata.push({
              continent: country.continent,
              selected: false,
              collapsed: true,
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
          continent.collapsed =
            this.countryMetadata().find(
              (country) =>
                country.continent === continent.continent && country.selected,
            ) === undefined;
        });
      }
    });
  }

  countriesByContinent(continent: string) {
    return this.countryMetadata().filter(
      (country) => country.continent === continent,
    );
  }

  selectContinent(continent: ContinentMetadata) {
    const maxCountries = this.isAuthenticated ? Infinity : 1;
    const shouldSelect = !continent.selected;

    if (!shouldSelect) {
      this.countryMetadata.update((countries) =>
        countries.map((country) =>
          country.continent === continent.continent
            ? { ...country, selected: false }
            : country,
        ),
      );
    } else {
      let remainingSlots = maxCountries - this.selectedCountriesCount();
      if (remainingSlots <= 0) {
        return;
      }

      this.countryMetadata.update((countries) =>
        countries.map((country) => {
          if (country.continent !== continent.continent) {
            return country;
          }

          if (country.selected) {
            return country;
          }

          if (remainingSlots > 0) {
            remainingSlots--;
            return { ...country, selected: true };
          }

          return country;
        }),
      );
    }

    const countriesInContinent = this.countryMetadata().filter(
      (country) => country.continent === continent.continent,
    );
    continent.selected = countriesInContinent.every(
      (country) => country.selected,
    );
    continent.collapsed = countriesInContinent.every(
      (country) => !country.selected,
    );

    this.valueChanged();
  }

  toggleCountry(country: CountryMetadata) {
    if (
      !this.isAuthenticated &&
      !country.selected &&
      this.selectedCountriesCount() >= 1
    ) {
      return;
    }

    this.countryMetadata.update((countries) =>
      countries.map((c) =>
        c === country ? { ...c, selected: !c.selected } : c,
      ),
    );

    this.continentMetadata.forEach((continent) => {
      const countriesInContinent = this.countryMetadata().filter(
        (c) => c.continent === continent.continent,
      );

      continent.selected = countriesInContinent.every(
        (country) => country.selected,
      );
      continent.collapsed = countriesInContinent.every(
        (country) => !country.selected,
      );
    });

    this.filterServers();
  }

  collapseItem(continent: ContinentMetadata) {
    continent.collapsed = !continent.collapsed;
  }

  loadRegions() {
    Promise.all([
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions(),
    ]).then((responses) => {
      if (responses[0]?.body) {
        this.vendorMetadata = responses[0].body;
      }
      if (responses[1]?.body) {
        this.regionMetadata.set(
          responses[1].body.sort((a: any, b: any) =>
            a.name.localeCompare(b.name),
          ),
        );
      }
    });
  }

  openSearchPrompt() {
    this.modalSearch?.show();
  }

  closeModal(confirm: boolean) {
    if (confirm) {
      this.searchParameters.forEach((param: any) => {
        param.modelValue = param.schema.default;
      });

      Object.keys(this.modalResponse).forEach((key) => {
        const param = this.searchParameters.find(
          (param: any) => param.name === key,
        );
        if (param) {
          param.modelValue = this.modalResponse[key];
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
        let response = await this.keeperAPI.parsePromptFor(
          this.AIAssistantType,
          { text: this.freetextSearchInput },
        );

        this.modalResponse = response.body;
        this.modalResponseStr = [];
        Object.keys(response.body).forEach((key) => {
          this.modalResponseStr.push(key + ": " + response.body[key]);
        });
      } catch (err) {
        console.error(err);
      } finally {
        this.modalSubmitted = false;
      }
    }
  }

  showTooltip(el: any, content: string, autoHide = false) {
    this.tooltipContent = content;
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.left = `${el.target.getBoundingClientRect().right + 5}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().top - 5}px`;

    tooltip.style.display = "block";
    tooltip.style.opacity = "1";

    if (autoHide) {
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
  }

  getInputStyle(parameter: SearchBarParameter) {
    if (!parameter.modelValue) {
      return { "max-width": "3ch" };
    }

    return { "max-width": `${parameter.modelValue.toString().length + 2}ch` };
  }

  ngOnDestroy() {
    Object.values(this.cpuCacheRangeSkipNextFocusLossCommit).forEach(
      (pendingSkip) => {
        if (pendingSkip) {
          clearTimeout(pendingSkip.timeoutId);
        }
      },
    );

    this.subscription.unsubscribe();
    this.valueChangeDebouncer.complete();
  }

  private getCpuCacheRangeInputElement(event: Event): HTMLInputElement | null {
    const target = event.target;

    return target instanceof HTMLInputElement ? target : null;
  }

  private normalizeOptionId(value: BenchmarkFilterOption): string {
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    return value?.key || value?.value || "";
  }

  private isCpuCacheRangeParameter(
    parameter: SearchBarParameter,
    type: string,
  ): boolean {
    if (parameter?.schema?.category_id !== "cpu_cache") {
      return false;
    }

    if (type !== "integer" && type !== "number") {
      return false;
    }

    return this.getCpuCacheRangeStops(parameter).length > 0;
  }

  private normalizeCommittedCpuCacheRangeValue(
    parameter: SearchBarParameter,
    rawValue: unknown,
  ): number | null {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return null;
    }

    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue)) {
      return null;
    }

    const values = this.getCpuCacheRangeStops(parameter);

    if (!values.length) {
      return numericValue;
    }

    const min = values[0];
    const max = values[values.length - 1];

    if (numericValue < min || numericValue > max) {
      return null;
    }

    return numericValue;
  }

  private syncCpuCacheRangeDraftValue(parameter: SearchBarParameter) {
    if (parameter.modelValue === null || parameter.modelValue === undefined) {
      delete this.cpuCacheRangeDraftValues[parameter.name];
      return;
    }

    this.cpuCacheRangeDraftValues[parameter.name] = String(
      parameter.modelValue,
    );
  }

  private showCpuCacheRangeValidationError(parameter: SearchBarParameter) {
    const min = this.getCpuCacheRangeMin(parameter);
    const max = this.getCpuCacheRangeMax(parameter);
    const title =
      typeof parameter.schema.title === "string"
        ? parameter.schema.title
        : "Invalid CPU cache value";
    const body =
      min !== null && max !== null
        ? `Enter a whole number between ${min} and ${max}${parameter.schema.unit ? ` ${parameter.schema.unit}` : ""}.`
        : "Enter a valid whole number.";

    this.toastService.show({
      title,
      body,
      type: "error",
      id: this.cpuCacheRangeErrorToastId,
      duration: 4000,
    });
  }

  getVendorRegionVendorIds(parameter: SearchBarParameter): string[] {
    const vendors: string[] = [];
    (parameter.schema.enum || []).forEach((value) => {
      const vendorId = (typeof value === "string" ? value : "").split("~")[0];
      if (vendorId && !vendors.includes(vendorId)) {
        vendors.push(vendorId);
      }
    });
    return vendors.sort((a, b) =>
      this.getVendorDisplayNameById(a).localeCompare(
        this.getVendorDisplayNameById(b),
      ),
    );
  }

  getVendorRegionsForVendor(
    parameter: SearchBarParameter,
    vendorId: string,
  ): string[] {
    return (parameter.schema.enum || [])
      .filter(
        (value): value is string =>
          typeof value === "string" && value.startsWith(vendorId + "~"),
      )
      .sort((a, b) =>
        this.getVendorRegionDisplayName(a).localeCompare(
          this.getVendorRegionDisplayName(b),
        ),
      );
  }

  isVendorRegionSelected(
    parameter: SearchBarParameter,
    vendorRegion: string,
  ): boolean {
    return (
      Array.isArray(parameter.modelValue) &&
      (parameter.modelValue as string[]).includes(vendorRegion)
    );
  }

  areAllVendorRegionsSelected(
    parameter: SearchBarParameter,
    vendorId: string,
  ): boolean {
    const vendorRegions = this.getVendorRegionsForVendor(parameter, vendorId);
    return (
      vendorRegions.length > 0 &&
      vendorRegions.every((vr) => this.isVendorRegionSelected(parameter, vr))
    );
  }

  selectedVendorRegionsCount(parameter: SearchBarParameter): number {
    return Array.isArray(parameter.modelValue)
      ? (parameter.modelValue as string[]).length
      : 0;
  }

  isVendorRegionCheckboxDisabled(
    parameter: SearchBarParameter,
    vendorRegion: string,
  ): boolean {
    if (this.isParameterDisabled(parameter.name)) return true;
    if (this.isAuthenticated) return false;
    return (
      !this.isVendorRegionSelected(parameter, vendorRegion) &&
      this.selectedVendorRegionsCount(parameter) >= this.MAX_VENDOR_REGIONS
    );
  }

  isVendorSelectAllDisabled(
    parameter: SearchBarParameter,
    vendorId: string,
  ): boolean {
    if (this.isParameterDisabled(parameter.name)) return true;
    if (this.isAuthenticated) return false;
    // Disable if all would already be checked, or we're at the limit and nothing to deselect
    if (this.areAllVendorRegionsSelected(parameter, vendorId)) return false;
    return (
      this.selectedVendorRegionsCount(parameter) >= this.MAX_VENDOR_REGIONS
    );
  }

  toggleVendorRegion(parameter: SearchBarParameter, vendorRegion: string) {
    if (!Array.isArray(parameter.modelValue)) {
      parameter.modelValue = [];
    }
    const values = parameter.modelValue as string[];
    if (values.includes(vendorRegion)) {
      parameter.modelValue = values.filter((v) => v !== vendorRegion);
    } else {
      if (!this.isAuthenticated && values.length >= this.MAX_VENDOR_REGIONS)
        return;
      parameter.modelValue = [...values, vendorRegion];
    }
    this.valueChanged();
  }

  toggleAllVendorRegions(parameter: SearchBarParameter, vendorId: string) {
    if (!Array.isArray(parameter.modelValue)) {
      parameter.modelValue = [];
    }
    const vendorRegions = this.getVendorRegionsForVendor(parameter, vendorId);
    if (this.areAllVendorRegionsSelected(parameter, vendorId)) {
      parameter.modelValue = (parameter.modelValue as string[]).filter(
        (v) => !vendorRegions.includes(v),
      );
    } else {
      const newValues = vendorRegions.filter(
        (vr) => !this.isVendorRegionSelected(parameter, vr),
      );
      const remaining = this.isAuthenticated
        ? newValues
        : newValues.slice(
            0,
            Math.max(
              0,
              this.MAX_VENDOR_REGIONS -
                this.selectedVendorRegionsCount(parameter),
            ),
          );
      parameter.modelValue = [
        ...(parameter.modelValue as string[]),
        ...remaining,
      ];
    }
    this.valueChanged();
  }

  getVendorRegionDisplayName(vendorRegion: string): string {
    const tilde = vendorRegion.indexOf("~");
    if (tilde === -1) return vendorRegion;
    const vendorId = vendorRegion.substring(0, tilde);
    const regionId = vendorRegion.substring(tilde + 1);
    const region = this.regionMetadata().find(
      (r) => r.vendor_id === vendorId && r.region_id === regionId,
    );
    return region?.name || regionId;
  }

  getVendorDisplayNameById(vendorId: string): string {
    return (
      this.vendorMetadata.find((v) => v.vendor_id === vendorId)?.name ||
      vendorId
    );
  }

  isVendorRegionGreenEnergy(vendorRegion: string): boolean {
    const tilde = vendorRegion.indexOf("~");
    if (tilde === -1) return false;
    const vendorId = vendorRegion.substring(0, tilde);
    const regionId = vendorRegion.substring(tilde + 1);
    return (
      this.regionMetadata().find(
        (r) => r.vendor_id === vendorId && r.region_id === regionId,
      )?.green_energy || false
    );
  }

  toggleVendorRegionCollapse(vendorId: string) {
    const current = this.vendorRegionCollapsedVendors[vendorId] !== false;
    this.vendorRegionCollapsedVendors[vendorId] = !current;
  }

  isVendorRegionCollapsed(vendorId: string): boolean {
    return this.vendorRegionCollapsedVendors[vendorId] !== false;
  }
}
