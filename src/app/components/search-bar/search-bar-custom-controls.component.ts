import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, PLATFORM_ID, inject, input, output } from "@angular/core";
import type { TemplateRef } from "@angular/core";
import {
  LucideDynamicIcon,
  LucideInfo,
  LucideMinus,
  LucidePlus,
  LucideX,
} from "@lucide/angular";
import { formatNumberInputValue } from "../../pipes/pipe-utils";
import type {
  SearchBarBenchmarkConfigOption,
  SearchBarCustomControl,
  SearchBarCustomControlChange,
  SearchBarCustomSelectOption,
  SearchBarParameter,
  SearchBarParameterPlacement,
  SearchBarParameterTemplateContext,
  SearchBarServerOption,
  SearchBarTooltipEvent,
} from "./search-bar.types";
import {
  POWER_OF_TWO_STEPPER_INPUT_PATTERN,
  getInputElementFromEvent,
  getNextPowerOfTwoStepperValue,
  getPowerOfTwoStepperDisplay,
  getPowerOfTwoStepperEditableValue,
  getPowerOfTwoStepperMinimum,
  getPreviousPowerOfTwoStepperValue,
  normalizeCommittedPowerOfTwoStepperValue,
  parsePowerOfTwoStepperNumericValue,
} from "./search-bar.utils";

@Component({
  selector: "app-search-bar-custom-controls",
  imports: [
    CommonModule,
    LucideDynamicIcon,
    LucideInfo,
    LucideMinus,
    LucidePlus,
    LucideX,
  ],
  templateUrl: "./search-bar-custom-controls.component.html",
})
export class SearchBarCustomControlsComponent {
  private platformId = inject(PLATFORM_ID);

  controls = input<SearchBarCustomControl[]>([]);
  parameters = input<SearchBarParameter[]>([]);
  parameterPlacements = input<SearchBarParameterPlacement[]>([]);
  filterCategoryId = input.required<string>();
  parameterTemplate =
    input.required<TemplateRef<SearchBarParameterTemplateContext>>();

  customControlChanged = output<SearchBarCustomControlChange>();
  showTooltip = output<SearchBarTooltipEvent>();
  hideTooltip = output<void>();

  private powerOfTwoStepperDraftValues: Record<string, string> = {};
  private powerOfTwoStepperFocusedControls: Record<string, boolean> = {};
  private benchmarkConfigDropdownOpen: Record<string, boolean> = {};
  private singleSelectDropdownOpen: Record<string, boolean> = {};
  private benchmarkGroupExpansion: Record<string, Record<string, boolean>> = {};

  customControlHasEnoughInput(control: SearchBarCustomControl): boolean {
    return (
      (control.inputValue || "").trim().length >=
      this.getCustomControlMinCharacters(control)
    );
  }

  onCustomControlInput(control: SearchBarCustomControl, event: Event) {
    const input = getInputElementFromEvent(event);

    if (!input) {
      return;
    }

    this.customControlChanged.emit({
      name: control.name,
      value: { inputValue: input.value },
    });
  }

  onCustomRangeSliderInput(control: SearchBarCustomControl, event: Event) {
    const input = getInputElementFromEvent(event);

    if (!input) {
      return;
    }

    const value = Number(input.value);

    if (!Number.isFinite(value)) {
      return;
    }

    this.customControlChanged.emit({
      name: control.name,
      value: { numericValue: value },
    });
  }

  onCustomCheckboxInput(control: SearchBarCustomControl, event: Event) {
    const input = getInputElementFromEvent(event);

    if (!input) {
      return;
    }

    this.customControlChanged.emit({
      name: control.name,
      value: { checked: input.checked },
    });
  }

  onCustomCheckboxGroupInput(optionName: string, event: Event) {
    const input = getInputElementFromEvent(event);

    if (!input) {
      return;
    }

    this.customControlChanged.emit({
      name: optionName,
      value: { checked: input.checked },
    });
  }

  handlePowerOfTwoStepperFocus(control: SearchBarCustomControl) {
    this.powerOfTwoStepperFocusedControls[control.name] = true;
    delete this.powerOfTwoStepperDraftValues[control.name];
  }

