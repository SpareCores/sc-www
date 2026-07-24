import { CommonModule } from "@angular/common";
import {
  Component,
  DoCheck,
  OnDestroy,
  inject,
  input,
  output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LucideDynamicIcon, LucideInfo } from "@lucide/angular";
import { NumbersOnlyDirective } from "../../directives/numbers-only.directive";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";
import { ToastService } from "../../services/toast.service";
import type {
  BenchmarkFilterOption,
  ComplianceFrameworkMetadata,
  SearchBarCurrency,
  SearchBarParameter,
  SearchBarParameterType,
  SearchBarTooltipEvent,
  StorageMetadata,
  VendorMetadata,
} from "./search-bar.types";
import {
  benchmarkFilterOptionKey,
  benchmarkFilterOptionLabel,
  draftValueFromUnknown,
  getCpuCacheRangeIndex,
  getCpuCacheRangeLabelPosition,
  getCpuCacheRangeLabelValues,
  getCpuCacheRangeMax,
  getCpuCacheRangeMaxIndex,
  getCpuCacheRangeMin,
  getCpuCacheRangeStops,
  getInputElementFromEvent,
  getParameterType,
  isDraftValueDirty,
  normalizeBenchmarkTriStateValue,
  normalizeCommittedCpuCacheRangeValue,
  normalizeOptionId,
  parseNumericDraftValue,
  parseTextDraftValue,
} from "./search-bar.utils";

type CpuCacheRangeFocusLossSkip = {
  target: HTMLInputElement | null;
  timeoutId: ReturnType<typeof setTimeout>;
};

@Component({
  selector: "app-search-bar-parameter-field",
  imports: [
    CommonModule,
    FormsModule,
    LucideDynamicIcon,
    LucideInfo,
    BenchmarkIconPipe,
    NumbersOnlyDirective,
  ],
  templateUrl: "./search-bar-parameter-field.component.html",
})
export class SearchBarParameterFieldComponent implements DoCheck, OnDestroy {
  private toastService = inject(ToastService);
  private readonly cpuCacheRangeErrorToastId = "cpu-cache-input-error";
  private parameterDraftValue: string | undefined;
  private cpuCacheRangeDraftValue: string | undefined;
  private lastModelValue: unknown = Symbol("initial-model-value");
  private cpuCacheRangeFocusLossSkip: CpuCacheRangeFocusLossSkip | undefined;

  parameter = input.required<SearchBarParameter>();
  filterCategoryId = input.required<string>();
  showParameterTitles = input(true);
  selectedCurrency = input<SearchBarCurrency>(null);
  disabled = input(false);
  complianceFrameworks = input<ComplianceFrameworkMetadata[]>([]);
  vendors = input<VendorMetadata[]>([]);
  storageIds = input<StorageMetadata[]>([]);

  valueChanged = output<void>();
  filterServers = output<void>();
  showTooltip = output<SearchBarTooltipEvent>();
  hideTooltip = output<void>();

  ngDoCheck() {
    const parameter = this.parameter();

    if (Object.is(this.lastModelValue, parameter.modelValue)) {
      return;
    }

    this.lastModelValue = parameter.modelValue;

    if (this.getParameterType(parameter) === "cpuCacheRange") {
      this.syncCpuCacheRangeDraftValue(parameter);
      return;
    }

    if (this.isDraftCommitParameter(parameter)) {
      this.syncParameterDraftValue(parameter);
    }
  }

  ngOnDestroy() {
    this.clearCpuCacheRangeFocusLossSkip();
  }

  getParameterType(parameter: SearchBarParameter): SearchBarParameterType {
    return getParameterType(parameter);
  }

  getStep(parameter: SearchBarParameter): number {
    return parameter.schema.step || 1;
  }

  getParameterDraftValue(
    parameter: SearchBarParameter,
  ): string | number | null {
    if (this.parameterDraftValue !== undefined) {
      return this.parameterDraftValue;
    }

    return typeof parameter.modelValue === "string" ||
      typeof parameter.modelValue === "number"
      ? parameter.modelValue
      : null;
  }

  getInputStyle(parameter: SearchBarParameter) {
    const value = this.getParameterDraftValue(parameter);

    if (value === null || value === undefined || value === "") {
      return { "max-width": "3ch" };
    }

    return { "max-width": `${value.toString().length + 2}ch` };
  }

  setParameterDraftValue(rawValue: unknown) {
    this.parameterDraftValue = draftValueFromUnknown(rawValue);
  }

  isParameterDraftDirty(parameter: SearchBarParameter): boolean {
    return isDraftValueDirty(this.parameterDraftValue, parameter.modelValue);
  }

  isCpuCacheRangeDraftDirty(parameter: SearchBarParameter): boolean {
    return isDraftValueDirty(
      this.cpuCacheRangeDraftValue,
      parameter.modelValue,
    );
  }

  onRangeSliderChanged() {
    const parameter = this.parameter();
    this.lastModelValue = parameter.modelValue;
    this.syncParameterDraftValue(parameter);
    this.valueChanged.emit();
  }

