/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  GetServerBenchmarksServerVendorServerBenchmarksGetData,
  GetServerPricesServerVendorServerPricesGetData,
  GetServerPricesServerVendorServerPricesGetParams,
  GetSimilarServersServerVendorServerSimilarServersByNumGetData,
  GetSimilarServersServerVendorServerSimilarServersByNumGetParams,
  HTTPValidationError,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Server<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Search similar servers to the provided one. The "family" method returns all servers from the same family of the same vendor. The "specs" approach will prioritize the number of GPUs, then CPUs, lastly the amount of memory. The "score" method will find the servers with the closest performance using the multi-core SCore. The "score_per_price" method is similar to "score", but instead of using the multi-core SCore, it uses the SCore per price.
   *
   * @tags Server Details
   * @name GetSimilarServersServerVendorServerSimilarServersByNumGet
   * @summary Get Similar Servers
   * @request GET:/server/{vendor}/{server}/similar_servers/{by}/{num}
   */
  getSimilarServersServerVendorServerSimilarServersByNumGet = (
    { vendor, server, by, num, ...query }: GetSimilarServersServerVendorServerSimilarServersByNumGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<GetSimilarServersServerVendorServerSimilarServersByNumGetData, HTTPValidationError>({
      path: `/server/${vendor}/${server}/similar_servers/${by}/${num}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Query the current prices of a single server by its vendor id and server id.
   *
   * @tags Server Details
   * @name GetServerPricesServerVendorServerPricesGet
   * @summary Get Server Prices
   * @request GET:/server/{vendor}/{server}/prices
   */
  getServerPricesServerVendorServerPricesGet = (
    { vendor, server, ...query }: GetServerPricesServerVendorServerPricesGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<GetServerPricesServerVendorServerPricesGetData, HTTPValidationError>({
      path: `/server/${vendor}/${server}/prices`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Query the current benchmark scores of a single server.
   *
   * @tags Server Details
   * @name GetServerBenchmarksServerVendorServerBenchmarksGet
   * @summary Get Server Benchmarks
   * @request GET:/server/{vendor}/{server}/benchmarks
   */
  getServerBenchmarksServerVendorServerBenchmarksGet = (vendor: string, server: string, params: RequestParams = {}) =>
    this.http.request<GetServerBenchmarksServerVendorServerBenchmarksGetData, HTTPValidationError>({
      path: `/server/${vendor}/${server}/benchmarks`,
      method: "GET",
      format: "json",
      ...params,
    });
}
