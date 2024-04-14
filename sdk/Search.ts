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

import { HTTPValidationError, SearchServerSearchGetData, SearchServerSearchGetParams } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Search<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @name SearchServerSearchGet
   * @summary Search Server
   * @request GET:/search
   */
  searchServerSearchGet = (query: SearchServerSearchGetParams, params: RequestParams = {}) =>
    this.http.request<SearchServerSearchGetData, HTTPValidationError>({
      path: `/search`,
      method: "GET",
      query: query,
      ...params,
    });
}
