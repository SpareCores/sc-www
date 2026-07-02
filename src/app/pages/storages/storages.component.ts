import { CommonModule } from "@angular/common";
import {
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Params, Router, RouterModule } from "@angular/router";

import { Subscription } from "rxjs";
import { OrderDir } from "../../../../sdk/data-contracts";
import openApiSpec from "../../../../sdk/openapi.json";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";
import { StoragePipe } from "../../pipes/storage.pipe";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { CurrencyOption, availableCurrencies } from "../../tools/shared_data";
import { Icon } from "../../components/icon/icon.js";
import {
  TableColumn,
  buildStoragePricesColumns,
} from "../../tools/table-columns";

@Component({
  selector: "app-storages",
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbsComponent,
    RouterModule,
    SearchBarComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    FlowbiteDropdownDirective,
    StoragePipe,
    Icon,
  ],
  templateUrl: "./storages.component.html",
  styleUrl: "./storages.component.scss",
})
export class StoragesComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private keeperAPI = inject(KeeperAPIService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private SEOHandler = inject(SeoHandlerService);
  currencyDropdown = viewChild<FlowbiteDropdownDirective>("currencyDropdown");
  pageDropdown = viewChild<FlowbiteDropdownDirective>("pageDropdown");

  private subscription = new Subscription();

  limit = 10;
  page = 1;
  totalPages = 1;
  pageLimits = [10, 25, 50, 100, 250];

  orderBy: string | undefined = undefined;
  orderDir: OrderDir | undefined = undefined;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Storage prices", url: "/storages" },
  ];

  isCollapsed = false;
  isLoading = false;

  filterCategories = [
    {
      category_id: "storage",
      name: "Storage",
      icon: "database",
      collapsed: false,
    },
    { category_id: "vendor", name: "Vendor", icon: "home", collapsed: true },
    { category_id: "region", name: "Region", icon: "hotel", collapsed: true },
  ];

  openApiJson: any = openApiSpec;
  searchParameters: any;
  query: any = {};

  storages: any[] = [];

  tableColumns: TableColumn[] = [];

  possibleColumns: TableColumn[] = buildStoragePricesColumns();

  availableCurrencies: CurrencyOption[] = availableCurrencies;

  selectedCurrency: CurrencyOption = availableCurrencies[0];

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      "Cloud Block Storage Prices - Spare Cores",
      "Explore, search, and evaluate block storage options and their pricing at various cloud providers in the table below. Note that the quoted pricing only includes capacity, and some options require extra payment for provisioned IOPS etc.",
      "cloud, server, instance, price, comparison, spot, sparecores",
    );

    this.SEOHandler.updateThumbnail(
      "https://sparecores.com/assets/images/og/server_list_image.png",
    );

    const parameters =
      this.openApiJson.paths["/storage_prices"].get.parameters || [];
    this.searchParameters = parameters.filter((p: any) => p.name !== "regions");

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

    this.refreshColumns();

    this.subscription.add(
      this.route.queryParams.subscribe((params: Params) => {
        const query: any = JSON.parse(JSON.stringify(params || "{}"));

        this.query = query;

        if (query.order_by && query.order_dir) {
          this.orderBy = query.order_by;
          this.orderDir = query.order_dir;
        }

        if (query.page) {
          this.page = parseInt(query.page);
        }

        if (query.limit) {
          this.limit = parseInt(query.limit);
        }

        if (query.currency) {
          this.selectedCurrency =
            this.availableCurrencies.find(
              (currency) => currency.slug === query.currency,
            ) || this.availableCurrencies[0];
        }

        this.query.add_total_count_header = true;

        this._searchStorages();
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  searchBarChanged(event: any) {
    this.page = 1;
    this.searchOptionsChanged(event);
  }

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

    if (this.limit !== 50) {
      queryParams.limit = this.limit;
    } else {
      delete queryParams.limit;
    }

    if (this.selectedCurrency.slug !== "USD") {
      queryParams.currency = this.selectedCurrency.slug;
    } else {
      delete queryParams.currency;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
    });
  }

  getQueryObjectBase() {
    const paramObject = JSON.parse(JSON.stringify(this.query));

    if (this.orderBy && this.orderDir) {
      paramObject.order_by = this.orderBy;
      paramObject.order_dir = this.orderDir;
    }

    if (this.limit !== 50) {
      paramObject.limit = this.limit;
    }

    return paramObject;
  }

  private _searchStorages() {
    this.isLoading = true;

    this.keeperAPI.getStoragePrices(this.query).then((results: any) => {
      this.storages = results.body;
      this.isLoading = false;
      this.totalPages = Math.ceil(
        parseInt(results?.headers?.get("x-total-count") || "0") / this.limit,
      );
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

  selectCurrency(currency: any) {
    this.selectedCurrency = currency;

    this.searchOptionsChanged(this.query);

    this.currencyDropdown()?.hide();
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

  selectPageSize(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.searchOptionsChanged(this.query);

    this.pageDropdown()?.hide();
    // scroll to top
    window.scrollTo(0, 0);
  }

  getField(item: any, field: string) {
    return field.split(".").reduce((obj, key) => {
      if (obj == null) return undefined;
      const value = (obj as Record<string, unknown>)[key];
      return value !== undefined && value !== null ? value : undefined;
    }, item);
  }

  refreshColumns() {
    this.tableColumns = this.possibleColumns.filter((column) => column.show);
  }
}
