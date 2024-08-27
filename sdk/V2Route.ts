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

import { GetServerWithoutRelationsV2ServerVendorServerGetData } from "./data-contracts";

export namespace V2 {
  /**
   * @description Query a single server by its vendor id and either the server id or its API reference.
   * @tags Server Details
   * @name GetServerWithoutRelationsV2ServerVendorServerGet
   * @summary Get Server Without Relations
   * @request GET:/v2/server/{vendor}/{server}
   */
  export namespace GetServerWithoutRelationsV2ServerVendorServerGet {
    export type RequestParams = {
      /**
       * Vendor
       * A Vendor's ID.
       */
      vendor: string;
      /**
       * Server
       * A Server's ID or API reference.
       */
      server: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetServerWithoutRelationsV2ServerVendorServerGetData;
  }
}