  onPowerOfTwoStepperInput(control: SearchBarCustomControl, event: Event) {
    const input = getInputElementFromEvent(event);

    if (!input) {
      return;
    }

    const normalizedValue = input.value.replace(/\s+/g, "");
    const previousValue =
      this.powerOfTwoStepperDraftValues[control.name] ??
      getPowerOfTwoStepperEditableValue(control);
    const nextValue = POWER_OF_TWO_STEPPER_INPUT_PATTERN.test(normalizedValue)
      ? normalizedValue
      : previousValue;

    this.powerOfTwoStepperDraftValues[control.name] = nextValue;
    input.value = nextValue;
  }

  commitPowerOfTwoStepperFromEnter(event: Event) {
    event.preventDefault();
    const input = getInputElementFromEvent(event);

    input?.blur();
  }

  commitPowerOfTwoStepperAfterFocusLoss(
    control: SearchBarCustomControl,
    event: Event,
  ) {
    this.powerOfTwoStepperFocusedControls[control.name] = false;
    this.commitPowerOfTwoStepperValue(
      control,
      getInputElementFromEvent(event)?.value,
    );
  }

  isPowerOfTwoStepperFocused(control: SearchBarCustomControl): boolean {
    return this.powerOfTwoStepperFocusedControls[control.name] === true;
  }

  getPowerOfTwoStepperInputValue(control: SearchBarCustomControl): string {
    const draftValue = this.powerOfTwoStepperDraftValues[control.name];

    if (draftValue !== undefined) {
      return draftValue;
    }

    if (control.numericValue === null || control.numericValue === undefined) {
      return "";
    }

    return this.isPowerOfTwoStepperFocused(control)
      ? getPowerOfTwoStepperEditableValue(control)
      : getPowerOfTwoStepperDisplay(control).value;
  }

  getPowerOfTwoStepperInputStyle(control: SearchBarCustomControl) {
    const inputValue = this.getPowerOfTwoStepperInputValue(control);
    const width = Math.max(inputValue.length, 1) + 0.5;

    return { width: `${width}ch` };
  }

  getPowerOfTwoStepperInputUnit(
    control: SearchBarCustomControl,
  ): string | null {
    if (control.numericFormat === "binaryMemory") {
      return this.isPowerOfTwoStepperFocused(control)
        ? "GiB"
        : getPowerOfTwoStepperDisplay(control).unit;
    }

    return control.unit || null;
  }

  getPowerOfTwoStepperCurrentValue(
    control: SearchBarCustomControl,
  ): number | null {
    const draftValue = this.powerOfTwoStepperDraftValues[control.name];

    if (draftValue !== undefined && draftValue !== "") {
      const parsedDraftValue = parsePowerOfTwoStepperNumericValue(
        control,
        draftValue,
      );

      if (parsedDraftValue !== null) {
        return parsedDraftValue;
      }
    }

    return control.numericValue ?? null;
  }

  incrementPowerOfTwoValue(control: SearchBarCustomControl) {
    const currentValue = this.getPowerOfTwoStepperCurrentValue(control);
    const nextValue = getNextPowerOfTwoStepperValue(control, currentValue);

    this.syncPowerOfTwoStepperDraftValue(control, nextValue);
    this.customControlChanged.emit({
      name: control.name,
      value: { numericValue: nextValue },
    });
  }

  decrementPowerOfTwoValue(control: SearchBarCustomControl) {
    const currentValue = this.getPowerOfTwoStepperCurrentValue(control);

    if (currentValue === null) {
      return;
    }

    const nextValue = getPreviousPowerOfTwoStepperValue(control, currentValue);

    if (nextValue === currentValue) {
      return;
    }

    this.syncPowerOfTwoStepperDraftValue(control, nextValue);
    this.customControlChanged.emit({
      name: control.name,
      value: { numericValue: nextValue },
    });
  }

