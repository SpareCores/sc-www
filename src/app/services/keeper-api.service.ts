import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MYHTTPClient } from './my_http/my-http';
import { Search } from '../../../sdk/Search';
import { Server } from '../../../sdk/Server';
import { Metatable } from '../../../sdk/Metatable';
import { MetaTables, SearchServerSearchGetParams } from '../../../sdk/data-contracts';

@Injectable({
  providedIn: 'root'
})
export class KeeperAPIService {

  public myHttp = new MYHTTPClient(this.httpClient, this.platformId);

  public SearchController: Search = new Search(this.myHttp);
  public ServerController: Server = new Server(this.myHttp);
  public MetadataController: Metatable = new Metatable(this.myHttp);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private httpClient: HttpClient) {
  }

  public getServer(vendor: string, id: string): Promise<any> {
    return this.ServerController.getServerServerVendorIdServerIdGet(vendor, id);
  }

  public searchServers(query: SearchServerSearchGetParams): Promise<any> {
    return this.SearchController.searchServerSearchGet(query);
  }

  public parseFreetextSearch(query: string): Promise<any> {
    // return mock data
    return new Promise((resolve, reject) => {
      resolve({

      });
    });
    //return this.SearchController.parseFreetextSearch(query);
  }

  public getMetaTable(tableName: MetaTables): Promise<any> {
    return this.MetadataController.metadataMetatableMetaTableGet(tableName);
  }

}
