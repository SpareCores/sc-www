import { Status } from "../../../sdk/data-contracts";

export type ServerCardDefinition = {
  cardId: string;
  cardTitle: string;
  fixedRows: boolean;
};

export type ServerBody = Record<string, unknown> & {
  vendor_id: string;
  server_id: string;
  api_reference: string;
  display_name: string;
  status?: Status;
  min_price?: number;
};

export type BenchmarkScoreBody = { benchmark_id: string; score?: number };
