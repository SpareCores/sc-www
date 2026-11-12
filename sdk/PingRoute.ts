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

import { PingPingGetData } from "./data-contracts";

export namespace Ping {
  /**
   * @description Liveness check: answers as long as the process responds. Unlike `/healthcheck`, it doesn't use the database nor the thread pool that the other endpoints share, so it doesn't tell whether the replica can serve requests. A failing `/healthcheck` with a working `/ping` means a busy or stuck thread pool, not a dead process.
   * @tags Administrative Endpoints
   * @name PingPingGet
   * @summary Ping
   * @request GET:/ping
   */
  export namespace PingPingGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = PingPingGetData;
  }
}
