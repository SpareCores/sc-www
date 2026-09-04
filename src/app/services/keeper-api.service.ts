import { HttpClient } from "@angular/common/http";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { Auth } from "./auth/auth";
import { MYHTTPClient } from "./my_http/my-http";
import { Server } from "../../../sdk/Server";
import { Servers } from "../../../sdk/Servers";
import {
  AssistServerFiltersAiAssistServerFiltersGetParams,
  GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetData,
  GetDatabasePricesDatabaseVendorDatabasePricesGetData,
  GetDatabasePricesDatabaseVendorDatabasePricesGetParams,
  GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetData,
  HTTPValidationError,
  SearchDatabasesDatabasesGetData,
  SearchDatabasesDatabasesGetParams,
  SearchServerPricesServerPricesGetParams,
  SearchServersServersGetParams,
  SearchStoragePricesStoragePricesGetParams,
  SearchTrafficPricesTrafficPricesGetParams,
  TableServerSelectTableServerSelectGetData,
  TableServerSelectTableServerSelectGetParams,
} from "../../../sdk/data-contracts";
import { Table } from "../../../sdk/Table";
import { Ai } from "../../../sdk/Ai";
import { ServerPrices } from "../../../sdk/ServerPrices";
import { StoragePrices } from "../../../sdk/StoragePrices";
import { V2 } from "../../../sdk/V2";
import { TrafficPrices } from "../../../sdk/TrafficPrices";
import { BenchmarkConfigs } from "../../../sdk/BenchmarkConfigs";
import { Debug } from "../../../sdk/Debug";
import { BenchmarkScoreStats } from "../../../sdk/BenchmarkScoreStats";
import { Databases } from "../../../sdk/Databases";
import { Database } from "../../../sdk/Database";

type KeeperApiResponse<T> = {
  body?: T;
  headers?: {
    get(name: string): string | null;
  };
};

type ServerSelectColumn = NonNullable<
  TableServerSelectTableServerSelectGetParams["columns"]
>;

type ServerSelectColumns = ServerSelectColumn[];

@Injectable({
  providedIn: "root",
})
export class KeeperAPIService {
  private platformId = inject(PLATFORM_ID);
  private httpClient = inject(HttpClient);
  private auth = inject(Auth);

  public myHttp = new MYHTTPClient(this.httpClient, this.platformId, this.auth);

  public SearchController: Servers = new Servers(this.myHttp);
  public ServerController: Server = new Server(this.myHttp);
  public ServerPricesController: ServerPrices = new ServerPrices(this.myHttp);
  public DatabasesController: Databases = new Databases(this.myHttp);
  public DatabaseController: Database = new Database(this.myHttp);
  public TableController: Table = new Table(this.myHttp);
  public AIController: Ai = new Ai(this.myHttp);
  public StorageController: StoragePrices = new StoragePrices(this.myHttp);
  public TrafficController: TrafficPrices = new TrafficPrices(this.myHttp);
  public BenchmarksController: BenchmarkConfigs = new BenchmarkConfigs(
    this.myHttp,
  );
  public BenchmarkScoreStatsController: BenchmarkScoreStats =
    new BenchmarkScoreStats(this.myHttp);
  public V2Controller: V2 = new V2(this.myHttp);
  public debugController: Debug = new Debug(this.myHttp);

  public getServerV2(vendor: string, id: string): Promise<any> {
    return this.V2Controller.getServerWithoutRelationsV2ServerVendorServerGet({
      vendor,
      server: id,
    });
  }

  public getServerPrices(
    vendor: string,
    id: string,
    currency?: string,
  ): Promise<any> {
    return this.ServerController.getServerPricesServerVendorServerPricesGet({
      vendor,
      server: id,
      currency,
    });
  }

  public getServerBenchmark(vendor: string, id: string): Promise<any> {
    return this.ServerController.getServerBenchmarksServerVendorServerBenchmarksGet(
      { vendor, server: id },
    );
  }

  public getServerSimilarServers(
    vendor: string,
    id: string,
    category: "family" | "specs" | "score" | "score_per_price",
    limit: number,
  ): Promise<any> {
    return this.ServerController.getSimilarServersServerVendorServerSimilarServersByNumGet(
      { vendor, server: id, by: category, num: limit },
    );
  }

