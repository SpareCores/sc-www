import { Injectable, inject } from "@angular/core";
import {
  Benchmark,
  Database,
  DatabasePrice,
  Region,
} from "../../../sdk/data-contracts";
import {
  LineBenchmarkMeta,
  PgbenchScore,
} from "../components/charts/line/benchmark-line-chart.types";
import { ComparedDatabase } from "./compare-selection";
import { DatabaseCompareSpecs } from "./database-compare-specs";
import { DatabaseSpecCards } from "./database-spec-cards";
import { LoadedDatabase } from "./database-spec-cards.types";
import { DatabaseUnderlyingServer } from "./database-underlying-server";
import { DatabasePgbench, hasPgbenchScores } from "./database-pgbench";
import {
  COMPARE_PGBENCH_TITLE_FALLBACK,
  DETAILS_PGBENCH_TITLE_FALLBACK,
} from "./database-pgbench.constants";
import { DetailsEmbedModel } from "./details-embed.types";
import { KeeperAPI } from "./keeper-api";
import { DatabaseCompareEmbedDetails } from "./database-embed.types";
import {
  DATABASE_CARDS,
  DATABASE_COMPARE_SPECS_WIDGET_ID,
  DATABASE_PGBENCH_WIDGET_ID,
  UNDERLYING_SERVER_PGBENCH_WIDGET_ID,
} from "./database-embed.constants";

@Injectable({ providedIn: "root" })
export class DatabaseEmbedData {
  private keeperAPI = inject(KeeperAPI);
  private pgbench = inject(DatabasePgbench);
  private specCards = inject(DatabaseSpecCards);
  private compareSpecs = inject(DatabaseCompareSpecs);
  private underlyingServer = inject(DatabaseUnderlyingServer);

  async loadDetails(
    vendor: string,
    id: string,
    widgetId: string,
  ): Promise<DetailsEmbedModel | null> {
    const card = DATABASE_CARDS.find((item) => item.id === widgetId);
    const isDatabaseChart = widgetId === DATABASE_PGBENCH_WIDGET_ID;
    const isServerChart = widgetId === UNDERLYING_SERVER_PGBENCH_WIDGET_ID;
    const needsPrices = widgetId === "availability";
    const needsServer = isServerChart || widgetId === "metadata";

    const [databaseResponse, benchmarkMeta, prices, regions, databaseScores] =
      await Promise.all([
        this.keeperAPI.getDatabase(vendor, id),
        card ? Promise.resolve([] as Benchmark[]) : this.loadBenchmarkMeta(),
        needsPrices
          ? this.keeperAPI
              .getDatabasePrices(vendor, id)
              .then((response) => (response.body || []) as DatabasePrice[])
          : Promise.resolve([] as DatabasePrice[]),
        needsPrices
          ? this.keeperAPI
              .getRegions()
              .then((response) => (response?.body || []) as Region[])
          : Promise.resolve([] as Region[]),
        isDatabaseChart
          ? this.loadScores(this.keeperAPI.getDatabaseBenchmarks(vendor, id))
          : Promise.resolve([] as PgbenchScore[]),
      ]);
    const body = databaseResponse.body as Database | undefined;
    if (!body) {
      return null;
    }

    const underlying = needsServer
      ? await this.underlyingServer.load(body, isServerChart)
      : undefined;
    const server = underlying?.server;
    const database: LoadedDatabase = {
      ...body,
      prices: this.specCards.attachPrices(prices, regions),
      underlyingServer: server,
    };
    const model: DetailsEmbedModel = {
      path: `/database/${database.vendor_id}/${database.api_reference}`,
      linkLabel: database.display_name,
    };

    if (card) {
      model.card = {
        cardId: card.cardId,
        cardTitle: card.name,
        fixedRows: card.fixedRows,
        sections: card.sections(
          this.specCards.buildSections(database),
          this.specCards.buildAvailabilitySections(database.prices || []),
        ),
      };
      return model;
    }

    model.pgbench = {
      meta: this.pgbench.meta(benchmarkMeta, DETAILS_PGBENCH_TITLE_FALLBACK),
      chart: isServerChart
        ? server && underlying && hasPgbenchScores(underlying.scores)
          ? this.pgbench.detailsChart(
              underlying.scores,
              server.vcpus ?? server.cpu_cores,
              benchmarkMeta,
            )
          : undefined
        : this.pgbench.detailsChart(
            databaseScores,
            database.vcpus,
            benchmarkMeta,
          ),
    };
    return model;
  }

  async loadCompare(
    instances: ComparedDatabase[],
    widgetId: string,
  ): Promise<DatabaseCompareEmbedDetails> {
    const specs = widgetId === DATABASE_COMPARE_SPECS_WIDGET_ID;
    const { benchmarkMeta, databases } = await this.compareSpecs.load(
      instances,
      "USD",
      { specs, pgbench: !specs },
    );

    return {
      pgbench: this.pgbench.meta(benchmarkMeta, COMPARE_PGBENCH_TITLE_FALLBACK),
      databases,
      servers: this.pgbench.lineServers(databases),
      benchmarkMeta: benchmarkMeta as LineBenchmarkMeta[],
      propertySections: specs
        ? this.compareSpecs.buildPropertySections(databases)
        : [],
      priceRows: specs ? this.compareSpecs.buildPriceRows(databases) : [],
    };
  }

  private loadScores(
    request: Promise<{ body?: unknown }>,
  ): Promise<PgbenchScore[]> {
    return request
      .then((response) => (response?.body || []) as PgbenchScore[])
      .catch(() => [] as PgbenchScore[]);
  }

  private loadBenchmarkMeta(): Promise<Benchmark[]> {
    return this.keeperAPI
      .getServerBenchmarkMeta()
      .then((response) => (response?.body || []) as Benchmark[])
      .catch(() => [] as Benchmark[]);
  }
}
