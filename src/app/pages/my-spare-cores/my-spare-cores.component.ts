import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UsersAPIService } from '../../services/users-api.service';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SeoHandlerService } from '../../services/seo-handler.service';

@Component({
  selector: 'app-my-spare-cores',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, FormsModule, LucideAngularModule, RouterModule],
  templateUrl: './my-spare-cores.component.html',
  styleUrl: './my-spare-cores.component.scss'
})
export class MySpareCoresComponent implements OnInit {

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'My Spare Cores', url: '/dashboard' }
  ];

  featureCategories = [
    {category_id: 'settings', name: 'Settings', icon: 'settings'},
    {category_id: 'watchlist', name: 'Watchlist', icon: 'star'},
    {category_id: 'search_history', name: 'Search History', icon: 'search'},
  ];

  searchSettings: any[] = [
    {name: 'Currency', key: 'currency' },
    {name: 'Page Size', key: 'limit'},
    {name: 'Allocation', key: 'allocation'},
    {name: 'Columns', key: 'tableColumns'},
  ];

  servers: any[] = [];

  selectedFeatureCategory = 'settings';

  userData: any;
  watchlistItems: any[] = [];
  searchHistory: any[] = [];

  tooltipContent = '';

  @ViewChild('tooltipDefault') tooltip!: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private keeperAPI: KeeperAPIService,
    private auth: AuthenticationService,
    private usersAPI: UsersAPIService,
    private router: Router,
    private SEOHandler: SeoHandlerService
  ) { }

  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
       'My Spare Cores - Spare Cores',
       'Manage your settings and watchlist',
       'my spare cores, watchlist, settings, search history'
    );

    if(isPlatformBrowser(this.platformId)) {
      this.usersAPI.getCurrentUserData().then((data) => {
        this.userData = data;
      });
      this.keeperAPI.getServers().then((data) => {
        this.servers = data.body;
        this.usersAPI.getWatchlist().then((watchlist) => {
          this.watchlistItems = data.body.filter((item: any) => {
            return watchlist.find((watchlistItem: any) => watchlistItem.vendor_id === item.vendor_id && watchlistItem.server_id === item.server_id);
          });
        });
      });
      this.usersAPI.getSearchHistory().then((data) => {
        this.searchHistory = data;
      });
    }
  }

  toggleCategory(category_id: string) {
    this.selectedFeatureCategory = category_id;
  }

  getSettingValue(key: string) {
    return this.userData?.[key] || 'Default';
  }

  resetSetting(setting_id: string) {
    this.usersAPI.insertOrUpdateUserData({ [setting_id]: null }).then(() => {
      this.usersAPI.getCurrentUserData().then((data) => {
        this.userData = data;
      });
    });
  }

  clearWatchlist(item: any) {
    this.usersAPI.toggleWatchlist(item.vendor_id, item.server_id).then(() => {
      this.usersAPI.getWatchlist().then((watchlist) => {
        this.watchlistItems = this.servers.filter((server: any) => {
          return watchlist.find((watchlistItem: any) => watchlistItem.vendor_id === server.vendor_id && watchlistItem.server_id === server.server_id);
        });
      });
    });
  }

  showTooltip(el: any, content: string) {
    const description = content;
    if(description) {
      const tooltip = this.tooltip.nativeElement;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      tooltip.style.left = `${el.target.getBoundingClientRect().left + 25}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().top - 5 + scrollPosition}px`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';

      this.tooltipContent = description;
    }
  }

  getSearchHistoryItemDescription(item: any) {
    let description = '';
    Object.keys(item).forEach((key) => {
      if(description.length > 0) {
        description += ' | ';
      }
      description += `${key}: ${item[key]} `;
    });
    return description;
  }

  openSearchHistoryItem(item: any) {
    let query = JSON.parse(JSON.stringify(item));
    // convert all arrays to strings
    Object.keys(query).forEach((key) => {
      if(Array.isArray(query[key])) {
        query[key] = query[key].join(',');
      }
    });
    this.router.navigate(['/servers'], { queryParams: query } );
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

  clearHistory() {
    this.usersAPI.clearSearchHistory().then(() => {
      this.usersAPI.getSearchHistory().then((data) => {
        this.searchHistory = data;
      });
    });
  }


}
