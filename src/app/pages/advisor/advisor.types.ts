import { Server, ServerPKs } from "../../../../sdk/data-contracts";
import { SearchBarServerOption } from "../../components/search-bar/search-bar.component";

export type AdvisorTableColumn = {
  name: string;
  type:
    | "name"
    | "vendor"
    | "score"
    | "score_per_price"
    | "processor"
    | "cpu_model"
    | "cpu_cache"
    | "benchmark"
    | "benchmark_score_per_price"
    | "memory"
    | "gpu"
    | "gpu_memory_min"
    | "gpu_memory_total"
    | "gpu_model"
    | "storage"
    | "price"
    | "network_speed"
    | "inbound_traffic"
    | "outbound_traffic"
    | "ipv4"
    | "text";
  key?: keyof ServerPKs | "vendor_id";
  show: boolean;
  orderField?: string;
  info?: string;
};

export type AdvisorBaselineServer = SearchBarServerOption &
  Partial<Pick<Server, "status">>;

export type AdvisorRegionMetadata = {
  region_id: string;
  vendor_id: string;
  name: string;
};

export type AdvisorOptimizationGoal =
  | "performance"
  | "cost"
  | "cost-efficiency";

export type AdvisorCompareTarget = {
  display_name: string;
  vendor: string;
  server: string;
};

export type AdvisorSeoMetadata = {
  title: string;
  description: string;
  keywords: string;
};

export type AdvisorSummaryAlert = {
  tone: "positive" | "neutral";
  title: string;
  body: string;
};

export type AdvisorDeltaTone = "positive" | "negative" | "neutral";

export type AdvisorMetricDelta = {
  baselineValue: number | null;
  candidateValue: number | null;
  percentageDelta: number | null;
  tone: AdvisorDeltaTone;
};

export type AdvisorPriceColumnKey =
  | "min_price"
  | "min_price_spot"
  | "min_price_ondemand"
  | "min_price_ondemand_monthly";

export type AdvisorBaselinePriceAggregate = Record<
  AdvisorPriceColumnKey,
  number | null
>;
