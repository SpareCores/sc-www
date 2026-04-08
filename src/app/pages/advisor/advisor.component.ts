import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
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
import { Server } from "../../../../sdk/data-contracts";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import openApiSpec from "../../../../sdk/openapi.json";

@Component({
  selector: "app-advisor",
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    LucideAngularModule,
    SearchBarComponent,
  ],
  templateUrl: "./advisor.component.html",
  styleUrl: "./advisor.component.scss",
})
export class AdvisorComponent implements OnInit {
  private seoHandler = inject(SeoHandlerService);
  private keeperApi = inject(KeeperAPIService);

  readonly title = "Server Advisor";
  readonly description =
    "Find better cloud server alternatives for a selected baseline server. This page will reuse the server-listing experience while adding advisor-specific recommendation inputs and workload-aware guidance.";

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
  readonly optimizationGoal = signal<
    "performance" | "cost" | "cost-efficiency"
  >("cost");
  readonly averageCpuUtilization = signal<number | null>(null);
  readonly minimumMemoryGiB = signal<number | null>(null);
  readonly peakGpuMemoryGiB = signal<number>(0);

  readonly filterCategories = [
    { category_id: "advisor", name: "Advisor", icon: "bot", collapsed: false },
    { category_id: "basic", name: "Basics", icon: "server", collapsed: true },
    {
      category_id: "performance",
      name: "Performance",
      icon: "gauge",
      collapsed: true,
    },
    {
      category_id: "processor",
      name: "Processor",
      icon: "microchip",
      collapsed: false,
    },
    {
      category_id: "cpu_cache",
      name: "CPU Cache",
      icon: "layers",
      collapsed: true,
    },
    { category_id: "gpu", name: "GPU", icon: "cpu", collapsed: true },
    {
      category_id: "memory",
      name: "Memory",
      icon: "memory-stick",
      collapsed: true,
    },
    {
      category_id: "storage",
      name: "Storage",
      icon: "database",
      collapsed: true,
    },
    { category_id: "vendor", name: "Vendor", icon: "home", collapsed: true },
    { category_id: "region", name: "Region", icon: "hotel", collapsed: true },
  ];

  searchParameters: SearchBarParameter[] = [];
  readonly optimizationGoalOptions: SearchBarCustomSelectOption[] = [
    { value: "performance", label: "Performance" },
    { value: "cost", label: "Cost" },
    { value: "cost-efficiency", label: "Cost-efficiency" },
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
    () => this.missingRequiredInputs().length === 0,
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
  ]);

  ngOnInit(): void {
    this.seoHandler.updateTitleAndMetaTags(
      "Server Advisor - Spare Cores",
      "Compare a baseline server against better alternatives with the Spare Cores Server Advisor.",
      "server advisor, cloud servers, recommendation, spare cores",
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
  }

  toggleCollapse(): void {
    this.isCollapsed.update((value) => !value);
  }

  onSearchChanged(query: Record<string, unknown>): void {
    this.query.set(query);
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
}
