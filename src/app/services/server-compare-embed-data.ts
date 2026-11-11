import { Injectable, inject } from "@angular/core";
import { Allocation } from "../../../sdk/data-contracts";
import type { ExtendedServerDetails } from "../pages/server-details/server-details.types";
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
    const serverCount = instances.length;
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

    const promises: Promise<any>[] = [
      this.keeperAPI.getServerMeta(),
      this.keeperAPI.getServerBenchmarkMeta(),
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions(),
      this.keeperAPI.getZones(),
    ];
    instances.forEach((instance) => {
      promises.push(
        this.keeperAPI.getServerV2(instance.vendor, instance.server),
      );
      promises.push(
        this.keeperAPI.getServerPrices(instance.vendor, instance.server, "USD"),
      );
      promises.push(
        this.keeperAPI.getServerBenchmark(instance.vendor, instance.server),
      );
    });

    const data = await Promise.all(promises);
    const promiseAllData = data.map((x: any) => x.body);
    const [meta, benchmarkMeta, vendors, regions, zones, ...servers] =
      promiseAllData;

    result.instanceProperties = meta.fields;

    result.instancePropertyCategories.forEach((c) => {
      c.properties = [];
    });

    result.servers = [];

    for (let i = 0; i < serverCount; i++) {
      let server: ExtendedServerDetails = servers[i * 3];

      server.benchmark_scores = servers[i * 3 + 2];
      server.prices = servers[i * 3 + 1]?.sort(
        (a: any, b: any) => a.price - b.price,
      );

      server.vendor = vendors.find(
        (v: any) => v.vendor_id === server.vendor_id,
      );
      server.vendor_name = server.vendor?.name;

      if (server.prices?.length > 0) {
        server.prices.forEach((price: any) => {
          price.region = regions.find(
            (r: any) =>
              r.vendor_id === price.vendor_id &&
              r.region_id === price.region_id,
          );
          price.zone = zones.find(
            (z: any) =>
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
        (b: any) => b.benchmark_id === "stress_ng:bestn",
      )?.score;
      server.price = server.prices?.length ? server.prices[0].price : 0;
      server.score_per_price =
        server.price && server.score
          ? server.score / server.price
          : server.score || 0;

      result.servers.push(server);
    }

    result.instanceProperties.forEach((p: any) => {
      const group = result.instancePropertyCategories.find(
        (g) => g.category === p.category,
      );
      const hasValue = result.servers.some(
        (s: any) =>
          s[p.id] !== undefined &&
          s[p.id] !== null &&
          s[p.id] !== "" &&
          !Array.isArray(s[p.id]),
      );

      if (group && hasValue) {
        group.properties.push(p);
      }
    });

    result.benchmarkMeta = benchmarkMeta
      ?.filter((benchmark: any) => {
        let found = false;
        result.servers.forEach((s: any) => {
          if (
            s.benchmark_scores?.find(
              (score: any) => score.benchmark_id === benchmark.benchmark_id,
            )
          ) {
            found = true;
          }
        });
        return found;
      })
      .map((b: any) => {
        return {
          ...b,
          collapsed: true,
          configs: [],
        };
      });

    result.benchmarkMeta.forEach((benchmark: any) => {
      result.servers.forEach((server: any) => {
        const scores = server.benchmark_scores?.filter(
          (s: any) => s.benchmark_id === benchmark.benchmark_id,
        );
        if (scores) {
          scores.forEach((score: any) => {
            const config = benchmark.configs.find((c: any) => {
              return JSON.stringify(c.config) === JSON.stringify(score.config);
            });
            if (!config) {
              benchmark.configs.push({
                config: score.config,
                values: [],
              });
            }
          });
        }
      });
    });

    result.benchmarkMeta.forEach((benchmark: any) => {
      benchmark.configs.forEach((config: any) => {
        result.servers.forEach((server: any) => {
          const score = server.benchmark_scores?.find(
            (s: any) =>
              s.benchmark_id === benchmark.benchmark_id &&
              JSON.stringify(s.config) === JSON.stringify(config.config),
          );
          config.values.push(score ? Math.floor(score.score * 100) / 100 : "-");
        });
      });
    });

    result.benchmarkCategories.forEach((category) => {
      category.data = result.benchmarkMeta.filter((b: any) =>
        category.benchmarks.includes(b.benchmark_id),
      );
      category.data?.forEach((d: any) => {
        d.name = d.name
          .replace(/PassMark: CPU (.*?) Test|PassMark: CPU (.*?)/, "$1$2")
          .replace(/PassMark: (.*?) Test|PassMark: (.*?)/, "$1$2");
      });
    });

    let ngData: any[] = result.benchmarkCategories.find(
      (c) => c.id === "stress_ng",
    ).data;
    if (ngData?.length > 0) {
      ngData[0].configs = ngData[0].configs.sort((a: any, b: any) => {
        return a.config.cores - b.config.cores;
      });
    }

    result.benchmarkCategories.find((c) => c.id === "stress_ng_pct").data =
      ngData;

    return result;
  }
}
