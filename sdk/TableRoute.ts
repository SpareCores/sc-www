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
  TableBenchmarkTableBenchmarkGetData,
  TableComplianceFrameworksTableComplianceFrameworkGetData,
  TableCountryTableCountryGetData,
  TableMetadataServerTableServerMetaGetData,
  TableRegionTableRegionGetData,
  TableServerTableServerGetData,
  TableStorageTableStorageGetData,
  TableVendorTableVendorGetData,
  TableZoneTableZoneGetData,
} from "./data-contracts";

export namespace Table {
  /**
   * @description Return the Benchmark table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableBenchmarkTableBenchmarkGet
   * @summary Table Benchmark
   * @request GET:/table/benchmark
   */
  export namespace TableBenchmarkTableBenchmarkGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableBenchmarkTableBenchmarkGetData;
  }

  /**
   * @description Return the Country table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableCountryTableCountryGet
   * @summary Table Country
   * @request GET:/table/country
   */
  export namespace TableCountryTableCountryGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableCountryTableCountryGetData;
  }

  /**
   * @description Return the ComplianceFramework table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableComplianceFrameworksTableComplianceFrameworkGet
   * @summary Table Compliance Frameworks
   * @request GET:/table/compliance_framework
   */
  export namespace TableComplianceFrameworksTableComplianceFrameworkGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableComplianceFrameworksTableComplianceFrameworkGetData;
  }

  /**
   * @description Return the Vendor table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableVendorTableVendorGet
   * @summary Table Vendor
   * @request GET:/table/vendor
   */
  export namespace TableVendorTableVendorGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableVendorTableVendorGetData;
  }

  /**
   * @description Return the Region table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableRegionTableRegionGet
   * @summary Table Region
   * @request GET:/table/region
   */
  export namespace TableRegionTableRegionGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableRegionTableRegionGetData;
  }

  /**
   * @description Return the Zone table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableZoneTableZoneGet
   * @summary Table Zone
   * @request GET:/table/zone
   */
  export namespace TableZoneTableZoneGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableZoneTableZoneGetData;
  }

  /**
   * @description Return the Server table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableServerTableServerGet
   * @summary Table Server
   * @request GET:/table/server
   */
  export namespace TableServerTableServerGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableServerTableServerGetData;
  }

  /**
   * @description Return the Storage table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableStorageTableStorageGet
   * @summary Table Storage
   * @request GET:/table/storage
   */
  export namespace TableStorageTableStorageGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableStorageTableStorageGetData;
  }

  /**
   * @description Server table and column names and comments.
   * @tags Table metadata
   * @name TableMetadataServerTableServerMetaGet
   * @summary Table Metadata Server
   * @request GET:/table/server/meta
   */
  export namespace TableMetadataServerTableServerMetaGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableMetadataServerTableServerMetaGetData;
  }
}
