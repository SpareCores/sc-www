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

import { HTTPValidationError, SearchRegionsRegionsGetData, SearchRegionsRegionsGetParams } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Regions<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Resources
   * @name SearchRegionsRegionsGet
   * @summary Search Regions
   * @request GET:/regions
   */
  searchRegionsRegionsGet = (query: SearchRegionsRegionsGetParams, params: RequestParams = {}) =>
    this.http.request<SearchRegionsRegionsGetData, HTTPValidationError>({
      path: `/regions`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
