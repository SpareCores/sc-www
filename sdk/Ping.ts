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
import { HttpClient, RequestParams } from "./http-client";

export class Ping<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Liveness check: answers as long as the process responds. Unlike `/healthcheck`, it doesn't use the database nor the thread pool that the other endpoints share, so it doesn't tell whether the replica can serve requests. A failing `/healthcheck` with a working `/ping` means a busy or stuck thread pool, not a dead process.
   *
   * @tags Administrative Endpoints
   * @name PingPingGet
   * @summary Ping
   * @request GET:/ping
   */
  pingPingGet = (params: RequestParams = {}) =>
    this.http.request<PingPingGetData, any>({
      path: `/ping`,
      method: "GET",
      format: "json",
      ...params,
    });
}
