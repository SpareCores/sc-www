import { CommonModule } from "@angular/common";
import { Component, Inject, PLATFORM_ID } from "@angular/core";
import { ServerCompareChartsComponent } from "../../components/server-compare-charts/server-compare-charts.component";
import { LucideAngularModule } from "lucide-angular";
import { ActivatedRoute } from "@angular/router";
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ExtendedServerDetails } from "../server-details/server-details.component";
import { Allocation } from "../../../../sdk/data-contracts";
import { OnInit } from "@angular/core";

@Component({
  selector: "app-embedded-compare-chart",
  imports: [CommonModule, ServerCompareChartsComponent, LucideAngularModule],
  templateUrl: "./embedded-compare-chart.component.html",
  styleUrl: "./embedded-compare-chart.component.scss",
})
export class EmbeddedCompareChartComponent implements OnInit {
  showChart: string = "all";

  instancesRaw: any;
  instances: any[] = [];

  zones: any[] = [];
  regions: any[] = [];

  servers: ExtendedServerDetails[] = [];
  instanceProperties: any[] = [];
  benchmarkMeta: any;

  instancePropertyCategories: any[] = [
    { name: "CPU", category: "cpu", properties: [] },
    { name: "Memory", category: "memory", properties: [] },
    { name: "GPU", category: "gpu", properties: [] },
    { name: "Storage", category: "storage", properties: [] },
    { name: "Network", category: "network", properties: [] },
  ];

  benchmarkCategories: any[] = [
    {
      name: "Geekbench",
      id: "geekbench",
      benchmarks: [
        "geekbench:text_processing",
        "geekbench:structure_from_motion",
        "geekbench:score",
        "geekbench:ray_tracer",
        "geekbench:photo_library",
        "geekbench:photo_filter",
        "geekbench:pdf_renderer",
        "geekbench:object_remover",
        "geekbench:object_detection",
        "geekbench:navigation",
        "geekbench:html5_browser",
        "geekbench:horizon_detection",
        "geekbench:hdr",
        "geekbench:file_compression",
        "geekbench:clang",
        "geekbench:background_blur",
        "geekbench:asset_compression",
      ],
      data: [],
      show_more: false,
      hidden: true,
    },
    {
      name: "Geekbench",
      id: "geekbench_single",
      benchmarks: [
        "geekbench:text_processing",
        "geekbench:structure_from_motion",
        "geekbench:score",
        "geekbench:ray_tracer",
        "geekbench:photo_library",
        "geekbench:photo_filter",
        "geekbench:pdf_renderer",
        "geekbench:object_remover",
        "geekbench:object_detection",
        "geekbench:navigation",
        "geekbench:html5_browser",
        "geekbench:horizon_detection",
        "geekbench:hdr",
        "geekbench:file_compression",
        "geekbench:clang",
        "geekbench:background_blur",
        "geekbench:asset_compression",
      ],
      data: [],
      show_more: false,
      hidden: true,
    },
    {
      name: "Geekbench",
      id: "geekbench_multi",
      benchmarks: [
        "geekbench:text_processing",
        "geekbench:structure_from_motion",
        "geekbench:score",
        "geekbench:ray_tracer",
        "geekbench:photo_library",
        "geekbench:photo_filter",
        "geekbench:pdf_renderer",
        "geekbench:object_remover",
        "geekbench:object_detection",
        "geekbench:navigation",
        "geekbench:html5_browser",
        "geekbench:horizon_detection",
        "geekbench:hdr",
        "geekbench:file_compression",
        "geekbench:clang",
        "geekbench:background_blur",
        "geekbench:asset_compression",
      ],
      data: [],
      show_more: false,
      hidden: true,
    },
    {
      name: "Memory Bandwidth",
      id: "bw_mem",
      benchmarks: ["bw_mem"],
      data: [],
      show_more: false,
      hidden: true,
    },
    {
      name: "OpenSSL",
      id: "openssl",
      benchmarks: ["openssl"],
      data: [],
      show_more: false,
      hidden: true,
    },
    {
      name: "Compression",
      id: "compress",
      benchmarks: [
        "compression_text:ratio",
        "compression_text:decompress",
        "compression_text:compress",
      ],
      data: [],
      show_more: false,
      hidden: true,
    },
    {
      name: "Stress-ng div16 Raw Scores per vCPU",
      id: "stress_ng",
      benchmarks: ["stress_ng:div16"],
      data: [],
      show_more: false,
      hidden: true,
    },
    {
      name: "Stress-ng Relative Multicore Performance per vCPU",
      id: "stress_ng_pct",
      benchmarks: ["stress_ng:div16"],
      data: [],
      show_more: false,
      hidden: true,
    },
    {
      id: "llm_inference",
      name: "LLM Inference Speed",
      benchmarks: ["llm_speed:prompt_processing", "llm_speed:text_generation"],
      data: [],
      show_more: false,
    },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private SEOHandler: SeoHandlerService,
    private route: ActivatedRoute,
    private analytics: AnalyticsService,
    private keeperAPI: KeeperAPIService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(() => {
      this.setup();
    });

    this.route.params.subscribe(() => {
      this.setup();
    });
  }

