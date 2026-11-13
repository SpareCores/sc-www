import { Benchmark, ServerDescription } from "../../../sdk/data-contracts";
import { PgbenchChartResult } from "../components/charts/line/benchmark-line-chart.types";
import { DetailsCardSection } from "../components/details-card/details-card.types";

export interface PgbenchChartMeta {
  title: string;
  infoTooltip: string;
  noteTooltip: string;
}

export interface DetailsEmbedCard {
  cardId: string;
  cardTitle: string;
  sections: DetailsCardSection[];
  fixedRows: boolean;
}

export interface ServerChartsEmbed {
  serverDetails: Record<string, unknown>;
  benchmarksByCategory: { benchmark_id: string; benchmarks: unknown[] }[];
  benchmarkMeta: Benchmark[];
}

export interface DetailsEmbedModel {
  path: string;
  linkLabel: string;
  card?: DetailsEmbedCard;
  serverCharts?: ServerChartsEmbed;
  lstopo?: { vendorId: string; apiReference: string };
  description?: ServerDescription;
  pgbench?: { meta: PgbenchChartMeta; chart?: PgbenchChartResult };
}
