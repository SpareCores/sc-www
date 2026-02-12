import {
  Component,
  PLATFORM_ID,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  inject,
} from "@angular/core";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import {
  OrderDir,
  ServerPKs,
  ServerPriceWithPKs,
} from "../../../../sdk/data-contracts";
import { encodeQueryParams } from "../../tools/queryParamFunctions";
import { ActivatedRoute, Params, Router, RouterModule } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule } from "lucide-angular";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import {
  ServerCompare,
  ServerCompareService,
} from "../../services/server-compare.service";
import { DropdownManagerService } from "../../services/dropdown-manager.service";
import { AnalyticsService } from "../../services/analytics.service";
import { Modal, ModalOptions } from "flowbite";
import { ToastService } from "../../services/toast.service";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { Subscription } from "rxjs";
import openApiSpec from "../../../../sdk/openapi.json";
import specialServerListsData from "./special-lists.js";
import { GpuCountPipe } from "../../pipes/gpu-count.pipe";

export type TableColumn = {
  name: string;
  type: string;
  key?: string;
  show?: boolean;
  orderField?: string;
  info?: string;
};

export type CountryMetadata = {
  continent: string;
  country_id: string;
  selected?: boolean;
};

export type ContinentMetadata = {
  continent: string;
  selected?: boolean;
  collapsed?: boolean;
};

export type RegionMetadata = {
  region_id: string;
  vendor_id: string;
  name: string;
  api_reference: string;
  green_energy: boolean;
  selected?: boolean;
};

export type RegionVendorMetadata = {
  vendor_id: string;
  name: string;
  selected?: boolean;
  collapsed?: boolean;
};

const optionsModal: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

