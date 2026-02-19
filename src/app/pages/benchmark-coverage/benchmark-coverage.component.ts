import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  effect,
} from "@angular/core";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LucideAngularModule } from "lucide-angular";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import {
  ServerDebugInfo,
  Vendor,
  VendorDebugInfo,
} from "../../../../sdk/data-contracts";
import { PercentPipe } from "@angular/common";
import { PageLimitPipe } from "../../pipes/page-limit.pipe";
import {
  BenchmarkFamilyFilterValue,
  FilterCategory,
  MissingBenchmarkServerRow,
  SearchBarFilters,
  SearchParameter,
  SearchQuery,
  ServerStatusFilter,
} from "./benchmark-coverage.types";
import {
  getAssessment,
  normalizeBenchmarkFamilyFilters,
  parseArray,
  parseServerStatusFilter,
  safeJsonParse,
} from "./benchmark-coverage.utils";

@Component({
  selector: "app-benchmark-coverage",
  imports: [
    BreadcrumbsComponent,
    LucideAngularModule,
    RouterModule,
    PercentPipe,
    PageLimitPipe,
    SearchBarComponent,
  ],
  templateUrl: "./benchmark-coverage.component.html",
  styleUrls: ["./benchmark-coverage.component.scss"],
})
export class BenchmarkCoverageComponent implements OnInit {
  constructor() {
    effect(() => {
      const params = this.filterParams();
      const currentParams = this.route.snapshot.queryParams;

      if (JSON.stringify(params) !== JSON.stringify(currentParams)) {
        this.router.navigate([], {
          queryParams: params,
          replaceUrl: true,
        });
      }
    });
  }

  private keeperApi = inject(KeeperAPIService);
  private seoHandler = inject(SeoHandlerService);
  private route = inject(ActivatedRoute);

  isCollapsed = false;

  readonly breadcrumbs = signal<BreadcrumbSegment[]>([
    { name: "Home", url: "/" },
    { name: "Navigator", url: "/about/navigator" },
    { name: "Benchmark Coverage", url: "/navigator/benchmark-coverage" },
  ]);

