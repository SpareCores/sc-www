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
  SearchDatacentersDatacentersGetData,
  SearchDatacentersDatacentersGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Datacenters<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Resources
   * @name SearchDatacentersDatacentersGet
   * @summary Search Datacenters
   * @request GET:/datacenters
   */
  searchDatacentersDatacentersGet = (query: SearchDatacentersDatacentersGetParams, params: RequestParams = {}) =>
    this.http.request<SearchDatacentersDatacentersGetData, HTTPValidationError>({
      path: `/datacenters`,
      method: "GET",
      query: query,
      ...params,
    });
}
