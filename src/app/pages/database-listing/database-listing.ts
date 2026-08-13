import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
  viewChild,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Params, Router, RouterModule } from "@angular/router";
import {
  LucideCheck,
  LucideChevronLeft,
  LucideChevronRight,
  LucideDynamicIcon,
  LucideInfo,
  LucideX,
} from "@lucide/angular";
import { Subscription } from "rxjs";
import {
  DatabasePKs,
  OrderDir,
  SearchDatabasesDatabasesGetParams,
} from "../../../../sdk/data-contracts";
import openApiSpec from "../../../../sdk/openapi.json";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { Button } from "../../components/button/button";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { PageHeader } from "../../components/page-header/page-header";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import type {
  SearchBarParameter,
  SearchBarQuery,
} from "../../components/search-bar/search-bar.types";
import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";
import { StoragePipe } from "../../pipes/storage.pipe";
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { ToastService } from "../../services/toast.service";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { encodeQueryParams } from "../../tools/queryParamFunctions";
import {
  BestDatabasePriceAllocationType,
  CurrencyOption,
  availableCurrencies,
  bestDatabasePriceAllocationTypes,
} from "../../tools/shared_data";
import {
  TableColumn,
  buildDatabaseListingColumns,
} from "../../tools/table-columns";

type OpenApiParameterSource = {
  name: string;
  in?: string;
  required?: boolean;
  schema?: SearchBarParameter["schema"];
  description?: string;
};

type OpenApiSpecShape = {
  paths: Record<
    string,
    {
      get?: {
        parameters?: OpenApiParameterSource[];
      };
    }
  >;
};

type DatabaseListingQuery = Params &
  Partial<SearchDatabasesDatabasesGetParams> & {
    columns?: string | number;
  };

