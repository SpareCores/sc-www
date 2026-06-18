import {
  COLUMN_BENCHMARK_EFFICIENCY_TOOLTIP,
  COLUMN_BENCHMARK_TOOLTIP,
  COLUMN_SCORE_PER_PRICE_TOOLTIP,
  COLUMN_SCORE_TOOLTIP,
} from "./column-tooltips";
import {
  buildAdvisorColumns,
  buildServerListingColumns,
  buildServerPricesColumns,
  buildStoragePricesColumns,
  buildTrafficPricesColumns,
  TableColumn,
} from "./table-columns";

const ADVISOR_WORKLOAD_SCORE_TOOLTIP = "Selected workload score.";

const EXPECTED_SERVER_LISTING_COLUMNS: TableColumn[] = [
  { name: "NAME & PROVIDER", show: true, type: "name" },
  {
    name: "VENDOR",
    show: false,
    type: "vendor",
    key: "vendor_id",
    orderField: "vendor_id",
  },
  {
    name: "ARCHITECTURE",
    show: false,
    type: "text",
    key: "cpu_architecture",
  },
  { name: "PROCESSOR", show: true, type: "processor", orderField: "vcpus" },
  { name: "CPU MODEL", show: false, type: "cpu_model" },
  { name: "CPU CACHE", show: false, type: "cpu_cache" },
  {
    name: "CPU ALLOCATION",
    show: false,
    type: "text",
    key: "cpu_allocation",
  },
  {
    name: "HW VIRT",
    show: false,
    type: "text",
    key: "hw_virt",
    orderField: "hw_virt",
  },
  {
    name: "START TIME",
    show: false,
    type: "text",
    key: "average_time_to_start",
    orderField: "average_time_to_start",
  },
  {
    name: "SCORE",
    show: false,
    type: "score",
    orderField: "score",
    info: COLUMN_SCORE_TOOLTIP,
  },
  {
    name: "$CORE",
    show: false,
    type: "score_per_price",
    orderField: "score_per_price",
    info: COLUMN_SCORE_PER_PRICE_TOOLTIP,
  },
  {
    name: "BENCHMARK",
    show: true,
    type: "benchmark",
    orderField: "selected_benchmark_score",
    info: COLUMN_BENCHMARK_TOOLTIP,
  },
  {
    name: "$ EFFICIENCY",
    show: true,
    type: "benchmark_score_per_price",
    orderField: "selected_benchmark_score_per_price",
    info: COLUMN_BENCHMARK_EFFICIENCY_TOOLTIP,
  },
  { name: "MEMORY", show: true, type: "memory", orderField: "memory_amount" },
  { name: "GPUs", show: true, type: "gpu", orderField: "gpu_count" },
  {
    name: "GPU MIN MEMORY",
    show: false,
    type: "gpu_memory_min",
    orderField: "gpu_memory_min",
  },
  {
    name: "GPU TOTAL MEMORY",
    show: false,
    type: "gpu_memory_total",
    orderField: "gpu_memory_total",
  },
  { name: "GPU MODEL", show: false, type: "gpu_model" },
  {
    name: "STORAGE",
    show: true,
    type: "storage",
    orderField: "storage_size",
  },
  { name: "STORAGE TYPE", show: false, type: "text", key: "storage_type" },
  {
    name: "NETWORK SPEED",
    show: false,
    type: "network_speed",
    orderField: "network_speed_baseline",
  },
  {
    name: "STORAGE SPEED",
    show: false,
    type: "storage_speed",
    orderField: "network_storage_speed_baseline",
  },
  {
    name: "INBOUND TRAFFIC",
    show: false,
    type: "text",
    key: "inbound_traffic",
    orderField: "inbound_traffic",
  },
  {
    name: "OUTBOUND TRAFFIC",
    show: false,
    type: "text",
    key: "outbound_traffic",
    orderField: "outbound_traffic",
  },
  {
    name: "IPV4",
    show: false,
    type: "text",
    key: "ipv4",
    orderField: "ipv4",
  },
  {
    name: "BEST PRICE",
    show: true,
    type: "price",
    key: "min_price",
    orderField: "min_price",
  },
  {
    name: "BEST ONDEMAND PRICE",
    show: false,
    type: "price",
    key: "min_price_ondemand",
    orderField: "min_price_ondemand",
  },
  {
    name: "BEST ONDEMAND MONTHLY PRICE",
    show: false,
    type: "price",
    key: "min_price_ondemand_monthly",
    orderField: "min_price_ondemand_monthly",
  },
  {
    name: "BEST SPOT PRICE",
    show: false,
    type: "price",
    key: "min_price_spot",
    orderField: "min_price_spot",
  },
  { name: "STATUS", show: false, type: "text", key: "status" },
];

