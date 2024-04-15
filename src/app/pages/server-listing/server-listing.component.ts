import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BreadcrumbSegment } from '../../components/breadcrumbs/breadcrumbs.component';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { ServerPriceWithPKs } from '../../../../sdk/data-contracts';

@Component({
  selector: 'app-server-listing',
  templateUrl: './server-listing.component.html',
  styleUrl: './server-listing.component.scss'
})
export class ServerListingComponent {

  isCollapsed = false;

  filterCategories = [
    {name: 'Basics', icon: 'database'},
    {name: 'Pricing', icon: 'dollar-sign'},
    {name: 'Processor', icon: 'cpu'},
  ];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Server listing', url: '/servers' }
  ];

  servers: ServerPriceWithPKs[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService) { }

  ngOnInit() {
    this.keeperAPI.searchServers({limit: 25}).then(servers => {
      this.servers = servers;
      console.log('Servers:', servers);
    }).catch(err => {
      console.error(err);
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
}
