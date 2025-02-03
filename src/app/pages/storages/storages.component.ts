import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { OrderDir } from '../../../../sdk/data-contracts';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { TableColumn } from '../server-listing/server-listing.component';
import { CurrencyOption, availableCurrencies } from '../../tools/shared_data';
import { DropdownManagerService } from '../../services/dropdown-manager.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-storages',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule, SearchBarComponent, PaginationComponent, LoadingSpinnerComponent],
  templateUrl: './storages.component.html',
  styleUrl: './storages.component.scss'
})
export class StoragesComponent implements OnInit {


  limit = 10;
  page = 1;
  totalPages = 1;
  pageLimits = [10, 25, 50, 100, 250];
  dropdownPage: any;
  dropdownColumn: any;

  orderBy: string | undefined = undefined;
  orderDir: OrderDir | undefined = undefined;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Storage prices', url: '/storages' }
  ];

  isCollapsed = false;
  isLoading = false;

  filterCategories = [
    {category_id: 'storage', name: 'Storage', icon: 'database', collapsed: false},
    {category_id: 'vendor', name: 'Vendor', icon: 'home', collapsed: true},
    {category_id: 'region', name: 'Region', icon: 'hotel', collapsed: true},
  ];

  openApiJson: any = require('../../../../sdk/openapi.json');
  searchParameters: any;
  query: any= {};

  storages: any[] = [];

  tableColumns: TableColumn[] = [

  ];

  possibleColumns: TableColumn[] = [
    { name: 'VENDOR', show: true, type: 'vendor'},
    { name: 'NAME', show: true, type: 'name', key: 'storage.name'},
    { name: 'REGION', show: true, type: 'region' },
    { name: 'MIN', show: true, type: 'storage', key: 'storage.min_size' },
    { name: 'MAX', show: true, type: 'storage', key: 'storage.max_size' },
    { name: 'TYPE', show: true, type: 'text', key: 'storage.storage_type'},
    { name: 'MAX IOPS', show: true, type: 'text', key: 'storage.max_iops', orderField: 'max_iops' },
    { name: 'MAX THROUGHPUT', show: true, type: 'text', key: 'storage.max_throughput', orderField: 'max_throughput' },
    { name: 'PRICE', show: true, type: 'price', orderField: 'price' }
  ];

  availableCurrencies: CurrencyOption[] = availableCurrencies;

  selectedCurrency: CurrencyOption = availableCurrencies[0];

  dropdownCurrency: any;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
            private keeperAPI: KeeperAPIService,
            private route: ActivatedRoute,
            private router: Router,
            private SEOHandler: SeoHandlerService,
            private dropdownManager: DropdownManagerService,
            ) { }

  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
      'Cloud Block Storage Prices - Spare Cores',
      'Explore, search, and evaluate block storage options and their pricing at various cloud providers in the table below. Note that the quoted pricing only includes capacity, and some options require extra payment for provisioned IOPS etc.',
      'cloud, server, instance, price, comparison, spot, sparecores');

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/server_list_image.png');

    const parameters = this.openApiJson.paths['/storage_prices'].get.parameters || [];
    this.searchParameters = parameters;

    let limit = this.searchParameters.find((param: any) => param.name === 'limit');
    if(limit && limit.schema && limit.schema.default) {
      this.limit = limit.schema.default;
    }

    let order = this.searchParameters.find((param: any) => param.name === 'order_by');
    if(order && order.schema && order.schema.default) {
      this.orderBy = order.schema.default;
    }

    this.refreshColumns();

    this.route.queryParams.subscribe((params: Params) => {
      const query: any = JSON.parse(JSON.stringify(params || '{}'));

      this.query = query;

      if(query.order_by && query.order_dir) {
        this.orderBy = query.order_by;
        this.orderDir = query.order_dir;
      }

      if(query.page) {
        this.page = parseInt(query.page);
      }

      if(query.limit) {
        this.limit = parseInt(query.limit);
      }

      if(query.currency) {
        this.selectedCurrency = this.availableCurrencies.find((currency) => currency.slug === query.currency) || this.availableCurrencies[0];
      }

      this.query.add_total_count_header = true;

      this._searchStorages();

      if(isPlatformBrowser(this.platformId)) {

        this.dropdownManager.initDropdown('currency_button', 'currency_options').then((dropdown: any) => {
          this.dropdownCurrency = dropdown
        });

        this.dropdownManager.initDropdown('column_button', 'column_options').then((dropdown: any) => {
          this.dropdownColumn = dropdown
        });

        this.dropdownManager.initDropdown('pagesize_button', 'pagesize_options').then((dropdown: any) => {
          this.dropdownPage = dropdown
        });
      }

    });


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

    if(this.orderBy && this.orderDir) {
      queryParams.order_by = this.orderBy;
      queryParams.order_dir = this.orderDir;
    } else {
      delete queryParams.order_by;
      delete queryParams.order_dir;
    }

    if(this.page > 1) {
      queryParams.page = this.page;
    }

    if(this.limit !== 50) {
      queryParams.limit = this.limit;
    } else {
      delete queryParams.limit;
    }

    if(this.selectedCurrency.slug !== 'USD') {
      queryParams.currency = this.selectedCurrency.slug;
    } else {
      delete queryParams.currency;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams
    });
  }

  getQueryObjectBase() {
    const paramObject = JSON.parse(JSON.stringify(this.query));

    if(this.orderBy && this.orderDir) {
      paramObject.order_by = this.orderBy;
      paramObject.order_dir = this.orderDir;
    }

    if(this.limit !== 50) {
      paramObject.limit = this.limit;
    }

    return paramObject;
  }

  private _searchStorages() {
    this.isLoading = true;

    this.keeperAPI.getStoragePrices(this.query).then((results: any) => {
      this.storages = results.body;
      this.isLoading = false;
      this.totalPages = Math.ceil(parseInt(results?.headers?.get('x-total-count') || '0') / this.limit);
    });
  }

  toggleOrdering(column: TableColumn) {

    if(!column.orderField) return;

    if(this.orderBy === column.orderField) {
      if(this.orderDir === OrderDir.Desc) {
        this.orderDir = OrderDir.Asc;
      }
      else {
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

    this.dropdownCurrency?.hide();
  }

  getOrderingIcon(column: TableColumn) {
    if(!column.orderField) return null;

    if(this.orderBy === column.orderField) {
      return this.orderDir === OrderDir.Desc ? 'arrow-down-wide-narrow' : 'arrow-down-narrow-wide';
    }
    return null;
  }

  selectPageSize(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.searchOptionsChanged(this.query);

    this.dropdownPage?.hide();
    // scroll to top
    window.scrollTo(0, 0);
  }

  getField(item: any, field: string) {
    return field.split('.').reduce((obj, key) => (obj && (obj as any)[key]) ? (obj as any)[key] : undefined, item);
  }

  refreshColumns() {
    this.tableColumns = this.possibleColumns.filter((column) => column.show);
  }

  getStorage(value: number | undefined) {
    if(!value) return '-';

    if(value < 1000) return `${value} GB`;

    return `${(value / 1000).toFixed(1)} TB`;
  }

}
