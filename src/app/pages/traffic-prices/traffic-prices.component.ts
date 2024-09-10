import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostBinding, Inject, PLATFORM_ID } from '@angular/core';
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

@Component({
  selector: 'app-traffic-prices',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule, SearchBarComponent, PaginationComponent],
  templateUrl: './traffic-prices.component.html',
  styleUrl: './traffic-prices.component.scss'
})
export class TrafficPricesComponent {

  @HostBinding('attr.ngSkipHydration') ngSkipHydration = 'true';

  limit = 50;
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

  possibleColumns: TableColumn[] = [
    { name: 'VENDOR', show: true, type: 'vendor' },
    { name: 'REGION', show: true, type: 'region' },
    { name: 'DIRECTION', show: true, type: 'text', key: 'direction',},
    { name: 'PRICE', show: true, type: 'price', orderField: 'price' },
    { name: 'PRICE TOTAL', show: true, type: 'priceMonthly' },
    { name: 'PRICE TIERS', show: false, type: 'price_tiers' },
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
      'TODO - Spare Cores',
      'TODO DESCRIPTION',
      'cloud, server, instance, price, comparison, spot, sparecores');

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/server_list_image.png');

    const parameters = this.openApiJson.paths['/traffic_prices'].get.parameters || [];
    this.searchParameters = parameters;

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
      console.log(results.body);
      this.traffic_prices = results.body;
      this.isLoading = false;
      this.totalPages = this.traffic_prices?.length === this.limit ? this.page + 1 : this.page;
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
    let from = price_tier.lower && !isNaN(price_tier.lower) ? (price_tier.lower / 1000).toFixed() : '0';
    let to = price_tier.upper && !isNaN(price_tier.upper) && price_tier.upper !== "Infinity" ? (price_tier.upper / 1000).toFixed() : '∞';

    // padd from and to to at least 3 charaters long
    from = from.padStart(3, ' ');
    to = to.padStart(3, ' ');

    return `${from} - ${to} TB:`;
  }

  getTieredPriceValue(price_tier: any) {
    let from = price_tier.lower && !isNaN(price_tier.lower) ? (price_tier.lower / 1000).toFixed() : 0;
    let to = price_tier.upper && !isNaN(price_tier.upper) && price_tier.upper !== "Infinity" ? (price_tier.upper / 1000).toFixed() : '∞';

    return `${price_tier.price} ${this.selectedCurrency.slug}`;
  }


}
