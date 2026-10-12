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
  ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetData,
  ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetParams,
  TaskBlockReasonCodesInspectorTaskBlockReasonCodesGetData,
  TaskBlockReasonCodesInspectorTaskBlockReasonCodesGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Inspector<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Return block reason codes for the requested server's inspector tasks.
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
   * @description Return block reason codes for every active server, nested by vendor ID then server API reference.
   *
   * @tags Inspector
   * @name TaskBlockReasonCodesInspectorTaskBlockReasonCodesGet
   * @summary Task Block Reason Codes
   * @request GET:/inspector/task_block_reason_codes
   */
  taskBlockReasonCodesInspectorTaskBlockReasonCodesGet = (
    query: TaskBlockReasonCodesInspectorTaskBlockReasonCodesGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      TaskBlockReasonCodesInspectorTaskBlockReasonCodesGetData,
      HTTPValidationError
    >({
      path: `/inspector/task_block_reason_codes`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
