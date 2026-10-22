import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Analytics } from "../../services/analytics";
import { KeeperAPI } from "../../services/keeper-api";
import { Benchmark } from "../../../../sdk/data-contracts";
import { ServerCharts } from "../../components/server-charts/server-charts";
import { SeoHandler } from "../../services/seo-handler";
import { LucideExternalLink } from "@lucide/angular";
import { Subscription } from "rxjs";

@Component({
  selector: "sc-embedded-server-chart",
  imports: [ServerCharts, LucideExternalLink],
  templateUrl: "./embedded-server-chart.html",
  styleUrl: "./embedded-server-chart.css",
})
export class EmbeddedServerChart implements OnInit, OnDestroy {
  private SEOHandler = inject(SeoHandler);
  private route = inject(ActivatedRoute);
  private analytics = inject(Analytics);
  private keeperAPI = inject(KeeperAPI);

  benchmarkMeta!: Benchmark[];
  benchmarksByCategory!: any[];
  serverDetails!: any;
  showChart: string = "all";
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe((params) => {
        const vendor = params["vendor"];
        const id = params["id"];
        const chartname = params["chartname"];

        this.showChart = chartname || "all";

        Promise.all([
          this.keeperAPI.getServerBenchmarkMeta(),
          this.keeperAPI.getServerBenchmark(vendor, id),
          this.keeperAPI.getServerV2(vendor, id),
        ])
          .then((dataAll) => {
            const promisAllResponses = dataAll.map((d) => d.body);
            const [benchmarkMeta, benchmarks, serverDetails] =
              promisAllResponses;

            this.benchmarkMeta = benchmarkMeta || {};

            if (serverDetails) {
              this.serverDetails = JSON.parse(
                JSON.stringify(serverDetails),
              ) as any;

              this.serverDetails.benchmark_scores = benchmarks;
              this.serverDetails.score =
                this.serverDetails.benchmark_scores?.find(
                  (b: any) => b.benchmark_id === "stress_ng:bestn",
                )?.score;
              this.serverDetails.score_per_price =
                this.serverDetails.min_price && this.serverDetails.score
                  ? this.serverDetails.score / this.serverDetails.min_price
                  : this.serverDetails.score || 0;

              this.benchmarksByCategory = [];
              this.serverDetails.benchmark_scores?.forEach((b: any) => {
                let group_id = b.benchmark_id;
                if (group_id.includes("passmark:")) {
                  if (group_id.includes("passmark:cpu_")) {
                    group_id = "passmark:cpu";
                  } else {
                    group_id = "passmark:other";
                  }
                }
                const group = this.benchmarksByCategory.find(
                  (g) => g.benchmark_id === group_id,
                );
                if (!group) {
                  this.benchmarksByCategory.push({
                    benchmark_id: group_id,
                    benchmarks: [b],
                  });
                } else {
                  group.benchmarks.push(b);
                }
              });
            }
          })
          .catch((error) => {
            console.error(error);
            if (error?.status === 500) {
              this.analytics.SentryException(error, {
                tags: {
                  location: this.constructor.name,
                  function: "getServers",
                },
              });
            } else {
              this.analytics.SentryException(error, {
                tags: {
                  location: this.constructor.name,
                  function: "getServers",
                },
              });
            }
          });
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getBaseURL() {
    return this.SEOHandler.getBaseURL();
  }
}
