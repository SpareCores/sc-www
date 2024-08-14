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
  SearchServerPricesServerPricesGetData,
  SearchServerPricesServerPricesGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class ServerPrices<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Resources
   * @name SearchServerPricesServerPricesGet
   * @summary Search Server Prices
   * @request GET:/server_prices
   */
  searchServerPricesServerPricesGet = (query: SearchServerPricesServerPricesGetParams, params: RequestParams = {}) =>
    this.http.request<SearchServerPricesServerPricesGetData, HTTPValidationError>({
      path: `/server_prices`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
