import {
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest } from "rxjs";
import { BenchmarkLineChart } from "../../components/charts/line/benchmark-line-chart";
import { ChartTooltip } from "../../components/charts/shared/chart-tooltip";
import { DatabaseCompareSpecRows } from "../../components/database-compare-spec-rows/database-compare-spec-rows";
import { EmbedResource } from "../../components/embed-dialog/embed-dialog.types";
import { EmbedFrame } from "../../components/embed-frame/embed-frame";
import { ServerCompareCharts } from "../../components/server-compare-charts/server-compare-charts";
import { Analytics } from "../../services/analytics";
import { CompareEmbedData } from "../../services/compare-embed-data";
import { CompareEmbedModel } from "../../services/compare-embed.types";
import { DatabaseCompareSpecs } from "../../services/database-compare-specs";
import { DATABASE_COMPARE_SPECS_WIDGET_ID } from "../../services/database-embed.constants";
import { hasPgbenchScores } from "../../services/database-pgbench";
import { showInvalidUrlParamToast } from "../../services/page-toast.helpers";
import { Toast } from "../../services/toast";

@Component({
  selector: "sc-embedded-compare-widget",
  imports: [
    BenchmarkLineChart,
    DatabaseCompareSpecRows,
    EmbedFrame,
    ServerCompareCharts,
  ],
  templateUrl: "./embedded-compare-widget.html",
  styleUrl: "./embedded-compare-widget.css",
  host: { ngSkipHydration: "true" },
})
export class EmbeddedCompareWidget {
  private router = inject(Router);
  private analytics = inject(Analytics);
  private toastService = inject(Toast);
  private platformId = inject(PLATFORM_ID);
  private chartTooltip = inject(ChartTooltip);
  private embedData = inject(CompareEmbedData);
  private compareSpecs = inject(DatabaseCompareSpecs);

  readonly specsWidgetId = DATABASE_COMPARE_SPECS_WIDGET_ID;
  readonly resource = signal<EmbedResource>("server");
  readonly widgetId = signal("all");
  readonly model = signal<CompareEmbedModel | null>(null);
  readonly failed = signal(false);
  readonly failedPath = signal<string | null>(null);
  readonly hasPgbenchChart = computed(
    () =>
      this.model()?.database?.servers.some((server) =>
        hasPgbenchScores(server.benchmark_scores),
      ) ?? false,
  );

  tooltip = viewChild<ElementRef<HTMLElement>>("tooltip");
  tooltipContent = signal("");
  private loadId = 0;

  constructor() {
    const route = inject(ActivatedRoute);
    combineLatest([route.data, route.params, route.queryParams])
      .pipe(takeUntilDestroyed())
      .subscribe(([data, params, queryParams]) => {
        this.resource.set((data["resource"] as EmbedResource) || "server");
        this.widgetId.set(params["widget"] || "all");
        this.load(queryParams["instances"]);
      });

    inject(DestroyRef).onDestroy(() => {
      this.toastService.removeToast(this.config().toastId);
    });
  }

  columnWidth(displayName: string | undefined): string {
    return this.compareSpecs.columnWidth(displayName);
  }

  showTooltip(event: MouseEvent, content: string) {
    this.chartTooltip.showIfPresent({
      tooltipElement: this.tooltip()?.nativeElement,
      event,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent.set(tooltipContent);
      },
    });
  }

  hideTooltip() {
    this.chartTooltip.hide(this.tooltip()?.nativeElement);
  }

  private config() {
    return this.embedData.config(this.resource());
  }

  private load(encodedInstances: string | undefined) {
    const loadId = ++this.loadId;
    const config = this.config();
    this.model.set(null);
    this.failed.set(false);
    this.failedPath.set(null);

    if (!encodedInstances) {
      this.toastService.removeToast(config.toastId);
      return;
    }

    this.embedData
      .load(this.resource(), encodedInstances, this.widgetId())
      .then((model) => {
        if (loadId !== this.loadId) {
          return;
        }
        if (!model) {
          console.warn("Invalid instances data in URL:", encodedInstances);
          showInvalidUrlParamToast(this.toastService, this.platformId, {
            id: config.toastId,
            body: config.toastBody,
            action: {
              label: config.toastActionLabel,
              onClick: () => this.router.navigate([config.listingPath]),
            },
          });
          return;
        }
        this.toastService.removeToast(config.toastId);
        this.model.set(model);
      })
      .catch((err) => {
        if (loadId === this.loadId) {
          this.failed.set(true);
          this.failedPath.set(
            this.embedData.path(this.resource(), encodedInstances),
          );
        }
        console.error(err);
        this.analytics.SentryException(err, {
          tags: { location: this.constructor.name, function: "load" },
        });
      });
  }
}
