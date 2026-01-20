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

import { SearchBenchmarkConfigsBenchmarkConfigsGetData } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class BenchmarkConfigs<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Resources
   * @name SearchBenchmarkConfigsBenchmarkConfigsGet
   * @summary Search Benchmark Configs
   * @request GET:/benchmark_configs
   */
  searchBenchmarkConfigsBenchmarkConfigsGet = (params: RequestParams = {}) =>
    this.http.request<SearchBenchmarkConfigsBenchmarkConfigsGetData, any>({
      path: `/benchmark_configs`,
      method: "GET",
      format: "json",
      ...params,
    });
}
