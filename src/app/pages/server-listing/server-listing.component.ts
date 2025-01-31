import { Component, Inject, PLATFORM_ID, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { OrderDir, ServerPKs, ServerPriceWithPKs } from '../../../../sdk/data-contracts';
import { encodeQueryParams } from '../../tools/queryParamFunctions';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StorageHandlerService } from '../../services/storage-handler.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ServerCompare, ServerCompareService } from '../../services/server-compare.service';
import { DropdownManagerService } from '../../services/dropdown-manager.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Modal, ModalOptions } from 'flowbite';

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

const optionsModal: ModalOptions = {
  backdropClasses:
      'bg-gray-900/50 fixed inset-0 z-40',
  closable: true,
};


@Component({
  selector: 'app-server-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule, SearchBarComponent, PaginationComponent],
  templateUrl: './server-listing.component.html',
  styleUrl: './server-listing.component.scss',
})
export class ServerListingComponent implements OnInit, OnDestroy {

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
    { name: 'VENDOR', show: false, type: 'vendor' },
    { name: 'ARCHITECTURE', show: false, type: 'text', key: 'cpu_architecture' },
    { name: 'PROCESSOR', show: true, type: 'processor', orderField: 'vcpus' },
    { name: 'CPU MODEL', show: false, type: 'cpu_model' },
    { name: 'CPU ALLOCATION', show: false, type: 'text', key: 'cpu_allocation' },
    { name: 'SCORE',
      show: true,
      type: 'score',
      orderField: 'score',
      info: "Performance benchmark score using stress-ng's div16 method (doing 16 bit unsigned integer divisions for 20 seconds): simulating CPU heavy workload that scales well on any number of (v)CPUs. The SCore/price value in the second line shows the div16 performance measured for 1 USD/hour, using the best (usually spot) price of all zones. To order by the latter, enable the $Core column."
    },
    { name: '$CORE',
      show: false,
      type: 'score_per_price',
      orderField: 'score_per_price',
      info: "SCore/price showing stress-ng's div16 performance measured for 1 USD/hour, using the best (usually spot) price of all zones."
    },
    { name: 'BENCHMARK',
      show: false,
      type: 'benchmark',
      orderField: 'selected_benchmark_score',
      info: "Performance benchmark score using the selected Benchmark. The value in the second line shows the performance measured for 1 USD/hour, using the best (usually spot) price of all zones."
    },
    { name: 'BENCHMARK/USD',
      show: false,
      type: 'benchmark_score_per_price',
      orderField: 'selected_benchmark_score_per_price',
      info: "Benchmark/price showing the selected benchmark performance measured for 1 USD/hour, using the best (usually spot) price of all zones."
    },
    { name: 'MEMORY', show: true, type: 'memory', orderField: 'memory_amount' },
    { name: 'STORAGE', show: true, type: 'storage', orderField: 'storage_size' },
    { name: 'STORAGE TYPE', show: false, type: 'text', key: 'storage_type' },
    { name: 'GPUs', show: true, type: 'gpu', orderField: 'gpu_count' },
    { name: 'GPU MIN MEMORY', show: false, type: 'gpu_memory_min', orderField: 'gpu_memory_min' },
    { name: 'GPU TOTAL MEMORY', show: false, type: 'gpu_memory_total', orderField: 'gpu_memory_total' },
    { name: 'GPU MODEL', show: false, type: 'gpu_model' },
    { name: 'BEST PRICE', show: true, type: 'price', key: 'min_price', orderField: 'min_price' },
    { name: 'BEST ONDEMAND PRICE', show: false, type: 'price', key: 'min_price_ondemand', orderField: 'min_price_ondemand'  },
    { name: 'BEST SPOT PRICE', show: false, type: 'price', key: 'min_price_spot', orderField: 'min_price_spot'  },
    { name: 'STATUS', show: false, type: 'text', key: 'status' },
  ];

  hasCustomColumns = false;

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


  isLoading = false;

  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: any;
  modalResponseStr: string[] = [];

  vendorMetadata: any[] = [];
  benchmarkMetadata: any[] = [];
  benchmarksConfigs: any[] = [];
  benchmarkCategories: any[] = [];
  selectedBenchmarkConfig: any = null;
  modalBenchmarkSelect: any;

  //modal
  modalText: string = 'Select Benchmark Category';
  tempfilteredBenchmarkConfigs: any[] = [];
  tempSelectedBenchmarkCategory: string | null = null;
  tempSelectedBenchmarkConfig: any = null;
  modalFilterTerm: string | null = null;

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  clipboardIcon = 'clipboard';
  tooltipContent = '';

  sub: any;

  specialServerLists: any[] = require('./special-lists');
  specialList: any = null;
  specialParameters: any = {};
  title: string = 'Cloud Compute Resources';
  description: string = 'Explore, search, and evaluate the supported cloud compute resources in the table below. This comprehensive comparison includes diverse attributes such as CPU count, detailed processor information, memory, GPU, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the “Search prompt” bar. You can also compare servers by selecting at least two rows using the checkboxes.';

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService,
              private route: ActivatedRoute,
              private router: Router,
              private SEOHandler: SeoHandlerService,
              private storageHandler: StorageHandlerService,
              private dropdownManager: DropdownManagerService,
              private analytics: AnalyticsService,
              private serverCompare: ServerCompareService) { }

  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
      'Listing of Cloud Compute Resources - Spare Cores',
      'Harnessing the compute resources of the cloud to optimize efficiency and costs of batch and service tasks.',
      'cloud, server, instance, price, comparison, spot, sparecores');

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/server_list_image.png');

    const parameters = this.openApiJson.paths['/servers'].get.parameters || [];
    this.searchParameters = parameters;

    let limit = this.searchParameters.find((param: any) => param.name === 'limit');
    if(limit && limit.schema && limit.schema.default) {
      this.limit = limit.schema.default;
    }

    let order = this.searchParameters.find((param: any) => param.name === 'order_by');
    if(order && order.schema && order.schema.default) {
      this.orderBy = order.schema.default;
    }

    this.route.params.subscribe(() => {
      this.setSpecialList();
      if(this.specialList) {
       this.breadcrumbs.push({ name: this.specialList.title, url: `/servers/${this.specialList.id}` });
       this.SEOHandler.updateTitleAndMetaTags(
          `${this.specialList.title} - Spare Cores`,
          this.specialList.description,
          'cloud, server, instance, price, comparison, spot, sparecores');
      }
    });

    this.route.queryParams.subscribe((params: Params) => {
      const query: any = JSON.parse(JSON.stringify(params || '{}'));

      this.query = query;

      if(query.page) {
        this.page = parseInt(query.page);
      }

      if(query.limit) {
        this.limit = parseInt(query.limit);
      }

      this.setSpecialList();

      const tableColumns: string = this.specialList?.columns || query.columns;
      if(tableColumns && parseInt(tableColumns) ) {
        const tableColumnsArray: number[] = Number(tableColumns).toString(2).split('').map(Number);
        if(tableColumnsArray.length === this.possibleColumns.length) {
          this.hasCustomColumns = query.columns !== undefined;
          this.possibleColumns.forEach((column, index) => {
            column.show = tableColumnsArray[index] === 1;
          });
        }
      }

      if(this.specialList?.order_by && this.specialList?.order_dir) {
        this.orderBy = this.specialList.order_by;
        this.orderDir = this.specialList.order_dir;
      }

      if(query.order_by && query.order_dir) {
        this.orderBy = query.order_by;
        this.orderDir = query.order_dir;
      }

      if(this.orderBy && this.possibleColumns.find((column) => column.orderField === this.orderBy)) {
        this.possibleColumns.find((column) => column.orderField === this.orderBy)!.show = true;
      }

      this.refreshColumns(false);

      this._searchServers(true);
    });
    Promise.all([
      this.keeperAPI.getServerBenchmarkMeta(),
      this.keeperAPI.getBenchamarkConfigs()]).then((data) => {
        this.benchmarkMetadata = data[0]?.body;

        this.benchmarksConfigs = data[1]?.body.map((config: any) => {
          let template = this.benchmarkMetadata.find((benchmark: any) => benchmark.benchmark_id === config.benchmark_id);
          return {
            ...config,
            config_title: config.config.replaceAll(/[{}"]/g, ''),
            benchmarkTemplate: template,
            group: JSON.stringify({group: {title: config.category, name: config.category}})
          };
        });

        this.benchmarkCategories = [];
        this.benchmarksConfigs.forEach((config: any) => {
          if(!this.benchmarkCategories.find((category: any) => category === config.category)) {
            this.benchmarkCategories.push(config.category);
          }
        });

        const benchmarkId = this.route.snapshot.queryParams.benchmark_id || this.specialList?.benchmark_id;
        const benchmarkConfig = this.route.snapshot.queryParams.benchmark_config || this.specialList?.benchmark_config;

        if(benchmarkId && benchmarkConfig) {
          this.selectedBenchmarkConfig = this.benchmarksConfigs.find((config: any) => config.benchmark_id === benchmarkId && config.config === benchmarkConfig);
        }

        this._searchServers(true);

        //console.log(this.benchmarksConfigs);

        if(isPlatformBrowser(this.platformId)) {
          this.initDropdown();
        }
    });

    if(isPlatformBrowser(this.platformId)) {

      this.sub = this.serverCompare.selectionChanged.subscribe((selectedServers: ServerCompare[]) => {
        this.servers?.forEach((server: any) => {
          server.selected = selectedServers.findIndex((item: ServerCompare) => item.vendor === server.vendor_id && item.server === server.api_reference) !== -1;
        });
      });

      this.dropdownManager.initDropdown('column_button', 'column_options').then((dropdown) => {
        this.dropdownColumn = dropdown;
      });

      this.dropdownManager.initDropdown('pagesize_button', 'pagesize_options').then((dropdown) => {
        this.dropdownPage = dropdown;
      });

      const targetElModal = document.getElementById('benchmark-type-modal');

      this.modalBenchmarkSelect = new Modal(targetElModal, optionsModal,  {
        id: 'benchmark-type-modal',
        override: true
      });
    }
  }

  private async initDropdown() {
    const { default: HSComboBox } = await import('@preline/combobox');
    HSComboBox.autoInit();
  }

  ngOnDestroy () {
    this.sub?.unsubscribe();
  }

  setSpecialList() {
    const id = this.route.snapshot.paramMap.get('id');

    if(id) {
      this.specialList = this.specialServerLists.find((list) => list.id === id);
    } else {
      this.specialList = null;
    }

    this.specialParameters = this.specialList?.parameters || {};
    this.title = this.specialList?.title || 'Cloud Compute Resources';
    this.description = this.specialList?.description || 'Explore, search, and evaluate the supported cloud compute resources in the table below. This comprehensive comparison includes diverse attributes such as CPU count, detailed processor information, memory, GPU, storage, network speed and capacity, available operating systems. Use the sidebar to filter the results, or enter your freetext query in the “Search prompt” bar. You can also compare servers by selecting at least two rows using the checkboxes.';
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getMemory(item: ServerPKs) {
    return ((item.memory_amount || 0) / 1024).toFixed(1) + ' GiB';
  }

  getGPUMemory(item: ServerPKs, stat: 'min' | 'total' = 'min'): string {
    const memory = stat === 'min' ? item.gpu_memory_min : item.gpu_memory_total;
    return ((memory || 0) / 1024).toFixed(1) + ' GiB';
  }

  getStorage(item: ServerPKs) {
    if(!item.storage_size) return '-';

    if(item.storage_size < 1000) return `${item.storage_size} GB`;

    return `${(item.storage_size / 1000).toFixed(1)} TB`;
  }

  getScore(value: number | null): string {
    return value ? (value > 100 ?  value.toFixed(0) : (Math.round(value * 100) / 100).toFixed(4)) : '-';
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
    } else {
      delete queryParams.limit;
    }

    if(this.hasCustomColumns) {
      let columns = this.possibleColumns.map((column) => column.show ? 1 : 0).reduce((acc: number, bit) => ((acc << 1) | bit), 0);
      queryParams.columns = columns;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams
    });
  }

  private _searchServers(updateTotalCount = true) {
    this.isLoading = true;

    let query = JSON.parse(JSON.stringify(this.query));

    if(query.columns) {
      delete query.columns;
    }

    if(this.specialParameters) {
      query = {...query, ...this.specialParameters};
    }

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

    if(this.selectedBenchmarkConfig) {
      query.benchmark_config = this.selectedBenchmarkConfig.config;
      query.benchmark_id = this.selectedBenchmarkConfig.benchmark_id;
    }

    this.keeperAPI.searchServers(query).then(servers => {
      this.servers = servers?.body;

      // set stored selected state
      this.servers?.forEach((server: any) => {
        server.selected = this.serverCompare.selectedForCompare
          .findIndex((item) => item.vendor === server.vendor_id && item.server === server.api_reference) !== -1;
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

  getQueryObjectBase() {
    const paramObject = JSON.parse(JSON.stringify(this.query));

    if(this.orderBy && this.orderDir) {
      paramObject.order_by = this.orderBy;
      paramObject.order_dir = this.orderDir;
    }

    if(this.limit !== 25) {
      paramObject.limit = this.limit;
    } else {
      delete paramObject.limit;
    }

    if(this.hasCustomColumns) {
      let columns = this.possibleColumns.map((column) => column.show ? 1 : 0).reduce((acc: number, bit) => ((acc << 1) | bit), 0);
      paramObject.columns = columns;
    }

    if(this.selectedBenchmarkConfig) {
      paramObject.benchmark_config = this.selectedBenchmarkConfig.config;
      paramObject.benchmark_id = this.selectedBenchmarkConfig.benchmark_id;
    }

    return paramObject;
  }

  updateQueryParams(object: any) {
    const encodedQuery = encodeQueryParams(object);
    const path = window.location.pathname || '/servers';

    if(encodedQuery?.length) {
      // update the URL
      window.history.pushState({}, '', `${path}?${encodedQuery}`);
    } else {
      // remove the query params
      window.history.pushState({}, '', path);
    }
  }


  refreshColumns(save = true) {
    this.tableColumns = this.possibleColumns.filter((column) => column.show);
    if(isPlatformBrowser(this.platformId) && save) {
      this.hasCustomColumns = true;
      this.updateQueryParams(this.getQueryObjectBase());
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
    this.serverCompare.toggleCompare(event, {server: server.api_reference, vendor: server.vendor_id, display_name: server.display_name});
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

  showAPIReference(item: ServerPKs) {
    return item.display_name !== item.api_reference && item.display_name !== item.api_reference.replace('Standard_', '');
  }

  openModal() {
    this.modalText = 'Select Benchmark Category';
    this.modalBenchmarkSelect.show();
  }

  closeModal() {
    this.modalBenchmarkSelect?.hide();
  }

  selectBenchmarkCategory(category: any, searcTerm: string | null = null) {
    this.tempSelectedBenchmarkCategory = category;

    if(category) {
      this.tempfilteredBenchmarkConfigs = this.benchmarksConfigs
        .filter((config: any) =>
          (category ==='All' || config.category === category) &&
          (!searcTerm || config.benchmark_id.toLowerCase().includes(searcTerm.toLowerCase()) || config.config.toLowerCase().includes(searcTerm.toLowerCase())));
      this.modalText = `Select ${this.tempSelectedBenchmarkCategory} Configuration`;
    } else {
      this.modalText = 'Select Benchmark Category';
    }
  }

  selectBenchmarkConfig(config: any) {
    this.tempSelectedBenchmarkCategory = null;
    this.selectedBenchmarkConfig = config;
    this.modalBenchmarkSelect?.hide();
    this.updateQueryParams(this.getQueryObjectBase());
    this._searchServers(true);
  }

  updateFilterTerm() {
    this.selectBenchmarkCategory(this.tempSelectedBenchmarkCategory, this.modalFilterTerm);
  }

}
