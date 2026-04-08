import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute, Params, RouterLink } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { Subscription } from "rxjs";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import {
  SearchBarComponent,
  SearchBarBenchmarkConfigGroup,
  SearchBarBenchmarkConfigOption,
  SearchBarCustomControl,
  SearchBarCustomSelectOption,
  SearchBarParameter,
} from "../../components/search-bar/search-bar.component";
import {
  BenchmarkScore,
  OrderDir,
  SearchServersServersGetData,
  SearchServersServersGetParams,
  Server,
  ServerPKs,
} from "../../../../sdk/data-contracts";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ServerCompareService } from "../../services/server-compare.service";
import { ToastService } from "../../services/toast.service";
import { encodeQueryParams } from "../../tools/queryParamFunctions";
import openApiSpec from "../../../../sdk/openapi.json";

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([left], [right]) => left.localeCompare(right),
    );

    return `{${entries
      .map(
        ([key, entryValue]) =>
          `${JSON.stringify(key)}:${stableStringify(entryValue)}`,
      )
      .join(",")}}`;
  }

  return JSON.stringify(value ?? null);
}

function normalizeBenchmarkConfig(config: unknown): string {
  if (typeof config === "string") {
    const trimmed = config.trim();

    if (!trimmed) {
      return stableStringify({});
    }

    try {
      return stableStringify(JSON.parse(trimmed));
    } catch {
      return trimmed;
    }
  }

  return stableStringify(config ?? {});
}

type AdvisorTableColumn = {
  name: string;
  key: keyof ServerPKs | "details";
  orderField?: string;
};

