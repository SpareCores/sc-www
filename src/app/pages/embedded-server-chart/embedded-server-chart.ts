import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Analytics } from "../../services/analytics";
import { KeeperAPI } from "../../services/keeper-api";
import { Benchmark, ServerDescription } from "../../../../sdk/data-contracts";
import { ServerCharts } from "../../components/server-charts/server-charts";
import { SeoHandler } from "../../services/seo-handler";
import { LucideExternalLink } from "@lucide/angular";
import { Subscription } from "rxjs";
import {
  ServerPropertyCard,
  ServerPropertySection,
} from "../../components/server-property-card/server-property-card";
import { ServerAvailabilityCard } from "../../components/server-availability-card/server-availability-card";
import { ServerLstopo } from "../../components/server-lstopo/server-lstopo";
import { ServerDescriptionSummary } from "../../components/server-description-summary/server-description-summary";
import {
  AvailabilityRegion,
  ServerSpecCards,
} from "../../services/server-spec-cards";

export const SPEC_CARD_EMBED_IDS = [
  "metadata",
  "availability",
  "processor",
  "system_resources",
  "lstopo",
  "description",
];

const PROPERTY_CARD_EMBED_IDS = ["metadata", "processor", "system_resources"];

@Component({
  selector: "sc-embedded-server-chart",
  imports: [
    ServerCharts,
    LucideExternalLink,
    ServerPropertyCard,
    ServerAvailabilityCard,
    ServerLstopo,
    ServerDescriptionSummary,
  ],
  templateUrl: "./embedded-server-chart.html",
  styleUrl: "./embedded-server-chart.css",
})
export class EmbeddedServerChart implements OnInit, OnDestroy {
  private SEOHandler = inject(SeoHandler);
  private route = inject(ActivatedRoute);
  private analytics = inject(Analytics);
  private keeperAPI = inject(KeeperAPI);
  private serverSpecCards = inject(ServerSpecCards);

  benchmarkMeta!: Benchmark[];
  benchmarksByCategory!: any[];
  serverDetails!: any;
  showChart: string = "all";
  metadataSections: ServerPropertySection[] = [];
  processorSections: ServerPropertySection[] = [];
  resourceSections: ServerPropertySection[] = [];
  availabilityRegions: AvailabilityRegion[] = [];
  serverDescription: ServerDescription | null = null;
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe((params) => {
        const vendor = params["vendor"];
        const id = params["id"];
        const chartname = params["chartname"];

        this.showChart = chartname || "all";
        this.serverDescription = null;

        if (this.showChart === "description") {
          this.loadServerDescription(vendor, id);
        }

        const skipped = Promise.resolve({ body: null });
        const needsSections = PROPERTY_CARD_EMBED_IDS.includes(this.showChart);
        const needsPrices = this.showChart === "availability";

        Promise.all([
          this.keeperAPI.getServerBenchmarkMeta(),
          this.keeperAPI.getServerBenchmark(vendor, id),
          this.keeperAPI.getServerV2(vendor, id),
          needsSections ? this.keeperAPI.getServerMeta() : skipped,
          needsPrices
            ? this.keeperAPI.getServerPrices(vendor, id, undefined, false)
            : skipped,
          needsPrices ? this.keeperAPI.getRegions() : skipped,
          needsPrices ? this.keeperAPI.getZones() : skipped,
        ])
          .then((dataAll) => {
            const promisAllResponses = dataAll.map((d) => d.body);
            const [
              benchmarkMeta,
              benchmarks,
              serverDetails,
              serverMeta,
              prices,
              regions,
              zones,
            ] = promisAllResponses;

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

              const sections = this.serverSpecCards.buildSections(
                this.serverDetails,
                serverMeta?.fields || [],
              );
              this.metadataSections = sections.metadataSections;
              this.processorSections = sections.processorSections;
              this.resourceSections = sections.resourceSections;
              this.availabilityRegions =
                this.serverSpecCards.buildAvailabilityRegions(
                  this.serverSpecCards.preparePrices(
                    prices || [],
                    this.serverDetails.status,
                    regions || [],
                    zones || [],
                  ),
                );

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

  isSpecCard() {
    return SPEC_CARD_EMBED_IDS.includes(this.showChart);
  }

  getBaseURL() {
    return this.SEOHandler.getBaseURL();
  }

  private loadServerDescription(vendor: string, id: string) {
    this.keeperAPI
      .getServerDescriptions(vendor, id)
      .then((response) => {
        if (this.showChart === "description" && response?.body) {
          this.serverDescription = response.body as ServerDescription;
        }
      })
      .catch(() => {
        this.serverDescription = null;
      });
  }
}
