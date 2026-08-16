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
  SearchDatabasesDatabasesGetData,
  SearchDatabasesDatabasesGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Databases<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Resources
   * @name SearchDatabasesDatabasesGet
   * @summary Search Databases
   * @request GET:/databases
   */
  searchDatabasesDatabasesGet = (
    query: SearchDatabasesDatabasesGetParams = {},
    params: RequestParams = {},
  ) =>
    this.http.request<SearchDatabasesDatabasesGetData, HTTPValidationError>({
      path: `/databases`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
