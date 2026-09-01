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
  GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetData,
  GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetParams,
  GetDatabasePricesDatabaseVendorDatabasePricesGetData,
  GetDatabasePricesDatabaseVendorDatabasePricesGetParams,
  GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetData,
  GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetParams,
  HTTPValidationError,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Database<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Query a single database by its vendor id and either the database id or its API reference.
   *
   * @tags Database Details
   * @name GetDatabaseWithoutRelationsDatabaseVendorDatabaseGet
   * @summary Get Database Without Relations
   * @request GET:/database/{vendor}/{database}
   */
  getDatabaseWithoutRelationsDatabaseVendorDatabaseGet = (
    {
      vendor,
      database,
    }: GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetData,
      HTTPValidationError
    >({
      path: `/database/${vendor}/${database}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Query the current prices of a single database by its vendor id and database id.
   *
   * @tags Database Details
   * @name GetDatabasePricesDatabaseVendorDatabasePricesGet
   * @summary Get Database Prices
   * @request GET:/database/{vendor}/{database}/prices
   */
  getDatabasePricesDatabaseVendorDatabasePricesGet = (
    {
      vendor,
      database,
      ...query
    }: GetDatabasePricesDatabaseVendorDatabasePricesGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      GetDatabasePricesDatabaseVendorDatabasePricesGetData,
      HTTPValidationError
    >({
      path: `/database/${vendor}/${database}/prices`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Query the current benchmark scores of a single database.
   *
   * @tags Database Details
   * @name GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGet
   * @summary Get Database Benchmarks
   * @request GET:/database/{vendor}/{database}/benchmarks
   */
  getDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGet = (
    {
      vendor,
      database,
    }: GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetData,
      HTTPValidationError
    >({
      path: `/database/${vendor}/${database}/benchmarks`,
      method: "GET",
      format: "json",
      ...params,
    });
}
