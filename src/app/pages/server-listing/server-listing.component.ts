import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BreadcrumbSegment } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { ServerPriceWithPKs } from '../../../../sdk/data-contracts';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { decodeQueryParams, encodeQueryParams } from '../../tools/queryParamFunctions';
import { encode } from 'punycode';

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
  ];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Server listing', url: '/servers' }
  ];

  servers: ServerPriceWithPKs[] = [];

  openApiJson: any = require('../../../../sdk/openapi.json');
  searchParameters: any;

  valueChangeDebouncer: Subject<number> = new Subject<number>();

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService) { }

  ngOnInit() {

    this.keeperAPI.searchServers({limit: 25}).then(servers => {
      this.servers = servers;
      console.log('Servers:', servers);
    }).catch(err => {
      console.error(err);
    });

    console.log('OpenAPI JSON:', this.openApiJson);

    const search = location.search.substring(1);
    const query = decodeQueryParams(search);

    if(this.openApiJson.paths['/search'].get.parameters) {
      this.searchParameters = JSON.parse(JSON.stringify(this.openApiJson.paths['/search'].get.parameters)).map((item: any) => {
        return {...item,
          modelValue: query[item.name] || item.schema.default || null};
      });
    }

    console.log('Search parameters:', this.searchParameters);

    this.valueChangeDebouncer.pipe(debounceTime(300)).subscribe((value) => {
     this.filterServers();
    });

  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getMemory(item: ServerPriceWithPKs) {
    return (item.server.memory || 0 / 1024).toFixed(1) + ' GB';
  }

  getStorage(item: ServerPriceWithPKs) {
    if(!item.server.storages?.length) return '-';

    return 'any';
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

  filterServers() {
    console.log('Filtering servers');
    console.log(this.searchParameters);
    let query = this.updateQueryParams();
    if(query?.length) {
      // update the URL
      window.history.pushState({}, '', '/servers?' + query);
    }
  }

  valueChanged() {
    this.valueChangeDebouncer.next(0);
  }

  updateQueryParams(): string | null {
    let paramObject = this.searchParameters?.map((param: any) => {
      return (param.modelValue && param.schema.category_id && param.schema.default !== param.modelValue) ?
              {[param.name]: param.modelValue} :
              {};
    }).reduce((acc: any, curr: any) => {  return {...acc, ...curr}; }, {});

    return encodeQueryParams(paramObject);
  }

}
