import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MYHTTPClient } from './my_http/my-http';
import { Server } from '../../../sdk/Server';
import { Servers } from '../../../sdk/Servers';
import { SearchServersServersGetParams } from '../../../sdk/data-contracts';
import { Table } from '../../../sdk/Table';

@Injectable({
  providedIn: 'root'
})
export class KeeperAPIService {

  public myHttp = new MYHTTPClient(this.httpClient, this.platformId);

  public SearchController: Servers = new Servers(this.myHttp);
  public ServerController: Server = new Server(this.myHttp);
  public TableController: Table = new Table(this.myHttp);


  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private httpClient: HttpClient) {
  }

  public getServer(vendor: string, id: string): Promise<any> {
    return this.ServerController.getServerServerVendorIdServerIdGet(vendor, id);
  }

  public searchServers(query: SearchServersServersGetParams): Promise<any> {
    return this.SearchController.searchServersServersGet(query);
  }

  public parseFreetextSearch(query: string): Promise<any> {
    // return mock data
    return new Promise((resolve, reject) => {
      resolve({

      });
    });
    //return this.SearchController.parseFreetextSearch(query);
  }

  public getCountries(): Promise<any> {
    return this.TableController.tableCountryTableCountryGet();
  }

  public getVendors(): Promise<any> {
    return this.TableController.tableVendorTableVendorGet();
  }

  public getDatacenters(): Promise<any> {
    return this.TableController.tableDatacenterTableDatacenterGet();
  }

  public getServers(): Promise<any> {
    return this.TableController.tableServerTableServerGet();
  }

}
