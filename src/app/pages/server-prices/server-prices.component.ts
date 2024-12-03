import { Component, Inject, PLATFORM_ID, OnInit, ViewChild, ElementRef} from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, ServerPKs, ServerPriceWithPKs } from '../../../../sdk/data-contracts';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StorageHandlerService } from '../../services/storage-handler.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { DropdownManagerService } from '../../services/dropdown-manager.service';
import { AnalyticsService } from '../../services/analytics.service';
import { CurrencyOption, availableCurrencies } from '../../tools/shared_data';
import { ServerCompare, ServerCompareService } from '../../services/server-compare.service';

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
  selected? : boolean;
};

export type RegionVendorMetadata = {
  vendor_id: string;
  name: string;
  selected?: boolean;
  collapsed?: boolean;
};

@Component({
  selector: 'app-server-prices',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule, SearchBarComponent, PaginationComponent],
  templateUrl: './server-prices.component.html',
  styleUrl: './server-prices.component.scss'
})
export class ServerPricesComponent implements OnInit {

  isCollapsed = false;

  filterCategories = [
    {category_id: 'basic', name: 'Basics', icon: 'server', collapsed: true},
    {category_id: 'price', name: 'Pricing', icon: 'dollar-sign', collapsed: true},
    {category_id: 'processor', name: 'Processor', icon: 'cpu', collapsed: false},
    {category_id: 'gpu', name: 'GPU', icon: 'cpu', collapsed: true},
    {category_id: 'memory', name: 'Memory', icon: 'memory-stick', collapsed: true},
    {category_id: 'storage', name: 'Storage', icon: 'database', collapsed: true},
    {category_id: 'vendor', name: 'Vendor', icon: 'home', collapsed: true},
    {category_id: 'region', name: 'Region', icon: 'hotel', collapsed: true},
  ];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Server prices', url: '/server_prices' }
  ];

  tableColumns: TableColumn[] = [];

  possibleColumns: TableColumn[] = [
    { name: 'NAME & PROVIDER', show: true, type: 'name'},
    { name: 'VENDOR', show: false, type: 'vendor' },
    { name: 'REGION', show: false, type: 'region' },
    { name: 'ZONE', show: false, type: 'text', key: 'zone.name' },
    { name: 'CONTINENT', show: false, type: 'text', key: 'region.country.continent' },
    { name: 'COUNTRY', show: false, type: 'country' },
    { name: 'ARCHITECTURE', show: false, type: 'text', key: 'server.cpu_architecture' },
    { name: 'PROCESSOR', show: true, type: 'processor', orderField: 'vcpus' },
    { name: 'CPU MODEL', show: false, type: 'cpu_model' },
    { name: 'CPU ALLOCATION', show: false, type: 'text', key: 'server.cpu_allocation' },
    { name: 'SCORE',
      show: true,
      type: 'score',
      orderField: 'score',
      info: "Performance benchmark score using stress-ng's div16 method (doing 16 bit unsigned integer divisions for 20 seconds): simulating CPU heavy workload that scales well on any number of (v)CPUs. The SCore/price value in the second line shows the div16 performance measured for 1 USD/hour. To order by the latter, enable the $Core column."
    },
    { name: '$CORE',
      show: false,
      type: 'score_per_price',
      orderField: 'score_per_price',
      info: "SCore/price showing stress-ng's div16 performance measured for 1 USD/hour."
    },
    { name: 'MEMORY', show: true, type: 'memory', orderField: 'memory_amount' },
    { name: 'STORAGE', show: true, type: 'storage', orderField: 'storage_size' },
    { name: 'STORAGE TYPE', show: false, type: 'text', key: 'server.storage_type' },
    { name: 'GPUs', show: true, type: 'gpu', orderField: 'server.gpu_count' },
    { name: 'GPU MIN MEMORY', show: false, type: 'gpu_memory', key: 'server.gpu_memory_min' },
    { name: 'GPU TOTAL MEMORY', show: false, type: 'gpu_memory', key: 'server.gpu_memory_total' },
    { name: 'GPU MODEL', show: false, type: 'gpu_model' },
    { name: 'PRICE', show: true, type: 'price', orderField: 'price' },
    { name: 'STATUS', show: false, type: 'text', key: 'server.status' },
  ];

  availableCurrencies: CurrencyOption[] = availableCurrencies;

  allocationTypes = [
    {name: 'Both', slug: null},
    {name: 'Spot', slug: 'spot'},
    {name: 'On Demand', slug: 'ondemand'}
  ];

  pageLimits = [10, 25, 50, 100, 250];

  allocation = this.allocationTypes[0];

  selectedCurrency = this.availableCurrencies[0];

  limit = 25;
  page = 1;
  totalPages = 0;

  orderBy: string | undefined = undefined;
  orderDir: OrderDir | undefined = undefined;

  servers: ServerPriceWithPKs[] | any[] = [];

  openApiJson: any = require('../../../../sdk/openapi.json');
  searchParameters: any;
  query: any= {};

  dropdownCurrency: any;
  dropdownAllocation: any;
  dropdownColumn: any;
  dropdownPage: any;
  modalSearch: any;

  isLoading = false;

  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: any;
  modalResponseStr: string[] = [];

  countryMetadata: CountryMetadata[] = [];
  continentMetadata: ContinentMetadata[] = [];

  regionMetadata: RegionMetadata[] = [];
  regionVendorMetadata: RegionVendorMetadata[] = [];

  vendorMetadata: any[] = [];

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  clipboardIcon = 'clipboard';
  tooltipContent = '';

  selectedCountries: string[] = [];
  selectedRegions: string[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService,
              private route: ActivatedRoute,
              private router: Router,
              private SEOHandler: SeoHandlerService,
              private analytics: AnalyticsService,
              private dropdownManager: DropdownManagerService,
              private serverCompare: ServerCompareService,
              private storageHandler: StorageHandlerService) { }

  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
      'Price Listing of Cloud Compute Resources - Spare Cores',
      'Harnessing the compute resources of the cloud to optimize efficiency and costs of batch and service tasks.',
      'cloud, server, instance, price, comparison, spot, sparecores');

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/server_list_image.png');

    const parameters = this.openApiJson.paths['/server_prices'].get.parameters || [];
    this.searchParameters = parameters;

    let limit = this.searchParameters.find((param: any) => param.name === 'limit');
    if(limit && limit.schema && limit.schema.default) {
      this.limit = limit.schema.default;
    }

    let order = this.searchParameters.find((param: any) => param.name === 'order_by');
    if(order && order.schema && order.schema.default) {
      this.orderBy = order.schema.default;
    }

    this.route.queryParams.subscribe((params: Params) => {
      const query: any = JSON.parse(JSON.stringify(params || '{}'));

      this.query = query;

      if(query.order_by && query.order_dir) {
        this.orderBy = query.order_by;
        this.orderDir = query.order_dir;

        if(this.possibleColumns.find((column) => column.orderField === this.orderBy)) {
          this.possibleColumns.find((column) => column.orderField === this.orderBy)!.show = true;
        }
      }

      if(query.currency) {
        this.selectedCurrency = this.availableCurrencies.find((currency) => currency.slug === query.currency) || this.availableCurrencies[0];
      }

      if(query.allocation) {
        this.allocation = this.allocationTypes.find((allocation) => allocation.slug === query.allocation) || this.allocationTypes[0];
      }

      if(query.page) {
        this.page = parseInt(query.page);
      }

      if(query.limit) {
        this.limit = parseInt(query.limit);
      }

      const tableColumnsStr = this.storageHandler.get('serverListTableColumns');
      if(tableColumnsStr) {
        const tableColumns: string[] = JSON.parse(tableColumnsStr);
        this.possibleColumns.forEach((column) => {
          column.show = tableColumns.findIndex((item) => item === column.name) !== -1;
        });
      }

      this.refreshColumns(false);

      this._searchServers(true);
    });

    if(isPlatformBrowser(this.platformId)) {

      this.dropdownManager.initDropdown('currency_button', 'currency_options').then((dropdown: any) => {
        this.dropdownCurrency = dropdown
      });

      this.dropdownManager.initDropdown('allocation_button', 'allocation_options').then((dropdown: any) => {
        this.dropdownAllocation = dropdown;
      });

      this.dropdownManager.initDropdown('column_button', 'column_options').then((dropdown: any) => {
        this.dropdownColumn = dropdown;
      });

      this.dropdownManager.initDropdown('pagesize_button', 'pagesize_options').then((dropdown: any) => {
        this.dropdownPage = dropdown;
      });
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getMemory(item: ServerPriceWithPKs) {
    return ((item.server.memory_amount || 0) / 1024).toFixed(1) + ' GiB';
  }

  getGPUMemory(item: ServerPriceWithPKs) {
    return ((item.server.gpu_memory_min || 0) / 1024).toFixed(1) + ' GiB';
  }

  getStorage(item: ServerPriceWithPKs) {
    if(!item.server.storage_size) return '-';

    if(item.server.storage_size < 1000) return `${item.server.storage_size} GB`;

    return `${(item.server.storage_size / 1000).toFixed(1)} TB`;
  }

  getScore(value: number | null): string {
    return value ? value.toFixed(0) : '-';
  }

  getAllocationName(allocation: string | null) {
    return this.allocationTypes.find((item) => item.slug === allocation)?.name || '-';
  }

  openServerDetails(server: ServerPriceWithPKs) {
    this.router.navigateByUrl(`/server/${server.vendor.vendor_id}/${server.server.api_reference}`);
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

    if(this.selectedCurrency.slug !== 'USD') {
      queryParams.currency = this.selectedCurrency.slug;
    } else {
      delete queryParams.currency;
    }

    if(this.allocation.slug) {
      queryParams.allocation = this.allocation.slug;
    } else {
      delete queryParams.allocation;
    }

    if(this.page > 1) {
      queryParams.page = this.page;
    }

    if(this.limit !== 25) {
      queryParams.limit = this.limit;
    } else {
      delete queryParams.limit;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams
    });
  }

  private _searchServers(updateTotalCount = true) {
    this.isLoading = true;

    let query = JSON.parse(JSON.stringify(this.query));

    if(updateTotalCount) {
      query.add_total_count_header = true;
    }

    if(this.page > 1) {
      query.page = this.page;
    }

    query.limit = this.limit;

    if(this.orderBy && this.orderDir) {
      query.order_by = this.orderBy;
      query.order_dir = this.orderDir;
    }

    this.keeperAPI.searchServerPrices(query).then(servers => {
      this.servers = servers?.body.map((item: any) => {
        return {
          ...item,
          selected: this.serverCompare.selectedForCompare.findIndex(
            (compareItem: ServerCompare) =>
              compareItem.vendor === item.vendor_id &&
              compareItem.server === item.server.api_reference &&
              compareItem.zonesRegions.findIndex(x => x.zone === item.zone_id && x.region === item.region_id) > -1) !== -1
        };
      });

      if(updateTotalCount) {
        this.totalPages = Math.ceil(parseInt(servers?.headers?.get('x-total-count') || '0') / this.limit);
      }
    }).catch(err => {
      this.analytics.SentryException(err, {tags: { location: this.constructor.name, function: '_searchServers' }});
      console.error(err);
    }).finally(() => {
      this.isLoading = false;
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

  getOrderingIcon(column: TableColumn) {
    if(!column.orderField) return null;

    if(this.orderBy === column.orderField) {
      return this.orderDir === OrderDir.Desc ? 'arrow-down-wide-narrow' : 'arrow-down-narrow-wide';
    }
    return null;
  }

  getQueryObject() {
    const paramObject = this.searchParameters?.map((param: any) => {
      return ((param.modelValue || param.modelValue === false) && param.schema.category_id && param.schema.default !== param.modelValue) ?
              {[param.name]: param.modelValue} :
              {};
    }).reduce((acc: any, curr: any) => {  return {...acc, ...curr}; }, {});

    if(this.orderBy && this.orderDir) {
      paramObject.order_by = this.orderBy;
      paramObject.order_dir = this.orderDir;
    }

    if(this.selectedCurrency.slug !== 'USD') {
      paramObject.currency = this.selectedCurrency.slug;
    }

    if(this.allocation.slug) {
      paramObject.allocation = this.allocation.slug;
    }

    if(this.page > 1) {
      paramObject.page = this.page;
    }

    if(this.limit !== 25) {
      paramObject.limit = this.limit;
    } else {
      delete paramObject.limit;
    }

    if(this.countryMetadata.find((country) => country.selected)) {
      paramObject.countries = [];
      this.countryMetadata.forEach((country) => {
        if(country.selected) {
          paramObject.countries.push(country.country_id);
        }
      });
    } else {
      if(paramObject.countries) delete paramObject.countries;
    }

    if(this.regionMetadata.find((region) => region.selected)) {
      paramObject.regions = [];
      this.regionMetadata.forEach((region) => {
        if(region.selected) {
          paramObject.regions.push(region.region_id);
        }
      });
    } else {
      if(paramObject.datacregionsenters) delete paramObject.regions;
    }
    return paramObject;
  }

  refreshColumns(save = true) {
    this.tableColumns = this.possibleColumns.filter((column) => column.show);

    if(save) {
      this.storageHandler.set('serverListTableColumns', JSON.stringify(this.tableColumns.map(item => item.name)));
    }
  }

  selectCurrency(currency: any) {
    this.selectedCurrency = currency;

    this.searchOptionsChanged(this.query);

    this.dropdownCurrency?.hide();
  }

  selectAllocation(allocation: any) {
    this.allocation = allocation;
    this.page = 1;

    this.searchOptionsChanged(this.query);

    this.dropdownAllocation?.hide();
  }

  selectPageSize(limit: number) {
    this.limit = limit;
    this.page = 1;

    this.searchOptionsChanged(this.query);
    this.dropdownPage?.hide();

    window.scrollTo(0, 0);
  }

  getField(item: ServerPriceWithPKs, field: string) {
    return field.split('.').reduce((obj, key) => (obj && (obj as any)[key]) ? (obj as any)[key] : undefined, item);
  }

  getQueryObjectBase() {
    const paramObject = JSON.parse(JSON.stringify(this.query));

    if(this.orderBy && this.orderDir) {
      paramObject.order_by = this.orderBy;
      paramObject.order_dir = this.orderDir;
    }

    if(this.selectedCurrency.slug !== 'USD') {
      paramObject.currency = this.selectedCurrency.slug;
    }

    if(this.allocation.slug) {
      paramObject.allocation = this.allocation.slug;
    }

    if(this.limit !== 25) {
      paramObject.limit = this.limit;
    } else {
      delete paramObject.limit;
    }

    return paramObject;
  }

  closeModal(confirm: boolean) {
    if(confirm) {

      this.searchParameters.forEach((param: any) => {
        param.modelValue = param.schema.default;
      });

      Object.keys(this.modalResponse).forEach((key) => {
        const param = this.searchParameters.find((param: any) => param.name === key);
        if(param) {
          param.modelValue = this.modalResponse[key];
        }
      });

      //this.filterServers();

      this.freetextSearchInput = '';
      this.modalResponse = null;
    }

    this.modalSearch?.hide();
  }

  clipboardURL(event: any) {
    const url = window.location.href;
    navigator.clipboard.writeText(url);

    this.clipboardIcon = 'check';

    this.showTooltip(event, 'Link copied to clipboard!', true);

    setTimeout(() => {
      this.clipboardIcon = 'clipboard';
    }, 3000);
  }

   showTooltip(el: any, content: string, autoHide = false) {
    this.tooltipContent = content;
    const tooltip = this.tooltip.nativeElement;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    tooltip.style.left = `${el.target.getBoundingClientRect().right + 5}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().top - 5 + scrollPosition}px`;
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';

    if(autoHide) {
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

  toggleCompare2(event: any, server: ServerPriceWithPKs| any) {
    event.stopPropagation();
    server.selected = !server.selected;
    this.toggleCompare(server.selected, server);
  }

  toggleCompare(event: boolean, server: ServerPriceWithPKs| any) {
    this.serverCompare.toggleCompare(event, {
      server: server.server.api_reference,
      vendor: server.vendor_id,
      zoneRegion: {zone: server.zone_id, region: server.region_id},
      display_name: server.server.display_name
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

}