@Component({
  selector: "app-advisor",
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    LucideAngularModule,
    RouterLink,
    SearchBarComponent,
  ],
  templateUrl: "./advisor.component.html",
  styleUrl: "./advisor.component.scss",
})
export class AdvisorComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private seoHandler = inject(SeoHandlerService);
  private keeperApi = inject(KeeperAPIService);
  private route = inject(ActivatedRoute);
  private serverCompare = inject(ServerCompareService);
  private toastService = inject(ToastService);
  private compareSubscription = new Subscription();
  private lastEncodedQuery: string | null = null;
  private clipboardResetTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly title = "Server Advisor";
  readonly description =
    "Compare a baseline server against workload-aware alternatives and surface the best cloud replacement options based on performance, cost efficiency, memory, and GPU constraints. Use the Spare Cores Server Advisor to explore recommendations, refine the workload inputs, and share the resulting query with your team.";

  readonly breadcrumbs = signal<BreadcrumbSegment[]>([
    { name: "Home", url: "/" },
    { name: "Advisor", url: "/advisor" },
  ]);

  readonly isCollapsed = signal(false);
  readonly query = signal<Record<string, unknown>>({});
  readonly serverTableRows = signal<Server[]>([]);
  readonly baselineServerInput = signal("");
  readonly selectedBaselineServer = signal<Server | null>(null);
  readonly isLoadingBaselineServers = signal(false);
  readonly benchmarkConfigInput = signal("");
  readonly selectedBenchmarkConfig =
    signal<SearchBarBenchmarkConfigOption | null>(null);
  readonly benchmarkConfigOptions = signal<SearchBarBenchmarkConfigOption[]>(
    [],
  );
  readonly isLoadingBenchmarkConfigs = signal(false);
  readonly baselineBenchmarkScores = signal<BenchmarkScore[]>([]);
  readonly isLoadingBaselineBenchmarkScores = signal(false);
  readonly optimizationGoal = signal<
    "performance" | "cost" | "cost-efficiency"
  >("cost");
  readonly averageCpuUtilization = signal<number | null>(null);
  readonly minimumMemoryGiB = signal<number | null>(null);
  readonly peakGpuMemoryGiB = signal<number>(0);
  readonly recommendations = signal<SearchServersServersGetData>([]);
  readonly isLoadingRecommendations = signal(false);
  readonly compareSelectionKeys = signal<string[]>([]);
  readonly clipboardIcon = signal("clipboard");
  readonly pendingBaselineVendorId = signal<string | null>(null);
  readonly pendingBaselineApiReference = signal<string | null>(null);
  readonly pendingWorkloadId = signal<string | null>(null);
  readonly pendingWorkloadConfig = signal<string | null>(null);
  readonly hasRestoredRouteState = signal(false);
  readonly page = signal(1);
  readonly limit = signal(25);
  readonly totalPages = signal(0);
  readonly manualOrderBy = signal<string | undefined>(undefined);
  readonly manualOrderDir = signal<OrderDir | undefined>(undefined);
  readonly pageLimits = [10, 25, 50, 100];

  readonly advisorFilterCategories = [
    { category_id: "advisor", name: "Advisor", icon: "bot", collapsed: false },
    { category_id: "vendor", name: "Vendor", icon: "home", collapsed: true },
    { category_id: "region", name: "Region", icon: "hotel", collapsed: true },
  ];

  searchParameters: SearchBarParameter[] = [];
  readonly optimizationGoalOptions: SearchBarCustomSelectOption[] = [
    { value: "performance", label: "Performance" },
    { value: "cost", label: "Cost" },
    { value: "cost-efficiency", label: "Cost-efficiency" },
  ];
  readonly advisorTableColumns: AdvisorTableColumn[] = [
    { name: "Vendor", key: "vendor_id", orderField: "vendor_id" },
    {
      name: "API Reference",
      key: "api_reference",
      orderField: "api_reference",
    },
    { name: "Status", key: "status", orderField: "status" },
    { name: "vCPUs", key: "vcpus", orderField: "vcpus" },
    {
      name: "Memory",
      key: "memory_amount",
      orderField: "memory_amount",
    },
    {
      name: "GPU Memory",
      key: "gpu_memory_total",
      orderField: "gpu_memory_total",
    },
    {
      name: "Storage",
      key: "storage_size",
      orderField: "storage_size",
    },
    { name: "Details", key: "details" },
  ];

  readonly activeFilterCount = computed(() => Object.keys(this.query()).length);
  readonly filteredBaselineServers = computed(() => {
    const searchTerm = this.baselineServerInput().trim().toLowerCase();

    if (searchTerm.length < 3) {
      return [];
    }

    return this.serverTableRows()
      .filter((server) => {
        const vendor = server.vendor_id.toLowerCase();
        const apiReference = server.api_reference.toLowerCase();
        const displayName = server.display_name.toLowerCase();
        const description = (server.description || "").toLowerCase();

        return (
          vendor.includes(searchTerm) ||
          apiReference.includes(searchTerm) ||
          displayName.includes(searchTerm) ||
          description.includes(searchTerm)
        );
      })
      .slice(0, 20);
  });

  readonly visibleBenchmarkConfigOptions = computed(() => {
    const searchTerm = this.benchmarkConfigInput().trim().toLowerCase();
    const options = this.benchmarkConfigOptions();

    if (searchTerm.length < 3) {
      return options;
    }

    return options.filter((option) => {
      const category = (
        option.category ||
        option.framework ||
        ""
      ).toLowerCase();
      const displayName = option.displayName.toLowerCase();
      const config = option.config.toLowerCase();
      const description = (
        option.benchmarkTemplate?.description || ""
      ).toLowerCase();

      return (
        category.includes(searchTerm) ||
        displayName.includes(searchTerm) ||
        config.includes(searchTerm) ||
        description.includes(searchTerm)
      );
    });
  });

  readonly benchmarkGroups = computed<SearchBarBenchmarkConfigGroup[]>(() => {
    const grouped = new Map<string, SearchBarBenchmarkConfigOption[]>();

    for (const option of this.visibleBenchmarkConfigOptions()) {
      const groupName = option.category || option.framework || "Other";
      if (!grouped.has(groupName)) {
        grouped.set(groupName, []);
      }
      grouped.get(groupName)!.push(option);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, options]) => ({
        name,
        options: options.sort((left, right) =>
          left.displayName.localeCompare(right.displayName),
        ),
      }));
  });

  readonly recommendationOrderBy = computed(() => {
    switch (this.optimizationGoal()) {
      case "performance":
        return "selected_benchmark_score";
      case "cost-efficiency":
        return "selected_benchmark_score_per_price";
      case "cost":
      default:
        return "min_price";
    }
  });

  readonly matchedBaselineBenchmarkScore = computed<BenchmarkScore | null>(
    () => {
      const selectedBenchmarkConfig = this.selectedBenchmarkConfig();

      if (!selectedBenchmarkConfig) {
        return null;
      }

      const selectedConfigKey = normalizeBenchmarkConfig(
        selectedBenchmarkConfig.config,
      );

      return (
        this.baselineBenchmarkScores().find((benchmarkScore) => {
          return (
            benchmarkScore.benchmark_id ===
              selectedBenchmarkConfig.benchmark_id &&
            normalizeBenchmarkConfig(benchmarkScore.config) ===
              selectedConfigKey
          );
        }) || null
      );
    },
  );

  readonly benchmarkScoreMinimum = computed<number | null>(() => {
    const benchmarkScore = this.matchedBaselineBenchmarkScore();
    const cpuUtilization = this.averageCpuUtilization();

    if (!benchmarkScore || cpuUtilization === null) {
      return null;
    }

    return Number(((benchmarkScore.score * cpuUtilization) / 100).toFixed(2));
  });

  readonly missingRequiredInputs = computed(() => {
    const missing: string[] = [];

    if (!this.selectedBaselineServer()) {
      missing.push("Baseline server");
    }

    if (!this.selectedBenchmarkConfig()) {
      missing.push("Server workload");
    }

    if (!this.optimizationGoal()) {
      missing.push("Optimization goal");
    }

    if (this.averageCpuUtilization() === null) {
      missing.push("Average CPU utilization");
    }

    if (this.minimumMemoryGiB() === null) {
      missing.push("Minimum memory");
    }

    return missing;
  });

  readonly canRequestRecommendations = computed(
    () =>
      this.missingRequiredInputs().length === 0 &&
      this.matchedBaselineBenchmarkScore() !== null,
  );
  readonly topRecommendation = computed<ServerPKs | null>(
    () => this.recommendations()[0] || null,
  );
  readonly compareCount = computed(() => this.compareSelectionKeys().length);
  readonly activeOrderBy = computed(
    () => this.manualOrderBy() || this.recommendationOrderBy(),
  );
  readonly activeOrderDir = computed(
    () => this.manualOrderDir() || OrderDir.Desc,
  );

  readonly recommendationQuery = computed<SearchServersServersGetParams | null>(
    () => {
      const selectedBenchmarkConfig = this.selectedBenchmarkConfig();
      const benchmarkScoreMinimum = this.benchmarkScoreMinimum();
      const minimumMemoryGiB = this.minimumMemoryGiB();

      if (
        !this.canRequestRecommendations() ||
        !selectedBenchmarkConfig ||
        benchmarkScoreMinimum === null ||
        minimumMemoryGiB === null
      ) {
        return null;
      }

      const sharedQuery = {
        ...(this.query() as SearchServersServersGetParams),
      };

      return {
        ...sharedQuery,
        benchmark_id: selectedBenchmarkConfig.benchmark_id,
        benchmark_config: selectedBenchmarkConfig.config,
        benchmark_score_min: benchmarkScoreMinimum,
        memory_min: minimumMemoryGiB,
        gpu_memory_total:
          this.peakGpuMemoryGiB() > 0 ? this.peakGpuMemoryGiB() : undefined,
        order_by: this.activeOrderBy(),
        order_dir: this.activeOrderDir(),
        limit: this.limit(),
        page: this.page(),
        add_total_count_header: true,
      };
    },
  );

  readonly customControls = computed<SearchBarCustomControl[]>(() => [
    {
      name: "baseline_server",
      category_id: "advisor",
      type: "serverAutocomplete",
      title: "Baseline Server",
      placeholder: "Search for server...",
      required: true,
      minCharacters: 3,
      inputValue: this.baselineServerInput(),
      selectedServer: this.selectedBaselineServer(),
      options: this.filteredBaselineServers(),
      emptyMessage: this.isLoadingBaselineServers()
        ? "Loading server catalog..."
        : "No matching servers found.",
    },
    {
      name: "server_workload",
      category_id: "advisor",
      type: "benchmarkConfigSelect",
      title: "Server workload",
      placeholder: "Search benchmark or browse categories...",
      required: true,
      minCharacters: 3,
      inputValue: this.benchmarkConfigInput(),
      selectedBenchmarkConfig: this.selectedBenchmarkConfig(),
      benchmarkOptions: this.visibleBenchmarkConfigOptions(),
      benchmarkGroups: this.benchmarkGroups(),
      emptyMessage: this.isLoadingBenchmarkConfigs()
        ? "Loading benchmark workloads..."
        : "No matching workloads found.",
    },
    {
      name: "optimization_goal",
      category_id: "advisor",
      type: "singleSelect",
      title: "Optimization goal",
      required: true,
      description:
        "Selecting performance will search for servers delivering higher performance for the same price, while selecting cost-efficiency will find the cheapest option of right-sized server types.",
      selectedValue: this.optimizationGoal(),
      selectOptions: this.optimizationGoalOptions,
    },
    {
      name: "average_cpu_utilization",
      category_id: "advisor",
      type: "rangeSlider",
      title: "Average CPU utilization",
      required: true,
      description:
        "The selected workload score threshold is derived from the baseline server score scaled by this expected average CPU utilization.",
      numericValue: this.averageCpuUtilization(),
      min: 0,
      max: 100,
      step: 10,
      unit: "%",
      tickValues: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    },
    {
      name: "minimum_memory",
      category_id: "advisor",
      type: "powerOfTwoStepper",
      title: "Minimum memory",
      required: true,
      description:
        "Memory requirement in GB. The stepper follows powers of two starting at 0.5 GB.",
      numericValue: this.minimumMemoryGiB(),
      unit: "GB",
    },
    {
      name: "peak_gpu_memory",
      category_id: "advisor",
      type: "powerOfTwoStepper",
      title: "Peak GPU memory usage",
      description:
        "Total GPU memory requirement in GB. Leave at 0 to avoid applying GPU filters.",
      numericValue: this.peakGpuMemoryGiB(),
      unit: "GB",
      allowZero: true,
    },
  ]);

  constructor() {
    effect(() => {
      const pendingBaselineVendorId = this.pendingBaselineVendorId();
      const pendingBaselineApiReference = this.pendingBaselineApiReference();

      if (!pendingBaselineVendorId || !pendingBaselineApiReference) {
        return;
      }

      const matchedServer = this.serverTableRows().find((server) => {
        return (
          server.vendor_id === pendingBaselineVendorId &&
          server.api_reference === pendingBaselineApiReference
        );
      });

      if (!matchedServer) {
        return;
      }

      this.selectedBaselineServer.set(matchedServer);
      this.baselineServerInput.set(
        `${matchedServer.vendor_id} ${matchedServer.api_reference}`,
      );
      this.pendingBaselineVendorId.set(null);
      this.pendingBaselineApiReference.set(null);
    });

    effect(() => {
      const pendingWorkloadId = this.pendingWorkloadId();
      const pendingWorkloadConfig = this.pendingWorkloadConfig();

      if (!pendingWorkloadId) {
        return;
      }

      const matchedWorkload = this.benchmarkConfigOptions().find((option) => {
        return (
          option.benchmark_id === pendingWorkloadId &&
          option.config === (pendingWorkloadConfig || "{}")
        );
      });

      if (!matchedWorkload) {
        return;
      }

      this.selectedBenchmarkConfig.set(matchedWorkload);
      this.benchmarkConfigInput.set(matchedWorkload.displayName);
      this.pendingWorkloadId.set(null);
      this.pendingWorkloadConfig.set(null);
    });

    effect(() => {
      const selectedBaselineServer = this.selectedBaselineServer();

      if (!selectedBaselineServer) {
        this.baselineBenchmarkScores.set([]);
        return;
      }

      void this.loadBaselineBenchmarkScores(selectedBaselineServer);
    });

    effect(() => {
      const recommendationQuery = this.recommendationQuery();

      if (!recommendationQuery) {
        this.recommendations.set([]);
        return;
      }

      void this.loadRecommendations(recommendationQuery);
    });

    effect(() => {
      if (
        !this.hasRestoredRouteState() ||
        !isPlatformBrowser(this.platformId)
      ) {
        return;
      }

      const encodedQuery = encodeQueryParams(this.getUrlStateQueryParams());

      if (encodedQuery === this.lastEncodedQuery) {
        return;
      }

      this.lastEncodedQuery = encodedQuery;
      const path = window.location.pathname || "/advisor";

      if (encodedQuery?.length) {
        window.history.pushState({}, "", `${path}?${encodedQuery}`);
      } else {
        window.history.pushState({}, "", path);
      }
    });
  }

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "Server Advisor - Spare Cores",
      "Compare a baseline server against workload-aware alternatives with the Spare Cores Server Advisor. Explore recommendations based on performance, cost, memory, and GPU requirements, then share the advisor link with your team.",
      "server advisor, cloud servers, workload recommendations, cost efficiency, performance, spare cores",
    );

    const parameters = openApiSpec.paths["/servers"].get.parameters || [];
    this.searchParameters = parameters
      .filter((p: any) => p.name !== "regions")
      .map(
        (parameter: any): SearchBarParameter => ({
          name: parameter.name,
          modelValue: null,
          schema: parameter.schema,
        }),
      );

    this.loadBaselineServerRows();
    this.loadBenchmarkConfigs();
    this.restoreStateFromRoute();
    this.syncCompareSelection();
    this.compareSubscription.add(
      this.serverCompare.selectionChanged.subscribe(() => {
        this.syncCompareSelection();
      }),
    );
  }

  ngOnDestroy(): void {
    this.compareSubscription.unsubscribe();

    if (this.clipboardResetTimeout) {
      clearTimeout(this.clipboardResetTimeout);
      this.clipboardResetTimeout = null;
    }
  }

  toggleCollapse(): void {
    this.isCollapsed.update((value) => !value);
  }

  toggleOrdering(column: AdvisorTableColumn): void {
    if (!column.orderField) {
      return;
    }

    if (this.manualOrderBy() === column.orderField) {
      if (this.manualOrderDir() === OrderDir.Desc) {
        this.manualOrderDir.set(OrderDir.Asc);
      } else {
        this.manualOrderBy.set(undefined);
        this.manualOrderDir.set(undefined);
      }
    } else {
      this.manualOrderBy.set(column.orderField);
      this.manualOrderDir.set(OrderDir.Desc);
    }

    this.page.set(1);
  }

  getOrderingIcon(column: AdvisorTableColumn): string | null {
    if (!column.orderField || this.activeOrderBy() !== column.orderField) {
      return null;
    }

    return this.activeOrderDir() === OrderDir.Desc
      ? "arrow-down-wide-narrow"
      : "arrow-down-narrow-wide";
  }

  selectPageSize(limit: number): void {
    this.limit.set(limit);
    this.page.set(1);
  }

  goToPreviousPage(): void {
    if (this.page() > 1) {
      this.page.update((page) => page - 1);
    }
  }

  goToNextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((page) => page + 1);
    }
  }

  getVisiblePageNumbers(): number[] {
    const currentPage = this.page();
    const totalPages = this.totalPages();
    const min = Math.max(currentPage - 1, 1);
    const max = Math.min(currentPage + 1, totalPages);

    return Array.from({ length: Math.max(max - min + 1, 0) }, (_, index) => {
      return min + index;
    });
  }

  goToPage(pageTarget: number): void {
    const boundedPage = Math.max(1, Math.min(pageTarget, this.totalPages()));
    this.page.set(boundedPage);
  }

  formatMemoryGiB(value: number | null | undefined): string {
    if (!value) {
      return "-";
    }

    return `${(value / 1024).toFixed(1)} GiB`;
  }

  formatStorageGb(value: number | null | undefined): string {
    if (!value) {
      return "-";
    }

    return `${value} GB`;
  }

  formatPrice(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return "-";
    }

    return `${value} USD/hr`;
  }

  formatScore(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return "-";
    }

    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  showApiReference(item: ServerPKs): boolean {
    return (
      item.display_name !== item.api_reference &&
      item.display_name !== item.api_reference.replace("Standard_", "")
    );
  }

  isSelectedForCompare(server: ServerPKs): boolean {
    return this.compareSelectionKeys().includes(this.getCompareKey(server));
  }

  toggleCompareSelection(event: Event, server: ServerPKs): void {
    event.stopPropagation();

    const shouldSelect = !this.isSelectedForCompare(server);
    this.serverCompare.toggleCompare(shouldSelect, {
      server: server.api_reference,
      vendor: server.vendor_id,
      display_name: server.display_name,
    });
  }

  toggleCompareRecommendation(server: ServerPKs): void {
    const shouldSelect = !this.isSelectedForCompare(server);
    this.serverCompare.toggleCompare(shouldSelect, {
      server: server.api_reference,
      vendor: server.vendor_id,
      display_name: server.display_name,
    });
  }

  clearCompareSelection(): void {
    this.serverCompare.clearCompare();
  }

  async clipboardURL(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      this.clipboardIcon.set("check");
      this.toastService.show({
        title: "Link copied to clipboard!",
        type: "success",
        duration: 2000,
      });

      if (this.clipboardResetTimeout) {
        clearTimeout(this.clipboardResetTimeout);
      }

      this.clipboardResetTimeout = setTimeout(() => {
        this.clipboardIcon.set("clipboard");
        this.clipboardResetTimeout = null;
      }, 3000);
    } catch (error) {
      console.error("Failed to copy advisor link", error);
      this.toastService.show({
        title: "Failed to copy link",
        body: "Clipboard access is not available in this browser context.",
        type: "error",
        duration: 3000,
      });
    }
  }

  openCompare(): void {
    this.serverCompare.openCompare();
  }

  onSearchChanged(query: Record<string, unknown>): void {
    this.query.set(query);
    this.page.set(1);
  }

  onCustomControlChanged(event: { name: string; value: unknown }): void {
    if (event.name === "baseline_server") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as {
              inputValue?: string;
              selectedServer?: Server | null;
            })
          : {};

      this.baselineServerInput.set(nextValue.inputValue || "");
      this.selectedBaselineServer.set(nextValue.selectedServer || null);
      this.pendingBaselineVendorId.set(null);
      this.pendingBaselineApiReference.set(null);
      this.page.set(1);
      return;
    }

    if (event.name === "server_workload") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as {
              inputValue?: string;
              selectedBenchmarkConfig?: SearchBarBenchmarkConfigOption | null;
            })
          : {};

      this.benchmarkConfigInput.set(nextValue.inputValue || "");
      this.selectedBenchmarkConfig.set(
        nextValue.selectedBenchmarkConfig || null,
      );
      this.pendingWorkloadId.set(null);
      this.pendingWorkloadConfig.set(null);
      this.page.set(1);
      return;
    }

    if (event.name === "optimization_goal") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as { selectedValue?: string | null })
          : {};

      const selectedValue = nextValue.selectedValue;
      if (
        selectedValue === "performance" ||
        selectedValue === "cost" ||
        selectedValue === "cost-efficiency"
      ) {
        this.optimizationGoal.set(selectedValue);
      }

      this.page.set(1);

      return;
    }

    if (event.name === "average_cpu_utilization") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as { numericValue?: number | null })
          : {};

      this.averageCpuUtilization.set(nextValue.numericValue ?? null);
      this.page.set(1);
      return;
    }

    if (event.name === "minimum_memory") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as { numericValue?: number | null })
          : {};

      this.minimumMemoryGiB.set(nextValue.numericValue ?? null);
      this.page.set(1);
      return;
    }

    if (event.name === "peak_gpu_memory") {
      const nextValue =
        event.value && typeof event.value === "object"
          ? (event.value as { numericValue?: number | null })
          : {};

      this.peakGpuMemoryGiB.set(nextValue.numericValue ?? 0);
      this.page.set(1);
    }
  }

  private loadBaselineServerRows(): void {
    this.isLoadingBaselineServers.set(true);

    this.keeperApi
      .getServers()
      .then((response) => {
        this.serverTableRows.set(response?.body || []);
      })
      .catch((error) => {
        console.error("Failed to preload advisor baseline servers", error);
        this.serverTableRows.set([]);
      })
      .finally(() => {
        this.isLoadingBaselineServers.set(false);
      });
  }

  private loadBenchmarkConfigs(): void {
    this.isLoadingBenchmarkConfigs.set(true);

    Promise.all([
      this.keeperApi.getServerBenchmarkMeta(),
      this.keeperApi.getBenchmarkConfigs(),
    ])
      .then(([benchmarkMetaResponse, benchmarkConfigResponse]) => {
        const benchmarkMeta = benchmarkMetaResponse?.body || [];
        const benchmarkConfigs = benchmarkConfigResponse?.body || [];

        const options = benchmarkConfigs.map(
          (config: any): SearchBarBenchmarkConfigOption => {
            const benchmarkTemplate =
              benchmarkMeta.find(
                (benchmark: any) =>
                  benchmark.benchmark_id === config.benchmark_id,
              ) || null;

            const configTitle = (config.config || "").replaceAll(/[{}"]/g, "");
            const displayName = benchmarkTemplate?.name || config.benchmark_id;

            return {
              ...config,
              benchmarkTemplate,
              configTitle,
              displayName,
              framework:
                benchmarkTemplate?.framework ||
                config.category ||
                config.benchmark_id,
            };
          },
        );

        this.benchmarkConfigOptions.set(options);

        const defaultOption = options.find(
          (option: SearchBarBenchmarkConfigOption) =>
            option.benchmark_id === "stress_ng:bestn" && option.config === "{}",
        );

        if (defaultOption && !this.selectedBenchmarkConfig()) {
          this.selectedBenchmarkConfig.set(defaultOption);
          this.benchmarkConfigInput.set(defaultOption.displayName);
        }
      })
      .catch((error) => {
        console.error("Failed to preload advisor benchmark configs", error);
        this.benchmarkConfigOptions.set([]);
      })
      .finally(() => {
        this.isLoadingBenchmarkConfigs.set(false);
      });
  }

  private async loadBaselineBenchmarkScores(server: Server): Promise<void> {
    this.isLoadingBaselineBenchmarkScores.set(true);

    try {
      const response = await this.keeperApi.getServerBenchmark(
        server.vendor_id,
        server.server_id,
      );

      this.baselineBenchmarkScores.set(response?.body || []);
    } catch (error) {
      console.error("Failed to load advisor baseline benchmark scores", error);
      this.baselineBenchmarkScores.set([]);
    } finally {
      this.isLoadingBaselineBenchmarkScores.set(false);
    }
  }

  private async loadRecommendations(
    recommendationQuery: SearchServersServersGetParams,
  ): Promise<void> {
    this.isLoadingRecommendations.set(true);

    try {
      const response = await this.keeperApi.searchServers(recommendationQuery);
      const totalCount = parseInt(
        response?.headers?.get("x-total-count") || "0",
        10,
      );
      const totalPages = Math.ceil(totalCount / this.limit());

      this.totalPages.set(totalPages);

      if (totalPages > 0 && this.page() > totalPages) {
        this.page.set(totalPages);
        return;
      }

      this.recommendations.set(response?.body || []);
    } catch (error) {
      console.error("Failed to load advisor recommendations", error);
      this.recommendations.set([]);
      this.totalPages.set(0);
    } finally {
      this.isLoadingRecommendations.set(false);
    }
  }

  private syncCompareSelection(): void {
    this.compareSelectionKeys.set(
      this.serverCompare.selectedForCompare.map((server) => {
        return `${server.vendor}::${server.server}`;
      }),
    );
  }

  private restoreStateFromRoute(): void {
    this.compareSubscription.add(
      this.route.queryParams.subscribe((params: Params) => {
        const queryParams = JSON.parse(JSON.stringify(params || {}));
        const customParamNames = new Set([
          "page",
          "limit",
          "order_by",
          "order_dir",
          "baseline_vendor",
          "baseline_server",
          "workload_id",
          "workload_config",
          "optimization_goal",
          "avg_cpu_utilization",
          "minimum_memory",
          "peak_gpu_memory",
        ]);

        const baseQuery = Object.fromEntries(
          Object.entries(queryParams).filter(
            ([key]) => !customParamNames.has(key),
          ),
        );

        this.query.set(baseQuery);
        this.page.set(
          queryParams.page ? parseInt(String(queryParams.page), 10) || 1 : 1,
        );
        this.limit.set(
          queryParams.limit
            ? parseInt(String(queryParams.limit), 10) || 25
            : 25,
        );
        this.manualOrderBy.set(
          queryParams.order_by ? String(queryParams.order_by) : undefined,
        );

        const orderDir = queryParams.order_dir;
        this.manualOrderDir.set(
          orderDir === OrderDir.Asc || orderDir === OrderDir.Desc
            ? orderDir
            : undefined,
        );

        this.pendingBaselineVendorId.set(
          queryParams.baseline_vendor
            ? String(queryParams.baseline_vendor)
            : null,
        );
        this.pendingBaselineApiReference.set(
          queryParams.baseline_server
            ? String(queryParams.baseline_server)
            : null,
        );

        if (!queryParams.baseline_vendor || !queryParams.baseline_server) {
          this.selectedBaselineServer.set(null);
          this.baselineServerInput.set("");
        }

        this.pendingWorkloadId.set(
          queryParams.workload_id ? String(queryParams.workload_id) : null,
        );
        this.pendingWorkloadConfig.set(
          queryParams.workload_config
            ? String(queryParams.workload_config)
            : null,
        );

        if (!queryParams.workload_id) {
          this.selectedBenchmarkConfig.set(null);
          this.benchmarkConfigInput.set("");
        }

        const optimizationGoal = queryParams.optimization_goal;
        if (
          optimizationGoal === "performance" ||
          optimizationGoal === "cost" ||
          optimizationGoal === "cost-efficiency"
        ) {
          this.optimizationGoal.set(optimizationGoal);
        } else {
          this.optimizationGoal.set("cost");
        }

        this.averageCpuUtilization.set(
          queryParams.avg_cpu_utilization !== undefined
            ? Number(queryParams.avg_cpu_utilization)
            : null,
        );
        this.minimumMemoryGiB.set(
          queryParams.minimum_memory !== undefined
            ? Number(queryParams.minimum_memory)
            : null,
        );
        this.peakGpuMemoryGiB.set(
          queryParams.peak_gpu_memory !== undefined
            ? Number(queryParams.peak_gpu_memory)
            : 0,
        );

        this.lastEncodedQuery = encodeQueryParams(
          this.getUrlStateQueryParams(),
        );
        this.hasRestoredRouteState.set(true);
      }),
    );
  }

  private getUrlStateQueryParams(): Record<string, unknown> {
    const queryParams: Record<string, unknown> = { ...this.query() };
    const selectedBaselineServer = this.selectedBaselineServer();
    const selectedBenchmarkConfig = this.selectedBenchmarkConfig();

    const baselineVendorId =
      selectedBaselineServer?.vendor_id || this.pendingBaselineVendorId();
    const baselineApiReference =
      selectedBaselineServer?.api_reference ||
      this.pendingBaselineApiReference();

    if (baselineVendorId && baselineApiReference) {
      queryParams.baseline_vendor = baselineVendorId;
      queryParams.baseline_server = baselineApiReference;
    }

    const workloadId =
      selectedBenchmarkConfig?.benchmark_id || this.pendingWorkloadId();
    const workloadConfig =
      selectedBenchmarkConfig?.config || this.pendingWorkloadConfig();

    if (workloadId) {
      queryParams.workload_id = workloadId;
      queryParams.workload_config = workloadConfig || "{}";
    }

    if (this.optimizationGoal() !== "cost") {
      queryParams.optimization_goal = this.optimizationGoal();
    }

    if (this.averageCpuUtilization() !== null) {
      queryParams.avg_cpu_utilization = this.averageCpuUtilization();
    }

    if (this.minimumMemoryGiB() !== null) {
      queryParams.minimum_memory = this.minimumMemoryGiB();
    }

    if (this.peakGpuMemoryGiB() > 0) {
      queryParams.peak_gpu_memory = this.peakGpuMemoryGiB();
    }

    if (this.page() > 1) {
      queryParams.page = this.page();
    }

    if (this.limit() !== 25) {
      queryParams.limit = this.limit();
    }

    if (this.manualOrderBy() && this.manualOrderDir()) {
      queryParams.order_by = this.manualOrderBy();
      queryParams.order_dir = this.manualOrderDir();
    }

    return queryParams;
  }

  private getCompareKey(server: ServerPKs): string {
    return `${server.vendor_id}::${server.api_reference}`;
  }
}
