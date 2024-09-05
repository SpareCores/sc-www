import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MYHTTPClient } from './my_http/my-http';
import { Server } from '../../../sdk/Server';
import { Servers } from '../../../sdk/Servers';
import { AssistServerFiltersAiAssistServerFiltersGetParams, AssistServerPriceFiltersAiAssistServerPriceFiltersGetParams, SearchServerPricesServerPricesGetParams, SearchServersServersGetParams, SearchStoragePricesStoragePricesGetParams } from '../../../sdk/data-contracts';
import { Table } from '../../../sdk/Table';
import { Ai } from '../../../sdk/Ai';
import { ServerPrices } from '../../../sdk/ServerPrices';
import { StoragePrices } from '../../../sdk/StoragePrices';
import { V2 } from '../../../sdk/V2';

@Injectable({
  providedIn: 'root'
})
export class KeeperAPIService {

  public myHttp = new MYHTTPClient(this.httpClient, this.platformId);

  public SearchController: Servers = new Servers(this.myHttp);
  public ServerController: Server = new Server(this.myHttp);
  public ServerPricesController: ServerPrices = new ServerPrices(this.myHttp);
  public TableController: Table = new Table(this.myHttp);
  public AIController: Ai = new Ai(this.myHttp);
  public StorageController: StoragePrices = new StoragePrices(this.myHttp);
  public V2Controller: V2 = new V2(this.myHttp);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private httpClient: HttpClient) {
  }

  public getServer(vendor: string, id: string, currency?: string): Promise<any> {
    return this.ServerController.getServerServerVendorServerGet({vendor, server:id, currency });
  }

  public getServerV2(vendor: string, id: string): Promise<any> {
    return this.V2Controller.getServerWithoutRelationsV2ServerVendorServerGet(vendor, id);
  }

  public getServerPrices(vendor: string, id: string, currency?: string): Promise<any> {
    return this.ServerController.getServerPricesServerVendorServerPricesGet({vendor, server: id, currency});
  }

  public getServerBenchmark(vendor: string, id: string): Promise<any> {
    return this.ServerController.getServerBenchmarksServerVendorServerBenchmarksGet(vendor, id);
  }


  public getServerSimilarServers(vendor: string, id: string, category: "family" | "specs" | "score", limit: number): Promise<any> {
    return this.ServerController.getSimilarServersServerVendorServerSimilarServersByNGet({vendor, server:id, by:category, n:limit});
  }

  public searchServers(query: SearchServersServersGetParams): Promise<any> {
    return this.SearchController.searchServersServersGet(query);
  }

  public searchServerPrices(query: SearchServerPricesServerPricesGetParams): Promise<any> {
    return this.ServerPricesController.searchServerPricesServerPricesGet(query);
  }

  public parsePromptforServers(query: AssistServerFiltersAiAssistServerFiltersGetParams): Promise<any> {
    return this.AIController.assistServerFiltersAiAssistServerFiltersGet(query);
  }

  public parsePromptforServerPrices(query: AssistServerPriceFiltersAiAssistServerPriceFiltersGetParams): Promise<any> {
    return this.AIController.assistServerPriceFiltersAiAssistServerPriceFiltersGet(query);
  }

  public getCountries(): Promise<any> {
    return this.TableController.tableCountryTableCountryGet();
  }

  public getVendors(): Promise<any> {
    return this.TableController.tableVendorTableVendorGet();
  }

  public getRegions(): Promise<any> {
    return this.TableController.tableRegionTableRegionGet();
  }

  public getZones(): Promise<any> {
    return this.TableController.tableZoneTableZoneGet();
  }

  public getServers(): Promise<any> {
    return this.TableController.tableServerTableServerGet();
  }

  public getServerMeta(): Promise<any> {
    return this.TableController.tableMetadataServerTableServerMetaGet();
  }

  public getComplianceFrameworks(): Promise<any> {
    return this.TableController.tableComplianceFrameworksTableComplianceFrameworkGet();
  }

  public getServerBenchmarkMeta(): Promise<any> {
    return this.TableController.tableBenchmarkTableBenchmarkGet();
  }

  public getStorages(): Promise<any> {
    return this.TableController.tableStorageTableStorageGet();
  }

  public getStoragePrices(query: SearchStoragePricesStoragePricesGetParams): Promise<any> {
    return this.StorageController.searchStoragePricesStoragePricesGet(query);
  }

}
