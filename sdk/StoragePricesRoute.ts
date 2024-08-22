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

import { OrderDir, TableStoragePricesStoragePricesGetData } from "./data-contracts";

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
      vendor?: "aws" | "azure" | "gcp" | "hcloud";
      /**
       * Storage id
       * Identifier of the storage type.
       */
      storage_id?:
        | "30001"
        | "30002"
        | "30007"
        | "block"
        | "gp2"
        | "gp3"
        | "Premium_LRS"
        | "PremiumV2_LRS"
        | "Premium_ZRS"
        | "sc1"
        | "st1"
        | "standard"
        | "Standard_LRS"
        | "StandardSSD_LRS"
        | "StandardSSD_ZRS"
        | "UltraSSD_LRS";
      /**
       * Limit
       * Maximum number of results. Set to -1 for unlimited
       * @default 50
       */
      limit?: number;
      /**
       * Page
       * Page number.
       */
      page?: number | null;
      /**
       * Order By
       * Order by column.
       * @default "price"
       */
      order_by?: string;
      /**
       * Order Dir
       * Order direction.
       * @default "asc"
       */
      order_dir?: OrderDir;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableStoragePricesStoragePricesGetData;
  }
}
