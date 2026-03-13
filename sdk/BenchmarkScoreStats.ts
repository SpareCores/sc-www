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

import { GetBenchmarkScoreStatsBenchmarkScoreStatsGetData } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class BenchmarkScoreStats<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Return aggregate stats and score distribution histograms for each benchmark. For every benchmark in the Benchmark table, returns: - Basic benchmark metadata (name, framework, unit, etc.) - Count of active, non-null score records - Count of distinct (vendor_id, server_id) pairs - A 20-bin histogram of the score distribution (breakpoints + per-bucket counts) Aggregation and histogram binning are done in SQL to avoid transferring millions of BenchmarkScore rows. Due to the complexity of the query, not using sqlalchemy markup.
   *
   * @tags Administrative endpoints
   * @name GetBenchmarkScoreStatsBenchmarkScoreStatsGet
   * @summary Get Benchmark Score Stats
   * @request GET:/benchmark_score_stats
   */
  getBenchmarkScoreStatsBenchmarkScoreStatsGet = (params: RequestParams = {}) =>
    this.http.request<GetBenchmarkScoreStatsBenchmarkScoreStatsGetData, any>({
      path: `/benchmark_score_stats`,
      method: "GET",
      format: "json",
      ...params,
    });
}
