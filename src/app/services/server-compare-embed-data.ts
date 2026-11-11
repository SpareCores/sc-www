import { Injectable, inject } from "@angular/core";
import {
  Allocation,
  Benchmark,
  Region,
  ServerTableMetaData,
  Vendor,
  Zone,
} from "../../../sdk/data-contracts";
import type {
  ExtendedServerDetails,
  ExtendedServerPrice,
} from "../pages/server-details/server-details.types";
import { ComparedServer } from "./compare-selection";
import { KeeperAPI } from "./keeper-api";
import { ServerCompareEmbedDetails } from "./server-compare-embed.types";
import {
  createBenchmarkCategories,
  createInstancePropertyCategories,
} from "./server-compare-embed.constants";

@Injectable({ providedIn: "root" })
export class ServerCompareEmbedData {
  private keeperAPI = inject(KeeperAPI);

  async load(
    instances: ComparedServer[],
    widgetId: string,
  ): Promise<ServerCompareEmbedDetails> {
    const result: ServerCompareEmbedDetails = {
      servers: [],
      instanceProperties: [],
      benchmarkMeta: [],
      benchmarkCategories: createBenchmarkCategories(),
      instancePropertyCategories: createInstancePropertyCategories(),
    };
    result.benchmarkCategories.forEach((category) => {
      category.hidden = !(widgetId === category.id || widgetId === "all");
    });

    const [
      metaResponse,
      benchmarkMetaResponse,
      vendorsResponse,
      regionsResponse,
      zonesResponse,
      ...serverResponses
    ] = await Promise.all([
      this.keeperAPI.getServerMeta(),
      this.keeperAPI.getServerBenchmarkMeta(),
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions(),
      this.keeperAPI.getZones(),
      ...instances.map((instance) =>
        Promise.all([
          this.keeperAPI.getServerV2(instance.vendor, instance.server),
          this.keeperAPI.getServerPrices(
            instance.vendor,
            instance.server,
            "USD",
          ),
          this.keeperAPI.getServerBenchmark(instance.vendor, instance.server),
        ]),
      ),
    ]);
    const meta: ServerTableMetaData = metaResponse.body;
    const benchmarkMeta: Benchmark[] = benchmarkMetaResponse.body;
    const vendors: Vendor[] = vendorsResponse.body;
    const regions: Region[] = regionsResponse.body;
    const zones: Zone[] = zonesResponse.body;

    result.instanceProperties = meta.fields;

    for (const [
      serverResponse,
      pricesResponse,
      scoresResponse,
    ] of serverResponses) {
      const server: ExtendedServerDetails = serverResponse.body;

      server.benchmark_scores = scoresResponse.body;
      server.prices = pricesResponse.body?.sort(
        (a: ExtendedServerPrice, b: ExtendedServerPrice) => a.price - b.price,
      );

      const vendor = vendors.find((v) => v.vendor_id === server.vendor_id);
      if (vendor) {
        server.vendor = vendor;
      }
      server.vendor_name = server.vendor?.name;

      if (server.prices?.length > 0) {
        server.prices.forEach((price) => {
          price.region = regions.find(
            (r) =>
              r.vendor_id === price.vendor_id &&
              r.region_id === price.region_id,
          );
          price.zone = zones.find(
            (z) =>
              z.vendor_id === price.vendor_id &&
              z.region_id === price.region_id &&
              z.zone_id === price.zone_id,
          );
        });
        server.bestOndemandPrice = server.prices
          .filter((x) => x.allocation === Allocation.Ondemand)
          .sort((a, b) => a.price - b.price)
          .at(0);
        server.bestSpotPrice = server.prices
          .filter((x) => x.allocation === Allocation.Spot)
          .sort((a, b) => a.price - b.price)
          .at(0);
      }

      server.score = server.benchmark_scores?.find(
        (b) => b.benchmark_id === "stress_ng:bestn",
      )?.score;
      server.price = server.prices?.length ? server.prices[0].price : 0;
      server.score_per_price =
        server.price && server.score
          ? server.score / server.price
          : server.score || 0;

      result.servers.push(server);
    }

    result.instanceProperties.forEach((p) => {
      const group = result.instancePropertyCategories.find(
        (g) => g.category === p.category,
      );
      const hasValue = result.servers.some((s) => {
        const value = s[p.id as keyof ExtendedServerDetails];
        return (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !Array.isArray(value)
        );
      });

      if (group && hasValue) {
        group.properties.push(p);
      }
    });

    result.benchmarkMeta = benchmarkMeta
      .filter((benchmark) =>
        result.servers.some((s) =>
          s.benchmark_scores?.some(
            (score) => score.benchmark_id === benchmark.benchmark_id,
          ),
        ),
      )
      .map((b) => ({ ...b, collapsed: true, configs: [] }));

    result.benchmarkMeta.forEach((benchmark) => {
      result.servers.forEach((server) => {
        server.benchmark_scores
          ?.filter((s) => s.benchmark_id === benchmark.benchmark_id)
          .forEach((score) => {
            const config = benchmark.configs.find(
              (c) => JSON.stringify(c.config) === JSON.stringify(score.config),
            );
            if (!config) {
              benchmark.configs.push({ config: score.config, values: [] });
            }
          });
      });
    });

    result.benchmarkMeta.forEach((benchmark) => {
      benchmark.configs.forEach((config) => {
        result.servers.forEach((server) => {
          const score = server.benchmark_scores?.find(
            (s) =>
              s.benchmark_id === benchmark.benchmark_id &&
              JSON.stringify(s.config) === JSON.stringify(config.config),
          );
          config.values.push(score ? Math.floor(score.score * 100) / 100 : "-");
        });
      });
    });

    result.benchmarkCategories.forEach((category) => {
      category.data = result.benchmarkMeta.filter((b) =>
        category.benchmarks.includes(b.benchmark_id),
      );
      category.data.forEach((d) => {
        d.name = d.name
          .replace(/PassMark: CPU (.*?) Test|PassMark: CPU (.*?)/, "$1$2")
          .replace(/PassMark: (.*?) Test|PassMark: (.*?)/, "$1$2");
      });
    });

    const ngData =
      result.benchmarkCategories.find((c) => c.id === "stress_ng")?.data ?? [];
    if (ngData.length > 0) {
      ngData[0].configs = ngData[0].configs.sort(
        (a, b) => a.config?.["cores"] - b.config?.["cores"],
      );
    }

    const ngPercentCategory = result.benchmarkCategories.find(
      (c) => c.id === "stress_ng_pct",
    );
    if (ngPercentCategory) {
      ngPercentCategory.data = ngData;
    }

    return result;
  }
}