@Component({
  selector: "app-server-listing",
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbsComponent,
    LucideAngularModule,
    RouterModule,
    SearchBarComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    GpuCountPipe,
  ],
  templateUrl: "./server-listing.component.html",
  styleUrl: "./server-listing.component.scss",
})
export class ServerListingComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private keeperAPI = inject(KeeperAPIService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private SEOHandler = inject(SeoHandlerService);
  private dropdownManager = inject(DropdownManagerService);
  private analytics = inject(AnalyticsService);
  private serverCompare = inject(ServerCompareService);
  private toastService = inject(ToastService);

  isCollapsed = false;

  filterCategories = [
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
  ];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Server listing", url: "/servers" },
  ];

  tableColumns: TableColumn[] = [];

  possibleColumns: TableColumn[] = [
    { name: "NAME & PROVIDER", show: true, type: "name" },
    { name: "VENDOR", show: false, type: "vendor" },
    {
      name: "ARCHITECTURE",
      show: false,
      type: "text",
      key: "cpu_architecture",
    },
    { name: "PROCESSOR", show: true, type: "processor", orderField: "vcpus" },
    { name: "CPU MODEL", show: false, type: "cpu_model" },
    {
      name: "CPU ALLOCATION",
      show: false,
      type: "text",
      key: "cpu_allocation",
    },
    {
      name: "SCORE",
      // benchmark (set to SCore by default) is the new default
      show: false,
      type: "score",
      orderField: "score",
      info: "Performance benchmark score using stress-ng's div16 method (doing 16 bit unsigned integer divisions for 20 seconds): simulating CPU heavy workload that scales well on any number of (v)CPUs. The SCore/price value in the second line shows the div16 performance measured for 1 USD/hour, using the best (usually spot) price of all zones. To order by the latter, enable the $Core column.",
    },
    {
      name: "$CORE",
      show: false,
      type: "score_per_price",
      orderField: "score_per_price",
      info: "SCore/price showing stress-ng's div16 performance measured for 1 USD/hour, using the best (usually spot) price of all zones.",
    },
    {
      name: "BENCHMARK",
      show: true,
      type: "benchmark",
      orderField: "selected_benchmark_score",
      info: "Performance benchmark score as per the selected Benchmark at the top of the table.",
    },
    {
      name: "$ EFFICIENCY",
      show: true,
      type: "benchmark_score_per_price",
      orderField: "selected_benchmark_score_per_price",
      info: "Benchmark/price ratio showing the selected benchmark performance measured for 1 USD/hour, using the best (usually spot) price of all zones. In other words: how much performance you get for your money.",
    },
    { name: "MEMORY", show: true, type: "memory", orderField: "memory_amount" },
    {
      name: "STORAGE",
      show: true,
      type: "storage",
      orderField: "storage_size",
    },
    { name: "STORAGE TYPE", show: false, type: "text", key: "storage_type" },
    { name: "GPUs", show: true, type: "gpu", orderField: "gpu_count" },
    {
      name: "GPU MIN MEMORY",
      show: false,
      type: "gpu_memory_min",
      orderField: "gpu_memory_min",
    },
    {
      name: "GPU TOTAL MEMORY",
      show: false,
      type: "gpu_memory_total",
      orderField: "gpu_memory_total",
    },
    { name: "GPU MODEL", show: false, type: "gpu_model" },
    {
      name: "BEST PRICE",
      show: true,
      type: "price",
      key: "min_price",
      orderField: "min_price",
    },
    {
      name: "BEST ONDEMAND PRICE",
      show: false,
      type: "price",
      key: "min_price_ondemand",
      orderField: "min_price_ondemand",
    },
    {
      name: "BEST ONDEMAND MONTHLY PRICE",
      show: false,
      type: "price",
      key: "min_price_ondemand_monthly",
    },
    {
      name: "BEST SPOT PRICE",
      show: false,
      type: "price",
      key: "min_price_spot",
      orderField: "min_price_spot",
    },
    { name: "STATUS", show: false, type: "text", key: "status" },
  ];

  hasCustomColumns = false;

  pageLimits = [10, 25, 50, 100, 250];

  limit = 25;
  page = 1;
  totalPages = 0;

  orderBy: string | undefined = undefined;
  orderDir: OrderDir | undefined = undefined;

  servers: ServerPriceWithPKs[] | any[] = [];

  openApiJson: any = openApiSpec;
  searchParameters: any;
  query: any = {};

  dropdownColumn: any;
  dropdownPage: any;

  isLoading = false;

  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: any;
  modalResponseStr: string[] = [];

  vendorMetadata: any[] = [];
  benchmarkMetadata: any[] = [];
  benchmarksConfigs: any[] = [];
  benchmarkCategories: any[] = [];

  // getter/setter instead of direct property for setting up a hook on change
  private _selectedBenchmarkConfig: any = null;
  get selectedBenchmarkConfig(): any {
    return this._selectedBenchmarkConfig;
  }
  set selectedBenchmarkConfig(value: any) {
    this._selectedBenchmarkConfig = value;
    this.onBenchmarkConfigChanged();
  }

  modalBenchmarkSelect: any;

  //modal
  modalText: string = "Select Benchmark Category";
  tempfilteredBenchmarkConfigs: any[] = [];
  tempSelectedBenchmarkCategory: string | null = null;
  tempSelectedBenchmarkConfig: any = null;
  modalFilterTerm: string | null = null;

  @ViewChild("tooltipDefault") tooltip!: ElementRef;
  clipboardIcon = "clipboard";
  tooltipContent = "";

  sub: any;

  specialServerLists: any[] = specialServerListsData;
  specialList: any = null;
  specialParameters: any = {};
  title: string = "Cloud Servers Navigator";
  description: string =
    'Explore, search, and evaluate the supported cloud compute resources in the table below. This comprehensive comparison includes diverse attributes such as CPU count, detailed processor information, memory, GPU, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.';

  private subscription = new Subscription();

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "Cloud Servers Navigator - Spare Cores",
      "Harnessing the compute resources of the cloud to optimize efficiency and costs of batch and service tasks.",
      "cloud, server, instance, price, comparison, spot, sparecores",
    );

    this.SEOHandler.updateThumbnail(
      "https://sparecores.com/assets/images/media/server_list_image.png",
    );

    const parameters = this.openApiJson.paths["/servers"].get.parameters || [];
    this.searchParameters = parameters;

    let limit = this.searchParameters.find(
      (param: any) => param.name === "limit",
    );
    if (limit?.schema?.default) {
      this.limit = limit.schema.default;
    }

    let order = this.searchParameters.find(
      (param: any) => param.name === "order_by",
    );
    if (order?.schema?.default) {
      this.orderBy = order.schema.default;
    }

    this.route.params.subscribe(() => {
      this.setSpecialList();
      if (this.specialList) {
        this.breadcrumbs.push({
          name: this.specialList.title,
          url: `/servers/${this.specialList.id}`,
        });
        this.SEOHandler.updateTitleAndMetaTags(
          `${this.specialList.title} - Spare Cores`,
          this.specialList.description,
          "cloud, server, instance, price, comparison, spot, sparecores",
        );
      }
    });

    // initial load is special as we need to decode the benchmark URL param
    let isInitialLoad = true;
    let shouldSearchAfterBenchmarks = false;
    let benchmarkDataEncoded: string | null = null;

    this.subscription.add(
      this.route.queryParams.subscribe((params: Params) => {
        const query: any = JSON.parse(JSON.stringify(params || "{}"));
        this.query = query;

        if (query.page) {
          this.page = parseInt(query.page);
        }

        if (query.limit) {
          this.limit = parseInt(query.limit);
        }

        this.setSpecialList();

        const tableColumns: string = this.specialList?.columns || query.columns;
        if (tableColumns && parseInt(tableColumns)) {
          const tableColumnsArray: number[] = Number(tableColumns)
            .toString(2)
            .split("")
            .map(Number);
          if (tableColumnsArray.length === this.possibleColumns.length) {
            this.hasCustomColumns = query.columns !== undefined;
            this.possibleColumns.forEach((column, index) => {
              column.show = tableColumnsArray[index] === 1;
            });
          }
        }

        if (this.specialList?.order_by && this.specialList?.order_dir) {
          this.orderBy = this.specialList.order_by;
          this.orderDir = this.specialList.order_dir;
        }

        if (query.order_by && query.order_dir) {
          this.orderBy = query.order_by;
          this.orderDir = query.order_dir;
        }

        if (
          this.orderBy &&
          this.possibleColumns.find(
            (column) => column.orderField === this.orderBy,
          )
        ) {
          this.possibleColumns.find(
            (column) => column.orderField === this.orderBy,
          )!.show = true;
        }

        this.refreshColumns(false);

        // will process later
        if (query.benchmark) {
          benchmarkDataEncoded = query.benchmark;
        }

        // we don't want to search yet on initial load
        // as we need to decode the benchmark URL param first,
        // and will do the search after getBenchmarkConfigs is called
        if (!isInitialLoad) {
          this._searchServers(true);
          return;
        }

        if (!query.benchmark) {
          shouldSearchAfterBenchmarks = true;
        }
      }),
    );

    Promise.all([
      this.keeperAPI.getServerBenchmarkMeta(),
      this.keeperAPI.getBenchmarkConfigs(),
    ]).then((data) => {
      this.benchmarkMetadata = data[0]?.body;

      this.benchmarksConfigs = data[1]?.body.map((config: any) => {
        let template = this.benchmarkMetadata.find(
          (benchmark: any) => benchmark.benchmark_id === config.benchmark_id,
        );
        return {
          ...config,
          config_title: config.config.replaceAll(/[{}"]/g, ""),
          benchmarkTemplate: template,
          group: JSON.stringify({
            group: { title: config.category, name: config.category },
          }),
        };
      });

      this.benchmarkCategories = [];
      this.benchmarksConfigs.forEach((config: any) => {
        if (
          !this.benchmarkCategories.find(
            (category: any) => category === config.category,
          )
        ) {
          this.benchmarkCategories.push(config.category);
        }
      });

      // load benchmark id and configuration
      if (
        this.specialList?.benchmark_id &&
        this.specialList?.benchmark_config
      ) {
        this.selectedBenchmarkConfig = this.benchmarksConfigs.find(
          (config: any) =>
            config.benchmark_id === this.specialList.benchmark_id &&
            config.config === this.specialList.benchmark_config,
        );
      }
      // allow overriding preselected benchmark via URL parameters
      if (benchmarkDataEncoded) {
        try {
          const benchmarkData = JSON.parse(atob(benchmarkDataEncoded));
          this.selectedBenchmarkConfig = this.benchmarksConfigs.find(
            (config: any) =>
              config.benchmark_id === benchmarkData.id &&
              config.config === benchmarkData.config,
          );
          if (
            !this.selectedBenchmarkConfig &&
            isPlatformBrowser(this.platformId)
          ) {
            this.toastService.show({
              title: "Benchmark Not Found",
              body: "The provided benchmark URL parameter is unknown in our database. Please select a benchmark manually.",
              type: "error",
              id: "bad-benchmark-url-param",
            });
          }
        } catch (error) {
          console.warn("Invalid benchmark data in URL:", error);
          if (isPlatformBrowser(this.platformId)) {
            this.toastService.show({
              title: "Invalid Benchmark",
              body: "The benchmark data in the URL is invalid. Please select a benchmark manually.",
              type: "error",
              id: "bad-benchmark-url-param",
            });
          }
        }
      }

      // set default benchmark to stress-ng multi-code SCore
      else if (
        !this.selectedBenchmarkConfig &&
        this.benchmarksConfigs.length > 0
      ) {
        // let the user decide if something was wrong in the URL
        if (!benchmarkDataEncoded) {
          const defaultBenchmarkId = "stress_ng:bestn";
          const defaultBenchmarkConfig = '{"framework_version": "0.17.08"}';
          this.selectedBenchmarkConfig = this.benchmarksConfigs.find(
            (config: any) =>
              config.benchmark_id === defaultBenchmarkId &&
              config.config === defaultBenchmarkConfig,
          );
        }
      }

      // only search once after benchmarks are loaded on initial load
      if (
        shouldSearchAfterBenchmarks ||
        this.route.snapshot.queryParams.benchmark
      ) {
        this._searchServers(true);
      }

      if (isPlatformBrowser(this.platformId)) {
        this.initDropdown();
      }

      isInitialLoad = false;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.subscription.add(
        this.serverCompare.selectionChanged.subscribe(
          (selectedServers: ServerCompare[]) => {
            this.servers?.forEach((server: any) => {
              server.selected =
                selectedServers.findIndex(
                  (item: ServerCompare) =>
                    item.vendor === server.vendor_id &&
                    item.server === server.api_reference,
                ) !== -1;
            });
          },
        ),
      );

      this.dropdownManager
        .initDropdown("column_button", "column_options")
        .then((dropdown) => {
          this.dropdownColumn = dropdown;
        });

      this.dropdownManager
        .initDropdown("pagesize_button", "pagesize_options")
        .then((dropdown) => {
          this.dropdownPage = dropdown;
        });

      const targetElModal = document.getElementById("benchmark-type-modal");

      this.modalBenchmarkSelect = new Modal(targetElModal, optionsModal, {
        id: "benchmark-type-modal",
        override: true,
      });
    }
  }

  private async initDropdown() {
    try {
      const prelineModule = await import("@preline/combobox");
      // try to initialize using the default export, which works in dev
      if (
        prelineModule.default &&
        typeof prelineModule.default.autoInit === "function"
      ) {
        prelineModule.default.autoInit();
      } else {
        // need to fall back to manual initialization in prod :shrug:
        document.querySelectorAll("[data-hs-combobox]").forEach((el) => {
          if (
            prelineModule.default &&
            typeof prelineModule.default === "function"
          ) {
            try {
              // @ts-expect-error - Attempting to initialize even if types don't match
              new prelineModule.default(el);
            } catch (e) {
              console.error("Failed to initialize combobox:", e);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error initializing dropdown:", error);
      // fall back to trying to load globally if it exists
      if (
        window.HSComboBox &&
        typeof window.HSComboBox.autoInit === "function"
      ) {
        window.HSComboBox.autoInit();
      }
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.subscription.unsubscribe();
  }

  setSpecialList() {
    const id = this.route.snapshot.paramMap.get("id");

    if (id) {
      this.specialList = this.specialServerLists.find((list) => list.id === id);
    } else {
      this.specialList = null;
    }

    this.specialParameters = this.specialList?.parameters || {};
    this.title = this.specialList?.title || "Cloud Servers Navigator";
    this.description =
      this.specialList?.description ||
      'Explore, search, and evaluate the supported cloud compute resources in the table below. This comprehensive comparison includes diverse attributes such as CPU count, detailed processor information, memory, GPU, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare servers by selecting at least two rows using the checkboxes.';
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getMemory(item: ServerPKs) {
    return ((item.memory_amount || 0) / 1024).toFixed(1) + " GiB";
  }

  getGPUMemory(item: ServerPKs, stat: "min" | "total" = "min"): string {
    const memory = stat === "min" ? item.gpu_memory_min : item.gpu_memory_total;
    return ((memory || 0) / 1024).toFixed(1) + " GiB";
  }

  getStorage(item: ServerPKs) {
    if (!item.storage_size) return "-";

    if (item.storage_size < 1000) return `${item.storage_size} GB`;

    return `${(item.storage_size / 1000).toFixed(1)} TB`;
  }

  getScore(value: number | null): string {
    if (!value) return "-";
    // make sure to show small numbers
    if (value < 1) {
      return value.toPrecision(1);
    }
    // but suppress decimals for larger numbers, without rounding
    if (value < 100) {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    return Number.isInteger(value) ? value.toString() : value.toFixed(0);
  }

  openServerDetails(server: ServerPKs) {
    this.router.navigateByUrl(
      `/server/${server.vendor.vendor_id}/${server.api_reference}`,
    );
  }

  toggleCategory(category: any) {
    category.collapsed = !category.collapsed;
  }

  getParametersByCategory(category: string) {
    if (!this.searchParameters) return [];

    return this.searchParameters?.filter(
      (param: any) => param.schema?.category_id === category,
    );
  }

  searchBarChanged(event: any) {
    this.page = 1;
    this.searchOptionsChanged(event);
  }

  /**
   * Updates URL query parameters
   * @param event Object containing search/filter parameters from the search form
   * @description
   * This method:
   * - Takes parameters to be added to the URL
   * - Adds non-filter parameters (ordering, pagination, columns)
   * - Adds benchmark configuration as JSON/base64 encoded string
   * - Updates the URL with new query parameters
   * Note that URL params are also updated at updateQueryParams/encodeQueryParams (TODO refactor)
   */
  searchOptionsChanged(event: any) {
    const queryObject: any = event;

    let queryParams: any = queryObject;

    if (this.orderBy && this.orderDir) {
      queryParams.order_by = this.orderBy;
      queryParams.order_dir = this.orderDir;
    } else {
      delete queryParams.order_by;
      delete queryParams.order_dir;
    }

    if (this.page > 1) {
      queryParams.page = this.page;
    }

    if (this.limit !== 25) {
      queryParams.limit = this.limit;
    } else {
      delete queryParams.limit;
    }

    if (this.hasCustomColumns) {
      let columns = this.possibleColumns
        .map((column) => (column.show ? 1 : 0))
        .reduce((acc: number, bit) => (acc << 1) | bit, 0);
      queryParams.columns = columns;
    }

    if (this.selectedBenchmarkConfig) {
      const benchmarkData = {
        id: this.selectedBenchmarkConfig.benchmark_id,
        config: this.selectedBenchmarkConfig.config,
      };
      queryParams.benchmark = btoa(JSON.stringify(benchmarkData));
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
    });
  }

  private _searchServers(updateTotalCount = true) {
    this.isLoading = true;

    let query = JSON.parse(JSON.stringify(this.query));

    // drop the encoded benchmark URL parameter since we use the decoded benchmark_id and benchmark_config
    delete query.benchmark;

    if (query.columns) {
      delete query.columns;
    }

    if (this.specialParameters) {
      query = { ...query, ...this.specialParameters };
    }

    if (updateTotalCount) {
      query.add_total_count_header = true;
    }

    if (this.page > 1) {
      query.page = this.page;
    }

    query.limit = this.limit;

    if (this.orderBy && this.orderDir) {
      query.order_by = this.orderBy;
      query.order_dir = this.orderDir;
    }

    if (this.selectedBenchmarkConfig) {
      query.benchmark_config = this.selectedBenchmarkConfig.config;
      query.benchmark_id = this.selectedBenchmarkConfig.benchmark_id;
    }

    this.keeperAPI
      .searchServers(query)
      .then((servers) => {
        this.servers = servers?.body;

        // set stored selected state
        this.servers?.forEach((server: any) => {
          server.selected =
            this.serverCompare.selectedForCompare.findIndex(
              (item) =>
                item.vendor === server.vendor_id &&
                item.server === server.api_reference,
            ) !== -1;
        });

        if (updateTotalCount) {
          this.totalPages = Math.ceil(
            parseInt(servers?.headers?.get("x-total-count") || "0") /
              this.limit,
          );
        }

        this.toastService.removeToast("query-error");
      })
      .catch((err) => {
        this.analytics.SentryException(err, {
          tags: { location: this.constructor.name, function: "_searchServers" },
        });
        console.error(err);
        this.toastService.show({
          title: "Query error!",
          body: err.error?.detail || "Please try again later.",
          type: "error",
          id: "query-error",
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  toggleOrdering(column: TableColumn) {
    if (!column.orderField) return;

    if (this.orderBy === column.orderField) {
      if (this.orderDir === OrderDir.Desc) {
        this.orderDir = OrderDir.Asc;
      } else {
        this.orderDir = undefined;
        this.orderBy = undefined;
      }
    } else {
      this.orderBy = column.orderField;
      this.orderDir = OrderDir.Desc;
    }

    this.searchOptionsChanged(this.query);
  }

  getOrderingIcon(column: TableColumn) {
    if (!column.orderField) return null;

    if (this.orderBy === column.orderField) {
      return this.orderDir === OrderDir.Desc
        ? "arrow-down-wide-narrow"
        : "arrow-down-narrow-wide";
    }
    return null;
  }

  getQueryObjectBase() {
    const paramObject = JSON.parse(JSON.stringify(this.query));

    if (this.orderBy && this.orderDir) {
      paramObject.order_by = this.orderBy;
      paramObject.order_dir = this.orderDir;
    }

    if (this.limit !== 25) {
      paramObject.limit = this.limit;
    } else {
      delete paramObject.limit;
    }

    if (this.hasCustomColumns) {
      let columns = this.possibleColumns
        .map((column) => (column.show ? 1 : 0))
        .reduce((acc: number, bit) => (acc << 1) | bit, 0);
      paramObject.columns = columns;
    }

    if (this.selectedBenchmarkConfig) {
      const benchmarkData = {
        id: this.selectedBenchmarkConfig.benchmark_id,
        config: this.selectedBenchmarkConfig.config,
      };
      paramObject.benchmark = btoa(JSON.stringify(benchmarkData));
    }

    return paramObject;
  }

  /**
   * Updates the URL query parameters without triggering a page reload
   * @param object An object containing the query parameters to be encoded
   * @description
   * This method:
   * - calls encodeQueryParams to standardize the URL params
   * - Updates the browser URL using History API
   * Note that URL params are also updated at searchOptionsChanged (TODO refactor)
   */
  updateQueryParams(object: any) {
    const encodedQuery = encodeQueryParams(object);
    const path = window.location.pathname || "/servers";

    if (encodedQuery?.length) {
      // update the URL
      window.history.pushState({}, "", `${path}?${encodedQuery}`);
    } else {
      // remove the query params
      window.history.pushState({}, "", path);
    }
  }

  refreshColumns(save = true) {
    this.tableColumns = this.possibleColumns.filter((column) => column.show);
    if (isPlatformBrowser(this.platformId) && save) {
      this.hasCustomColumns = true;
      this.updateQueryParams(this.getQueryObjectBase());
    }
  }

  selectPageSize(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.searchOptionsChanged(this.query);

    this.dropdownPage?.hide();
    // scroll to top
    window.scrollTo(0, 0);
  }

  getField(item: ServerPriceWithPKs, field: string) {
    return field
      .split(".")
      .reduce(
        (obj, key) =>
          obj && (obj as any)[key] ? (obj as any)[key] : undefined,
        item,
      );
  }

  toggleCompare2(event: any, server: ServerPKs | any) {
    event.stopPropagation();
    server.selected = !server.selected;
    this.toggleCompare(server.selected, server);
  }

  toggleCompare(event: boolean, server: ServerPKs | any) {
    this.serverCompare.toggleCompare(event, {
      server: server.api_reference,
      vendor: server.vendor_id,
      display_name: server.display_name,
    });
  }

  compareCount() {
    return this.serverCompare.compareCount();
  }

  clearCompare() {
    this.serverCompare.clearCompare();
    this.servers?.forEach((server: any) => {
      server.selected = false;
    });
  }

  openCompare() {
    this.serverCompare.openCompare();
  }

  clipboardURL() {
    let url = window.location.href;
    navigator.clipboard.writeText(url);

    this.clipboardIcon = "check";

    this.toastService.show({
      title: "Link copied to clipboard!",
      type: "success",
      duration: 2000,
    });

    setTimeout(() => {
      this.clipboardIcon = "clipboard";
    }, 3000);
  }

  showTooltip(el: any, content: string, autoHide = false) {
    this.tooltipContent = content;
    const tooltip = this.tooltip.nativeElement;
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    tooltip.style.left = `${el.target.getBoundingClientRect().right + 5}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().top - 5 + scrollPosition}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";

    if (autoHide) {
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
  }

  showAPIReference(item: ServerPKs) {
    return (
      item.display_name !== item.api_reference &&
      item.display_name !== item.api_reference.replace("Standard_", "")
    );
  }

  openModal() {
    this.modalText = "Select Benchmark Category";
    this.modalBenchmarkSelect.show();
  }

  closeModal() {
    this.modalBenchmarkSelect?.hide();
  }

  selectBenchmarkCategory(category: any, searchTerm: string | null = null) {
    this.tempSelectedBenchmarkCategory = category;

    if (category) {
      this.tempfilteredBenchmarkConfigs = this.benchmarksConfigs.filter(
        (config: any) =>
          (category === "All" || config.category === category) &&
          (!searchTerm ||
            config.benchmarkTemplate.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            config.config.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      this.modalText = `Select ${this.tempSelectedBenchmarkCategory} Configuration`;
    } else {
      this.modalFilterTerm = null;
      this.modalText = "Select Benchmark Category";
    }
  }

  selectBenchmarkConfig(config: any) {
    this.tempSelectedBenchmarkCategory = null;
    this.selectedBenchmarkConfig = config;

    this.modalBenchmarkSelect?.hide();
    this.updateQueryParams(this.getQueryObjectBase());
    this.modalFilterTerm = null;
    this._searchServers(true);
  }

  updateFilterTerm() {
    this.selectBenchmarkCategory(
      this.tempSelectedBenchmarkCategory,
      this.modalFilterTerm,
    );
  }

  private onBenchmarkConfigChanged(): void {
    if (this._selectedBenchmarkConfig) {
      // make sure benchmark column is shown when a benchmark is selected
      // NOTE this is not in active use now, as we use a default benchmark automatically selected, but keeping it here for future use
      const benchmarkColumn = this.possibleColumns.find(
        (col) => col.type === "benchmark",
      );
      if (benchmarkColumn) benchmarkColumn.show = true;
      this.refreshColumns(true);

      // extract unit of selected benchmark config in short form
      const benchmarkTemplate = this._selectedBenchmarkConfig.benchmarkTemplate;
      if (benchmarkTemplate && typeof benchmarkTemplate.unit === "string") {
        const unit = benchmarkTemplate.unit;
        // remove short form (at the end of the string, in parentheses)
        this._selectedBenchmarkConfig.unit = unit.replace(
          /\s*\([^)]*\)\s*$/,
          "",
        );
        // keep short form (in parentheses)
        this._selectedBenchmarkConfig.unit_abbreviation =
          unit.match(/\(([^)]*)\)/)?.at(1) || unit;
        if (unit.length < 25) {
          this._selectedBenchmarkConfig.short_unit =
            this._selectedBenchmarkConfig.unit;
        } else {
          this._selectedBenchmarkConfig.short_unit =
            this._selectedBenchmarkConfig.unit_abbreviation;
        }
      } else {
        this._selectedBenchmarkConfig.unit = "";
        this._selectedBenchmarkConfig.unit_abbreviation = "";
        this._selectedBenchmarkConfig.short_unit = "";
      }

      // remove error toast if it exists
      this.toastService.removeToast("bad-benchmark-url-param");
    }
  }
}
