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
  SearchStoragePricesStoragePricesGetData,
  SearchStoragePricesStoragePricesGetParams,
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
   * @tags Query Resources
   * @name SearchStoragePricesStoragePricesGet
   * @summary Search Storage Prices
   * @request GET:/storage_prices
   */
  searchStoragePricesStoragePricesGet = (
    query: SearchStoragePricesStoragePricesGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<SearchStoragePricesStoragePricesGetData, HTTPValidationError>({
      path: `/storage_prices`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