  getCpuCacheRangeStops(parameter: SearchBarParameter): number[] {
    return getCpuCacheRangeStops(parameter);
  }

  getCpuCacheRangeMaxIndex(parameter: SearchBarParameter): number {
    return getCpuCacheRangeMaxIndex(parameter);
  }

  getCpuCacheRangeIndex(parameter: SearchBarParameter): number {
    return getCpuCacheRangeIndex(parameter);
  }

  setCpuCacheRangeIndexFromEvent(event: Event) {
    const input = getInputElementFromEvent(event);

    if (!input) {
      return;
    }

    this.setCpuCacheRangeIndex(input.value);
  }

  getCpuCacheRangeInputValue(): string | number | null {
    if (this.cpuCacheRangeDraftValue !== undefined) {
      return this.cpuCacheRangeDraftValue;
    }

    const modelValue = this.parameter().modelValue;
    return typeof modelValue === "number" ? modelValue : null;
  }

  getCpuCacheRangeInputStyle() {
    const value = this.getCpuCacheRangeInputValue();

    if (value === null || value === "") {
      return { "max-width": "3ch" };
    }

    return { "max-width": `${value.toString().length + 2}ch` };
  }

  getCpuCacheRangeLabelValues(parameter: SearchBarParameter): number[] {
    return getCpuCacheRangeLabelValues(parameter);
  }

  getCpuCacheRangeLabelPosition(
    parameter: SearchBarParameter,
    value: number,
  ): number {
    return getCpuCacheRangeLabelPosition(parameter, value);
  }

  setCpuCacheRangeDraftValue(rawValue: unknown) {
    this.cpuCacheRangeDraftValue = draftValueFromUnknown(rawValue);
  }

  commitCpuCacheRangeFromEnter(event: Event) {
    this.clearCpuCacheRangeFocusLossSkip();
    const timeoutId = setTimeout(() => {
      this.cpuCacheRangeFocusLossSkip = undefined;
    }, 250);
    this.cpuCacheRangeFocusLossSkip = {
      target: getInputElementFromEvent(event),
      timeoutId,
    };
    this.commitCpuCacheRangeInput(event);
  }

  commitCpuCacheRangeAfterFocusLoss(event: Event) {
    if (
      this.cpuCacheRangeFocusLossSkip?.target ===
      getInputElementFromEvent(event)
    ) {
      this.clearCpuCacheRangeFocusLossSkip();
      return;
    }

    this.commitCpuCacheRangeInput(event);
  }

  benchmarkFilterOptionKey(
    valueOrObj: BenchmarkFilterOption,
  ): string | number | undefined {
    return benchmarkFilterOptionKey(valueOrObj);
  }

  benchmarkFilterOptionLabel(valueOrObj: BenchmarkFilterOption): string {
    return benchmarkFilterOptionLabel(valueOrObj);
  }

  benchmarkFilterSelection(
    valueOrObj: BenchmarkFilterOption,
  ): "all" | "yes" | "no" {
    const key = this.benchmarkFilterOptionKey(valueOrObj);

    if (!key) {
      return "all";
    }

    const modelValue = normalizeBenchmarkTriStateValue(
      this.parameter().modelValue,
    );
    const selection = modelValue[key];

    return selection === "yes" || selection === "no" ? selection : "all";
  }

  setBenchmarkFilterSelection(
    valueOrObj: BenchmarkFilterOption,
    selection: "all" | "yes" | "no",
  ) {
    const key = this.benchmarkFilterOptionKey(valueOrObj);

    if (!key) {
      return;
    }

    const parameter = this.parameter();
    const next = {
      ...normalizeBenchmarkTriStateValue(parameter.modelValue),
    };

    if (selection === "all") {
      delete next[key];
    } else {
      next[key] = selection;
    }

    parameter.modelValue = next;
    this.lastModelValue = parameter.modelValue;
    this.filterServers.emit();
  }

  isEnumSelected(valueOrObj: BenchmarkFilterOption): boolean {
    const parameter = this.parameter();
    const value =
      typeof valueOrObj === "string" || typeof valueOrObj === "number"
        ? valueOrObj
        : valueOrObj.key;

    if (value === undefined || !Array.isArray(parameter.modelValue)) {
      return false;
    }

    const normalizedValue = normalizeOptionId(value);

    return parameter.modelValue
      .map((selectedValue) =>
        normalizeOptionId(selectedValue as BenchmarkFilterOption),
      )
      .includes(normalizedValue);
  }

  selectEnumItem(valueOrObj: BenchmarkFilterOption) {
    const parameter = this.parameter();

    if (!Array.isArray(parameter.modelValue)) {
      parameter.modelValue = [];
    }

    const selectedValues = parameter.modelValue as BenchmarkFilterOption[];
    const value =
      typeof valueOrObj === "string" || typeof valueOrObj === "number"
        ? valueOrObj
        : valueOrObj.key;

    if (value === undefined) {
      return;
    }

    const normalizedValue = normalizeOptionId(value);
    const normalizedValues = selectedValues.map((selectedValue) =>
      normalizeOptionId(selectedValue),
    );
    const index = normalizedValues.indexOf(normalizedValue);

    parameter.modelValue =
      index !== -1
        ? selectedValues.filter((_, selectedIndex) => selectedIndex !== index)
        : [...selectedValues, value];
    this.lastModelValue = parameter.modelValue;
    this.filterServers.emit();
  }

