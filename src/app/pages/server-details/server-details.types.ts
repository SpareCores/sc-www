import {
  BenchmarkScore,
  ServerPKs,
  ServerPrice,
} from "../../../../sdk/data-contracts";

export interface ExtendedServerPrice extends ServerPrice {
  region: any;
  zone: any;
}

export interface ExtendedServerDetails extends ServerPKs {
  benchmark_scores: BenchmarkScore[];
  prices: ExtendedServerPrice[];
  bestOndemandPrice?: ExtendedServerPrice;
  bestSpotPrice?: ExtendedServerPrice;
  additionalOndemandPrices?: ExtendedServerPrice[];
  additionalSpotPrices?: ExtendedServerPrice[];
  vendor_name?: string;
}