const EXPECTED_SERVER_PRICES_COLUMNS: TableColumn[] = [
  { name: "NAME & PROVIDER", show: true, type: "name" },
  {
    name: "VENDOR",
    show: false,
    type: "vendor",
    key: "vendor_id",
    orderField: "vendor_id",
  },
  { name: "REGION", show: false, type: "region" },
  { name: "ZONE", show: false, type: "text", key: "zone.name" },
  {
    name: "CONTINENT",
    show: false,
    type: "text",
    key: "region.country.continent",
  },
  { name: "COUNTRY", show: false, type: "country" },
  {
    name: "ARCHITECTURE",
    show: false,
    type: "text",
    key: "server.cpu_architecture",
  },
  { name: "PROCESSOR", show: true, type: "processor", orderField: "vcpus" },
  { name: "CPU MODEL", show: false, type: "cpu_model" },
  {
    name: "CPU ALLOCATION",
    show: false,
    type: "text",
    key: "server.cpu_allocation",
  },
  {
    name: "HW VIRT",
    show: false,
    type: "text",
    key: "server.hw_virt",
    orderField: "server.hw_virt",
  },
  {
    name: "START TIME",
    show: false,
    type: "text",
    key: "server.average_time_to_start",
    orderField: "server.average_time_to_start",
  },
  {
    name: "SCORE",
    show: true,
    type: "score",
    orderField: "score",
    info: COLUMN_SCORE_TOOLTIP,
  },
  {
    name: "$CORE",
    show: false,
    type: "score_per_price",
    orderField: "score_per_price",
    info: COLUMN_SCORE_PER_PRICE_TOOLTIP,
  },
  { name: "MEMORY", show: true, type: "memory", orderField: "memory_amount" },
  {
    name: "STORAGE",
    show: true,
    type: "storage",
    orderField: "storage_size",
  },
  {
    name: "STORAGE TYPE",
    show: false,
    type: "text",
    key: "server.storage_type",
  },
  { name: "GPUs", show: true, type: "gpu", orderField: "server.gpu_count" },
  {
    name: "GPU MIN MEMORY",
    show: false,
    type: "gpu_memory_min",
    key: "server.gpu_memory_min",
  },
  {
    name: "GPU TOTAL MEMORY",
    show: false,
    type: "gpu_memory_total",
    key: "server.gpu_memory_total",
  },
  { name: "GPU MODEL", show: false, type: "gpu_model" },
  { name: "PRICE", show: true, type: "price", orderField: "price" },
  { name: "STATUS", show: false, type: "text", key: "server.status" },
];

const EXPECTED_STORAGES_COLUMNS: TableColumn[] = [
  {
    name: "VENDOR",
    show: true,
    type: "vendor",
    key: "vendor_id",
    orderField: "vendor_id",
  },
  { name: "NAME", show: true, type: "name", key: "storage.name" },
  { name: "REGION", show: true, type: "region" },
  { name: "MIN", show: true, type: "storage", key: "storage.min_size" },
  { name: "MAX", show: true, type: "storage", key: "storage.max_size" },
  { name: "TYPE", show: true, type: "text", key: "storage.storage_type" },
  {
    name: "MAX IOPS",
    show: true,
    type: "text",
    key: "storage.max_iops",
    orderField: "max_iops",
  },
  {
    name: "MAX THROUGHPUT",
    show: true,
    type: "text",
    key: "storage.max_throughput",
    orderField: "max_throughput",
  },
  { name: "PRICE", show: true, type: "price", orderField: "price" },
];

const EXPECTED_TRAFFIC_PRICES_COLUMNS: TableColumn[] = [
  {
    name: "VENDOR",
    show: true,
    type: "vendor",
    key: "vendor_id",
    orderField: null,
  },
  { name: "REGION", show: true, type: "region" },
  { name: "DIRECTION", show: true, type: "text", key: "direction" },
  { name: "PRICE", show: true, type: "price", orderField: "price" },
  { name: "PRICE TIERS", show: true, type: "price_tiers" },
  { name: "PRICE TOTAL", show: true, type: "priceMonthly" },
];