  public getServerDescriptions(vendor: string, id: string): Promise<any> {
    return this.ServerController.getServerDescriptionsServerVendorServerDescriptionsGet(
      { vendor, server: id },
    );
  }

  public searchServers(query: SearchServersServersGetParams): Promise<any> {
    return this.SearchController.searchServersServersGet(query);
  }

  public searchDatabases(
    query: SearchDatabasesDatabasesGetParams,
  ): Promise<KeeperApiResponse<SearchDatabasesDatabasesGetData>> {
    return this.DatabasesController.searchDatabasesDatabasesGet(
      query,
    ) as unknown as Promise<KeeperApiResponse<SearchDatabasesDatabasesGetData>>;
  }

  public getDatabase(
    vendor: string,
    database: string,
  ): Promise<
    KeeperApiResponse<GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetData>
  > {
    return this.DatabaseController.getDatabaseWithoutRelationsDatabaseVendorDatabaseGet(
      { vendor, database },
    ) as unknown as Promise<
      KeeperApiResponse<GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetData>
    >;
  }

  public getDatabasePrices(
    vendor: string,
    database: string,
    query: Omit<
      GetDatabasePricesDatabaseVendorDatabasePricesGetParams,
      "vendor" | "database"
    > = {},
  ): Promise<
    KeeperApiResponse<GetDatabasePricesDatabaseVendorDatabasePricesGetData>
  > {
    return this.DatabaseController.getDatabasePricesDatabaseVendorDatabasePricesGet(
      { vendor, database, ...query },
    ) as unknown as Promise<
      KeeperApiResponse<GetDatabasePricesDatabaseVendorDatabasePricesGetData>
    >;
  }

  public getDatabaseBenchmarks(
    vendor: string,
    database: string,
  ): Promise<
    KeeperApiResponse<GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetData>
  > {
    return this.DatabaseController.getDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGet(
      { vendor, database },
    ) as unknown as Promise<
      KeeperApiResponse<GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetData>
    >;
  }

  public searchServerPrices(
    query: SearchServerPricesServerPricesGetParams,
  ): Promise<any> {
    return this.ServerPricesController.searchServerPricesServerPricesGet(query);
  }

  public parsePromptFor(
    type: string,
    query: AssistServerFiltersAiAssistServerFiltersGetParams,
  ): Promise<any> {
    switch (type) {
      case "traffic_prices":
        return this.AIController.assistTrafficPriceFiltersAiAssistTrafficPriceFiltersGet(
          query,
        );
      case "storages":
        return this.AIController.assistStoragePriceFiltersAiAssistStoragePriceFiltersGet(
          query,
        );
      case "server_prices":
        return this.AIController.assistServerPriceFiltersAiAssistServerPriceFiltersGet(
          query,
        );
      case "databases":
        return this.AIController.assistDatabaseFiltersAiAssistDatabaseFiltersGet(
          query,
        );
      case "servers":
      default:
        return this.AIController.assistServerFiltersAiAssistServerFiltersGet(
          query,
        );
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

  public getServersSelect(columns: ServerSelectColumns): Promise<any> {
    return this.TableController.http.request<
      TableServerSelectTableServerSelectGetData,
      HTTPValidationError
    >({
      path: `/table/server/select`,
      method: "GET",
      query: { columns },
      format: "json",
    });
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

  public getBenchmarkWorkloads(): Promise<any> {
    return this.BenchmarkScoreStatsController.getBenchmarkScoreStatsBenchmarkScoreStatsGet();
  }

  public getStorages(): Promise<any> {
    return this.TableController.tableStorageTableStorageGet();
  }

  public getStoragePrices(
    query: SearchStoragePricesStoragePricesGetParams,
  ): Promise<any> {
    return this.StorageController.searchStoragePricesStoragePricesGet(query);
  }

  public getTrafficPrices(
    query: SearchTrafficPricesTrafficPricesGetParams,
  ): Promise<any> {
    return this.TrafficController.searchTrafficPricesTrafficPricesGet(query);
  }

  public getBenchmarkConfigs(): Promise<any> {
    return this.BenchmarksController.searchBenchmarkConfigsBenchmarkConfigsGet();
  }

  public getDebugInfo(): Promise<any> {
    return this.debugController.getDebugInfoDebugGet();
  }
}
