/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  HTTPValidationError,
  SearchDatabaseStoragePricesDatabaseStoragePricesGetData,
  SearchDatabaseStoragePricesDatabaseStoragePricesGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class DatabaseStoragePrices<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Resources
   * @name SearchDatabaseStoragePricesDatabaseStoragePricesGet
   * @summary Search Database Storage Prices
   * @request GET:/database_storage_prices
   */
  searchDatabaseStoragePricesDatabaseStoragePricesGet = (
    query: SearchDatabaseStoragePricesDatabaseStoragePricesGetParams = {},
    params: RequestParams = {},
  ) =>
    this.http.request<
      SearchDatabaseStoragePricesDatabaseStoragePricesGetData,
      HTTPValidationError
    >({
      path: `/database_storage_prices`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
