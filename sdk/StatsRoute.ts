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

import { GetStatsStatsGetData } from "./data-contracts";

export namespace Stats {
  /**
   * @description Return counts of records in each table, optionally filtered by vendor and status.
   * @tags Administrative endpoints
   * @name GetStatsStatsGet
   * @summary Get Stats
   * @request GET:/stats
   */
  export namespace GetStatsStatsGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Vendor id
       * Identifier of the cloud provider vendor.
       */
      vendor?:
        | "alicloud"
        | "aws"
        | "azure"
        | "gcp"
        | "hcloud"
        | "ovh"
        | "upcloud";
      /**
       * Active only
       * Filter for active servers only.
       * @default false
       */
      only_active?: boolean | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetStatsStatsGetData;
  }
}