  setup() {
    const chartname = this.route.snapshot.params["chartname"];

    this.showChart = chartname;
    this.instancesRaw = this.route.snapshot.queryParams["instances"];

    if (!this.instancesRaw) {
      return;
    }

    this.benchmarkCategories.forEach((category) => {
      category.hidden = !(
        this.showChart === category.id || this.showChart === "all"
      );
    });

    this.instances = JSON.parse(atob(this.instancesRaw));

    if (this.instances?.length > 0) {
      let serverCount = this.instances?.length || 0;

      let promises: Promise<any>[] = [
        this.keeperAPI.getServerMeta(),
        this.keeperAPI.getServerBenchmarkMeta(),
        this.keeperAPI.getVendors(),
        this.keeperAPI.getRegions(),
        this.keeperAPI.getZones(),
      ];
      this.instances?.forEach((instance: any) => {
        promises.push(
          this.keeperAPI.getServerV2(instance.vendor, instance.server),
        );
        // TODO: add currency selection
        promises.push(
          this.keeperAPI.getServerPrices(
            instance.vendor,
            instance.server,
            "USD",
          ),
        );
        promises.push(
          this.keeperAPI.getServerBenchmark(instance.vendor, instance.server),
        );
      });
      Promise.all(promises)
        .then((data) => {
          const promiseAllData = data.map((x: any) => x.body);
          const [meta, benchmarkMeta, vendors, regions, zones, ...servers] =
            promiseAllData;

          this.zones = zones;
          this.regions = regions;

          this.instanceProperties = meta.fields;

          this.instancePropertyCategories.forEach((c) => {
            c.properties = [];
          });

          this.servers = [];

          for (let i = 0; i < serverCount; i++) {
            let server: ExtendedServerDetails = servers[i * 3];

            server.benchmark_scores = servers[i * 3 + 2];
            server.prices = servers[i * 3 + 1]?.sort(
              (a: any, b: any) => a.price - b.price,
            );

            server.vendor = vendors.find(
              (v: any) => v.vendor_id === server.vendor_id,
            );

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

            this.servers.push(server);
          }

          this.instanceProperties.forEach((p: any) => {
            const group = this.instancePropertyCategories.find(
              (g) => g.category === p.category,
            );
            const hasValue = this.servers.some(
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

          this.benchmarkMeta = benchmarkMeta
            ?.filter((benchmark: any) => {
              let found = false;
              this.servers.forEach((s: any) => {
                if (
                  s.benchmark_scores?.find(
                    (score: any) =>
                      score.benchmark_id === benchmark.benchmark_id,
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

          this.benchmarkMeta.forEach((benchmark: any) => {
            this.servers.forEach((server: any) => {
              const scores = server.benchmark_scores?.filter(
                (s: any) => s.benchmark_id === benchmark.benchmark_id,
              );
              if (scores) {
                scores.forEach((score: any) => {
                  const config = benchmark.configs.find((c: any) => {
                    return (
                      JSON.stringify(c.config) === JSON.stringify(score.config)
                    );
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

          this.benchmarkMeta.forEach((benchmark: any) => {
            benchmark.configs.forEach((config: any) => {
              this.servers.forEach((server: any) => {
                const score = server.benchmark_scores?.find(
                  (s: any) =>
                    s.benchmark_id === benchmark.benchmark_id &&
                    JSON.stringify(s.config) === JSON.stringify(config.config),
                );
                config.values.push(
                  score ? Math.floor(score.score * 100) / 100 : "-",
                );
              });
            });
          });

          this.benchmarkCategories.forEach((category) => {
            category.data = this.benchmarkMeta.filter((b: any) =>
              category.benchmarks.includes(b.benchmark_id),
            );
            category.data?.forEach((d: any) => {
              d.name = d.name
                .replace(/PassMark: CPU (.*?) Test|PassMark: CPU (.*?)/, "$1$2")
                .replace(/PassMark: (.*?) Test|PassMark: (.*?)/, "$1$2");
            });
          });

          // sort the stress_ng and stress_ng_pct by config.cores
          let ngData: any[] = this.benchmarkCategories.find(
            (c) => c.id === "stress_ng",
          ).data;
          if (ngData?.length > 0) {
            ngData[0].configs = ngData[0].configs.sort((a: any, b: any) => {
              return a.config.cores - b.config.cores;
            });
          }

          this.benchmarkCategories.find((c) => c.id === "stress_ng_pct").data =
            ngData;
        })
        .catch((err) => {
          this.analytics.SentryException(err, {
            tags: { location: this.constructor.name, function: "compareInit" },
          });
          console.error(err);
        });
    }
  }

  getBaseURL() {
    return this.SEOHandler.getBaseURL();
  }
}
