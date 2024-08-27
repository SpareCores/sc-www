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
  GetServerServerVendorServerGetData,
  GetServerServerVendorServerGetParams,
  GetSimilarServersServerVendorServerSimilarServersByNGetData,
  GetSimilarServersServerVendorServerSimilarServersByNGetParams,
  HTTPValidationError,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Server<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Query a single server by its vendor id and either the server or, or its API reference. Return dictionary includes all server fields, along with the current prices per zone, and the available benchmark scores.
   *
   * @tags Server Details
   * @name GetServerServerVendorServerGet
   * @summary Get Server
   * @request GET:/server/{vendor}/{server}
   * @deprecated
   */
  getServerServerVendorServerGet = (
    { vendor, server, ...query }: GetServerServerVendorServerGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<GetServerServerVendorServerGetData, HTTPValidationError>({
      path: `/server/${vendor}/${server}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Search similar servers to the provided one. The "family" method returns all servers from the same family of the same vendor. The "specs" approach will prioritize the number of GPUs, then CPUs, lastly the amount of memory. The "score" method will find the servers with the closest performance using the multi-core SCore.
   *
   * @tags Server Details
   * @name GetSimilarServersServerVendorServerSimilarServersByNGet
   * @summary Get Similar Servers
   * @request GET:/server/{vendor}/{server}/similar_servers/{by}/{n}
   */
  getSimilarServersServerVendorServerSimilarServersByNGet = (
    { vendor, server, by, n, ...query }: GetSimilarServersServerVendorServerSimilarServersByNGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<GetSimilarServersServerVendorServerSimilarServersByNGetData, HTTPValidationError>({
      path: `/server/${vendor}/${server}/similar_servers/${by}/${n}`,
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
  getServerPricesServerVendorServerPricesGet = (vendor: string, server: string, params: RequestParams = {}) =>
    this.http.request<GetServerPricesServerVendorServerPricesGetData, HTTPValidationError>({
      path: `/server/${vendor}/${server}/prices`,
      method: "GET",
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
