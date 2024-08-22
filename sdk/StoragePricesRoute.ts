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

import { TableStoragePricesStoragePricesGetData } from "./data-contracts";

export namespace StoragePrices {
  /**
   * No description
   * @name TableStoragePricesStoragePricesGet
   * @summary Table Storage Prices
   * @request GET:/storage_prices
   */
  export namespace TableStoragePricesStoragePricesGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Vendor id
       * Identifier of the cloud provider vendor.
       */
      vendor: "aws" | "gcp" | "hcloud";
      /**
       * Storage id
       * Identifier of the storage type.
       */
      storage_type: "30001" | "30002" | "30007" | "block" | "gp2" | "gp3" | "sc1" | "st1" | "standard";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableStoragePricesStoragePricesGetData;
  }
}
