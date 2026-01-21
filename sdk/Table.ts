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
  TableBenchmarkTableBenchmarkGetData,
  TableComplianceFrameworksTableComplianceFrameworkGetData,
  TableCountryTableCountryGetData,
  TableMetadataServerTableServerMetaGetData,
  TableRegionTableRegionGetData,
  TableServerPricesTableServerPricesGetData,
  TableServerPricesTableServerPricesGetParams,
  TableServerTableServerGetData,
  TableStorageTableStorageGetData,
  TableVendorTableVendorGetData,
  TableZoneTableZoneGetData,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Table<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Return the Benchmark table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableBenchmarkTableBenchmarkGet
   * @summary Table Benchmark
   * @request GET:/table/benchmark
   */
  tableBenchmarkTableBenchmarkGet = (params: RequestParams = {}) =>
    this.http.request<TableBenchmarkTableBenchmarkGetData, any>({
      path: `/table/benchmark`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Return the Country table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableCountryTableCountryGet
   * @summary Table Country
   * @request GET:/table/country
   */
  tableCountryTableCountryGet = (params: RequestParams = {}) =>
    this.http.request<TableCountryTableCountryGetData, any>({
      path: `/table/country`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Return the ComplianceFramework table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableComplianceFrameworksTableComplianceFrameworkGet
   * @summary Table Compliance Frameworks
   * @request GET:/table/compliance_framework
   */
  tableComplianceFrameworksTableComplianceFrameworkGet = (
    params: RequestParams = {},
  ) =>
    this.http.request<
      TableComplianceFrameworksTableComplianceFrameworkGetData,
      any
    >({
      path: `/table/compliance_framework`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Return the Vendor table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableVendorTableVendorGet
   * @summary Table Vendor
   * @request GET:/table/vendor
   */
  tableVendorTableVendorGet = (params: RequestParams = {}) =>
    this.http.request<TableVendorTableVendorGetData, any>({
      path: `/table/vendor`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Return the Region table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableRegionTableRegionGet
   * @summary Table Region
   * @request GET:/table/region
   */
  tableRegionTableRegionGet = (params: RequestParams = {}) =>
    this.http.request<TableRegionTableRegionGetData, any>({
      path: `/table/region`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Return the Zone table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableZoneTableZoneGet
   * @summary Table Zone
   * @request GET:/table/zone
   */
  tableZoneTableZoneGet = (params: RequestParams = {}) =>
    this.http.request<TableZoneTableZoneGetData, any>({
      path: `/table/zone`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Return the Server table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableServerTableServerGet
   * @summary Table Server
   * @request GET:/table/server
   */
  tableServerTableServerGet = (params: RequestParams = {}) =>
    this.http.request<TableServerTableServerGetData, any>({
      path: `/table/server`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Query ServerPrices records without relationships resolved.
   *
   * @tags Table dumps
   * @name TableServerPricesTableServerPricesGet
   * @summary Table Server Prices
   * @request GET:/table/server_prices
   * @secure
   */
  tableServerPricesTableServerPricesGet = (
    query: TableServerPricesTableServerPricesGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      TableServerPricesTableServerPricesGetData,
      HTTPValidationError
    >({
      path: `/table/server_prices`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Return the Storage table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableStorageTableStorageGet
   * @summary Table Storage
   * @request GET:/table/storage
   */
  tableStorageTableStorageGet = (params: RequestParams = {}) =>
    this.http.request<TableStorageTableStorageGetData, any>({
      path: `/table/storage`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Server table and column names and comments.
   *
   * @tags Table metadata
   * @name TableMetadataServerTableServerMetaGet
   * @summary Table Metadata Server
   * @request GET:/table/server/meta
   */
  tableMetadataServerTableServerMetaGet = (params: RequestParams = {}) =>
    this.http.request<TableMetadataServerTableServerMetaGetData, any>({
      path: `/table/server/meta`,
      method: "GET",
      format: "json",
      ...params,
    });
}
