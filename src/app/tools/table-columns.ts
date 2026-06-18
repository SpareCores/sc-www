import {
  COLUMN_BENCHMARK_EFFICIENCY_TOOLTIP,
  COLUMN_BENCHMARK_TOOLTIP,
  COLUMN_SCORE_PER_PRICE_TOOLTIP,
  COLUMN_SCORE_TOOLTIP,
} from "./column-tooltips";

export type TableColumnType =
  | "name"
  | "vendor"
  | "region"
  | "country"
  | "text"
  | "processor"
  | "cpu_model"
  | "cpu_cache"
  | "score"
  | "score_per_price"
  | "benchmark"
  | "benchmark_score_per_price"
  | "memory"
  | "gpu"
  | "gpu_memory"
  | "gpu_memory_min"
  | "gpu_memory_total"
  | "gpu_model"
  | "storage"
  | "price"
  | "priceMonthly"
  | "price_tiers"
  | "network_speed"
  | "storage_speed"
  | "inbound_traffic"
  | "outbound_traffic"
  | "ipv4";

export type TableColumn = {
  name: string;
  type: TableColumnType;
  key?: string;
  show: boolean;
  orderField?: string | null;
  info?: string;
};

const COLUMNS = {
  architecture: {
    name: "ARCHITECTURE",
    type: "text",
    key: "cpu_architecture",
  },
  benchmark: {
    name: "BENCHMARK",
    type: "benchmark",
    orderField: "selected_benchmark_score",
    info: COLUMN_BENCHMARK_TOOLTIP,
  },
  benchmarkEfficiency: {
    name: "$ EFFICIENCY",
    type: "benchmark_score_per_price",
    orderField: "selected_benchmark_score_per_price",
    info: COLUMN_BENCHMARK_EFFICIENCY_TOOLTIP,
  },
  bestOndemandMonthlyPrice: {
    name: "BEST ONDEMAND MONTHLY PRICE",
    type: "price",
    key: "min_price_ondemand_monthly",
    orderField: "min_price_ondemand_monthly",
  },
  bestOndemandPrice: {
    name: "BEST ONDEMAND PRICE",
    type: "price",
    key: "min_price_ondemand",
    orderField: "min_price_ondemand",
  },
  bestPrice: {
    name: "BEST PRICE",
    type: "price",
    key: "min_price",
    orderField: "min_price",
  },
  bestSpotPrice: {
    name: "BEST SPOT PRICE",
    type: "price",
    key: "min_price_spot",
    orderField: "min_price_spot",
  },
  continent: {
    name: "CONTINENT",
    type: "text",
    key: "region.country.continent",
  },
  country: { name: "COUNTRY", type: "country" },
  cpuAllocation: {
    name: "CPU ALLOCATION",
    type: "text",
    key: "cpu_allocation",
  },
  cpuCache: { name: "CPU CACHE", type: "cpu_cache" },
  cpuModel: { name: "CPU MODEL", type: "cpu_model" },
  direction: { name: "DIRECTION", type: "text", key: "direction" },
  gpu: { name: "GPUs", type: "gpu", orderField: "gpu_count" },
  gpuMemoryMin: {
    name: "GPU MIN MEMORY",
    type: "gpu_memory_min",
    orderField: "gpu_memory_min",
  },
  gpuMemoryTotal: {
    name: "GPU TOTAL MEMORY",
    type: "gpu_memory_total",
    orderField: "gpu_memory_total",
  },
  gpuModel: { name: "GPU MODEL", type: "gpu_model" },
  hwVirt: {
    name: "HW VIRT",
    type: "text",
    key: "hw_virt",
    orderField: "hw_virt",
  },
  inboundTraffic: {
    name: "INBOUND TRAFFIC",
    type: "text",
    key: "inbound_traffic",
    orderField: "inbound_traffic",
  },
  ipv4: {
    name: "IPV4",
    type: "text",
    key: "ipv4",
    orderField: "ipv4",
  },
  maxIops: {
    name: "MAX IOPS",
    type: "text",
    key: "storage.max_iops",
    orderField: "max_iops",
  },
  maxThroughput: {
    name: "MAX THROUGHPUT",
    type: "text",
    key: "storage.max_throughput",
    orderField: "max_throughput",
  },
  memory: { name: "MEMORY", type: "memory", orderField: "memory_amount" },
  name: { name: "NAME & PROVIDER", type: "name" },
  networkSpeed: {
    name: "NETWORK SPEED",
    type: "network_speed",
    orderField: "network_speed_baseline",
  },
  outboundTraffic: {
    name: "OUTBOUND TRAFFIC",
    type: "text",
    key: "outbound_traffic",
    orderField: "outbound_traffic",
  },
  price: { name: "PRICE", type: "price", orderField: "price" },
  priceMonthly: { name: "PRICE TOTAL", type: "priceMonthly" },
  priceTiers: { name: "PRICE TIERS", type: "price_tiers" },
  processor: { name: "PROCESSOR", type: "processor", orderField: "vcpus" },
  region: { name: "REGION", type: "region" },
  score: {
    name: "SCORE",
    type: "score",
    orderField: "score",
    info: COLUMN_SCORE_TOOLTIP,
  },
  scorePerPrice: {
    name: "$CORE",
    type: "score_per_price",
    orderField: "score_per_price",
    info: COLUMN_SCORE_PER_PRICE_TOOLTIP,
  },
  serverGpuMemoryMin: {
    name: "GPU MIN MEMORY",
    type: "gpu_memory_min",
    key: "server.gpu_memory_min",
  },
  serverGpuMemoryTotal: {
    name: "GPU TOTAL MEMORY",
    type: "gpu_memory_total",
    key: "server.gpu_memory_total",
  },
  startTime: {
    name: "START TIME",
    type: "text",
    key: "average_time_to_start",
    orderField: "average_time_to_start",
  },
  status: { name: "STATUS", type: "text", key: "status" },
  storage: { name: "STORAGE", type: "storage", orderField: "storage_size" },
  storageMax: { name: "MAX", type: "storage", key: "storage.max_size" },
  storageMin: { name: "MIN", type: "storage", key: "storage.min_size" },
  storageName: { name: "NAME", type: "name", key: "storage.name" },
  storageSpeed: {
    name: "STORAGE SPEED",
    type: "storage_speed",
    orderField: "network_storage_speed_baseline",
  },
  storageType: {
    name: "STORAGE TYPE",
    type: "text",
    key: "storage_type",
  },
  vendor: {
    name: "VENDOR",
    type: "vendor",
    key: "vendor_id",
    orderField: "vendor_id",
  },
  zone: { name: "ZONE", type: "text", key: "zone.name" },
} satisfies Record<string, Omit<TableColumn, "show">>;

