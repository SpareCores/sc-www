export const legacyMemoryBlockSizeTicks = [
  0.016384, 0.262144, 1, 2, 4, 8, 16, 32, 64, 256, 512,
];

export function sortUniqueNumbers(
  values: Array<number | null | undefined>,
): number[] {
  return values
    .filter((value): value is number => value !== null && value !== undefined)
    .filter(
      (value, index, items) =>
        items.findIndex((item) => item === value) === index,
    )
    .sort((left, right) => left - right);
}

export function buildMajorTicks(values: Array<number | string>) {
  return values.map((value) => ({ value, label: value, major: true }));
}
