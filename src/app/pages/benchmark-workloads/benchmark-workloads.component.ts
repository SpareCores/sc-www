import {
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  resource,
  DestroyRef,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  BreadcrumbsComponent,
  BreadcrumbSegment,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LucideAngularModule } from "lucide-angular";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import {
  BenchmarkScoreStatsItem,
  Status,
} from "../../../../sdk/data-contracts";
import { BenchmarkWorkloadComponent } from "../../components/benchmark-workload/benchmark-workload.component";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { ScrollSpyDirective } from "../../directives/scroll-spy.directive";
import { BenchmarkWorkloadsSidebarComponent } from "../../components/benchmark-workloads-sidebar/benchmark-workloads-sidebar.component";
import {
  BenchmarkFamily,
  BenchmarkWorkloadConfig,
  BenchmarkWorkloadConfigs,
  BenchmarkWorkloadExample,
  BenchmarkWorkloadItem,
} from "./benchmark-workloads.models";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";

type RawBenchmarkWorkloadConfig = {
  description?: unknown;
  examples?: unknown;
};

@Component({
  selector: "app-benchmark-workloads",
  imports: [
    BreadcrumbsComponent,
    LucideAngularModule,
    BenchmarkWorkloadComponent,
    LoadingSpinnerComponent,
    ScrollSpyDirective,
    BenchmarkWorkloadsSidebarComponent,
    BenchmarkIconPipe,
  ],
  templateUrl: "./benchmark-workloads.component.html",
  styleUrl: "./benchmark-workloads.component.scss",
})
export class BenchmarkWorkloadsComponent implements OnInit {
  private static readonly SCROLL_OFFSET = 104;
  private static readonly SCROLL_LOCK_TIMEOUT_MS = 1500;
  private static readonly SIDEBAR_TRANSITION_MS = 300;
  private static readonly DEFAULT_FAMILY_INDEX = 0;