const EXPECTED_ADVISOR_COLUMNS: TableColumn[] = [
  { name: "NAME & PROVIDER", show: true, type: "name" },
  {
    name: "VENDOR",
    show: false,
    type: "vendor",
    key: "vendor_id",
    orderField: "vendor_id",
  },
  {
    name: "ARCHITECTURE",
    show: false,
    type: "text",
    key: "cpu_architecture",
  },
  { name: "PROCESSOR", show: true, type: "processor", orderField: "vcpus" },
  { name: "CPU MODEL", show: false, type: "cpu_model", key: "cpu_model" },
  { name: "CPU CACHE", show: false, type: "cpu_cache" },
  {
    name: "CPU ALLOCATION",
    show: false,
    type: "text",
    key: "cpu_allocation",
  },
  {
    name: "SCORE",
    show: false,
    type: "score",
    key: "score",
    orderField: "score",
    info: COLUMN_SCORE_TOOLTIP,
  },
  {
    name: "$CORE",
    show: false,
    type: "score_per_price",
    key: "score_per_price",
    orderField: "score_per_price",
    info: COLUMN_SCORE_PER_PRICE_TOOLTIP,
  },
  {
    name: "WORKLOAD",
    show: true,
    type: "benchmark",
    key: "selected_benchmark_score",
    orderField: "selected_benchmark_score",
    info: ADVISOR_WORKLOAD_SCORE_TOOLTIP,
  },
  {
    name: "$ EFFICIENCY",
    show: true,
    type: "benchmark_score_per_price",
    key: "selected_benchmark_score_per_price",
    orderField: "selected_benchmark_score_per_price",
    info: COLUMN_BENCHMARK_EFFICIENCY_TOOLTIP,
  },
  {
    name: "MEMORY",
    show: true,
    type: "memory",
    key: "memory_amount",
    orderField: "memory_amount",
  },
  {
    name: "GPUs",
    show: true,
    type: "gpu",
    key: "gpu_count",
    orderField: "gpu_count",
  },
  {
    name: "GPU MIN MEMORY",
    show: false,
    type: "gpu_memory_min",
    key: "gpu_memory_min",
    orderField: "gpu_memory_min",
  },
  {
    name: "GPU TOTAL MEMORY",
    show: false,
    type: "gpu_memory_total",
    key: "gpu_memory_total",
    orderField: "gpu_memory_total",
  },
  { name: "GPU MODEL", show: false, type: "gpu_model", key: "gpu_model" },
  {
    name: "STORAGE",
    show: true,
    type: "storage",
    key: "storage_size",
    orderField: "storage_size",
  },
  { name: "STORAGE TYPE", show: false, type: "text", key: "storage_type" },
  {
    name: "NETWORK SPEED",
    show: false,
    type: "network_speed",
    key: "network_speed_baseline",
    orderField: "network_speed_baseline",
  },
  {
    name: "STORAGE SPEED",
    show: false,
    type: "network_speed",
    key: "network_storage_speed_baseline",
    orderField: "network_storage_speed_baseline",
  },
  {
    name: "INBOUND TRAFFIC",
    show: false,
    type: "inbound_traffic",
    key: "inbound_traffic",
    orderField: "inbound_traffic",
  },
  {
    name: "OUTBOUND TRAFFIC",
    show: false,
    type: "outbound_traffic",
    key: "outbound_traffic",
    orderField: "outbound_traffic",
  },
  {
    name: "IPV4",
    show: false,
    type: "ipv4",
    key: "ipv4",
    orderField: "ipv4",
  },
  {
    name: "BEST PRICE",
    show: true,
    type: "price",
    key: "min_price",
    orderField: "min_price",
  },
  {
    name: "BEST ONDEMAND PRICE",
    show: false,
    type: "price",
    key: "min_price_ondemand",
    orderField: "min_price_ondemand",
  },
  {
    name: "BEST ONDEMAND MONTHLY PRICE",
    show: false,
    type: "price",
    key: "min_price_ondemand_monthly",
    orderField: "min_price_ondemand_monthly",
  },
  {
    name: "BEST SPOT PRICE",
    show: false,
    type: "price",
    key: "min_price_spot",
    orderField: "min_price_spot",
  },
  {
    name: "STATUS",
    show: false,
    type: "text",
    key: "status",
    orderField: "status",
  },
];

describe("table-columns", () => {
  it("builds advisor table columns with preserved order and fields", () => {
    expect(buildAdvisorColumns(ADVISOR_WORKLOAD_SCORE_TOOLTIP)).toEqual(
      EXPECTED_ADVISOR_COLUMNS,
    );
  });

  it("builds server listing table columns with preserved order and fields", () => {
    expect(buildServerListingColumns()).toEqual(
      EXPECTED_SERVER_LISTING_COLUMNS,
    );
  });

  it("builds server prices table columns with preserved order and fields", () => {
    expect(buildServerPricesColumns()).toEqual(EXPECTED_SERVER_PRICES_COLUMNS);
  });

  it("builds storages table columns with preserved order and fields", () => {
    expect(buildStoragePricesColumns()).toEqual(EXPECTED_STORAGES_COLUMNS);
  });

  it("builds traffic prices table columns with preserved order and fields", () => {
    expect(buildTrafficPricesColumns()).toEqual(
      EXPECTED_TRAFFIC_PRICES_COLUMNS,
    );
  });
});
