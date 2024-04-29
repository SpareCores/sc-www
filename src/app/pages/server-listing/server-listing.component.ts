import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BreadcrumbSegment } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, SearchServerSearchGetParams, ServerPriceWithPKs } from '../../../../sdk/data-contracts';
import { Subject, debounceTime } from 'rxjs';
import { encodeQueryParams } from '../../tools/queryParamFunctions';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Dropdown, DropdownOptions, InstanceOptions, Modal, ModalOptions } from 'flowbite';
import { StorageHandlerService } from '../../services/storage-handler.service';
import { SeoHandlerService } from '../../services/seo-handler.service';

export type TableColumn = {
  name: string;
  type: string;
  key?: string;
  show?: boolean;
  orderField?: string;
};

 const options: DropdownOptions = {
  placement: 'bottom',
  triggerType: 'click',
  offsetSkidding: 0,
  offsetDistance: 10,
  delay: 300
};

const optionsModal: ModalOptions = {
  backdropClasses:
      'bg-gray-900/50 fixed inset-0 z-40',
  closable: true,
};

@Component({
  selector: 'app-server-listing',
  templateUrl: './server-listing.component.html',
  styleUrl: './server-listing.component.scss',
  host: {ngSkipHydration: 'true'},
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
    { name: 'ARCHITECTURE', show: false, type: 'text', key: 'server.cpu_architecture' },
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
  totalPages = 0;

  orderBy: string | undefined = undefined;
  orderDir: OrderDir | undefined = undefined;

  servers: ServerPriceWithPKs[] = [];

  openApiJson: any = require('../../../../sdk/openapi.json');
  searchParameters: any;

  valueChangeDebouncer: Subject<number> = new Subject<number>();

  dropdownCurrency: any;
  dropdownAllocation: any;
  dropdownColumn: any;
  modalSearch: any;

  isLoading = false;

  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: any;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService,
              private route: ActivatedRoute,
              private router: Router,
              private SEOHandler: SeoHandlerService,
              private storageHandler: StorageHandlerService) { }

  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
      'Listing of Cloud Compute Resources - Spare Cores',
      'Harnessing the compute resources of the cloud to optimize efficiency and costs of batch and service tasks.',
      'cloud, server, instance, price, comparison, spot, sparecores');

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/server_list_image.png');


    this.route.queryParams.subscribe((params: Params) => {
      const query: any = params;
      if(this.openApiJson.paths['/search'].get.parameters) {
        this.searchParameters = JSON.parse(JSON.stringify(this.openApiJson.paths['/search'].get.parameters)).map((item: any) => {
          let value = query[item.name] || item.schema.default || null;
          if(query[item.name] && query[item.name].split(',').length > 1) {
            value = query[item.name].split(',');
          }
          return {...item,
            modelValue: value};
        });
      }

      console.log('Search parameters:', this.searchParameters);

      if(query.order_by && query.order_dir) {
        this.orderBy = query.order_by;
        this.orderDir = query.order_dir;
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

      const tableColumnsStr = this.storageHandler.get('serverListTableColumns');
      if(tableColumnsStr) {
        const tableColumns: string[] = JSON.parse(tableColumnsStr);
        this.possibleColumns.forEach((column) => {
          column.show = tableColumns.findIndex((item) => item === column.name) !== -1;
        });
      }

      this.refreshColumns(false);

      this.filterServers(false);
    });

    this.valueChangeDebouncer.pipe(debounceTime(300)).subscribe((value) => {
      this.page = 1;
      this.filterServers();
    });

    if(isPlatformBrowser(this.platformId)) {
      const targetElCurrency: HTMLElement | null = document.getElementById('currency_options');
      const triggerElCurrency: HTMLElement | null = document.getElementById('currency_button');


      this.dropdownCurrency = new Dropdown(
          targetElCurrency,
          triggerElCurrency,
          options,
          {
            id: 'currency_options',
            override: true
          }
      );

      const targetElAllocation: HTMLElement | null = document.getElementById('allocation_options');
      const triggerElAllocation: HTMLElement | null = document.getElementById('allocation_button');

      this.dropdownAllocation = new Dropdown(
        targetElAllocation,
        triggerElAllocation,
        options,
        {
          id: 'allocation_options',
          override: true
        }
      );

      const targetElColumn: HTMLElement | null = document.getElementById('column_options');
      const triggerElColumn: HTMLElement | null = document.getElementById('column_button');

      this.dropdownColumn = new Dropdown(
        targetElColumn,
        triggerElColumn,
        options,
        {
          id: 'column_options',
          override: true
        }
      );

      // set the modal menu element
      const targetElModal = document.getElementById('large-modal');

      this.modalSearch = new Modal(targetElModal, optionsModal,  {
        id: 'large-modal',
        override: true
      });
    }

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

  openServerDetails(server: ServerPriceWithPKs) {
    //this.router.navigateByUrl(`/server/${server.server.server_id}`);
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
      if(parameter.schema.category_id === 'price')
        return 'price';
      else
        return 'number';
    }

    if(type === 'boolean') {
      return 'checkbox';
    }

    if(type === 'array' && parameter.schema.enum) {
      return 'enumArray';
    }

    return 'text';
  }

  getStep(parameter: any) {
    return parameter.schema.step || 1;
  }

  filterServers(updateURL = true, updateTotalCount = true) {
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

    this.isLoading = true;

    if(updateTotalCount) {
      queryObject.add_total_count_header = true;
    }

    this.keeperAPI.searchServers(queryObject).then(servers => {
      this.servers = servers?.body;
      if(updateTotalCount) {
        this.totalPages = Math.ceil(parseInt(servers?.headers?.get('x-total-count') || '0') / this.limit);
      }
      console.log('Servers:', servers);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      this.isLoading = false;
    });
  }

  valueChanged() {
    this.valueChangeDebouncer.next(0);
  }

  isEnumSelected(param: any, value: string) {
    return param.modelValue && param.modelValue.indexOf(value) !== -1;
  }

  toggleEnumSelection(param: any, value: string) {
    if(!param.modelValue) {
      param.modelValue = [];
    }

    const index = param.modelValue.indexOf(value);
    if(index !== -1) {
      param.modelValue.splice(index, 1);
    } else {
      param.modelValue.push(value);
    }

    this.valueChanged();
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

    if(this.page > 1) {
      paramObject.page = this.page;
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

  refreshColumns(save = true) {
    this.tableColumns = this.possibleColumns.filter((column) => column.show);

    if(save) {
      this.storageHandler.set('serverListTableColumns', JSON.stringify(this.tableColumns.map(item => item.name)));
    }
  }

  selectCurrency(currency: any) {
    this.selectedCurrency = currency;

    this.filterServers();

    this.dropdownCurrency?.hide();
  }

  selectAllocation(allocation: any) {
    this.allocation = allocation;
    this.page = 1;

    this.filterServers();

    this.dropdownAllocation?.hide();
  }

  getField(item: ServerPriceWithPKs, field: string) {
    return field.split('.').reduce((obj, key) => (obj && (obj as any)[key]) ? (obj as any)[key] : undefined, item);
  }

  prevPage() {
    this.page = Math.max(this.page - 1, 1);
    this.gotoPage(this.page);
  }

  nextPage() {
   this.gotoPage(this.page + 1);
  }

  gotoPage(page: number) {
    if(this.page === page) return;
    this.page = page;
    this.filterServers(true, false);
  }

  possiblePages() {
    // get numbers in array from min(page-2, 1) to page+2
    const min = Math.max(this.page - 1, 1);
    const max = Math.min(this.page + 1, this.totalPages);
    return Array.from({length: max - min + 1}, (_, i) => i + min);
  }

  openSearchPromt() {
    this.modalSearch?.show();
  }

  closeModal(confirm: boolean) {
    if(confirm) {
      this.filterServers();

      this.freetextSearchInput = '';
      this.modalResponse = null;
    }

    this.modalSearch?.hide();
  }

  submitFreetextSearch() {
    this.modalSubmitted = true;
    this.modalResponse = null;

    if(this.freetextSearchInput) {
      this.keeperAPI.parseFreetextSearch(this.freetextSearchInput).then(response => {
        this.modalResponse = {foo: 'bar'};
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        this.modalSubmitted = false;
      });
    }
  }

}
