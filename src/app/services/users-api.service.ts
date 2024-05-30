/* eslint-disable prefer-const */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MYHTTPClient } from './my_http/my-http';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UsersAPIService {

  public myHttp = new MYHTTPClient(this.httpClient, this.auth, this.platformId);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private httpClient: HttpClient,
    private auth: AuthenticationService
  ) { }

  public getCurrentUserData(): Promise<any> {
    const userID = this.auth.getUserID();
    if(userID) {
      return Promise.resolve(JSON.parse(localStorage.getItem(`user_data_${userID}`) || '{}'));
    } else {
      return Promise.resolve(undefined);
    }
  }

  public insertOrUpdateUserData(data: any): Promise<void> {
    const userID = this.auth.getUserID();
    if(userID) {
      let userData = JSON.parse(localStorage.getItem(`user_data_${userID}`) || '{}');
      userData = { ...userData, ...data };
      return Promise.resolve(localStorage.setItem(`user_data_${userID}`, JSON.stringify(userData)));
    } else {
      return Promise.resolve();
    }
  }

  public toggleWatchlist(vendor_id: string, server_id: string): Promise<void> {
    const userID = this.auth.getUserID();
    if(userID) {
      let userWatchlist = JSON.parse(localStorage.getItem(`user_watchlist_${userID}`) || '[]');
      const index = userWatchlist.findIndex((item: any) => item.vendor_id === vendor_id && item.server_id === server_id);
      if(index === -1) {
        userWatchlist.push({ vendor_id, server_id });
      } else {
        userWatchlist.splice(index, 1);
      }
      return Promise.resolve(localStorage.setItem(`user_watchlist_${userID}`, JSON.stringify(userWatchlist)));
    } {
      return Promise.resolve();
    }
  }

  public async getWatchlist(): Promise<any> {
    const userID = this.auth.getUserID();
    if(userID) {
      return Promise.resolve(JSON.parse(localStorage.getItem(`user_watchlist_${userID}`) || '[]'));
    } else {
      return Promise.resolve([]);
    }
  }

  public async saveSearchHistory(searchObject: any): Promise<void> {
    const userID = this.auth.getUserID();
    if(userID && searchObject) {
      let searchHistory = JSON.parse(localStorage.getItem(`search_history_${userID}`) || '[]');
      searchHistory.push(searchObject);
      return Promise.resolve(localStorage.setItem(`search_history_${userID}`, JSON.stringify(searchHistory)));
    } else {
      return Promise.resolve();
    }
  }

  public async getSearchHistory(): Promise<any> {
    const userID = this.auth.getUserID();
    if(userID) {
      return Promise.resolve(JSON.parse(localStorage.getItem(`search_history_${userID}`) || '[]'));
    } else {
      return Promise.resolve([]);
    }
  }

  public async clearSearchHistory(): Promise<void> {
    const userID = this.auth.getUserID();
    if(userID) {
      return Promise.resolve(localStorage.setItem(`search_history_${userID}`, '[]'));
    } else {
      return Promise.resolve();
    }
  }



}
