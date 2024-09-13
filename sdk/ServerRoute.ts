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
  GetServerBenchmarksServerVendorServerBenchmarksGetData,
  GetServerPricesServerVendorServerPricesGetData,
  GetServerServerVendorServerGetData,
  GetSimilarServersServerVendorServerSimilarServersByNumGetData,
} from "./data-contracts";

export namespace Server {
  /**
   * @description Query a single server by its vendor id and either the server or, or its API reference. Return dictionary includes all server fields, along with the current prices per zone, and the available benchmark scores.
   * @tags Server Details
   * @name GetServerServerVendorServerGet
   * @summary Get Server
   * @request GET:/server/{vendor}/{server}
   * @deprecated
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
   * @tags Server Details
   * @name GetSimilarServersServerVendorServerSimilarServersByNumGet
   * @summary Get Similar Servers
   * @request GET:/server/{vendor}/{server}/similar_servers/{by}/{num}
   */
  export namespace GetSimilarServersServerVendorServerSimilarServersByNumGet {
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
       * Num
       * Number of servers to get.
       * @max 100
       */
      num: number;
    };
    export type RequestQuery = {
      /**
       * Benchmark Id
       * Benchmark id to use as the main score for the server.
       * @default "stress_ng:cpu_all"
       */
      benchmark_id?: string;
      /**
       * Benchmark Config
       * Benchmark id to use as the main score for the server.
       * @default ""
       */
      benchmark_config?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSimilarServersServerVendorServerSimilarServersByNumGetData;
  }

  /**
   * @description Query the current prices of a single server by its vendor id and server id.
   * @tags Server Details
   * @name GetServerPricesServerVendorServerPricesGet
   * @summary Get Server Prices
   * @request GET:/server/{vendor}/{server}/prices
   */
  export namespace GetServerPricesServerVendorServerPricesGet {
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
    export type RequestQuery = {
      /**
       * Currency
       * Currency used for prices.
       */
      currency?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetServerPricesServerVendorServerPricesGetData;
  }

  /**
   * @description Query the current benchmark scores of a single server.
   * @tags Server Details
   * @name GetServerBenchmarksServerVendorServerBenchmarksGet
   * @summary Get Server Benchmarks
   * @request GET:/server/{vendor}/{server}/benchmarks
   */
  export namespace GetServerBenchmarksServerVendorServerBenchmarksGet {
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
    export type ResponseBody = GetServerBenchmarksServerVendorServerBenchmarksGetData;
  }
}
