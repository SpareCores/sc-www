import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
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
  readonly benchmarkFamilies = signal<BenchmarkFamily[]>([]);
  readonly activeBenchmarkId = signal<string>("");
  readonly expandedFamilies = signal<Set<string>>(new Set());

  readonly activeFamily = computed(() => {
    const id = this.activeBenchmarkId();
    if (!id) return "";
    for (const family of this.benchmarkFamilies()) {
      if (family.benchmarks.some((b) => b.benchmark_id === id))
        return family.framework;
    }
    return "";
  });

  private scrollHandler: (() => void) | null = null;
  private rafId: number | null = null;
  private expandDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {}

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
    // Set initial active item without waiting for first scroll
    this.updateActiveFromScroll();
  }

  private updateActiveFromScroll(): void {
    // Offset accounts for the sticky top navigation bar
    const offset = 100;
    let bestId = "";
    let bestTop = -Infinity;

    for (const family of this.benchmarkFamilies()) {
      for (const bm of family.benchmarks) {
        const el = this.document.getElementById(bm.benchmark_id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top - offset;
        // Pick the card whose top edge has most recently passed the offset line
        // (largest value that is still <= 0)
        if (top <= 0 && top > bestTop) {
          bestTop = top;
          bestId = bm.benchmark_id;
        }
      }
    }

    if (bestId && bestId !== this.activeBenchmarkId()) {
      this.activeBenchmarkId.set(bestId);

      // Debounce accordion expansion: only open the final family after scrolling settles
      if (this.expandDebounceTimer !== null)
        clearTimeout(this.expandDebounceTimer);
      this.expandDebounceTimer = setTimeout(() => {
        this.expandDebounceTimer = null;
        const family = this.activeFamily();
        this.expandedFamilies.set(new Set(family ? [family] : []));
      }, 300);
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
    if (this.expandDebounceTimer !== null) {
      clearTimeout(this.expandDebounceTimer);
      this.expandDebounceTimer = null;
    }
  }

  toggleFamily(framework: string): void {
    this.expandedFamilies.update((set) => {
      const next = new Set(set);
      if (next.has(framework)) {
        next.delete(framework);
      } else {
        next.add(framework);
      }
      return next;
    });
  }

  isFamilyExpanded(framework: string): boolean {
    return this.expandedFamilies().has(framework);
  }

  scrollTo(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.activeBenchmarkId.set(id);
    // Expand immediately on explicit click — cancel any pending debounce
    if (this.expandDebounceTimer !== null)
      clearTimeout(this.expandDebounceTimer);
    this.expandDebounceTimer = null;
    const family = this.activeFamily();
    this.expandedFamilies.set(new Set(family ? [family] : []));
    const el = this.document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  getMock(benchmark_id: string): BenchmarkWorkloadMockData | undefined {
    return getMockData(benchmark_id);
  }
}
