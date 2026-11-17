import { EmbedWidgetOption } from "../../components/embed-dialog/embed-dialog.types";
export const SERVER_COMPARE_TABLE_ID = "main-table";
export const SERVER_COMPARE_TABLE_HOLDER_ID = "table_holder";
export const SERVER_COMPARE_FIRST_COL_ID = "server-compare-table-first-col";
export const SERVER_COMPARE_VIEW_SERVER_ROW_ID =
  "server-compare-view-server-row";

export const SERVER_COMPARE_KEYWORDS =
  "compare, servers, server, hosting, cloud, vps, dedicated, comparison";

export const SERVER_COMPARE_EMBEDDABLE_WIDGETS: EmbedWidgetOption[] = [
  { id: "generic", name: "Server Specs and Prices" },
  { id: "workload_profile", name: "Workload Profiles" },
  { id: "nvbandwidth", name: "GPU Bandwidth and Latency" },
  { id: "bw_mem", name: "Memory Bandwidth" },
  { id: "compress", name: "Compression" },
  { id: "openssl", name: "OpenSSL" },
  { id: "geekbench", name: "Geekbench Single- and Multi-core" },
  { id: "geekbench_single", name: "Geekbench Single-core" },
  { id: "geekbench_multi", name: "Geekbench Multi-core" },
  { id: "passmark_cpu", name: "PassMark CPU" },
  { id: "passmark_other", name: "PassMark Memory" },
  { id: "stress_ng_full", name: "Stress-ng Stressors" },
  { id: "stress_ng", name: "Stress-ng div16" },
  { id: "stress_ng_pct", name: "Stress-ng Relative" },
  { id: "llm_inference", name: "LLM Inference" },
  { id: "static_web", name: "Static Web Server" },
  { id: "redis", name: "Redis" },
  { id: "pgbench", name: "PostgreSQL heavy read-only throughput" },
];

export const SERVER_COMPARE_GUIDE_TITLE = "Server Compare Guide";

export const SERVER_COMPARISON_TITLE = "Server Comparison";

export const SERVER_COMPARE_PARENT_BREADCRUMB = "Servers";

export const SERVER_COMPARE_GUIDE_DESCRIPTION =
  "Compare cloud servers characteristics, such as CPU, GPU, memory and storage details, and the performance of the instances by various benchmarking workloads to find the optimal compute resource for your needs.";
