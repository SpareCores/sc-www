import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { ActivatedRoute } from "@angular/router";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { AnalyticsService } from "../../services/analytics.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-server-og",
  imports: [LucideAngularModule],
  templateUrl: "./server-og.component.html",
  styleUrl: "./server-og.component.scss",
})
export class ServerOGComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private keeperAPI = inject(KeeperAPIService);
  private analytics = inject(AnalyticsService);
  private SEOHandler = inject(SeoHandlerService);

  serverDetails!: any;

  features: any[] = [];

  description = "";
  title = "";

  instanceProperties: any[] = [];
  benchmarkMeta: any;

  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe((params) => {
        const vendor = params["vendor"];
        const id = params["id"];

        Promise.all([
          this.keeperAPI.getServerMeta(),
          this.keeperAPI.getServerBenchmarkMeta(),
          this.keeperAPI.getServerV2(vendor, id),
          this.keeperAPI.getServerPrices(vendor, id),
          this.keeperAPI.getServerBenchmark(vendor, id),
          this.keeperAPI.getVendors(),
        ])
          .then((dataAll) => {
            this.instanceProperties = dataAll[0].body?.fields || [];

            this.benchmarkMeta = dataAll[1].body || {};

            const benchmarks = dataAll[4].body as any;
            const prices = dataAll[3].body as any;
            const vendors = dataAll[5].body as any;

            if (dataAll[2].body) {
              this.serverDetails = dataAll[2].body as any;

              this.serverDetails.benchmark_scores = benchmarks;
              this.serverDetails.vendor = vendors.find(
                (v: any) => v.vendor_id === this.serverDetails.vendor_id,
              );

              if (prices) {
                this.serverDetails.prices = JSON.parse(
                  JSON.stringify(prices),
                )?.sort((a: any, b: any) => a.price - b.price);
              }

              this.features = [];
              if (this.serverDetails.cpu_cores || this.serverDetails.vcpus) {
                this.features.push({
                  name: "vCPU",
                  value: `${this.serverDetails.vcpus || this.serverDetails.cpu_cores}`,
                });
              }
              if (this.serverDetails.memory_amount) {
                this.features.push({ name: "Memory", value: this.getMemory() });
              }
              if (this.serverDetails.storage_size) {
                this.features.push({
                  name: "Storage",
                  value: this.getStorage(),
                });
              }
              if (this.serverDetails.gpu_count) {
                this.features.push({
                  name: "GPU",
                  value: this.serverDetails.gpu_count,
                });
              }

              this.description = `The ${this.serverDetails.display_name} server is equipped with ${this.serverDetails.vcpus} logical CPU core${this.serverDetails.vcpus! > 1 ? "s" : ""} on ${this.serverDetails.cpu_cores || "unknown number of"} ${this.serverDetails.cpu_manufacturer || ""} ${this.serverDetails.cpu_family || ""} ${this.serverDetails.cpu_model || ""} physical CPU core${this.serverDetails.cpu_cores ? (this.serverDetails.cpu_cores! > 1 ? "s" : "") : "(s)"}${this.serverDetails.memory_speed ? " running at max. " + this.serverDetails.cpu_speed + " Ghz" : ""}, ${this.getMemory()} of ${this.serverDetails.memory_generation || ""} memory${this.serverDetails.memory_speed ? " with " + this.serverDetails.memory_speed + " Mhz clock rate" : ""}, ${this.getStorage()} of ${this.serverDetails.storage_type || ""} storage, and ${this.serverDetails.gpu_count! > 0 ? this.serverDetails.gpu_count : "no"} ${this.serverDetails.gpu_manufacturer || ""} ${this.serverDetails.gpu_family || ""} ${this.serverDetails.gpu_model || ""} GPU${this.serverDetails.gpu_count! > 1 ? "s" : ""}.`;
              if (this.serverDetails.prices[0]) {
                this.description += ` The pricing starts at ${this.serverDetails.prices[0].price} ${this.serverDetails.prices[0].currency} per hour.`;
              }

              this.SEOHandler.setNoFollow();
            }
          })
          .catch((error) => {
            this.analytics.SentryException(error, {
              tags: { location: this.constructor.name, function: "ogInit" },
            });
            console.error("Failed to load server data:", error);
          });
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getMemory(memory: number | undefined = undefined) {
    const memoryAmount = memory || this.serverDetails.memory_amount || 0;
    return (memoryAmount / 1024).toFixed(memoryAmount >= 1024 ? 0 : 1) + " GiB";
  }

  getStorage() {
    if (!this.serverDetails.storage_size) return "0 GB";

    if (this.serverDetails.storage_size < 1000)
      return `${this.serverDetails.storage_size} GB`;

    return `${(this.serverDetails.storage_size / 1000).toFixed(1)} TB`;
  }

  getBenchmark(isMulti: boolean) {
    return (
      this.serverDetails.benchmark_scores
        ?.find(
          (b: any) =>
            b.benchmark_id ===
            (isMulti ? "stress_ng:bestn" : "stress_ng:best1"),
        )
        ?.score?.toFixed(0) || "-"
    );
  }
}
