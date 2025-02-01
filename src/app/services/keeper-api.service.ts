import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MYHTTPClient } from './my_http/my-http';
import { Server } from '../../../sdk/Server';
import { Servers } from '../../../sdk/Servers';
import { AssistServerFiltersAiAssistServerFiltersGetParams, SearchServerPricesServerPricesGetParams, SearchServersServersGetParams, SearchStoragePricesStoragePricesGetParams, SearchTrafficPricesTrafficPricesGetParams } from '../../../sdk/data-contracts';
import { Table } from '../../../sdk/Table';
import { Ai } from '../../../sdk/Ai';
import { ServerPrices } from '../../../sdk/ServerPrices';
import { StoragePrices } from '../../../sdk/StoragePrices';
import { V2 } from '../../../sdk/V2';
import { TrafficPrices } from '../../../sdk/TrafficPrices';
import { BenchmarkConfigs } from '../../../sdk/BenchmarkConfigs';

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
  public TrafficController: TrafficPrices = new TrafficPrices(this.myHttp);
  public BenchmarksController: BenchmarkConfigs = new BenchmarkConfigs(this.myHttp);
  public V2Controller: V2 = new V2(this.myHttp);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private httpClient: HttpClient) {
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


  public getServerSimilarServers(vendor: string, id: string, category: "family" | "specs" | "score" | "score_per_price", limit: number): Promise<any> {
    return this.ServerController.getSimilarServersServerVendorServerSimilarServersByNumGet({vendor, server: id, by: category, num: limit});
  }

  public searchServers(query: SearchServersServersGetParams): Promise<any> {
    return this.SearchController.searchServersServersGet(query);
  }

  public searchServerPrices(query: SearchServerPricesServerPricesGetParams): Promise<any> {
    return this.ServerPricesController.searchServerPricesServerPricesGet(query);
  }

  public parsePromptFor(type: string, query: AssistServerFiltersAiAssistServerFiltersGetParams): Promise<any> {
    switch (type) {
      case 'traffic_prices':
        return this.AIController.assistTrafficPriceFiltersAiAssistTrafficPriceFiltersGet(query);
      case 'storages':
        return this.AIController.assistStoragePriceFiltersAiAssistStoragePriceFiltersGet(query);
      case 'server_prices':
        return this.AIController.assistServerPriceFiltersAiAssistServerPriceFiltersGet(query);
      case 'servers':
      default:
        return this.AIController.assistServerFiltersAiAssistServerFiltersGet(query);
    }
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

  public getTrafficPrices(query: SearchTrafficPricesTrafficPricesGetParams): Promise<any> {
    return this.TrafficController.searchTrafficPricesTrafficPricesGet(query);
  }

  public getBenchmarkConfigs(): Promise<any> {
    return this.BenchmarksController.searchBenchmarkConfigsBenchmarkConfigsGet();
  }

}
