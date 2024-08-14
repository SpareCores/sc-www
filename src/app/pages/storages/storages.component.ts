import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostBinding, Inject, PLATFORM_ID } from '@angular/core';
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
import { ServerCompareService } from '../../services/server-compare.service';
import { StorageHandlerService } from '../../services/storage-handler.service';
import { TableColumn } from '../server-listing/server-listing.component';
import { Dropdown, DropdownOptions } from 'flowbite';

const options: DropdownOptions = {
  placement: 'bottom',
  triggerType: 'click',
  offsetSkidding: 0,
  offsetDistance: 10,
  delay: 300
};

@Component({
  selector: 'app-storages',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, LucideAngularModule, CountryIdtoNamePipe, RouterModule, SearchBarComponent, PaginationComponent],
  templateUrl: './storages.component.html',
  styleUrl: './storages.component.scss'
})
export class StoragesComponent {

  @HostBinding('attr.ngSkipHydration') ngSkipHydration = 'true';

  limit = 50;
  page = 1;
  totalPages = 0;
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
  ];

  openApiJson: any = require('../../../../sdk/openapi.json');
  searchParameters: any;
  query: any= {};

  storages: any[] = [];

  tableColumns: TableColumn[] = [

  ];

  possibleColumns: TableColumn[] = [
    { name: 'VENDOR', show: true, type: 'vendor'},
    { name: 'NAME', show: true, type: 'text', key: 'storage.name'},
    { name: 'PRICE', show: true, type: 'price' },
    { name: 'REGION', show: true, type: 'region' },
    { name: 'MIN', show: true, type: 'storage', key: 'storage.min_size' },
    { name: 'MAX', show: true, type: 'storage', key: 'storage.max_size' },
    { name: 'TYPE', show: true, type: 'text', key: 'storage.storage_type',
    },
    { name: 'PRICE UPFRONT', show: false, type: 'price2', key: 'price_upfront' },
    { name: 'PRICE TIERED', show: false, type: 'price2', key: 'price_tiered' },
  ];

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

    const parameters = this.openApiJson.paths['/storage_prices'].get.parameters || [];
    this.searchParameters = parameters;
    console.log(this.searchParameters);

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

      this._searchStorages();

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

    if(this.limit !== 25) {
      queryParams.limit = this.limit;
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

    if(this.limit !== 25) {
      paramObject.limit = this.limit;
    }

    return paramObject;
  }

  private _searchStorages() {
    this.isLoading = true;

    this.keeperAPI.getStoragePrices(this.query).then((results: any) => {
      this.storages = results.body;
      this.isLoading = false
      console.log(this.storages);
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