  readonly vendors = signal<Vendor[]>([]);
  readonly vendorDebugData = signal<VendorDebugInfo[]>([]);
  readonly serverDebugData = signal<ServerDebugInfo[]>([]);
  readonly benchmarkFamilies = signal<string[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedVendorIds = signal<Set<string>>(new Set());
  readonly serverStatusFilter = signal<ServerStatusFilter>("active");
  readonly statusBoolFilters = signal<
    Record<string, BenchmarkFamilyFilterValue>
  >({ has_price: "yes" });
  readonly searchTerm = signal<string>("");

  readonly pageLimits = [10, 25, 50, 100, 250, Infinity];
  readonly page = signal<number>(1);
  readonly limit = signal<number>(25);
  readonly showPageSizeOptions = signal<boolean>(false);
  readonly benchmarkFamilyFilters = signal<
    Record<string, BenchmarkFamilyFilterValue>
  >({});
  readonly filterParams = computed(() => ({
    vendors:
      this.selectedVendorIds().size > 0
        ? Array.from(this.selectedVendorIds()).join(",")
        : null,
    status: this.serverStatusFilter(),
    search: this.searchTerm() || null,
    page: this.page(),
    limit: this.limit() === Infinity ? "All" : this.limit(),
    bools: JSON.stringify(this.statusBoolFilters()),
    benchmarks: JSON.stringify(this.benchmarkFamilyFilters()),
  }));
  private router = inject(Router);

  searchQuery: SearchQuery = {
    search: "",
    vendor_ids: [],
    server_status: "active",
    status_bool: {},
    benchmark_families: {},
  };
  searchParameters: SearchParameter[] = [];

  filterCategories: FilterCategory[] = [
    { category_id: "vendor", name: "Vendors", icon: "home", collapsed: false },
    {
      category_id: "status",
      name: "Status",
      icon: "activity",
      collapsed: false,
    },
    {
      category_id: "benchmark",
      name: "Specific benchmarks",
      icon: "gauge",
      collapsed: false,
    },
  ];

  readonly vendorNameById = computed<Record<string, string>>(() =>
    this.vendors().reduce(
      (acc, vendor) => {
        acc[vendor.vendor_id] = vendor.name;
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  readonly vendorFilterOptions = computed(() => {
    const vendorNameById = this.vendorNameById();
    const vendorIds = [
      ...new Set(this.serverDebugData().map((s) => s.vendor_id)),
    ];

    return vendorIds
      .sort((left, right) =>
        (vendorNameById[left] || left).localeCompare(
          vendorNameById[right] || right,
        ),
      )
      .map((vendorId) => ({
        vendorId,
        label: vendorNameById[vendorId] || vendorId,
      }));
  });

  readonly tableRows = computed<MissingBenchmarkServerRow[]>(() => {
    const families = this.benchmarkFamilies();

    return this.serverDebugData().map((server) => {
      const status = (server.status || "").toLowerCase();
      const isActive = status === "active";
      const benchmarkFlags: Record<string, boolean> = {};

      for (const family of families) {
        benchmarkFlags[family] = Boolean(server.benchmarks?.[family]);
      }

      const hasAnyBenchmark =
        Boolean(server.has_benchmarks) ||
        families.some((family) => benchmarkFlags[family]);

      const hasAllBenchmarks =
        families.length > 0
          ? families.every((family) => benchmarkFlags[family])
          : hasAnyBenchmark;

      return {
        serverKey: `${server.vendor_id}__${server.server_id}`,
        vendor_id: server.vendor_id,
        api_reference: server.api_reference,
        has_price: Boolean(server.has_price),
        is_active: isActive,
        has_hw_info: Boolean(server.has_hw_info),
        has_any_benchmark: hasAnyBenchmark,
        benchmarkFlags,
        assessment: getAssessment({
          isActive,
          hasPrice: Boolean(server.has_price),
          hasHwInfo: Boolean(server.has_hw_info),
          hasAnyBenchmark,
          hasAllBenchmarks,
        }),
      };
    });
  });

  readonly filteredTableRows = computed<MissingBenchmarkServerRow[]>(() => {
    const selectedVendorIds = this.selectedVendorIds();
    const serverStatusFilter = this.serverStatusFilter();
    const statusBoolFilters = this.statusBoolFilters();
    const benchmarkFamilyFilters = this.benchmarkFamilyFilters();
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();

    return this.tableRows().filter((row) => {
      if (normalizedSearchTerm) {
        const matchesSearch =
          row.vendor_id.toLowerCase().includes(normalizedSearchTerm) ||
          row.api_reference.toLowerCase().includes(normalizedSearchTerm);

        if (!matchesSearch) {
          return false;
        }
      }

      if (selectedVendorIds.size > 0 && !selectedVendorIds.has(row.vendor_id)) {
        return false;
      }

      if (serverStatusFilter === "active" && !row.is_active) return false;
      if (serverStatusFilter === "inactive" && row.is_active) return false;

      const hasPrice = statusBoolFilters["has_price"];
      if (hasPrice === "yes" && !row.has_price) return false;
      if (hasPrice === "no" && row.has_price) return false;

      const hasHwInfo = statusBoolFilters["has_hw_info"];
      if (hasHwInfo === "yes" && !row.has_hw_info) return false;
      if (hasHwInfo === "no" && row.has_hw_info) return false;

      const hasAnyBenchmark = statusBoolFilters["has_any_benchmark"];
      if (hasAnyBenchmark === "yes" && !row.has_any_benchmark) return false;
      if (hasAnyBenchmark === "no" && row.has_any_benchmark) return false;

      const benchmarkFilterEntries = Object.entries(benchmarkFamilyFilters);
      if (benchmarkFilterEntries.length > 0) {
        for (const [family, filterValue] of benchmarkFilterEntries) {
          const benchmarkValue = Boolean(row.benchmarkFlags[family]);

          if (filterValue === "yes" && !benchmarkValue) {
            return false;
          }

          if (filterValue === "no" && benchmarkValue) {
            return false;
          }
        }
      }

      return true;
    });
  });

  readonly totalPages = computed<number>(() => {
    const totalRows = this.filteredTableRows().length;
    const pageLimit = this.limit();

    if (pageLimit === Infinity) return 1;

    return Math.max(1, Math.ceil(totalRows / pageLimit));
  });

  readonly paginatedTableRows = computed<MissingBenchmarkServerRow[]>(() => {
    const rows = this.filteredTableRows();
    const currentPage = Math.min(this.page(), this.totalPages());
    const currentLimit = this.limit();

    if (currentLimit === Infinity) {
      return rows;
    }

    const start = (currentPage - 1) * currentLimit;
    return rows.slice(start, start + currentLimit);
  });

  readonly hasActiveFilters = computed<boolean>(() => {
    return (
      this.selectedVendorIds().size > 0 ||
      this.serverStatusFilter() !== "active" ||
      JSON.stringify(this.statusBoolFilters()) !==
        JSON.stringify({ has_price: "yes" }) ||
      Object.keys(this.benchmarkFamilyFilters()).length > 0 ||
      this.searchTerm().trim().length > 0
    );
  });

  ngOnInit() {
    this.seoHandler.updateTitleAndMetaTags(
      "Spare Cores - Benchmark Coverage",
      "View cloud server benchmark coverage across vendors with pricing data, hardware inspection results, and standardized performance measurements from Spare Cores.",
      "missing benchmarks, benchmark status",
    );

    void this.loadDebugData();

    this.initializeFiltersFromUrl();
  }

  private initializeFiltersFromUrl() {
    const params = this.route.snapshot.queryParams;

    if (params["status"]) {
      this.serverStatusFilter.set(parseServerStatusFilter(params["status"]));
    }
    if (params["search"]) this.searchTerm.set(params["search"]);
    if (params["page"]) {
      const pageNum = Number(params["page"]);
      if (!isNaN(pageNum) && pageNum >= 1) {
        this.page.set(Math.floor(pageNum));
      }
    }
    if (params["limit"]) {
      const limitNum = Number(params["limit"]);
      this.limit.set(
        params["limit"] === "All" ? Infinity : !isNaN(limitNum) ? limitNum : 25,
      );
    }
    if (params["vendors"]) {
      this.selectedVendorIds.set(new Set(params["vendors"].split(",")));
    }

    const bools = safeJsonParse(params, "bools");
    if (bools)
      this.statusBoolFilters.set(normalizeBenchmarkFamilyFilters(bools));

    const benchmarks = safeJsonParse(params, "benchmarks");
    if (benchmarks)
      this.benchmarkFamilyFilters.set(
        normalizeBenchmarkFamilyFilters(benchmarks),
      );
  }

  toggleVendorFilter(vendorId: string) {
    this.setVendorFilter(vendorId, !this.selectedVendorIds().has(vendorId));
  }

  setVendorFilter(vendorId: string, checked: boolean) {
    this.selectedVendorIds.update((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(vendorId);
      } else {
        next.delete(vendorId);
      }
      return next;
    });
    this.page.set(1);
  }

  updateSearchTerm(value: string) {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  searchBarChanged(filters: SearchBarFilters) {
    this.searchTerm.set(
      typeof filters?.search === "string" ? filters.search.trim() : "",
    );
    this.selectedVendorIds.set(new Set(parseArray(filters?.vendor_ids)));
    this.serverStatusFilter.set(
      parseServerStatusFilter(filters?.server_status),
    );
    this.statusBoolFilters.set(
      normalizeBenchmarkFamilyFilters(filters?.status_bool),
    );
    this.benchmarkFamilyFilters.set(
      normalizeBenchmarkFamilyFilters(filters?.benchmark_families),
    );
    this.page.set(1);
  }

  selectPageSize(limit: number) {
    this.limit.set(limit);
    this.page.set(1);
    this.showPageSizeOptions.set(false);
  }

  togglePageSizeOptions() {
    this.showPageSizeOptions.set(!this.showPageSizeOptions());
  }

  goToPage(pageTarget: number) {
    const clampedPage = Math.max(1, Math.min(pageTarget, this.totalPages()));
    this.page.set(clampedPage);
  }

  readonly possiblePages = computed<number[]>(() => {
    const current = this.page();
    const total = this.totalPages();
    const min = Math.max(current - 1, 1);
    const max = Math.min(current + 1, total);
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  });

  clearFilters() {
    this.selectedVendorIds.set(new Set());
    this.serverStatusFilter.set("active");
    this.statusBoolFilters.set({ has_price: "yes" });
    this.benchmarkFamilyFilters.set({});
    this.searchTerm.set("");
    this.page.set(1);
    this.initializeSearchBar();
  }

  toggleCategory(category: FilterCategory) {
    category.collapsed = !category.collapsed;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  private async loadDebugData() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [debugResponse, vendorsResponse] = await Promise.all([
        this.keeperApi.getDebugInfo(),
        this.keeperApi.getVendors(),
      ]);

      this.vendorDebugData.set(debugResponse.body.vendors ?? []);
      this.serverDebugData.set(debugResponse.body.servers ?? []);
      this.benchmarkFamilies.set(
        [...(debugResponse.body.benchmark_families ?? [])].sort(),
      );
      this.vendors.set(vendorsResponse.body as Vendor[]);
      this.initializeSearchBar();
    } catch {
      this.errorMessage.set("Failed to load benchmark data. Please try again.");
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildSearchParameters(): SearchParameter[] {
    return [
      {
        name: "search",
        schema: {
          title: "Search vendor or API reference",
          category_id: "vendor",
          type: "string",
        },
        modelValue: this.searchTerm(),
      },
      {
        name: "vendor_ids",
        schema: {
          title: "Vendors",
          category_id: "vendor",
          type: "array",
          enum: this.vendorFilterOptions().map((vendor) => ({
            key: vendor.vendorId,
            value: vendor.label,
          })),
        },
        modelValue: Array.from(this.selectedVendorIds()),
      },
      {
        name: "server_status",
        schema: {
          title: "Status",
          category_id: "status",
          type: "string",
          filter_mode: "single_radio",
          enum: [
            { key: "all", value: "All" },
            { key: "active", value: "Active" },
            { key: "inactive", value: "Inactive" },
          ],
        },
        modelValue: this.serverStatusFilter(),
      },
      {
        name: "status_bool",
        schema: {
          title: "Properties",
          category_id: "status",
          type: "array",
          filter_mode: "tri_state_boolean",
          enum: [
            { key: "has_price", value: "Has price" },
            { key: "has_hw_info", value: "Has hardware discovery" },
            { key: "has_any_benchmark", value: "Has any benchmark" },
          ],
        },
        modelValue: { ...this.statusBoolFilters() },
      },
      {
        name: "benchmark_families",
        schema: {
          title: "Specific benchmarks",
          category_id: "benchmark",
          type: "array",
          filter_mode: "tri_state_boolean",
          enum: this.benchmarkFamilies().map((family) => ({
            key: family,
            value: family,
          })),
        },
        modelValue: { ...this.benchmarkFamilyFilters() },
      },
    ];
  }

  private initializeSearchBar() {
    this.searchQuery = {
      search: this.searchTerm(),
      vendor_ids: Array.from(this.selectedVendorIds()),
      server_status: this.serverStatusFilter(),
      status_bool: { ...this.statusBoolFilters() },
      benchmark_families: { ...this.benchmarkFamilyFilters() },
    };
    this.searchParameters = this.buildSearchParameters();
  }
}
