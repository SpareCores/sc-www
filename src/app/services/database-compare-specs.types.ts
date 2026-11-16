import {
  Benchmark,
  Database,
  DatabasePrice,
  Region,
  Vendor,
} from "../../../sdk/data-contracts";
import { PgbenchScore } from "../components/charts/line/benchmark-line-chart.types";

export type LoadedCompareDatabase = Database & {
  vendor?: Vendor;
  prices?: (DatabasePrice & { region?: Region })[];
  benchmark_scores: PgbenchScore[];
  bestHourPrice?: DatabasePrice;
  bestMonthPrice?: DatabasePrice;
  underlyingServer?: {
    display_name: string;
    api_reference: string;
  };
};

export type ComparePropertyRow = {
  id: string;
  name: string;
  values: string[];
  rawValues: Array<number | null>;
  description?: string;
  lowerIsBetter?: boolean;
};

export type ComparePropertySection = {
  name: string;
  rows: ComparePropertyRow[];
};

export interface LoadedDatabaseCompare {
  benchmarkMeta: Benchmark[];
  databases: LoadedCompareDatabase[];
}

export interface DatabaseCompareInclude {
  specs: boolean;
  pgbench: boolean;
}
