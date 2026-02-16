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
  GetStatsStatsGetData,
  GetStatsStatsGetParams,
  HTTPValidationError,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Stats<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Return counts of records in each table, optionally filtered by vendor and status.
   *
   * @tags Administrative endpoints
   * @name GetStatsStatsGet
   * @summary Get Stats
   * @request GET:/stats
   */
  getStatsStatsGet = (
    query: GetStatsStatsGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<GetStatsStatsGetData, HTTPValidationError>({
      path: `/stats`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
