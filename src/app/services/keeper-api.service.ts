import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MYHTTPClient } from './my_http/my-http';
import { Search } from '../../../sdk/Search';
import { Server } from '../../../sdk/Server';
import { SearchServerSearchGetData, SearchServerSearchGetParams } from '../../../sdk/data-contracts';

@Injectable({
  providedIn: 'root'
})
export class KeeperAPIService {

  public myHttp = new MYHTTPClient(this.httpClient, this.platformId);

  public SearchController: Search = new Search(this.myHttp);
  public ServerController: Server = new Server(this.myHttp);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private httpClient: HttpClient) {
  }

  public getServer(vendor: string, id: string) {
    return this.ServerController.readServerServerVendorIdServerIdGet(vendor, id);
  }

  public searchServers(query: SearchServerSearchGetParams): Promise<SearchServerSearchGetData> {
    console.log('Searching servers with query:', query);
    return this.SearchController.searchServerSearchGet(query) as any  as Promise<SearchServerSearchGetData>;
  }

}
