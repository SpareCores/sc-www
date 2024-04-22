import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BreadcrumbSegment } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, SearchServerSearchGetParams, ServerPriceWithPKs } from '../../../../sdk/data-contracts';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { decodeQueryParams, encodeQueryParams } from '../../tools/queryParamFunctions';
import { encode } from 'punycode';
import { ActivatedRoute, ParamMap, Params } from '@angular/router';

export type TableColumn = {
  name: string;
  type: string;
  key?: string;
  show?: boolean;
  orderField?: string;
}

@Component({
  selector: 'app-server-listing',
  templateUrl: './server-listing.component.html',
  styleUrl: './server-listing.component.scss'
})
export class ServerListingComponent {

  isCollapsed = false;

  filterCategories = [
    {category_id: 'basic', name: 'Basics', icon: 'database', collapsed: true},
    {category_id: 'price', name: 'Pricing', icon: 'dollar-sign', collapsed: true},
    {category_id: 'processor', name: 'Processor', icon: 'cpu', collapsed: false},
    {category_id: 'memory', name: 'Memory', icon: 'memory-stick', collapsed: true},
    {category_id: 'vendor', name: 'Vendor', icon: 'home', collapsed: true},
    {category_id: 'datacenter', name: 'Datacenter', icon: 'hotel', collapsed: true},
  ];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Server listing', url: '/servers' }
  ];

  tableColumns: TableColumn[] = [];

  possibleColumns: TableColumn[] = [
    { name: 'NAME & PROVIDER', show: true, type: 'name'},
    { name: 'PROCESSOR', show: true, type: 'processor', orderField: 'vcpus' },
    { name: 'PRODUCT', show: true, type: 'text', key: 'server.server_id' },
    { name: 'MEMORY', show: true, type: 'memory', orderField: 'memory' },
    { name: 'STORAGE', show: true, type: 'storage', orderField: 'storage_size' },
    { name: 'STOCK', show: true, type: 'text', key: 'status' },
    { name: 'PRICE', show: true, type: 'price', orderField: 'price' },
    { name: 'STORAGE2', show: false, type: 'storage' },
  ];

  availableCurrencies = [
    {name: 'US dollar', slug: 'USD', symbol: '$'},
    {name: 'Euro', slug: 'EUR', symbol: '€'},
    {name: 'British Pound', slug: 'GBP', symbol: '£'},
    {name: 'Swedish Krona', slug: 'SEK', symbol: 'kr'},
    {name: 'Danish Krone', slug: 'DKK', symbol: 'kr'},
    {name: 'Norwegian Krone', slug: 'NOK', symbol: 'kr'},
    {name: 'Swiss Franc', slug: 'CHF', symbol: 'CHF'},
    {name: 'Australian Dollar', slug: 'AUD', symbol: '$'},
    {name: 'Canadian Dollar', slug: 'CAD', symbol: '$'},
    {name: 'Japanese Yen', slug: 'JPY', symbol: '¥'},
    {name: 'Chinese Yuan', slug: 'CNY', symbol: '¥'},
    {name: 'Indian Rupee', slug: 'INR', symbol: '₹'},
    {name: 'Russian Ruble', slug: 'RUB', symbol: '₽'},
    {name: 'Brazilian Real', slug: 'BRL', symbol: 'R$'},
    {name: 'South African Rand', slug: 'ZAR', symbol: 'R'},
  ];

  allocationTypes = [
    {name: 'Spot', slug: 'spot'},
    {name: 'On Demand', slug: 'ondemand'},
    {name: 'Reserved', slug: 'reserved'},
  ];

  allocation = this.allocationTypes[0];

  selectedCurrency = this.availableCurrencies[0];

  limit = 25;
  page = 1;

  orderBy: string | undefined = undefined;
  orderDir: OrderDir | undefined = undefined;

  servers: ServerPriceWithPKs[] = [];

  openApiJson: any = require('../../../../sdk/openapi.json');
  searchParameters: any;

  valueChangeDebouncer: Subject<number> = new Subject<number>();

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService,
              private route: ActivatedRoute) { }

  ngOnInit() {

    this.route.queryParams.subscribe((params: Params) => {
      const query: any = params;
      if(this.openApiJson.paths['/search'].get.parameters) {
        this.searchParameters = JSON.parse(JSON.stringify(this.openApiJson.paths['/search'].get.parameters)).map((item: any) => {
          return {...item,
            modelValue: query[item.name] || item.schema.default || null};
        });
      }

      if(query.order_by && query.order_dir) {
        this.orderBy = query.order_by;
        this.orderDir = query.order_dir;
      }

      if(query.currency) {
        this.selectedCurrency = this.availableCurrencies.find((currency) => currency.slug === query.currency) || this.availableCurrencies[0];
      }

      this.refreshColumns();

      this.filterServers(false);
    });

    this.valueChangeDebouncer.pipe(debounceTime(300)).subscribe((value) => {
     this.filterServers();
    });

  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getMemory(item: ServerPriceWithPKs) {
    return ((item.server.memory || 0) / 1024).toFixed(1) + ' GB';
  }

  getStorage(item: ServerPriceWithPKs) {
    if(!item.server.storage_size) return '-';

    if(item.server.storage_size < 1000) return `${item.server.storage_size} GB`;

    return `${(item.server.storage_size / 1000).toFixed(1)} TB`;
  }

  toggleCategory(category: any) {
    category.collapsed = !category.collapsed;
  }

  getParametersByCategory(category: string) {
    if(!this.searchParameters) return [];

    return this.searchParameters?.filter((param: any) => param.schema?.category_id === category);
  }

  getParamterType(parameter: any) {
    const type = parameter.schema.type || parameter.schema.anyOf?.find((item: any)  => item.type !== 'null')?.type || 'text';

    if((type === 'integer' || type === 'number') && parameter.schema.minimum && parameter.schema.maximum) {
      return 'range';
    }
    if(type === 'integer' || type === 'number') {
      return 'number';
    }
    if(type === 'boolean') {
      return 'checkbox';
    }
    return 'text';
  }

  getStep(parameter: any) {
    return parameter.schema.step || 1;
  }

  filterServers(updateURL = true) {
    let queryObject: SearchServerSearchGetParams = this.getQueryObject() || {};

    if(updateURL) {
      this.updateQueryParams(queryObject);
    }

    queryObject.limit = this.limit;
    queryObject.page = this.page;

    if(this.orderBy && this.orderDir) {
      queryObject.order_by = this.orderBy;
      queryObject.order_dir = this.orderDir;
    }

    this.keeperAPI.searchServers(queryObject).then(servers => {
      this.servers = servers;
      console.log('Servers:', servers);
    }).catch(err => {
      console.error(err);
    });
  }

  valueChanged() {
    this.valueChangeDebouncer.next(0);
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

    this.filterServers();
  }

  getOrderingIcon(column: TableColumn) {
    if(!column.orderField) return null;

    if(this.orderBy === column.orderField) {
      return this.orderDir === OrderDir.Desc ? 'arrow-down-wide-narrow' : 'arrow-down-narrow-wide';
    }
    return null;
  }

  getQueryObject() {
    let paramObject = this.searchParameters?.map((param: any) => {
      return (param.modelValue && param.schema.category_id && param.schema.default !== param.modelValue) ?
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

    if(this.allocation.slug !== 'ondemand') {
      paramObject.allocation = this.allocation.slug;
    }

    return paramObject;
  }


  updateQueryParams(object: any) {
    let encodedQuery = encodeQueryParams(object);

    if(encodedQuery?.length) {
      // update the URL
      window.history.pushState({}, '', '/servers?' + encodedQuery);
    } else {
      // remove the query params
      window.history.pushState({}, '', '/servers');
    }
  }

  refreshColumns() {
    this.tableColumns = this.possibleColumns.filter((column) => column.show);
  }

  selectCurrency(currency: any) {
    this.selectedCurrency = currency;

    this.filterServers();
  }

  selectAllocation(allocation: any) {
    this.allocation = allocation;

    this.filterServers();
  }

  getField(item: ServerPriceWithPKs, field: string) {
    return field.split('.').reduce((obj, key) => (obj && (obj as any)[key]) ? (obj as any)[key] : undefined, item);
  }

}
