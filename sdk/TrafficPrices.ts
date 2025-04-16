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
  SearchTrafficPricesTrafficPricesGetData,
  SearchTrafficPricesTrafficPricesGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class TrafficPrices<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Resources
   * @name SearchTrafficPricesTrafficPricesGet
   * @summary Search Traffic Prices
   * @request GET:/traffic_prices
   */
  searchTrafficPricesTrafficPricesGet = (
    query: SearchTrafficPricesTrafficPricesGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<SearchTrafficPricesTrafficPricesGetData, HTTPValidationError>({
      path: `/traffic_prices`,
      method: "GET",
      query: query,
      ...params,
    });
}