@Component({
  selector: "sc-database-listing",
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbsComponent,
    LucideDynamicIcon,
    LucideCheck,
    LucideChevronLeft,
    LucideChevronRight,
    LucideInfo,
    LucideX,
    RouterModule,
    Button,
    PageHeader,
    SearchBarComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    StoragePipe,
    FlowbiteDropdownDirective,
  ],
  templateUrl: "./database-listing.html",
  styleUrl: "./database-listing.scss",
})
export class DatabaseListing implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private keeperAPI = inject(KeeperAPIService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private SEOHandler = inject(SeoHandlerService);
  currencyDropdown = viewChild<FlowbiteDropdownDirective>("currencyDropdown");
  allocationDropdown =
    viewChild<FlowbiteDropdownDirective>("allocationDropdown");
  pageDropdown = viewChild<FlowbiteDropdownDirective>("pageDropdown");
  private analytics = inject(AnalyticsService);
  private toastService = inject(ToastService);
  private uiTooltip = inject(UiTooltipService);

  isCollapsed = false;

  filterCategories = [
    { category_id: "basic", name: "Basics", icon: "server", collapsed: true },
    {
      category_id: "engine",
      name: "Engine",
      icon: "database",
      collapsed: false,
    },
    {
      category_id: "vcpus",
      name: "Processor",
      icon: "microchip",
      collapsed: true,
    },
    {
      category_id: "memory",
      name: "Memory",
      icon: "memory-stick",
      collapsed: true,
    },
    {
      category_id: "storage",
      name: "Storage",
      icon: "layers",
      collapsed: true,
    },
    {
      category_id: "features",
      name: "Features",
      icon: "shield-cog",
      collapsed: true,
    },
    { category_id: "vendor", name: "Vendor", icon: "home", collapsed: true },
    { category_id: "region", name: "Region", icon: "hotel", collapsed: true },
  ];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Database listing", url: "/databases" },
  ];

  tableColumns: TableColumn[] = [];
  possibleColumns: TableColumn[] = buildDatabaseListingColumns();
  hasCustomColumns = false;

  availableCurrencies: CurrencyOption[] = availableCurrencies;
  selectedCurrency = this.availableCurrencies[0];
  displayedCurrency = this.availableCurrencies[0];

  bestPriceAllocationTypes: BestDatabasePriceAllocationType[] =
    bestDatabasePriceAllocationTypes;
  bestPriceAllocation = this.bestPriceAllocationTypes[0];

  pageLimits = [10, 25, 50, 100, 250];
  limit = 25;
  page = 1;
  totalPages = 0;

  orderBy: string | undefined = undefined;
  orderDir: OrderDir | undefined = undefined;

  databases: DatabasePKs[] = [];

  searchParameters: SearchBarParameter[] = [];
  query: DatabaseListingQuery = {};

  isLoading = true;
  title = "Cloud Databases Navigator";
  description =
    'Explore, search, and evaluate the supported managed database services (DBaaS) in the table below. This comprehensive comparison includes diverse attributes such as database engine, version support, vCPU count, memory, storage capacity, high availability, backup retention, and regional availability. Use the sidebar to filter the results, or enter your freetext query in the "Search prompt" bar. You can also compare database instances by selecting at least two rows using the checkboxes.';

  clipboardIcon = "clipboard";
  tooltipContent = "";

  @ViewChild("tooltipDefault") tooltip!: ElementRef;

  private subscription = new Subscription();

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "Cloud Databases Navigator - Spare Cores",
      "Compare managed database instances across cloud providers by engine, capacity, HA, and price.",
      "cloud, database, dbaas, postgres, price, comparison, sparecores",
    );

    this.SEOHandler.updateThumbnail(
      "https://sparecores.com/assets/images/og/server_list_image.png",
    );

    const openApi = openApiSpec as OpenApiSpecShape;
    const parameters = openApi.paths["/databases"]?.get?.parameters ?? [];
    this.searchParameters = parameters
      .filter((parameter) => parameter.name !== "regions")
      .map(
        (parameter): SearchBarParameter => ({
          name: parameter.name,
          modelValue: null,
          schema: parameter.schema ?? {},
        }),
      );

    const limit = this.searchParameters.find((param) => param.name === "limit");
    if (typeof limit?.schema?.default === "number") {
      this.limit = limit.schema.default;
    }

    const order = this.searchParameters.find(
      (param) => param.name === "order_by",
    );
    if (typeof order?.schema?.default === "string") {
      this.orderBy = order.schema.default;
    }

    this.subscription.add(
      this.route.queryParams.subscribe((params: Params) => {
        const query: DatabaseListingQuery = { ...params };
        this.query = query;

        const parsedPage = parseInt(String(query.page ?? ""));
        if (Number.isFinite(parsedPage) && parsedPage > 0) {
          this.page = parsedPage;
        }

        const parsedLimit = parseInt(String(query.limit ?? ""));
        if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
          this.limit = parsedLimit;
        }

        const tableColumns = query.columns;
        if (tableColumns && parseInt(String(tableColumns))) {
          const tableColumnsArray: number[] = Number(tableColumns)
            .toString(2)
            .padStart(this.possibleColumns.length, "0")
            .split("")
            .map(Number);
          if (tableColumnsArray.length === this.possibleColumns.length) {
            this.hasCustomColumns = query.columns !== undefined;
            this.possibleColumns.forEach((column, index) => {
              column.show = tableColumnsArray[index] === 1;
            });
          }
        }

        if (query.order_by && query.order_dir) {
          this.orderBy = String(query.order_by);
          this.orderDir = query.order_dir as OrderDir;
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

        if (query.currency) {
          this.selectedCurrency =
            this.availableCurrencies.find(
              (currency) => currency.slug === query.currency,
            ) || this.availableCurrencies[0];
        } else {
          this.selectedCurrency = this.availableCurrencies[0];
        }

        if (query.best_price_allocation) {
          this.bestPriceAllocation =
            this.bestPriceAllocationTypes.find(
              (allocation) => allocation.slug === query.best_price_allocation,
            ) || this.bestPriceAllocationTypes[0];
        } else {
          this.bestPriceAllocation = this.bestPriceAllocationTypes[0];
        }

        this.refreshColumns(false);
        this._searchDatabases(true);
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getMemory(item: DatabasePKs) {
    return item.memory_amount === null || item.memory_amount === undefined
      ? "-"
      : `${(item.memory_amount / 1024).toFixed(1)} GiB`;
  }

  openDatabaseDetails(database: DatabasePKs) {
    this.router.navigateByUrl(
      `/database/${database.vendor.vendor_id}/${database.api_reference}`,
    );
  }

  searchBarChanged(event: SearchBarQuery) {
    this.page = 1;
    this.searchOptionsChanged(event);
  }

  searchOptionsChanged(event: SearchBarQuery | DatabaseListingQuery) {
    const queryParams: DatabaseListingQuery = { ...event };

    if (this.page > 1) {
      queryParams.page = this.page;
    } else {
      delete queryParams.page;
    }

    if (this.orderBy && this.orderDir) {
      queryParams.order_by = this.orderBy;
      queryParams.order_dir = this.orderDir;
    } else {
      delete queryParams.order_by;
      delete queryParams.order_dir;
    }

    if (this.selectedCurrency.slug !== "USD") {
      queryParams.currency = this.selectedCurrency.slug;
    } else {
      delete queryParams.currency;
    }

    if (this.bestPriceAllocation.slug !== "ANY") {
      queryParams.best_price_allocation = this.bestPriceAllocation.slug;
    } else {
      delete queryParams.best_price_allocation;
    }

    if (this.limit !== 25) {
      queryParams.limit = this.limit;
    } else {
      delete queryParams.limit;
    }

    if (this.hasCustomColumns) {
      const columns = this.possibleColumns
        .map((column) => (column.show ? 1 : 0))
        .reduce((acc: number, bit) => (acc << 1) | bit, 0);
      queryParams.columns = columns;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }

  private _searchDatabases(updateTotalCount = true) {
    this.isLoading = true;

    const query = structuredClone(
      this.query,
    ) as SearchDatabasesDatabasesGetParams & DatabaseListingQuery;

    if (query.columns) {
      delete query.columns;
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

    if (this.selectedCurrency.slug !== "USD") {
      query.currency = this.selectedCurrency.slug;
    } else {
      delete query.currency;
    }

    if (this.bestPriceAllocation.slug !== "ANY") {
      query.best_price_allocation = this.bestPriceAllocation.slug;
    } else {
      delete query.best_price_allocation;
    }

    this.keeperAPI
      .searchDatabases(query)
      .then((databases) => {
        this.databases = databases?.body || [];
        this.displayedCurrency = this.selectedCurrency;

        if (updateTotalCount) {
          this.totalPages = Math.ceil(
            parseInt(databases?.headers?.get("x-total-count") || "0") /
              this.limit,
          );
        }

        this.toastService.removeToast("query-error");
      })
      .catch((err) => {
        this.analytics.SentryException(err, {
          tags: {
            location: this.constructor.name,
            function: "_searchDatabases",
          },
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

  getQueryObjectBase(): DatabaseListingQuery {
    const paramObject = structuredClone(this.query) as DatabaseListingQuery;

    if (this.orderBy && this.orderDir) {
      paramObject.order_by = this.orderBy;
      paramObject.order_dir = this.orderDir;
    }

    if (this.selectedCurrency.slug !== "USD") {
      paramObject.currency = this.selectedCurrency.slug;
    } else {
      delete paramObject.currency;
    }

    if (this.bestPriceAllocation.slug !== "ANY") {
      paramObject.best_price_allocation = this.bestPriceAllocation.slug;
    } else {
      delete paramObject.best_price_allocation;
    }

    if (this.limit !== 25) {
      paramObject.limit = this.limit;
    } else {
      delete paramObject.limit;
    }

    if (this.hasCustomColumns) {
      const columns = this.possibleColumns
        .map((column) => (column.show ? 1 : 0))
        .reduce((acc: number, bit) => (acc << 1) | bit, 0);
      paramObject.columns = columns;
    }

    return paramObject;
  }

  updateQueryParams(object: DatabaseListingQuery) {
    const encodedQuery = encodeQueryParams(object);
    const path = window.location.pathname || "/databases";

    if (encodedQuery?.length) {
      window.history.pushState({}, "", `${path}?${encodedQuery}`);
    } else {
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

  selectCurrency(currency: CurrencyOption) {
    this.selectedCurrency = currency;
    this.page = 1;
    this.searchOptionsChanged(this.query);
    this.currencyDropdown()?.hide();
  }

  selectAllocation(allocation: BestDatabasePriceAllocationType) {
    this.bestPriceAllocation = allocation;
    this.page = 1;
    this.searchOptionsChanged(this.query);
    this.allocationDropdown()?.hide();
  }

  selectPageSize(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.searchOptionsChanged(this.query);
    this.pageDropdown()?.hide();
    window.scrollTo(0, 0);
  }

  getField(item: DatabasePKs, field: string): unknown {
    return field
      .split(".")
      .reduce<unknown>(
        (obj, key) =>
          obj !== null &&
          obj !== undefined &&
          typeof obj === "object" &&
          key in (obj as Record<string, unknown>)
            ? (obj as Record<string, unknown>)[key]
            : undefined,
        item,
      );
  }

  formatList(value: unknown): string {
    if (!Array.isArray(value) || !value.length) {
      return "-";
    }
    return value.join(", ");
  }

  formatSla(value: unknown): string {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return `${value}%`;
  }

  showAPIReference(item: DatabasePKs) {
    return item.display_name !== item.api_reference;
  }

  clipboardURL() {
    navigator.clipboard.writeText(window.location.href);
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

  showTooltip(el: Event, content: string, autoHide = false) {
    this.tooltipContent = content;
    const tooltip = this.tooltip.nativeElement;
    this.uiTooltip.show(tooltip, el, {
      left: "anchor-right",
      top: "anchor-above",
    });

    if (autoHide) {
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
  }

  hideTooltip() {
    this.uiTooltip.hide(this.tooltip.nativeElement);
  }
}
