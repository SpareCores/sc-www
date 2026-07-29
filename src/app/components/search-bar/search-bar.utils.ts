import {
  formatBinaryMemoryDisplay,
  formatNumberInputValue,
  parseBinaryMemoryInput,
} from "../../pipes/pipe-utils";
import type {
  BenchmarkFilterOption,
  SearchBarCustomControl,
  SearchBarParameter,
  SearchBarParameterType,
} from "./search-bar.types";

export const POWER_OF_TWO_STEPPER_INPUT_PATTERN = /^\d*\.?\d*$/;
const POWER_OF_TWO_STEPPER_BASE_VALUE = 0.5;
const POWER_OF_TWO_STEPPER_EPSILON = 1e-9;

export function getParameterType(
  parameter: SearchBarParameter,
): SearchBarParameterType {
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

  if (isCpuCacheRangeParameter(parameter, type)) {
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

export function getCpuCacheRangeStops(parameter: SearchBarParameter): number[] {
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

function isCpuCacheRangeParameter(
  parameter: SearchBarParameter,
  type: string,
): boolean {
  if (parameter.schema.category_id !== "cpu_cache") {
    return false;
  }

  if (type !== "integer" && type !== "number") {
    return false;
  }

  return getCpuCacheRangeStops(parameter).length > 0;
}

export function normalizeOptionId(value: BenchmarkFilterOption): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return value?.key || value?.value || "";
}

export function benchmarkFilterOptionKey(
  valueOrObj: BenchmarkFilterOption,
): string | number | undefined {
  if (typeof valueOrObj === "string" || typeof valueOrObj === "number") {
    return valueOrObj;
  }

  return valueOrObj?.key;
}

export function benchmarkFilterOptionLabel(
  valueOrObj: BenchmarkFilterOption,
): string {
  if (typeof valueOrObj === "string" || typeof valueOrObj === "number") {
    return String(valueOrObj);
  }

  return valueOrObj?.value || valueOrObj?.key || "";
}

export function normalizeBenchmarkTriStateValue(
  value: unknown,
): Record<string, "all" | "yes" | "no"> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
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

export function normalizeCommittedCpuCacheRangeValue(
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

  const values = getCpuCacheRangeStops(parameter);

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

export function getCpuCacheRangeMaxIndex(
  parameter: SearchBarParameter,
): number {
  return Math.max(getCpuCacheRangeStops(parameter).length - 1, 0);
}

export function getCpuCacheRangeIndex(parameter: SearchBarParameter): number {
  const values = getCpuCacheRangeStops(parameter);

  if (!values.length) {
    return 0;
  }

  const normalizedValue = normalizeCommittedCpuCacheRangeValue(
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

export function getCpuCacheRangeMin(
  parameter: SearchBarParameter,
): number | null {
  const values = getCpuCacheRangeStops(parameter);
  return values.length ? values[0] : null;
}

export function getCpuCacheRangeMax(
  parameter: SearchBarParameter,
): number | null {
  const values = getCpuCacheRangeStops(parameter);
  return values.length ? values[values.length - 1] : null;
}

export function getCpuCacheRangeLabelValues(
  parameter: SearchBarParameter,
): number[] {
  const values = getCpuCacheRangeStops(parameter);

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

export function getCpuCacheRangeLabelPosition(
  parameter: SearchBarParameter,
  value: number,
): number {
  const values = getCpuCacheRangeStops(parameter);
  const maxIndex = values.length - 1;

  if (maxIndex <= 0) {
    return 0;
  }

  return (Math.max(values.indexOf(value), 0) / maxIndex) * 100;
}

export function getPowerOfTwoStepperEditableValue(
  control: SearchBarCustomControl,
): string {
  if (control.numericValue === null || control.numericValue === undefined) {
    return "";
  }

  return formatNumberInputValue(control.numericValue);
}

export function getPowerOfTwoStepperDisplay(control: SearchBarCustomControl): {
  value: string;
  unit: string | null;
} {
  if (control.numericValue === null || control.numericValue === undefined) {
    return { value: "", unit: control.unit || null };
  }

  if (control.numericFormat === "binaryMemory") {
    return formatBinaryMemoryDisplay(control.numericValue);
  }

  return {
    value: formatNumberInputValue(control.numericValue),
    unit: control.unit || null,
  };
}

export function parsePowerOfTwoStepperNumericValue(
  control: SearchBarCustomControl,
  rawValue: string,
): number | null {
  const normalizedValue = rawValue.trim();

  if (!normalizedValue.length || normalizedValue === ".") {
    return null;
  }

  if (control.numericFormat === "binaryMemory") {
    return parseBinaryMemoryInput(normalizedValue, "GiB");
  }

  if (!POWER_OF_TWO_STEPPER_INPUT_PATTERN.test(normalizedValue)) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function normalizeCommittedPowerOfTwoStepperValue(
  control: SearchBarCustomControl,
  rawValue?: unknown,
): number | null {
  const normalizedValue =
    rawValue === null || rawValue === undefined ? "" : String(rawValue).trim();

  if (!normalizedValue.length) {
    return control.defaultNumericValue ?? control.numericValue ?? null;
  }

  const parsedValue = parsePowerOfTwoStepperNumericValue(
    control,
    normalizedValue,
  );

  if (parsedValue === null) {
    return control.numericValue ?? control.defaultNumericValue ?? null;
  }

  let nextValue = parsedValue;

  if (control.max !== undefined) {
    nextValue = Math.min(nextValue, control.max);
  }

  if (control.allowZero && Math.abs(nextValue) < POWER_OF_TWO_STEPPER_EPSILON) {
    return 0;
  }

  const minimumValue = getPowerOfTwoStepperMinimum(control);

  if (nextValue < minimumValue) {
    nextValue = minimumValue;
  }

  return nextValue;
}

export function getPowerOfTwoStepperMinimum(
  control: SearchBarCustomControl,
): number {
  if (control.min !== undefined) {
    return control.min;
  }

  return control.allowZero ? 0 : POWER_OF_TWO_STEPPER_BASE_VALUE;
}

export function getNextPowerOfTwoStepperValue(
  control: SearchBarCustomControl,
  currentValue: number | null,
): number {
  if (currentValue === null) {
    return Math.max(
      getPowerOfTwoStepperMinimum(control),
      POWER_OF_TWO_STEPPER_BASE_VALUE,
    );
  }

  if (currentValue < POWER_OF_TWO_STEPPER_BASE_VALUE) {
    return POWER_OF_TWO_STEPPER_BASE_VALUE;
  }

  if (
    Math.abs(currentValue - POWER_OF_TWO_STEPPER_BASE_VALUE) <
    POWER_OF_TWO_STEPPER_EPSILON
  ) {
    return 1;
  }

  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(currentValue)));

  return Math.abs(nextPowerOfTwo - currentValue) < POWER_OF_TWO_STEPPER_EPSILON
    ? nextPowerOfTwo * 2
    : nextPowerOfTwo;
}

export function getPreviousPowerOfTwoStepperValue(
  control: SearchBarCustomControl,
  currentValue: number,
): number {
  if (currentValue <= 0) {
    return 0;
  }

  if (currentValue <= POWER_OF_TWO_STEPPER_BASE_VALUE) {
    return control.allowZero ? 0 : POWER_OF_TWO_STEPPER_BASE_VALUE;
  }

  const previousPowerOfTwo = Math.pow(2, Math.floor(Math.log2(currentValue)));

  return Math.abs(previousPowerOfTwo - currentValue) <
    POWER_OF_TWO_STEPPER_EPSILON
    ? previousPowerOfTwo / 2
    : previousPowerOfTwo;
}

export function getInputElementFromEvent(
  event: Event,
): HTMLInputElement | null {
  return event.target instanceof HTMLInputElement ? event.target : null;
}

export function draftValueFromUnknown(rawValue: unknown): string {
  return rawValue === null || rawValue === undefined ? "" : String(rawValue);
}

export function isDraftValueDirty(
  draftValue: string | undefined,
  committedValue: unknown,
): boolean {
  if (draftValue === undefined) {
    return false;
  }

  if (
    committedValue === null ||
    committedValue === undefined ||
    committedValue === ""
  ) {
    return draftValue !== "";
  }

  return draftValue !== String(committedValue);
}

export function parseNumericDraftValue(rawValue: unknown): number | null {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function parseTextDraftValue(rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined) {
    return "";
  }
  return String(rawValue);
}
