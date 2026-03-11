import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from "@angular/core";
import { isPlatformBrowser, DOCUMENT } from "@angular/common";
import {
  BreadcrumbsComponent,
  BreadcrumbSegment,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LucideAngularModule } from "lucide-angular";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { Benchmark } from "../../../../sdk/data-contracts";
import { BenchmarkWorkloadComponent } from "../../components/benchmark-workload/benchmark-workload.component";
import { BenchmarkWorkloadMockData } from "../../mocks/benchmark-workload.mock.interface";
import { getMockData } from "../../mocks/benchmark-workload.mock-data";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { ScrollSpyDirective } from "../../directives/scroll-spy.directive";
import { BenchmarkWorkloadsSidebarComponent } from "../../components/benchmark-workloads-sidebar/benchmark-workloads-sidebar.component";

export interface BenchmarkWithMock extends Benchmark {
  mockData?: BenchmarkWorkloadMockData;
}

export interface BenchmarkFamily {
  framework: string;
  benchmarks: BenchmarkWithMock[];
}

@Component({
  selector: "app-benchmark-workloads",
  imports: [
    BreadcrumbsComponent,
    LucideAngularModule,
    BenchmarkWorkloadComponent,
    LoadingSpinnerComponent,
    ScrollSpyDirective,
    BenchmarkWorkloadsSidebarComponent,
  ],
  templateUrl: "./benchmark-workloads.component.html",
  styleUrl: "./benchmark-workloads.component.scss",
})
export class BenchmarkWorkloadsComponent implements OnInit, OnDestroy {
  private static readonly SCROLL_OFFSET = 104;
  private static readonly SCROLL_LOCK_TIMEOUT_MS = 1500;
  private static readonly SIDEBAR_TRANSITION_MS = 300;
  private static readonly DEFAULT_FAMILY_INDEX = 0;

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private keeperAPI = inject(KeeperAPIService);
  private seoHandler = inject(SeoHandlerService);

  readonly pageTitle = "Benchmark Workloads";
  readonly pageDescription =
    "Spare Cores runs standardized benchmark workloads across cloud servers to measure performance and cost efficiency. This page describes each benchmark family and workload, including units of measurement, configuration options, and score distributions.";

  readonly breadcrumbs = signal<BreadcrumbSegment[]>([
    { name: "Home", url: "/" },
    { name: "Navigator", url: "/about/navigator" },
    { name: "Benchmark Workloads", url: "/navigator/benchmark-workloads" },
  ]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isCollapsed = signal(false);
  readonly disableLayoutTransitions = signal(false);
  readonly benchmarkFamilies = signal<BenchmarkFamily[]>([]);
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

  private pendingScrollTargetId: string | null = null;
  private deferredScrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingScrollTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "Spare Cores - Benchmark Workloads",
      "Descriptions of all benchmark families and workloads used by Spare Cores, including units of measurement, configuration options, and score distributions.",
      "benchmark workloads, cloud benchmarks, performance testing, CPU benchmarks",
    );
    this.loadBenchmarks();
  }

  ngOnDestroy(): void {
    this.clearPendingScrollTarget();
    this.clearDeferredScroll();
  }

  private async loadBenchmarks(): Promise<void> {
    try {
      const response = await this.keeperAPI.getServerBenchmarkMeta();
      const rawData: Benchmark[] = response.body ?? [];
      const data: BenchmarkWithMock[] = rawData.map((b) => ({
        ...b,
        mockData: getMockData(b.benchmark_id),
      }));
      this.benchmarkFamilies.set(this.groupByFramework(data));
      if (data.length > 0) {
        this.activeBenchmarkId.set(data[0].benchmark_id);
      }
    } catch {
      this.errorMessage.set(
        "Failed to load benchmark data. Please try again later.",
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private groupByFramework(benchmarks: BenchmarkWithMock[]): BenchmarkFamily[] {
    const map = new Map<string, BenchmarkWithMock[]>();
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
