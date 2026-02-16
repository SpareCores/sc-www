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

export namespace Debug {
  /**
   * @description Return debug information about the availability of benchmark scores for servers. Returns vendor-level statistics, per-server details, and a list of all benchmark families.
   * @tags Administrative endpoints
   * @name GetDebugInfoDebugGet
   * @summary Get Debug Info
   * @request GET:/debug
   */
  export namespace GetDebugInfoDebugGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDebugInfoDebugGetData;
  }
}
