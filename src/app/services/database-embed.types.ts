import {
  LineBenchmarkMeta,
  LineChartServer,
} from "../components/charts/line/benchmark-line-chart.types";
import { DetailsCardSection } from "../components/details-card/details-card.types";
import { EmbedWidgetOption } from "../components/embed-dialog/embed-dialog.types";
import {
  ComparePropertyRow,
  ComparePropertySection,
  LoadedCompareDatabase,
} from "./database-compare-specs.types";
import { DatabaseSpecSections } from "./database-spec-cards.types";
import { PgbenchChartMeta } from "./details-embed.types";

export interface DatabaseCompareEmbedDetails {
  pgbench: PgbenchChartMeta;
  databases: LoadedCompareDatabase[];
  servers: LineChartServer[];
  benchmarkMeta: LineBenchmarkMeta[];
  propertySections: ComparePropertySection[];
  priceRows: ComparePropertyRow[];
}

export type DatabaseCardDefinition = EmbedWidgetOption & {
  cardId: string;
  fixedRows: boolean;
  sections: (
    sections: DatabaseSpecSections,
    availability: DetailsCardSection[],
  ) => DetailsCardSection[];
};
