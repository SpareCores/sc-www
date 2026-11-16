import { Injectable, inject } from "@angular/core";
import { Benchmark } from "../../../sdk/data-contracts";
import { BenchmarkLineChartBuilder } from "../components/charts/line/benchmark-line-chart-builder";
import {
  LineChartServer,
  PGBENCH_HEAVY_READ_ONLY_ID,
  PgbenchChartResult,
  PgbenchScore,
} from "../components/charts/line/benchmark-line-chart.types";
import { getBenchmarkMetaNote } from "../components/charts/shared/chart-tooltip.utils";
import { lineChartOptionsPgbench } from "../pages/server-details/chartOptions";
import type { LoadedCompareDatabase } from "./database-compare-specs.types";
import { PgbenchChartMeta } from "./details-embed.types";

export function hasPgbenchScores(scores: PgbenchScore[] | undefined): boolean {
  return (scores ?? []).some(
    (score) =>
      score.benchmark_id === PGBENCH_HEAVY_READ_ONLY_ID && score.score != null,
  );
}

@Injectable({ providedIn: "root" })
export class DatabasePgbench {
  private lineChartBuilder = inject(BenchmarkLineChartBuilder);

  meta(benchmarkMeta: Benchmark[], titleFallback: string): PgbenchChartMeta {
    const meta = this.findMeta(benchmarkMeta);
    return {
      title: meta?.name || titleFallback,
      infoTooltip: meta?.description || "",
      noteTooltip:
        getBenchmarkMetaNote(benchmarkMeta, PGBENCH_HEAVY_READ_ONLY_ID) || "",
    };
  }

  detailsChart(
    scores: PgbenchScore[],
    vcpus: number | null | undefined,
    benchmarkMeta: Benchmark[],
  ): PgbenchChartResult | undefined {
    return this.lineChartBuilder.buildDetailsPgbenchChart({
      scores,
      vcpus,
      optionsBase: lineChartOptionsPgbench,
      scoreUnit: this.findMeta(benchmarkMeta)?.unit,
    });
  }

  lineServers(databases: LoadedCompareDatabase[]): LineChartServer[] {
    return databases.map((database) => ({
      display_name: database.display_name,
      vendor_id: database.vendor_id,
      vendor_name: database.vendor?.name,
      api_reference: database.api_reference,
      benchmark_scores:
        database.benchmark_scores as LineChartServer["benchmark_scores"],
    }));
  }

  private findMeta(benchmarkMeta: Benchmark[]): Benchmark | undefined {
    return benchmarkMeta.find(
      (item) => item.benchmark_id === PGBENCH_HEAVY_READ_ONLY_ID,
    );
  }
}
