import { Component, HostBinding, Inject, PLATFORM_ID, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, ServerPKs, ServerPriceWithPKs } from '../../../../sdk/data-contracts';
import { encodeQueryParams } from '../../tools/queryParamFunctions';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Dropdown, DropdownOptions } from 'flowbite';
import { StorageHandlerService } from '../../services/storage-handler.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ServerCompareService } from '../../services/server-compare.service';

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



const options: DropdownOptions = {
  placement: 'bottom',
  triggerType: 'click',
  offsetSkidding: 0,
  offsetDistance: 10,
  delay: 300
};


@Component({
  selector: 'app-server-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule, SearchBarComponent, PaginationComponent],
  templateUrl: './server-listing.component.html',
  styleUrl: './server-listing.component.scss',
})
export class ServerListingComponent implements OnInit, OnDestroy {
  @HostBinding('attr.ngSkipHydration') ngSkipHydration = 'true';

  isCollapsed = false;

  filterCategories = [
    {category_id: 'basic', name: 'Basics', icon: 'server', collapsed: true},
    {category_id: 'processor', name: 'Processor', icon: 'cpu', collapsed: false},
    {category_id: 'gpu', name: 'GPU', icon: 'cpu', collapsed: true},
    {category_id: 'memory', name: 'Memory', icon: 'memory-stick', collapsed: true},
    {category_id: 'storage', name: 'Storage', icon: 'database', collapsed: true},
    {category_id: 'vendor', name: 'Vendor', icon: 'home', collapsed: true},
  ];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Server listing', url: '/servers' }
  ];

  tableColumns: TableColumn[] = [];

  possibleColumns: TableColumn[] = [
    { name: 'NAME & PROVIDER', show: true, type: 'name'},
    { name: 'PROCESSOR', show: true, type: 'processor', orderField: 'vcpus' },
    { name: 'SCORE',
      show: true,
      type: 'score',
      orderField: 'score',
      info: "Performance benchmark score using stress-ng's div16 method (doing 16 bit unsigned integer divisions for 20 seconds): simulating CPU heavy workload that scales well on any number of (v)CPUs. The score/price value shows the div16 performance measured for 1 USD/hour."
    },
    { name: 'MEMORY', show: true, type: 'memory', orderField: 'memory_amount' },
    { name: 'STORAGE', show: true, type: 'storage', orderField: 'storage_size' },
    { name: 'STORAGE TYPE', show: false, type: 'text', key: 'storage_type' },
    { name: 'GPUs', show: true, type: 'gpu', orderField: 'server.gpu_count' },
    { name: 'BEST PRICE', show: true, type: 'price', orderField: 'price' },
    { name: 'GPU MIN MEMORY', show: false, type: 'gpu_memory', key: 'server.gpu_memory_min' },
    { name: 'GPU TOTAL MEMORY', show: false, type: 'gpu_memory', key: 'server.gpu_memory_total' },
    { name: 'ARCHITECTURE', show: false, type: 'text', key: 'cpu_architecture' },
    { name: 'CPU ALLOCATION', show: false, type: 'text', key: 'cpu_allocation' },
    { name: 'STATUS', show: false, type: 'text', key: 'status' },
    { name: 'VENDOR', show: false, type: 'vendor' },
  ];

  pageLimits = [10, 25, 50, 100, 250];

  limit = 25;
  page = 1;
  totalPages = 0;

  orderBy: string | undefined = undefined;
  orderDir: OrderDir | undefined = undefined;

  servers: ServerPriceWithPKs[] | any[] = [];

  openApiJson: any = require('../../../../sdk/openapi.json');
  searchParameters: any;
  query: any= {};

  dropdownColumn: any;
  dropdownPage: any;
  modalSearch: any;

  isLoading = false;

  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: any;
  modalResponseStr: string[] = [];

  vendorMetadata: any[] = [];

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  clipboardIcon = 'clipboard';
  tooltipContent = '';

  sub: any;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService,
              private route: ActivatedRoute,
              private router: Router,
              private SEOHandler: SeoHandlerService,
              private storageHandler: StorageHandlerService,
              private serverCompare: ServerCompareService) { }

  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
      'Listing of Cloud Compute Resources - Spare Cores',
      'Harnessing the compute resources of the cloud to optimize efficiency and costs of batch and service tasks.',
      'cloud, server, instance, price, comparison, spot, sparecores');

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/server_list_image.png');

    const parameters = this.openApiJson.paths['/servers'].get.parameters || [];
    this.searchParameters = parameters;

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

      this.sub = this.serverCompare.selectionChanged.subscribe((selectedServers: ServerPKs[]) => {
        this.servers?.forEach((server: any) => {
          server.selected = selectedServers.findIndex((item: ServerPKs) => item.vendor_id === server.vendor_id && item.server_id === server.server_id) !== -1;
        });
      });

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

      const targetElPage: HTMLElement | null = document.getElementById('pagesize_options');
      const triggerElPage: HTMLElement | null = document.getElementById('pagesize_button');

      this.dropdownPage = new Dropdown(
        targetElPage,
        triggerElPage,
        options,
        {
          id: 'pagesize_options',
          override: true
        }
      );
    }
  }

  ngOnDestroy () {
    this.sub?.unsubscribe();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getMemory(item: ServerPKs) {
    return ((item.memory_amount || 0) / 1024).toFixed(1) + ' GiB';
  }

  getGPUMemory(item: ServerPKs) {
    return ((item.gpu_memory_min || 0) / 1024).toFixed(1) + ' GiB';
  }

  getStorage(item: ServerPKs) {
    if(!item.storage_size) return '-';

    if(item.storage_size < 1000) return `${item.storage_size} GB`;

    return `${(item.storage_size / 1000).toFixed(1)} TB`;
  }

  getScore(value: number | null): string {
    return value ? value.toFixed(0) : '-';
  }

  openServerDetails(server: ServerPKs) {
    this.router.navigateByUrl(`/server/${server.vendor.vendor_id}/${server.api_reference}`);
  }

  toggleCategory(category: any) {
    category.collapsed = !category.collapsed;
  }

  getParametersByCategory(category: string) {
    if(!this.searchParameters) return [];

    return this.searchParameters?.filter((param: any) => param.schema?.category_id === category);
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

    if(this.limit !== 25) {
      queryParams.limit = this.limit;
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

    this.keeperAPI.searchServers(query).then(servers => {
      this.servers = servers?.body;

      // set stored selected state
      this.servers?.forEach((server: any) => {
        server.selected = this.serverCompare.selectedForCompare
          .findIndex((item) => item.vendor_id === server.vendor_id && item.server_id === server.server_id) !== -1;
      });

      if(updateTotalCount) {
        this.totalPages = Math.ceil(parseInt(servers?.headers?.get('x-total-count') || '0') / this.limit);
      }
    }).catch(err => {
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

  getQueryObjectBase() {
    const paramObject = JSON.parse(JSON.stringify(this.query));

    if(this.orderBy && this.orderDir) {
      paramObject.order_by = this.orderBy;
      paramObject.order_dir = this.orderDir;
    }

    if(this.limit !== 25) {
      paramObject.limit = this.limit;
    }

    return paramObject;
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

    if(this.page > 1) {
      paramObject.page = this.page;
    }

    if(this.limit !== 25) {
      paramObject.limit = this.limit;
    }

    return paramObject || {};
  }

  updateQueryParams(object: any) {
    const encodedQuery = encodeQueryParams(object);

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

  selectPageSize(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.searchOptionsChanged(this.query);

    this.dropdownPage?.hide();
    // scroll to top
    window.scrollTo(0, 0);
  }

  getField(item: ServerPriceWithPKs, field: string) {
    return field.split('.').reduce((obj, key) => (obj && (obj as any)[key]) ? (obj as any)[key] : undefined, item);
  }

  toggleCompare2(event: any, server: ServerPKs| any) {
    event.stopPropagation();
    server.selected = !server.selected;
    this.toggleCompare(server.selected, server);
  }

  toggleCompare(event: boolean, server: ServerPKs| any) {
    this.serverCompare.toggleCompare(event, server);
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

}
