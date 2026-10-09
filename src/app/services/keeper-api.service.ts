import { HttpClient } from "@angular/common/http";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { AuthStateService } from "../core/auth";
import { KeeperHttpClient } from "./keeper-http-client";
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
import type { RequestParams } from "../../../sdk/http-client";

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
  private angularHttp = inject(HttpClient);
  private auth = inject(AuthStateService);

  public httpClient = new KeeperHttpClient(
    this.angularHttp,
    this.platformId,
    this.auth,
  );

  public SearchController: Servers = new Servers(this.httpClient);
  public ServerController: Server = new Server(this.httpClient);
  public ServerPricesController: ServerPrices = new ServerPrices(
    this.httpClient,
  );
  public DatabasesController: Databases = new Databases(this.httpClient);
  public DatabaseController: Database = new Database(this.httpClient);
  public TableController: Table = new Table(this.httpClient);
  public AIController: Ai = new Ai(this.httpClient);
  public StorageController: StoragePrices = new StoragePrices(this.httpClient);
  public TrafficController: TrafficPrices = new TrafficPrices(this.httpClient);
  public BenchmarksController: BenchmarkConfigs = new BenchmarkConfigs(
    this.httpClient,
  );
  public BenchmarkScoreStatsController: BenchmarkScoreStats =
    new BenchmarkScoreStats(this.httpClient);
  public V2Controller: V2 = new V2(this.httpClient);
  public debugController: Debug = new Debug(this.httpClient);

  public getServerV2(
    vendor: string,
    id: string,
    params: RequestParams = {},
  ): Promise<any> {
    return this.V2Controller.getServerWithoutRelationsV2ServerVendorServerGet(
      {
        vendor,
        server: id,
      },
      params,
    );
  }

  public getServerPrices(
    vendor: string,
    id: string,
    currency?: string,
    params: RequestParams = {},
  ): Promise<any> {
    return this.ServerController.getServerPricesServerVendorServerPricesGet(
      {
        vendor,
        server: id,
        currency,
      },
      params,
    );
  }

  public getServerBenchmark(
    vendor: string,
    id: string,
    params: RequestParams = {},
  ): Promise<any> {
    return this.ServerController.getServerBenchmarksServerVendorServerBenchmarksGet(
      { vendor, server: id },
      params,
    );
  }

  public getServerSimilarServers(
    vendor: string,
    id: string,
    category: "family" | "specs" | "score" | "score_per_price",
    limit: number,
    params: RequestParams = {},
  ): Promise<any> {
    return this.ServerController.getSimilarServersServerVendorServerSimilarServersByNumGet(
      { vendor, server: id, by: category, num: limit },
      params,
    );
  }

  public getServerDescriptions(
    vendor: string,
    id: string,
    params: RequestParams = {},
  ): Promise<any> {
    return this.ServerController.getServerDescriptionsServerVendorServerDescriptionsGet(
      { vendor, server: id },
      params,
    );
  }

  public searchServers(
    query: SearchServersServersGetParams,
    params: RequestParams = {},
  ): Promise<any> {
    return this.SearchController.searchServersServersGet(query, params);
  }

  public searchDatabases(
    query: SearchDatabasesDatabasesGetParams,
    params: RequestParams = {},
  ): Promise<KeeperApiResponse<SearchDatabasesDatabasesGetData>> {
    return this.DatabasesController.searchDatabasesDatabasesGet(
      query,
      params,
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
    params: RequestParams = {},
  ): Promise<any> {
    return this.ServerPricesController.searchServerPricesServerPricesGet(
      query,
      params,
    );
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

  public getCountries(params: RequestParams = {}): Promise<any> {
    return this.TableController.tableCountryTableCountryGet(params);
  }

  public getVendors(params: RequestParams = {}): Promise<any> {
    return this.TableController.tableVendorTableVendorGet(params);
  }

  public getRegions(params: RequestParams = {}): Promise<any> {
    return this.TableController.tableRegionTableRegionGet(params);
  }

  public getZones(params: RequestParams = {}): Promise<any> {
    return this.TableController.tableZoneTableZoneGet(params);
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

  public getServerMeta(params: RequestParams = {}): Promise<any> {
    return this.TableController.tableMetadataServerTableServerMetaGet(params);
  }

  public getComplianceFrameworks(params: RequestParams = {}): Promise<any> {
    return this.TableController.tableComplianceFrameworksTableComplianceFrameworkGet(
      params,
    );
  }

  public getServerBenchmarkMeta(params: RequestParams = {}): Promise<any> {
    return this.TableController.tableBenchmarkTableBenchmarkGet(params);
  }

  public getBenchmarkWorkloads(params: RequestParams = {}): Promise<any> {
    return this.BenchmarkScoreStatsController.getBenchmarkScoreStatsBenchmarkScoreStatsGet(
      params,
    );
  }

  public getStorages(params: RequestParams = {}): Promise<any> {
    return this.TableController.tableStorageTableStorageGet(params);
  }

  public getStoragePrices(
    query: SearchStoragePricesStoragePricesGetParams,
    params: RequestParams = {},
  ): Promise<any> {
    return this.StorageController.searchStoragePricesStoragePricesGet(
      query,
      params,
    );
  }

  public getTrafficPrices(
    query: SearchTrafficPricesTrafficPricesGetParams,
    params: RequestParams = {},
  ): Promise<any> {
    return this.TrafficController.searchTrafficPricesTrafficPricesGet(
      query,
      params,
    );
  }

  public getBenchmarkConfigs(params: RequestParams = {}): Promise<any> {
    return this.BenchmarksController.searchBenchmarkConfigsBenchmarkConfigsGet(
      params,
    );
  }

  public getDebugInfo(params: RequestParams = {}): Promise<any> {
    return this.debugController.getDebugInfoDebugGet(params);
  }
}
