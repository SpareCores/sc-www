import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  ViewChild,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { DOCUMENT } from "@angular/common";
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

export interface BenchmarkFamily {
  framework: string;
  benchmarks: Benchmark[];
}

@Component({
  selector: "app-benchmark-workloads",
  imports: [
    BreadcrumbsComponent,
    LucideAngularModule,
    BenchmarkWorkloadComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: "./benchmark-workloads.component.html",
  styleUrl: "./benchmark-workloads.component.scss",
})
export class BenchmarkWorkloadsComponent implements OnInit, OnDestroy {
  private static readonly SCROLL_OFFSET = 104;
  private static readonly ACTIVE_TRACKING_OFFSET = 180;
  private static readonly TARGET_SCROLL_TOLERANCE = 24;
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

  sidebarTooltipContent = "";
  @ViewChild("sidebarTooltipEl") sidebarTooltipEl!: ElementRef<HTMLElement>;

  readonly activeFamily = computed(() => {
    const family = this.getFamilyByBenchmarkId(this.activeBenchmarkId());
    return family?.framework ?? "";
  });

  private scrollHandler: (() => void) | null = null;
  private rafId: number | null = null;
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
    this.destroyObserver();
  }

  private async loadBenchmarks(): Promise<void> {
    try {
      const response = await this.keeperAPI.getServerBenchmarkMeta();
      const data: Benchmark[] = response.body ?? [];
      this.benchmarkFamilies.set(this.groupByFramework(data));
    } catch {
      this.errorMessage.set(
        "Failed to load benchmark data. Please try again later.",
      );
    } finally {
      this.isLoading.set(false);
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.setupObserver(), 150);
      }
    }
  }

  private groupByFramework(benchmarks: Benchmark[]): BenchmarkFamily[] {
    const map = new Map<string, Benchmark[]>();
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
        window.scrollBy({ top: scrollAdjustment, behavior: "auto" });
      }

      requestAnimationFrame(() => {
        this.disableLayoutTransitions.set(false);
        this.updateActiveFromScroll();
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
      this.updateActiveFromScroll();
    }, BenchmarkWorkloadsComponent.SCROLL_LOCK_TIMEOUT_MS);

    const element = this.document.getElementById(id);
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
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

  private setupObserver(): void {
    this.destroyObserver();
    if (!isPlatformBrowser(this.platformId)) return;

    this.scrollHandler = () => {
      if (this.rafId !== null) return;
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        this.updateActiveFromScroll();
      });
    };

    window.addEventListener("scroll", this.scrollHandler, { passive: true });
    this.updateActiveFromScroll();
  }

  private updateActiveFromScroll(): void {
    const activeTrackingOffset =
      BenchmarkWorkloadsComponent.ACTIVE_TRACKING_OFFSET;

    if (this.pendingScrollTargetId) {
      const pendingTargetId = this.pendingScrollTargetId;
      const targetElement = this.document.getElementById(pendingTargetId);

      if (!targetElement) {
        this.clearPendingScrollTarget();
      } else {
        const pendingTop =
          targetElement.getBoundingClientRect().top -
          BenchmarkWorkloadsComponent.SCROLL_OFFSET;

        if (
          Math.abs(pendingTop) >
          BenchmarkWorkloadsComponent.TARGET_SCROLL_TOLERANCE
        ) {
          return;
        }

        this.clearPendingScrollTarget();
      }
    }

    let bestId = "";
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestTop = Number.POSITIVE_INFINITY;

    for (const family of this.benchmarkFamilies()) {
      for (const bm of family.benchmarks) {
        const el = this.document.getElementById(bm.benchmark_id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top - activeTrackingOffset;
        const distance = Math.abs(top);

        if (
          distance < bestDistance ||
          (distance === bestDistance && top <= 0 && bestTop > 0)
        ) {
          bestDistance = distance;
          bestTop = top;
          bestId = bm.benchmark_id;
        }
      }
    }

    if (!bestId) {
      bestId = this.benchmarkFamilies()[0]?.benchmarks[0]?.benchmark_id ?? "";
    }

    if (bestId && bestId !== this.activeBenchmarkId()) {
      this.activeBenchmarkId.set(bestId);
      this.expandedFamily.set(
        this.getFamilyByBenchmarkId(bestId)?.framework ?? null,
      );
    } else if (bestId && !this.expandedFamily()) {
      this.expandedFamily.set(
        this.getFamilyByBenchmarkId(bestId)?.framework ?? null,
      );
    }
  }

  private destroyObserver(): void {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.clearPendingScrollTarget();
    this.clearDeferredScroll();
  }

  private clearDeferredScroll(): void {
    if (this.deferredScrollTimeout !== null) {
      clearTimeout(this.deferredScrollTimeout);
      this.deferredScrollTimeout = null;
    }
  }

  showSidebarTooltip(event: MouseEvent | FocusEvent, content: string): void {
    if (!this.isCollapsed() || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const tooltip = this.sidebarTooltipEl?.nativeElement;
    const target = event.currentTarget as HTMLElement | null;

    if (!tooltip || !target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const scrollY = window.scrollY ?? document.documentElement.scrollTop;

    this.sidebarTooltipContent = content;
    tooltip.style.left = `${rect.right + 8}px`;
    tooltip.style.top = `${rect.top - 8 + scrollY}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
  }

  hideSidebarTooltip(): void {
    const tooltip = this.sidebarTooltipEl?.nativeElement;

    if (!tooltip) {
      return;
    }

    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
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
      this.hideSidebarTooltip();
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

  isFamilyExpanded(framework: string): boolean {
    return this.expandedFamily() === framework;
  }

  isFamilyHighlighted(framework: string): boolean {
    if (this.isCollapsed()) {
      return this.activeFamily() === framework;
    }

    return (
      this.expandedFamily() === framework || this.activeFamily() === framework
    );
  }

  toggleCollapse(): void {
    const willCollapse = !this.isCollapsed();

    this.hideSidebarTooltip();

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
      setTimeout(() => this.updateActiveFromScroll());
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

  getMock(benchmark_id: string): BenchmarkWorkloadMockData | undefined {
    return getMockData(benchmark_id);
  }
}