  private document = inject(DOCUMENT);
  private keeperAPI = inject(KeeperAPIService);
  private seoHandler = inject(SeoHandlerService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  readonly pageTitle = "Benchmark Workloads";
  readonly pageDescription =
    "Spare Cores runs standardized benchmark workloads across cloud servers to measure performance and cost efficiency. This page describes each benchmark family and workload, including units of measurement, configuration options, and score distributions.";

  readonly breadcrumbs = signal<BreadcrumbSegment[]>([
    { name: "Home", url: "/" },
    { name: "Navigator", url: "/about/navigator" },
    { name: "Benchmark Workloads", url: "/navigator/benchmark-workloads" },
  ]);

  private pendingScrollTargetId: string | null = null;
  private deferredScrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingScrollTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearPendingScrollTarget();
      this.clearDeferredScroll();
    });
  }

  readonly benchmarksResource = resource({
    loader: async () => {
      const response = await this.keeperAPI.getBenchmarkWorkloads();
      const rawData: BenchmarkScoreStatsItem[] = response.body ?? [];
      const data = rawData.map((workload) => this.normalizeWorkload(workload));
      const grouped = this.groupByFramework(data);

      if (data.length > 0 && !this.activeBenchmarkId()) {
        this.activeBenchmarkId.set(data[0].benchmark_id);
      }

      return grouped;
    },
  });

  readonly isLoading = computed(() => this.benchmarksResource.isLoading());
  readonly errorMessage = computed(() =>
    this.benchmarksResource.error()
      ? "Failed to load benchmark data. Please try again later."
      : null,
  );
  readonly benchmarkFamilies = computed(
    () => this.benchmarksResource.value() ?? [],
  );

  readonly isCollapsed = signal(false);
  readonly disableLayoutTransitions = signal(false);
  readonly activeBenchmarkId = signal<string>("");
  readonly expandedFamily = signal<string | null>(null);
  readonly autoCollapseAfterSelection = signal(false);

  readonly activeFamily = computed(() => {
    const family = this.getFamilyByBenchmarkId(this.activeBenchmarkId());
    return family?.framework ?? "";
  });

  readonly allBenchmarkIds = computed(() =>
    this.benchmarkFamilies().flatMap((f) =>
      f.benchmarks.map((b) => b.benchmark_id),
    ),
  );

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "Spare Cores - Benchmark Workloads",
      "Descriptions of all benchmark families and workloads used by Spare Cores, including units of measurement, configuration options, and score distributions.",
      "benchmark workloads, cloud benchmarks, performance testing, CPU benchmarks",
    );
  }

  private normalizeWorkload(
    workload: BenchmarkScoreStatsItem,
  ): BenchmarkWorkloadItem {
    return {
      ...workload,
      configs: this.normalizeConfigs(workload.configs),
      status: this.normalizeStatus(workload.status),
    };
  }

  private normalizeConfigs(
    configs: object | undefined,
  ): BenchmarkWorkloadConfigs | undefined {
    if (!configs || typeof configs !== "object") {
      return undefined;
    }

    const normalizedEntries = Object.entries(configs as Record<string, unknown>)
      .map(([key, value]) => {
        if (!value || typeof value !== "object") {
          return null;
        }

        const config = value as RawBenchmarkWorkloadConfig;
        const description =
          typeof config.description === "string" ? config.description : "";
        const examplesSource = Array.isArray(config.examples)
          ? config.examples
          : [];
        const examples = examplesSource.filter(
          (example): example is BenchmarkWorkloadExample =>
            typeof example === "boolean" ||
            typeof example === "number" ||
            typeof example === "string",
        );

        const normalizedConfig: BenchmarkWorkloadConfig = {
          description,
          examples,
        };

        return [key, normalizedConfig] as const;
      })
      .filter(
        (entry): entry is readonly [string, BenchmarkWorkloadConfig] =>
          entry !== null,
      );

    return normalizedEntries.length > 0
      ? Object.fromEntries(normalizedEntries)
      : undefined;
  }

  private normalizeStatus(status: string): Status {
    return status.toLowerCase() === Status.Inactive
      ? Status.Inactive
      : Status.Active;
  }

  private groupByFramework(
    benchmarks: BenchmarkWorkloadItem[],
  ): BenchmarkFamily[] {
    const map = new Map<string, BenchmarkWorkloadItem[]>();
    for (const b of benchmarks) {
      if (!map.has(b.framework)) map.set(b.framework, []);
      map.get(b.framework)!.push(b);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([framework, items]) => ({ framework, benchmarks: items }));
  }

  private getFamilyByBenchmarkId(
    benchmarkId: string,
  ): BenchmarkFamily | undefined {
    if (!benchmarkId) {
      return undefined;
    }

    return this.benchmarkFamilies().find((family) =>
      family.benchmarks.some(
        (benchmark) => benchmark.benchmark_id === benchmarkId,
      ),
    );
  }

  private getDefaultFamilyFramework(): string | null {
    return (
      this.benchmarkFamilies()[BenchmarkWorkloadsComponent.DEFAULT_FAMILY_INDEX]
        ?.framework ?? null
    );
  }

  private getFirstBenchmarkIdForFamily(framework: string): string | null {
    return (
      this.benchmarkFamilies().find((family) => family.framework === framework)
        ?.benchmarks[0]?.benchmark_id ?? null
    );
  }

  private setCollapsedStatePreservingViewport(
    nextCollapsed: boolean,
    benchmarkId?: string | null,
  ): void {
    if (!isPlatformBrowser(this.platformId) || !benchmarkId) {
      this.isCollapsed.set(nextCollapsed);
      return;
    }

    const anchorElement = this.document.getElementById(benchmarkId);

    if (!anchorElement) {
      this.isCollapsed.set(nextCollapsed);
      return;
    }

    const anchorTopBeforeToggle = anchorElement.getBoundingClientRect().top;

    this.disableLayoutTransitions.set(true);
    this.isCollapsed.set(nextCollapsed);

    requestAnimationFrame(() => {
      const anchorTopAfterToggle = anchorElement.getBoundingClientRect().top;
      const scrollAdjustment = anchorTopAfterToggle - anchorTopBeforeToggle;

      if (scrollAdjustment !== 0) {
        this.document.defaultView?.scrollBy({
          top: scrollAdjustment,
          behavior: "auto",
        });
      }

      requestAnimationFrame(() => {
        this.disableLayoutTransitions.set(false);
      });
    });
  }

  private performScrollToBenchmark(id: string): void {
    this.pendingScrollTargetId = id;
    if (this.pendingScrollTimeout !== null) {
      clearTimeout(this.pendingScrollTimeout);
    }

    this.pendingScrollTimeout = setTimeout(() => {
      this.clearPendingScrollTarget();
    }, BenchmarkWorkloadsComponent.SCROLL_LOCK_TIMEOUT_MS);

    const element = this.document.getElementById(id);
    const win = this.document.defaultView;

    if (element && win) {
      const elementTop = element.getBoundingClientRect().top + win.scrollY;
      win.scrollTo({
        top: elementTop - BenchmarkWorkloadsComponent.SCROLL_OFFSET,
        behavior: "smooth",
      });
    }
  }

  private scheduleScrollAfterCollapse(id: string): void {
    this.clearDeferredScroll();

    this.deferredScrollTimeout = setTimeout(() => {
      this.deferredScrollTimeout = null;
      requestAnimationFrame(() => this.performScrollToBenchmark(id));
    }, BenchmarkWorkloadsComponent.SIDEBAR_TRANSITION_MS);
  }

  onActiveItemChange(id: string): void {
    if (this.pendingScrollTargetId || this.deferredScrollTimeout !== null) {
      return;
    }

    if (id && id !== this.activeBenchmarkId()) {
      this.activeBenchmarkId.set(id);

      const newFamily = this.getFamilyByBenchmarkId(id)?.framework ?? null;
      if (!this.expandedFamily() || newFamily !== this.expandedFamily()) {
        this.expandedFamily.set(newFamily);
      }
    }
  }

  private clearDeferredScroll(): void {
    if (this.deferredScrollTimeout !== null) {
      clearTimeout(this.deferredScrollTimeout);
      this.deferredScrollTimeout = null;
    }
  }

  private clearPendingScrollTarget(): void {
    if (this.pendingScrollTimeout !== null) {
      clearTimeout(this.pendingScrollTimeout);
      this.pendingScrollTimeout = null;
    }

    this.pendingScrollTargetId = null;
  }

  toggleFamily(framework: string): void {
    this.expandedFamily.update((currentFamily) =>
      currentFamily === framework ? null : framework,
    );
  }

  handleFamilyClick(framework: string): void {
    if (this.isCollapsed()) {
      this.expandedFamily.set(framework);
      this.autoCollapseAfterSelection.set(true);
      this.setCollapsedStatePreservingViewport(
        false,
        this.activeBenchmarkId() ||
          this.getFirstBenchmarkIdForFamily(framework),
      );
      return;
    }

    this.toggleFamily(framework);
  }

  toggleCollapse(): void {
    const willCollapse = !this.isCollapsed();

    if (willCollapse) {
      this.autoCollapseAfterSelection.set(false);
      this.clearDeferredScroll();
    }

    this.setCollapsedStatePreservingViewport(
      willCollapse,
      this.activeBenchmarkId() || this.pendingScrollTargetId,
    );

    if (willCollapse) {
      return;
    }

    if (!this.expandedFamily()) {
      this.expandedFamily.set(
        this.activeFamily() || this.getDefaultFamilyFramework(),
      );
    }

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const id = this.activeBenchmarkId();
        if (id) this.onActiveItemChange(id);
      }, 50);
    }
  }

  scrollTo(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const shouldCollapseAfterSelection = this.autoCollapseAfterSelection();

    this.activeBenchmarkId.set(id);
    this.expandedFamily.set(this.getFamilyByBenchmarkId(id)?.framework ?? null);
    this.autoCollapseAfterSelection.set(false);

    if (shouldCollapseAfterSelection) {
      this.clearPendingScrollTarget();
      this.isCollapsed.set(true);
      this.scheduleScrollAfterCollapse(id);
      return;
    }

    this.clearDeferredScroll();
    this.performScrollToBenchmark(id);
  }
}
