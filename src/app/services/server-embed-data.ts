import { Injectable, inject } from "@angular/core";
import {
  Benchmark,
  IdNameAndDescriptionAndCategory,
  ServerDescription,
} from "../../../sdk/data-contracts";
import { DetailsCardSection } from "../components/details-card/details-card.types";
import { DetailsEmbedCard, DetailsEmbedModel } from "./details-embed.types";
import { KeeperAPI } from "./keeper-api";
import { ServerSpecCards } from "./server-spec-cards";
import {
  BenchmarkScoreBody,
  ServerBody,
  ServerCardDefinition,
} from "./server-embed.types";
import {
  NON_CHART_WIDGET_IDS,
  PROPERTY_CARD_WIDGET_IDS,
  SERVER_CARD_WIDGETS,
} from "./server-embed.constants";

@Injectable({ providedIn: "root" })
export class ServerEmbedData {
  private keeperAPI = inject(KeeperAPI);
  private serverSpecCards = inject(ServerSpecCards);

  async load(
    vendor: string,
    id: string,
    widgetId: string,
  ): Promise<DetailsEmbedModel | null> {
    const skipped = Promise.resolve({ body: null });
    const needsSections = PROPERTY_CARD_WIDGET_IDS.includes(widgetId);
    const needsPrices = widgetId === "availability";
    const needsBenchmarks = !NON_CHART_WIDGET_IDS.includes(widgetId);

    const [
      benchmarkMeta,
      benchmarks,
      serverBody,
      serverMeta,
      prices,
      regions,
      zones,
      description,
    ] = (
      await Promise.all([
        needsBenchmarks ? this.keeperAPI.getServerBenchmarkMeta() : skipped,
        needsBenchmarks
          ? this.keeperAPI.getServerBenchmark(vendor, id)
          : skipped,
        this.keeperAPI.getServerV2(vendor, id),
        needsSections ? this.keeperAPI.getServerMeta() : skipped,
        needsPrices
          ? this.keeperAPI.getServerPrices(vendor, id, undefined, false)
          : skipped,
        needsPrices ? this.keeperAPI.getRegions() : skipped,
        needsPrices ? this.keeperAPI.getZones() : skipped,
        widgetId === "description"
          ? this.keeperAPI
              .getServerDescriptions(vendor, id)
              .catch(() => skipped)
          : skipped,
      ])
    ).map((response) => response?.body);

    if (!serverBody) {
      return null;
    }

    const server = JSON.parse(JSON.stringify(serverBody)) as ServerBody;
    const model: DetailsEmbedModel = {
      path: `/server/${server.vendor_id}/${server.server_id}`,
      linkLabel: server.display_name,
    };

    const card = Object.hasOwn(SERVER_CARD_WIDGETS, widgetId)
      ? SERVER_CARD_WIDGETS[widgetId]
      : undefined;
    if (card) {
      model.card = this.buildCard(
        card,
        widgetId === "availability"
          ? this.serverSpecCards.buildAvailabilitySections(
              this.serverSpecCards.buildAvailabilityRegions(
                this.serverSpecCards.preparePrices(
                  prices || [],
                  server.status,
                  regions || [],
                  zones || [],
                ),
              ),
            )
          : this.cardSections(widgetId, server, serverMeta?.fields || []),
      );
      return model;
    }

    if (widgetId === "lstopo") {
      model.lstopo = {
        vendorId: server.vendor_id,
        apiReference: server.api_reference,
      };
      return model;
    }

    if (widgetId === "description") {
      model.description = (description as ServerDescription) || undefined;
      return model;
    }

    const scores = (benchmarks || []) as BenchmarkScoreBody[];
    const score = scores.find(
      (benchmark) => benchmark.benchmark_id === "stress_ng:bestn",
    )?.score;
    server["benchmark_scores"] = scores;
    server["score"] = score;
    server["score_per_price"] =
      server.min_price && score ? score / server.min_price : score || 0;

    model.serverCharts = {
      serverDetails: server,
      benchmarksByCategory: this.groupBenchmarks(scores),
      benchmarkMeta: (benchmarkMeta || []) as Benchmark[],
    };
    return model;
  }

  private cardSections(
    widgetId: string,
    server: ServerBody,
    fields: IdNameAndDescriptionAndCategory[],
  ): DetailsCardSection[] {
    const sections = this.serverSpecCards.buildSections(server, fields);
    switch (widgetId) {
      case "metadata":
        return sections.metadataSections;
      case "processor":
        return sections.processorSections;
      default:
        return sections.resourceSections;
    }
  }

  private buildCard(
    definition: ServerCardDefinition,
    sections: DetailsCardSection[],
  ): DetailsEmbedCard {
    return { ...definition, sections };
  }

  private groupBenchmarks(scores: BenchmarkScoreBody[]) {
    const groups: { benchmark_id: string; benchmarks: BenchmarkScoreBody[] }[] =
      [];
    scores.forEach((score) => {
      let groupId = score.benchmark_id;
      if (groupId.includes("passmark:")) {
        groupId = groupId.includes("passmark:cpu_")
          ? "passmark:cpu"
          : "passmark:other";
      }
      const group = groups.find((item) => item.benchmark_id === groupId);
      if (group) {
        group.benchmarks.push(score);
      } else {
        groups.push({ benchmark_id: groupId, benchmarks: [score] });
      }
    });
    return groups;
  }
}
