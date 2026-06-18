import { Server } from "../../../../sdk/data-contracts";
import { SearchBarServerOption } from "../../components/search-bar/search-bar.component";

export type AdvisorBaselineServer = SearchBarServerOption &
  Partial<
    Pick<
      Server,
      | "status"
      | "network_speed_baseline"
      | "network_speed_max"
      | "network_storage_speed_baseline"
      | "network_storage_speed_max"
      | "inbound_traffic"
      | "outbound_traffic"
    >
  >;

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
