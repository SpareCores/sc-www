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

import { HealthcheckHealthcheckGetData } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Healthcheck<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Quickly return package and database version information.
   *
   * @tags Administrative endpoints
   * @name HealthcheckHealthcheckGet
   * @summary Healthcheck
   * @request GET:/healthcheck
   */
  healthcheckHealthcheckGet = (params: RequestParams = {}) =>
    this.http.request<HealthcheckHealthcheckGetData, any>({
      path: `/healthcheck`,
      method: "GET",
      format: "json",
      ...params,
    });
}
