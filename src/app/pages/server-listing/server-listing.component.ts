import { Component, HostBinding, Inject, PLATFORM_ID, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, SearchServersServersGetParams, ServerPKs, ServerPriceWithPKs } from '../../../../sdk/data-contracts';
import { Subject, debounceTime } from 'rxjs';
import { encodeQueryParams } from '../../tools/queryParamFunctions';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Dropdown, DropdownOptions, Modal, ModalOptions } from 'flowbite';
import { StorageHandlerService } from '../../services/storage-handler.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';

export type TableColumn = {
  name: string;
  type: string;
  key?: string;
  show?: boolean;
  orderField?: string;
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

const optionsModal: ModalOptions = {
  backdropClasses:
      'bg-gray-900/50 fixed inset-0 z-40',
  closable: true,
};

@Component({
  selector: 'app-server-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule],
  templateUrl: './server-listing.component.html',
  styleUrl: './server-listing.component.scss',
})
export class ServerListingComponent implements OnInit {
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
    { name: 'MEMORY', show: true, type: 'memory', orderField: 'memory' },
    { name: 'STORAGE', show: true, type: 'storage', orderField: 'storage_size' },
    { name: 'STORAGE TYPE', show: false, type: 'text', key: 'server.storage_type' },
    { name: 'GPUs', show: true, type: 'gpu', orderField: 'server.gpu_count' },
    { name: 'GPU MIN MEMORY', show: false, type: 'gpu_memory', key: 'server.gpu_memory_min' },
    { name: 'ARCHITECTURE', show: false, type: 'text', key: 'server.cpu_architecture' },
    { name: 'STATUS', show: false, type: 'text', key: 'server.status' },
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

  valueChangeDebouncer: Subject<number> = new Subject<number>();

  dropdownColumn: any;
  dropdownPage: any;
  modalSearch: any;

  isLoading = false;

  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: any;
  modalResponseStr: string[] = [];

  vendorMetadata: any[] = [];

  selectedForCompare: ServerPKs[] = [];

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  clipboardIcon = 'clipboard';
  tooltipContent = '';

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
      const parameters = this.openApiJson.paths['/servers'].get.parameters || [];
      this.searchParameters = parameters.map((item: any) => {
        const value = query[item.name]?.split(',') || item.schema.default || null;

        if(query[item.name]) {
          if(this.filterCategories.find((column) => column.category_id === item.schema.category_id)) {
            this.filterCategories.find((column) => column.category_id === item.schema.category_id)!.collapsed = false;
          }
        }

        return {...item, modelValue: value};
      });

      if(query.order_by && query.order_dir) {
        this.orderBy = query.order_by;
        this.orderDir = query.order_dir;
      }

      if(query.page) {
        this.page = parseInt(query.page);
      }

      this.loadVendors();

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

    this.valueChangeDebouncer.pipe(debounceTime(300)).subscribe(() => {
      this.page = 1;
      this.filterServers();
    });

    if(isPlatformBrowser(this.platformId)) {

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

  getParamterType(parameter: any) {
    const type = parameter.schema.type || parameter.schema.anyOf?.find((item: any)  => item.type !== 'null')?.type || 'text';
    const name = parameter.name;

    if(name === 'countries') {
      return 'country';
    }

    if(name === 'regions') {
      return 'regions';
    }

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
    const queryObject: SearchServersServersGetParams = this.getQueryObject() || {};

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

      console.log(servers);

      // set stored selected state
      this.servers?.forEach((server: any) => {
        server.selected = this.selectedForCompare
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

  valueChanged() {
    this.valueChangeDebouncer.next(0);
  }

  isEnumSelected(param: any, valueOrObj: any) {
    const value = typeof valueOrObj === 'string' ? valueOrObj : valueOrObj.key;
    return param.modelValue && param.modelValue.indexOf(value) !== -1;
  }

  selectEnumItem(param: any, valueOrObj: any) {
    if(!param.modelValue) {
      param.modelValue = [];
    }

    const value = typeof valueOrObj === 'string' ? valueOrObj : valueOrObj.key;

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
    const paramObject = this.searchParameters?.map((param: any) => {
      return (param.modelValue && param.schema.category_id && param.schema.default !== param.modelValue) ?
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

    return paramObject;
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
    this.filterServers();

    this.dropdownPage?.hide();
    // scroll to top
    window.scrollTo(0, 0);
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

  openSearchPrompt() {
    this.modalSearch?.show();
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
      this.keeperAPI.parsePromptforServers({text:this.freetextSearchInput}).then(response => {
        this.modalResponse = response.body;
        this.modalResponseStr = [];
        Object.keys(response.body).forEach((key) => {
          this.modalResponseStr.push(key + ': ' + response.body[key]);
        });
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        this.modalSubmitted = false;
      });
    }
  }

  collapseItem(continent: ContinentMetadata | RegionVendorMetadata) {
    continent.collapsed = !continent.collapsed;
  }

  loadVendors() {
    Promise.all([
      this.keeperAPI.getVendors()]).then((responses) => {
      if(responses[0]?.body) {
        this.vendorMetadata = responses[0].body;
      }
    });
  }

  toggleCompare2(event: any, server: ServerPKs| any) {
    event.stopPropagation();
    server.selected = !server.selected;
    this.toggleCompare(server.selected, server);
  }

  toggleCompare(event: boolean, server: ServerPKs| any) {
    if(event) {
      if(this.selectedForCompare.findIndex((item) => item.vendor_id === server.vendor_id && item.server_id === server.server_id) === -1) {
        this.selectedForCompare.push(server);
      }
    } else {
      this.selectedForCompare = this.selectedForCompare.filter((item) => item !== server);
    }
  }

  compareCount() {
    return this.servers?.filter((server) => server.selected).length;
  }

  openCompare() {
    const selectedServers = this.servers.filter((server) => server.selected);

    if(selectedServers.length < 2) {
      alert('Please select at least two servers to compare');
      return;
    }

    const serverIds = selectedServers.map((server) => {
      return {vendor: server.vendor_id, server: server.api_reference}
    });

    // encode atob to avoid issues with special characters
    const encoded = btoa(JSON.stringify(serverIds));

    this.router.navigateByUrl('/compare?instances=' + encoded);
  }

  clipboardURL(event: any) {
    const url = window.location.href;
    navigator.clipboard.writeText(url);

    this.clipboardIcon = 'check';

    this.showTooltip(event, 'Copied to clipboard!', true);

    setTimeout(() => {
      this.clipboardIcon = 'clipboard';
    }, 3000);
  }

   showTooltip(el: any, content: string, autoHide = false) {
    this.tooltipContent = content;
    const tooltip = this.tooltip.nativeElement;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().top - 45 + scrollPosition}px`;
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
