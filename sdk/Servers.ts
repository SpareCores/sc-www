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
  SearchServersServersGetData,
  SearchServersServersGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Servers<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Resources
   * @name SearchServersServersGet
   * @summary Search Servers
   * @request GET:/servers
   */
  searchServersServersGet = (
    query: SearchServersServersGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<SearchServersServersGetData, HTTPValidationError>({
      path: `/servers`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
