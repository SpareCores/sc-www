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
  DatabaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGetData,
  DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGetData,
  ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetData,
  ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGetData,
} from "./data-contracts";

export namespace Inspector {
  /**
   * @description Return block reason codes for the requested Server's inspector tasks.
   * @tags Inspector
   * @name ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGet
   * @summary Server Task Block Reason Codes
   * @request GET:/inspector/server/{vendor}/{server}/task_block_reason_codes
   */
  export namespace ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGet {
    export type RequestParams = {
      /**
       * Vendor
       * A Vendor's ID.
       */
      vendor: string;
      /**
       * Server
       * A Server's ID or API reference.
       */
      server: string;
    };
    export type RequestQuery = {
      /**
       * Tasks
       * Inspector task names to evaluate.
       */
      tasks: string[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetData;
  }

  /**
   * @description Return block reason codes for the requested Database's inspector tasks.
   * @tags Inspector
   * @name DatabaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGet
   * @summary Database Task Block Reason Codes
   * @request GET:/inspector/database/{vendor}/{database}/task_block_reason_codes
   */
  export namespace DatabaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGet {
    export type RequestParams = {
      /**
       * Vendor
       * A Vendor's ID.
       */
      vendor: string;
      /**
       * Database
       * A Database's ID or API reference.
       */
      database: string;
    };
    export type RequestQuery = {
      /**
       * Tasks
       * Inspector task names to evaluate.
       */
      tasks: string[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      DatabaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGetData;
  }

  /**
   * @description Return block reason codes for every active Server, nested by vendor ID then server API reference.
   * @tags Inspector
   * @name ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGet
   * @summary Servers Task Block Reason Codes
   * @request GET:/inspector/servers/task_block_reason_codes
   */
  export namespace ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Tasks
       * Inspector task names to evaluate.
       */
      tasks: string[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGetData;
  }

  /**
   * @description Return block reason codes for every active Database, nested by vendor ID then database API reference.
   * @tags Inspector
   * @name DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGet
   * @summary Databases Task Block Reason Codes
   * @request GET:/inspector/databases/task_block_reason_codes
   */
  export namespace DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Tasks
       * Inspector task names to evaluate.
       */
      tasks: string[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGetData;
  }
}
