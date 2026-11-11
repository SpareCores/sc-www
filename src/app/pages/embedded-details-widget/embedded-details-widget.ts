import { Component, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { combineLatest } from "rxjs";
import { BenchmarkLineChart } from "../../components/charts/line/benchmark-line-chart";
import { DetailsCard } from "../../components/details-card/details-card";
import { EmbedResource } from "../../components/embed-dialog/embed-dialog.types";
import { EmbedFrame } from "../../components/embed-frame/embed-frame";
import { ServerCharts } from "../../components/server-charts/server-charts";
import { ServerDescriptionSummary } from "../../components/server-description-summary/server-description-summary";
import { ServerLstopo } from "../../components/server-lstopo/server-lstopo";
import { Analytics } from "../../services/analytics";
import { DetailsEmbedData } from "../../services/details-embed-data";
import { DetailsEmbedModel } from "../../services/details-embed.types";

@Component({
  selector: "sc-embedded-details-widget",
  imports: [
    BenchmarkLineChart,
    DetailsCard,
    EmbedFrame,
    ServerCharts,
    ServerDescriptionSummary,
    ServerLstopo,
  ],
  templateUrl: "./embedded-details-widget.html",
})
export class EmbeddedDetailsWidget {
  private analytics = inject(Analytics);
  private embedData = inject(DetailsEmbedData);

  readonly widgetId = signal("all");
  readonly model = signal<DetailsEmbedModel | null>(null);
  private loadId = 0;

  constructor() {
    const route = inject(ActivatedRoute);
    combineLatest([route.data, route.params])
      .pipe(takeUntilDestroyed())
      .subscribe(([data, params]) => {
        this.widgetId.set(params["widget"] || "all");
        this.load(
          (data["resource"] as EmbedResource) || "server",
          params["vendor"],
          params["id"],
        );
      });
  }

  private load(resource: EmbedResource, vendor: string, id: string) {
    const loadId = ++this.loadId;
    this.model.set(null);
    this.embedData
      .load(resource, vendor, id, this.widgetId())
      .then((model) => {
        if (loadId === this.loadId) {
          this.model.set(model);
        }
      })
      .catch((err) => {
        console.error(err);
        this.analytics.SentryException(err, {
          tags: { location: this.constructor.name, function: "load" },
        });
      });
  }
}
