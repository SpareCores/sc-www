export type DetailsCompressionMode = {
  name: string;
  key:
    | "compress"
    | "decompress"
    | "ratio"
    | "ratio_compress"
    | "ratio_decompress";
  order: string;
  icon: "circle-arrow-down" | "circle-arrow-up";
};

export const detailsCompressionModes: DetailsCompressionMode[] = [
  {
    name: "Compression speed",
    key: "compress",
    order: "Higher is better.",
    icon: "circle-arrow-up",
  },
  {
    name: "Decompression speed",
    key: "decompress",
    order: "Higher is better.",
    icon: "circle-arrow-up",
  },
  {
    name: "Compression ratio",
    key: "ratio",
    order: "Lower is better.",
    icon: "circle-arrow-down",
  },
  {
    name: "Compression speed/ratio",
    key: "ratio_compress",
    order: "Higher is better.",
    icon: "circle-arrow-up",
  },
  {
    name: "Decompression speed/ratio",
    key: "ratio_decompress",
    order: "Higher is better.",
    icon: "circle-arrow-up",
  },
];

export const compressionInfoTooltip =
  "Measuring the compression ratio and speed while compressing and decompressing the dickens.txt of the Silesia corpus (10 MB uncompressed) using various algorithms, compressions levels and other extra arguments.";

export const DETAILS_SERIES_IGNORED_KEYS = new Set([
  "algo",
  "compression_level",
  "cores",
]);

export const COMPRESSION_LEVEL_NOT_AVAILABLE_LABEL = "N/A";

export const LEGACY_LZ4_BLOCK_SIZE_BYTES: Record<number, number> = {
  0: 64 * 1024,
  4: 1024 * 1024,
  6: 4 * 1024 * 1024,
};