  selectSingleRadioOption(valueOrObj: BenchmarkFilterOption) {
    const value = this.benchmarkFilterOptionKey(valueOrObj);

    if (value === undefined) {
      return;
    }

    const parameter = this.parameter();
    parameter.modelValue = value;
    this.lastModelValue = parameter.modelValue;
    this.filterServers.emit();
  }

  getEnumOptionLabel(
    parameterType: SearchBarParameterType,
    option: BenchmarkFilterOption,
  ): string {
    const id = normalizeOptionId(option);

    switch (parameterType) {
      case "compliance_framework":
        return (
          this.complianceFrameworks().find(
            (item) => item.compliance_framework_id === id,
          )?.abbreviation || id
        );
      case "vendor":
        return this.vendors().find((item) => item.vendor_id === id)?.name || id;
      case "storage_id":
        return (
          this.storageIds().find((item) => item.storage_id === id)?.name || id
        );
      default:
        return this.benchmarkFilterOptionLabel(option);
    }
  }

  emitTooltip(event: MouseEvent | FocusEvent, content: string | undefined) {
    if (!content) {
      return;
    }

    this.showTooltip.emit({ event, content });
  }

  commitParameterInput(event: Event) {
    this.commitParameterValue(getInputElementFromEvent(event)?.value);
  }

  private commitParameterValue(rawValue?: unknown) {
    const parameter = this.parameter();
    const previousValue = parameter.modelValue;
    const source = rawValue ?? this.parameterDraftValue ?? previousValue;

    if (this.getParameterType(parameter) === "text") {
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

    this.lastModelValue = parameter.modelValue;
    this.syncParameterDraftValue(parameter);

    if (previousValue !== parameter.modelValue) {
      this.filterServers.emit();
    }
  }

  private isDraftCommitParameter(parameter: SearchBarParameter): boolean {
    const type = this.getParameterType(parameter);
    return (
      type === "number" ||
      type === "price" ||
      type === "text" ||
      type === "range"
    );
  }

  private syncParameterDraftValue(parameter: SearchBarParameter) {
    if (
      parameter.modelValue === null ||
      parameter.modelValue === undefined ||
      parameter.modelValue === ""
    ) {
      this.parameterDraftValue = undefined;
      return;
    }

    this.parameterDraftValue = String(parameter.modelValue);
  }

  private setCpuCacheRangeIndex(rawIndex: unknown) {
    const parameter = this.parameter();
    const values = this.getCpuCacheRangeStops(parameter);

    if (!values.length) {
      return;
    }

    const numericIndex = Number(rawIndex);
    const boundedIndex = Number.isFinite(numericIndex)
      ? Math.min(Math.max(Math.round(numericIndex), 0), values.length - 1)
      : 0;

    parameter.modelValue = values[boundedIndex];
    this.lastModelValue = parameter.modelValue;
    this.syncCpuCacheRangeDraftValue(parameter);
    this.toastService.removeToast(this.cpuCacheRangeErrorToastId);
    this.valueChanged.emit();
  }

  private commitCpuCacheRangeInput(event: Event) {
    this.commitCpuCacheRangeValue(getInputElementFromEvent(event)?.value);
  }

  private commitCpuCacheRangeValue(rawValue?: unknown) {
    const parameter = this.parameter();
    const previousValue = parameter.modelValue;
    const normalizedValue = normalizeCommittedCpuCacheRangeValue(
      parameter,
      rawValue ?? this.cpuCacheRangeDraftValue,
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
    this.lastModelValue = parameter.modelValue;
    this.syncCpuCacheRangeDraftValue(parameter);
    this.toastService.removeToast(this.cpuCacheRangeErrorToastId);

    if (previousValue !== parameter.modelValue) {
      this.filterServers.emit();
    }
  }

  private syncCpuCacheRangeDraftValue(parameter: SearchBarParameter) {
    if (parameter.modelValue === null || parameter.modelValue === undefined) {
      this.cpuCacheRangeDraftValue = undefined;
      return;
    }

    this.cpuCacheRangeDraftValue = String(parameter.modelValue);
  }

  private clearCpuCacheRangeFocusLossSkip() {
    if (this.cpuCacheRangeFocusLossSkip) {
      clearTimeout(this.cpuCacheRangeFocusLossSkip.timeoutId);
      this.cpuCacheRangeFocusLossSkip = undefined;
    }
  }

  private showCpuCacheRangeValidationError(parameter: SearchBarParameter) {
    const min = getCpuCacheRangeMin(parameter);
    const max = getCpuCacheRangeMax(parameter);
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
}
