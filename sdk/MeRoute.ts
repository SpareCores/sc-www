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

import { MeMeGetData } from "./data-contracts";

export namespace Me {
  /**
   * @description Return the current user after authentication.
   * @tags Administrative endpoints
   * @name MeMeGet
   * @summary Me
   * @request GET:/me
   * @secure
   */
  export namespace MeMeGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = MeMeGetData;
  }
}
