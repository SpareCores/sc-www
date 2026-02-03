import { CommonModule } from "@angular/common";
import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { Benchmark } from "../../../../sdk/data-contracts";
import { ServerChartsComponent } from "../../components/server-charts/server-charts.component";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { LucideAngularModule } from "lucide-angular";
import { Subscription } from "rxjs";

@Component({
  selector: "app-embedded-server-chart",
  imports: [ServerChartsComponent, CommonModule, LucideAngularModule],
  templateUrl: "./embedded-server-chart.component.html",
  styleUrl: "./embedded-server-chart.component.scss",
})
export class EmbeddedServerChartComponent implements OnInit, OnDestroy {
  benchmarkMeta!: Benchmark[];
  benchmarksByCategory!: any[];
  serverDetails!: any;
  showChart: string = "all";
  private subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private SEOHandler: SeoHandlerService,
    private route: ActivatedRoute,
    private analytics: AnalyticsService,
    private keeperAPI: KeeperAPIService,
  ) {}

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
                const group = this.benchmarksByCategory.find(
                  (g) => g.benchmark_id === b.benchmark_id,
                );
                if (!group) {
                  this.benchmarksByCategory.push({
                    benchmark_id: b.benchmark_id,
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