export function buildServerListingColumns(): TableColumn[] {
  return [
    { ...COLUMNS.name, show: true },
    { ...COLUMNS.vendor, show: false },
    { ...COLUMNS.architecture, show: false },
    { ...COLUMNS.processor, show: true },
    { ...COLUMNS.cpuModel, show: false },
    { ...COLUMNS.cpuCache, show: false },
    { ...COLUMNS.cpuAllocation, show: false },
    { ...COLUMNS.hwVirt, show: false },
    { ...COLUMNS.startTime, show: false },
    { ...COLUMNS.score, show: false },
    { ...COLUMNS.scorePerPrice, show: false },
    { ...COLUMNS.benchmark, show: true },
    { ...COLUMNS.benchmarkEfficiency, show: true },
    { ...COLUMNS.memory, show: true },
    { ...COLUMNS.gpu, show: true },
    { ...COLUMNS.gpuMemoryMin, show: false },
    { ...COLUMNS.gpuMemoryTotal, show: false },
    { ...COLUMNS.gpuModel, show: false },
    { ...COLUMNS.storage, show: true },
    { ...COLUMNS.storageType, show: false },
    { ...COLUMNS.networkSpeed, show: false },
    { ...COLUMNS.storageSpeed, show: false },
    { ...COLUMNS.inboundTraffic, show: false },
    { ...COLUMNS.outboundTraffic, show: false },
    { ...COLUMNS.ipv4, show: false },
    { ...COLUMNS.bestPrice, show: true },
    { ...COLUMNS.bestOndemandPrice, show: false },
    { ...COLUMNS.bestOndemandMonthlyPrice, show: false },
    { ...COLUMNS.bestSpotPrice, show: false },
    { ...COLUMNS.status, show: false },
  ];
}

