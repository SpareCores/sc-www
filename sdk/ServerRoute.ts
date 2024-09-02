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

import {
  GetServerServerVendorServerGetData,
  GetSimilarServersServerVendorServerSimilarServersByNGetData,
} from "./data-contracts";

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

  /**
   * @description Search similar servers to the provided one. The "family" method returns all servers from the same family of the same vendor. The "specs" approach will prioritize the number of GPUs, then CPUs, lastly the amount of memory. The "score" method will find the servers with the closest performance using the multi-core SCore.
   * @tags Query Resources
   * @name GetSimilarServersServerVendorServerSimilarServersByNGet
   * @summary Get Similar Servers
   * @request GET:/server/{vendor}/{server}/similar_servers/{by}/{n}
   */
  export namespace GetSimilarServersServerVendorServerSimilarServersByNGet {
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
      /**
       * By
       * Algorithm to look for similar servers.
       */
      by: "family" | "specs" | "score";
      /**
       * N
       * Number of servers to get.
       * @max 100
       */
      n: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSimilarServersServerVendorServerSimilarServersByNGetData;
  }
}
