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

import { GetServerServerVendorServerGetData } from "./data-contracts";

export namespace Server {
  /**
   * @description Query a single server by its vendor id and either the server or, or its API reference. Return dictionary includes all server fields, along with the current prices per zone, and the available benchmark scores.
   * @tags Query Resources
   * @name GetServerServerVendorServerGet
   * @summary Get Server
   * @request GET:/server/{vendor}/{server}
   */
  export namespace GetServerServerVendorServerGet {
    export type RequestParams = {
      /**
       * Vendor
       * Vendor ID.
       */
      vendor: string;
      /**
       * Server
       * Server ID or API reference.
       */
      server: string;
    };
    export type RequestQuery = {
      /**
       * Currency
       * Currency used for prices.
       */
      currency?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetServerServerVendorServerGetData;
  }
}