  canDecrementPowerOfTwoValue(control: SearchBarCustomControl): boolean {
    const currentValue = this.getPowerOfTwoStepperCurrentValue(control);
    const minimumValue = getPowerOfTwoStepperMinimum(control);

    if (currentValue === null) {
      return false;
    }

    if (currentValue <= 0) {
      return false;
    }

    return currentValue > minimumValue || control.allowZero === true;
  }

  formatRangeSliderValue(control: SearchBarCustomControl): string {
    const formattedValue = this.formatCustomNumericValue(control);

    return control.valueSummary
      ? `${formattedValue} ${control.valueSummary}`
      : formattedValue;
  }

  getRangeSliderValue(control: SearchBarCustomControl): number {
    if (control.numericValue !== null && control.numericValue !== undefined) {
      return control.numericValue;
    }

    return control.min ?? 0;
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
    server: SearchBarServerOption,
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
    if (control.disabled) {
      return;
    }

    this.customControlChanged.emit({
      name: control.name,
      value: {
        inputValue: benchmarkOption.displayName,
        selectedBenchmarkConfig: benchmarkOption,
      },
    });
    this.closeBenchmarkConfigDropdown(control);
  }

  clearBenchmarkConfigSelection(control: SearchBarCustomControl) {
    if (control.disabled) {
      return;
    }

    this.customControlChanged.emit({
      name: control.name,
      value: { inputValue: "", selectedBenchmarkConfig: null },
    });
  }

  handleBenchmarkConfigInputFocus(control: SearchBarCustomControl) {
    if (control.disabled) {
      return;
    }

    if (
      control.selectedBenchmarkConfig &&
      (control.inputValue || "").trim() ===
        control.selectedBenchmarkConfig.displayName
    ) {
      this.customControlChanged.emit({
        name: control.name,
        value: { inputValue: "" },
      });
    }

    this.openBenchmarkConfigDropdown(control);
  }

  restoreBenchmarkConfigInput(control: SearchBarCustomControl) {
    if (control.disabled) {
      this.closeBenchmarkConfigDropdown(control);
      return;
    }

    if (
      control.selectedBenchmarkConfig &&
      !(control.inputValue || "").trim().length
    ) {
      this.customControlChanged.emit({
        name: control.name,
        value: { inputValue: control.selectedBenchmarkConfig.displayName },
      });
    }

    this.closeBenchmarkConfigDropdown(control);
  }

  isBenchmarkConfigDropdownOpen(control: SearchBarCustomControl): boolean {
    return this.benchmarkConfigDropdownOpen[control.name] ?? false;
  }

  openBenchmarkConfigDropdown(control: SearchBarCustomControl) {
    if (control.disabled) {
      this.closeBenchmarkConfigDropdown(control);
      return;
    }

    this.benchmarkConfigDropdownOpen[control.name] = true;
  }

  closeBenchmarkConfigDropdown(control: SearchBarCustomControl) {
    this.benchmarkConfigDropdownOpen[control.name] = false;
  }

  focusControl(name: string): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const element = document.getElementById(
      `custom_control_input_${name}`,
    ) as HTMLInputElement | null;

    if (!element || element.disabled) {
      return false;
    }

    const wasFocused = document.activeElement === element;
    element.focus({ preventScroll: true });

    const control = this.controls().find((item) => item.name === name);

    if (wasFocused && control?.type === "benchmarkConfigSelect") {
      this.handleBenchmarkConfigInputFocus(control);
    }

