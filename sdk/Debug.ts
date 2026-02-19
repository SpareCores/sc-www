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

import { GetDebugInfoDebugGetData } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Debug<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Return debug information about the availability of benchmark scores for servers. Returns vendor-level statistics, per-server details, and a list of all benchmark families.
   *
   * @tags Administrative endpoints
   * @name GetDebugInfoDebugGet
   * @summary Get Debug Info
   * @request GET:/debug
   */
  getDebugInfoDebugGet = (params: RequestParams = {}) =>
    this.http.request<GetDebugInfoDebugGetData, any>({
      path: `/debug`,
      method: "GET",
      format: "json",
      ...params,
    });
}
