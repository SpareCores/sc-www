export const BURSTABLE_INSTANCE_WARNING_TITLE = "Note on Burstable Instances.";

export const BURSTABLE_INSTANCE_WARNING_BODY =
  'Benchmark results may vary. Performance on these instance types is more susceptible to "noisy neighbors", resource sharing, and varying CPU credit balances.';

export const HIDDEN_SERVER_PROPERTY_IDS = new Set(["api_reference_object"]);

export const SIMILAR_SERVER_CATEGORIES: Partial<
  Record<string, "score" | "score_per_price" | "specs">
> = {
  byScore: "score",
  byPerformancePerPrice: "score_per_price",
  bySpecs: "specs",
};

export const DEFAULT_EMBEDDABLE_WIDGETS = [
  { id: "metadata", name: "Server Metadata" },
  { id: "availability", name: "Availability" },
  { id: "processor", name: "Processor" },
  { id: "system_resources", name: "System Resources and Accelerators" },
  { id: "workload_profile", name: "Workload Profiles" },
  { id: "bw_mem", name: "Memory Bandwidth" },
  { id: "compress", name: "Compression" },
  { id: "geek_single", name: "Geekbench Single-core" },
  { id: "geek_multi", name: "Geekbench Multi-core" },
  { id: "ssl", name: "OpenSSL" },
  { id: "static_web", name: "Static Web Server" },
  { id: "redis", name: "Redis" },
];

export const DEFAULT_SERVER_DETAILS_ERROR_MESSAGE =
  "Failed to load server details. Please try again later.";
