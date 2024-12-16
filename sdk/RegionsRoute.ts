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

import { SearchRegionsRegionsGetData } from "./data-contracts";

export namespace Regions {
  /**
   * No description
   * @tags Query Resources
   * @name SearchRegionsRegionsGet
   * @summary Search Regions
   * @request GET:/regions
   */
  export namespace SearchRegionsRegionsGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Vendor id
       * Identifier of the cloud provider vendor.
       */
      vendor?: "aws" | "azure" | "gcp" | "hcloud" | "upcloud";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchRegionsRegionsGetData;
  }
}