export function buildAdvisorColumns(workloadTooltip: string): TableColumn[] {
  return [
    { ...COLUMNS.name, show: true },
    { ...COLUMNS.vendor, show: false },
    { ...COLUMNS.architecture, show: false },
    { ...COLUMNS.processor, show: true },
    { ...COLUMNS.cpuModel, key: "cpu_model", show: false },
    { ...COLUMNS.cpuCache, show: false },
    { ...COLUMNS.cpuAllocation, show: false },
    { ...COLUMNS.score, key: "score", show: false },
    { ...COLUMNS.scorePerPrice, key: "score_per_price", show: false },
    {
      ...COLUMNS.benchmark,
      name: "WORKLOAD",
      key: "selected_benchmark_score",
      info: workloadTooltip,
      show: true,
    },
    {
      ...COLUMNS.benchmarkEfficiency,
      key: "selected_benchmark_score_per_price",
      show: true,
    },
    { ...COLUMNS.memory, key: "memory_amount", show: true },
    { ...COLUMNS.gpu, key: "gpu_count", show: true },
    { ...COLUMNS.gpuMemoryMin, key: "gpu_memory_min", show: false },
    { ...COLUMNS.gpuMemoryTotal, key: "gpu_memory_total", show: false },
    { ...COLUMNS.gpuModel, key: "gpu_model", show: false },
    { ...COLUMNS.storage, key: "storage_size", show: true },
    { ...COLUMNS.storageType, show: false },
    { ...COLUMNS.networkSpeed, key: "network_speed_baseline", show: false },
    {
      ...COLUMNS.storageSpeed,
      type: "network_speed",
      key: "network_storage_speed_baseline",
      show: false,
    },
    { ...COLUMNS.inboundTraffic, type: "inbound_traffic", show: false },
    { ...COLUMNS.outboundTraffic, type: "outbound_traffic", show: false },
    { ...COLUMNS.ipv4, type: "ipv4", show: false },
    { ...COLUMNS.bestPrice, show: true },
    { ...COLUMNS.bestOndemandPrice, show: false },
    { ...COLUMNS.bestOndemandMonthlyPrice, show: false },
    { ...COLUMNS.bestSpotPrice, show: false },
    { ...COLUMNS.status, orderField: "status", show: false },
  ];
}

export function buildServerPricesColumns(): TableColumn[] {
  return [
    { ...COLUMNS.name, show: true },
    { ...COLUMNS.vendor, show: false },
    { ...COLUMNS.region, show: false },
    { ...COLUMNS.zone, show: false },
    { ...COLUMNS.continent, show: false },
    { ...COLUMNS.country, show: false },
    {
      ...COLUMNS.architecture,
      key: "server.cpu_architecture",
      show: false,
    },
    { ...COLUMNS.processor, show: true },
    { ...COLUMNS.cpuModel, show: false },
    { ...COLUMNS.cpuAllocation, key: "server.cpu_allocation", show: false },
    {
      ...COLUMNS.hwVirt,
      key: "server.hw_virt",
      orderField: "server.hw_virt",
      show: false,
    },
    {
      ...COLUMNS.startTime,
      key: "server.average_time_to_start",
      orderField: "server.average_time_to_start",
      show: false,
    },
    { ...COLUMNS.score, show: true },
    { ...COLUMNS.scorePerPrice, show: false },
    { ...COLUMNS.memory, show: true },
    { ...COLUMNS.storage, show: true },
    { ...COLUMNS.storageType, key: "server.storage_type", show: false },
    { ...COLUMNS.gpu, orderField: "server.gpu_count", show: true },
    { ...COLUMNS.serverGpuMemoryMin, show: false },
    { ...COLUMNS.serverGpuMemoryTotal, show: false },
    { ...COLUMNS.gpuModel, show: false },
    { ...COLUMNS.price, show: true },
    { ...COLUMNS.status, key: "server.status", show: false },
  ];
}

export function buildStoragePricesColumns(): TableColumn[] {
  return [
    { ...COLUMNS.vendor, show: true },
    { ...COLUMNS.storageName, show: true },
    { ...COLUMNS.region, show: true },
    { ...COLUMNS.storageMin, show: true },
    { ...COLUMNS.storageMax, show: true },
    {
      ...COLUMNS.storageType,
      name: "TYPE",
      key: "storage.storage_type",
      show: true,
    },
    { ...COLUMNS.maxIops, show: true },
    { ...COLUMNS.maxThroughput, show: true },
    { ...COLUMNS.price, show: true },
  ];
}

export function buildTrafficPricesColumns(): TableColumn[] {
  return [
    { ...COLUMNS.vendor, show: true, orderField: null },
    { ...COLUMNS.region, show: true },
    { ...COLUMNS.direction, show: true },
    { ...COLUMNS.price, show: true },
    { ...COLUMNS.priceTiers, show: true },
    { ...COLUMNS.priceMonthly, show: true },
  ];
}
