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
  TableComplianceFrameworksTableComplianceFrameworkGetData,
  TableCountryTableCountryGetData,
  TableDatacenterTableDatacenterGetData,
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
  tableComplianceFrameworksTableComplianceFrameworkGet = (params: RequestParams = {}) =>
    this.http.request<TableComplianceFrameworksTableComplianceFrameworkGetData, any>({
      path: `/table/compliance_framework`,
      method: "GET",
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
      ...params,
    });
  /**
   * @description Return the Datacenter table as-is, without filtering options or relationships resolved.
   *
   * @tags Table dumps
   * @name TableDatacenterTableDatacenterGet
   * @summary Table Datacenter
   * @request GET:/table/datacenter
   */
  tableDatacenterTableDatacenterGet = (params: RequestParams = {}) =>
    this.http.request<TableDatacenterTableDatacenterGetData, any>({
      path: `/table/datacenter`,
      method: "GET",
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
      ...params,
    });
}
