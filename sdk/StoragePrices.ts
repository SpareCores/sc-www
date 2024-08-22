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
  HTTPValidationError,
  TableStoragePricesStoragePricesGetData,
  TableStoragePricesStoragePricesGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class StoragePrices<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @name TableStoragePricesStoragePricesGet
   * @summary Table Storage Prices
   * @request GET:/storage_prices
   */
  tableStoragePricesStoragePricesGet = (query: TableStoragePricesStoragePricesGetParams, params: RequestParams = {}) =>
    this.http.request<TableStoragePricesStoragePricesGetData, HTTPValidationError>({
      path: `/storage_prices`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