    return document.activeElement === element;
  }

  isSingleSelectDropdownOpen(control: SearchBarCustomControl): boolean {
    return this.singleSelectDropdownOpen[control.name] ?? false;
  }

  toggleSingleSelectDropdown(control: SearchBarCustomControl) {
    if (control.disabled) {
      return;
    }

    this.singleSelectDropdownOpen[control.name] =
      !this.isSingleSelectDropdownOpen(control);
  }

  closeSingleSelectDropdown(control: SearchBarCustomControl) {
    this.singleSelectDropdownOpen[control.name] = false;
  }

  handleSingleSelectFocusOut(
    control: SearchBarCustomControl,
    event: FocusEvent,
  ) {
    const currentTarget = event.currentTarget as HTMLElement | null;
    const relatedTarget = event.relatedTarget as Node | null;

    if (
      currentTarget &&
      relatedTarget &&
      currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    this.closeSingleSelectDropdown(control);
  }

  getCustomSingleSelectLabel(control: SearchBarCustomControl): string {
    const selectedOption = (control.selectOptions || []).find(
      (option) => option.value === control.selectedValue,
    );

    return selectedOption?.label || control.placeholder || control.title;
  }

  selectCustomControlOption(
    control: SearchBarCustomControl,
    option: SearchBarCustomSelectOption,
  ) {
    this.closeSingleSelectDropdown(control);
    this.customControlChanged.emit({
      name: control.name,
      value: { selectedValue: option.value },
    });
  }

  formatBenchmarkConfigDescription(
    benchmarkOption: SearchBarBenchmarkConfigOption,
  ): string {
    if (benchmarkOption.groupLabel) {
      const descriptionParts: string[] = [];

      if (
        benchmarkOption.configTitle &&
        benchmarkOption.configTitle !== benchmarkOption.framework
      ) {
        descriptionParts.push(benchmarkOption.configTitle);
      }

      if (benchmarkOption.benchmarkTemplate?.unit) {
        descriptionParts.push(String(benchmarkOption.benchmarkTemplate.unit));
      }

      return descriptionParts.join(" | ");
    }

    const descriptionParts = [benchmarkOption.framework];

    if (benchmarkOption.configTitle) {
      descriptionParts.push(benchmarkOption.configTitle);
    }

    if (benchmarkOption.benchmarkTemplate?.unit) {
      descriptionParts.push(String(benchmarkOption.benchmarkTemplate.unit));
    }

    return descriptionParts.filter(Boolean).join(" | ");
  }

  formatServerAutocompleteDescription(server: SearchBarServerOption): string {
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

  getParametersAfterControl(controlName: string): SearchBarParameter[] {
    return this.sortParametersByPlacement(
      this.parameters().filter((parameter) => {
        return (
          this.getParameterPlacement(parameter.name)?.afterControlName ===
          controlName
        );
      }),
    );
  }

  getParameterTrackId(parameter: SearchBarParameter): string {
    return `${parameter.name}_${String(parameter.schema.title || "")}`;
  }

  emitTooltip(event: MouseEvent | FocusEvent, content: string | undefined) {
    if (content) {
      this.showTooltip.emit({ event, content });
    }
  }

  getCustomControlMinCharacters(control: SearchBarCustomControl): number {
    return control.minCharacters || 3;
  }

  private formatCustomNumericValue(control: SearchBarCustomControl): string {
    const value = control.numericValue;

    if (value === null || value === undefined) {
      return "Not set";
    }

    const formattedValue = formatNumberInputValue(value);

    if (!control.unit) {
      return formattedValue;
    }

    return control.unit === "%"
      ? `${formattedValue}%`
      : `${formattedValue} ${control.unit}`;
  }

  private commitPowerOfTwoStepperValue(
    control: SearchBarCustomControl,
    rawValue?: unknown,
  ) {
    const nextValue = normalizeCommittedPowerOfTwoStepperValue(
      control,
      rawValue,
    );

    delete this.powerOfTwoStepperDraftValues[control.name];

    if (nextValue === control.numericValue) {
      return;
    }

    this.customControlChanged.emit({
      name: control.name,
      value: { numericValue: nextValue },
    });
  }

  private syncPowerOfTwoStepperDraftValue(
    control: SearchBarCustomControl,
    value: number,
  ) {
    if (this.isPowerOfTwoStepperFocused(control)) {
      this.powerOfTwoStepperDraftValues[control.name] =
        formatNumberInputValue(value);
      return;
    }

    delete this.powerOfTwoStepperDraftValues[control.name];
  }

  private getParameterPlacement(
    parameterName: string,
  ): SearchBarParameterPlacement | undefined {
    const placements = this.parameterPlacements();

    for (let index = placements.length - 1; index >= 0; index--) {
      const placement = placements[index];

      if (placement.parameterName === parameterName) {
        return placement;
      }
    }

    return undefined;
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
}
