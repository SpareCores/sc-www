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

export namespace Healthcheck {
  /**
   * @description Return database hash and last udpated timestamp.
   * @tags Administrative endpoints
   * @name HealthcheckHealthcheckGet
   * @summary Healthcheck
   * @request GET:/healthcheck
   */
  export namespace HealthcheckHealthcheckGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HealthcheckHealthcheckGetData;
  }
}
