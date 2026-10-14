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
  DatabaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGetParams,
  DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGetData,
  DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGetParams,
  HTTPValidationError,
  ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetData,
  ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetParams,
  ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGetData,
  ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Inspector<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Return block reason codes for the requested Server's inspector tasks.
   *
   * @tags Inspector
   * @name ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGet
   * @summary Server Task Block Reason Codes
   * @request GET:/inspector/server/{vendor}/{server}/task_block_reason_codes
   */
  serverTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGet =
    (
      {
        vendor,
        server,
        ...query
      }: ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetParams,
      params: RequestParams = {},
    ) =>
      this.http.request<
        ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetData,
        HTTPValidationError
      >({
        path: `/inspector/server/${vendor}/${server}/task_block_reason_codes`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      });
  /**
   * @description Return block reason codes for the requested Database's inspector tasks.
   *
   * @tags Inspector
   * @name DatabaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGet
   * @summary Database Task Block Reason Codes
   * @request GET:/inspector/database/{vendor}/{database}/task_block_reason_codes
   */
  databaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGet =
    (
      {
        vendor,
        database,
        ...query
      }: DatabaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGetParams,
      params: RequestParams = {},
    ) =>
      this.http.request<
        DatabaseTaskBlockReasonCodesInspectorDatabaseVendorDatabaseTaskBlockReasonCodesGetData,
        HTTPValidationError
      >({
        path: `/inspector/database/${vendor}/${database}/task_block_reason_codes`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      });
  /**
   * @description Return block reason codes for every active Server, nested by vendor ID then server API reference.
   *
   * @tags Inspector
   * @name ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGet
   * @summary Servers Task Block Reason Codes
   * @request GET:/inspector/servers/task_block_reason_codes
   */
  serversTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGet = (
    query: ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      ServersTaskBlockReasonCodesInspectorServersTaskBlockReasonCodesGetData,
      HTTPValidationError
    >({
      path: `/inspector/servers/task_block_reason_codes`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Return block reason codes for every active Database, nested by vendor ID then database API reference.
   *
   * @tags Inspector
   * @name DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGet
   * @summary Databases Task Block Reason Codes
   * @request GET:/inspector/databases/task_block_reason_codes
   */
  databasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGet = (
    query: DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      DatabasesTaskBlockReasonCodesInspectorDatabasesTaskBlockReasonCodesGetData,
      HTTPValidationError
    >({
      path: `/inspector/databases/task_block_reason_codes`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
