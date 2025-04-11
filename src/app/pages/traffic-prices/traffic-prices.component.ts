import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component,  Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Params, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OrderDir } from '../../../../sdk/data-contracts';
import { BreadcrumbsComponent, BreadcrumbSegment } from '../../components/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { DropdownManagerService } from '../../services/dropdown-manager.service';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { CurrencyOption, availableCurrencies } from '../../tools/shared_data';
import { TableColumn } from '../server-listing/server-listing.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-traffic-prices',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule, SearchBarComponent, PaginationComponent, LoadingSpinnerComponent],
  templateUrl: './traffic-prices.component.html',
  styleUrl: './traffic-prices.component.scss'
})
export class TrafficPricesComponent implements OnInit {

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
    { name: 'Network traffic prices', url: '/traffic-prices' }
  ];

  isCollapsed = false;
  isLoading = false;

  filterCategories = [
    {category_id: 'traffic', name: 'Traffic', icon: 'database', collapsed: false},
    {category_id: 'vendor', name: 'Vendor', icon: 'home', collapsed: true},
    {category_id: 'region', name: 'Region', icon: 'hotel', collapsed: true},
  ];

  openApiJson: any = require('../../../../sdk/openapi.json');
  searchParameters: any;
  query: any= {};

  traffic_prices: any[] = [];

  tableColumns: TableColumn[] = [

  ];

  title = 'Cloud Data Transfer Pricing';

  possibleColumns: TableColumn[] = [
    { name: 'VENDOR', show: true, type: 'vendor' },
    { name: 'REGION', show: true, type: 'region' },
    { name: 'DIRECTION', show: true, type: 'text', key: 'direction',},
    { name: 'PRICE', show: true, type: 'price', orderField: 'price' },
    { name: 'PRICE TIERS', show: true, type: 'price_tiers' },
    { name: 'PRICE TOTAL', show: true, type: 'priceMonthly' },
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

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/server_list_image.png');

    const parameters = this.openApiJson.paths['/traffic_prices'].get.parameters || [];
    this.searchParameters = parameters;

    let limit = this.searchParameters.find((param: any) => param.name === 'limit');
    if(limit?.schema?.default) {
      this.limit = limit.schema.default;
    }

    let order = this.searchParameters.find((param: any) => param.name === 'order_by');
    if(order?.schema?.default) {
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

      this.SEOHandler.updateTitleAndMetaTags(
        this.title,
        'Explore, search, and evaluate ingress (inbound) and egress (outbound) traffic pricing options and tiers of various cloud providers in the table below. Note that the pricing tiers usually apply at the account level. Enter the estimated monthly traffic (instead of the default 1 GB) to calculate pricing based on the known tiers.',
        'cloud, server, instance, price, comparison, spot, sparecores');

      this.query.add_total_count_header = true;

      this._searchTrafficPrices();

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

  private _searchTrafficPrices() {
    this.isLoading = true;

    this.keeperAPI.getTrafficPrices(this.query).then((results: any) => {
      this.traffic_prices = results.body;
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

  getTieredPriceText(price_tier: any) {
    let from = price_tier.lower && !isNaN(price_tier.lower) ?
              (price_tier.lower / 1000).toFixed(price_tier.lower < 1000 ? 2 : 0) :
              '0';
    let to = price_tier.upper && !isNaN(price_tier.upper) && price_tier.upper !== "Infinity" ?
              (price_tier.upper / 1000).toFixed(price_tier.upper < 1000 ? 2 : 0) :
              '∞';


    return `${from} - ${to} TB:`;
  }

  getTieredPriceValue(price_tier: any) {
    return `${price_tier.price} ${this.selectedCurrency.slug}`;
  }

  craftTitle(query: any) {
    // TDB if this is useful
    let prefix = 'Instance';
    let suffix = '';
    let base = 'Traffic prices';

    let vendor = typeof query.vendor === 'string' ? query.vendor : (query.vendor?.length === 1 ? query.vendor[0] : undefined);
    const direction = typeof query.direction === 'string' ? query.direction : (query.direction?.length === 1 ? query.direction[0] : undefined);

    if(vendor) {
      vendor = vendor?.length <= 3 ? vendor.toUpperCase() : (vendor.charAt(0).toUpperCase() + vendor.slice(1));
    }

    if(vendor) {
      if(direction) {
        prefix = `${vendor} ${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
      } else {
        prefix = `${vendor}`;
      }
    } else if(direction) {
      prefix = `${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
    }

    if(query.monthly_traffic) {
      suffix += ` for ${query.monthly_traffic}GB monthly traffic`;
    }

    this.title = `${prefix} ${base} ${suffix}`;
  }


}
