function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (
    typeof value === "function" ||
    value === null ||
    typeof value !== "object"
  ) {
    return value;
  }

  const clone = {} as Record<PropertyKey, unknown>;

  Reflect.ownKeys(value).forEach((key) => {
    clone[key] = cloneValue((value as Record<PropertyKey, unknown>)[key]);
  });

  return clone as T;
}

export function cloneChartOptions<T>(options: T): T {
  return cloneValue(options);
}
