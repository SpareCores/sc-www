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

import { OrderDir, SearchServerPricesServerPricesGetData } from "./data-contracts";

export namespace ServerPrices {
  /**
   * No description
   * @tags Query Resources
   * @name SearchServerPricesServerPricesGet
   * @summary Search Server Prices
   * @request GET:/server_prices
   */
  export namespace SearchServerPricesServerPricesGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Processor number
       * Minimum number of virtual CPUs.
       * @min 1
       * @max 128
       * @default 1
       */
      vcpus_min?: number;
      /**
       * Processor architecture
       * Processor architecture.
       */
      architecture?: "arm64" | "arm64_mac" | "i386" | "x86_64" | "x86_64_mac";
      /**
       * Memory amount
       * Minimum amount of memory in GBs.
       */
      memory_min?: number | null;
      /**
       * Maximum price
       * Maximum price (USD/hr).
       */
      price_max?: number | null;
      /**
       * Active only
       * Filter for active servers only.
       * @default true
       */
      only_active?: boolean | null;
      /**
       * Green energy
       * Filter for regions with kow CO2 emission only.
       */
      green_energy?: boolean | null;
      /**
       * Allocation
       * Server allocation method.
       */
      allocation?: "ondemand" | "reserved" | "spot";
      /**
       * Vendor id
       * Identifier of the cloud provider vendor.
       */
      vendor?: "hcloud" | "aws" | "gcp";
      /**
       * region id
       * Identifier of the region.
       */
      regions?:
        | "af-south-1"
        | "ap-east-1"
        | "ap-northeast-1"
        | "ap-northeast-2"
        | "ap-northeast-3"
        | "ap-south-1"
        | "ap-south-2"
        | "ap-southeast-1"
        | "ap-southeast-2"
        | "ap-southeast-3"
        | "ap-southeast-4"
        | "ca-central-1"
        | "ca-west-1"
        | "cn-north-1"
        | "cn-northwest-1"
        | "eu-central-1"
        | "eu-central-2"
        | "eu-north-1"
        | "eu-south-1"
        | "eu-south-2"
        | "eu-west-1"
        | "eu-west-2"
        | "eu-west-3"
        | "il-central-1"
        | "me-central-1"
        | "me-south-1"
        | "sa-east-1"
        | "us-east-1"
        | "us-east-2"
        | "us-west-1"
        | "us-west-2"
        | "1610"
        | "1220"
        | "1370"
        | "1250"
        | "1390"
        | "1410"
        | "1320"
        | "1470"
        | "1260"
        | "1440"
        | "1280"
        | "1480"
        | "1450"
        | "1350"
        | "1540"
        | "1100"
        | "1590"
        | "1570"
        | "1290"
        | "1300"
        | "1340"
        | "1380"
        | "1510"
        | "1520"
        | "1580"
        | "1600"
        | "1560"
        | "1330"
        | "1460"
        | "1310"
        | "1490"
        | "1000"
        | "1230"
        | "1270"
        | "1530"
        | "1550"
        | "1210"
        | "1360"
        | "1420"
        | "1430"
        | "2"
        | "3"
        | "4"
        | "5"
        | "6";
      /**
       * Compliance Framework id
       * Compliance framework implemented at the vendor.
       */
      compliance_framework?: "hipaa" | "soc2t2" | "iso27001";
      /**
       * Storage Size
       * Minimum amount of storage (GBs) attached to the server.
       */
      storage_size?: number | null;
      /**
       * Storage Type
       * Type of the storage attached to the server.
       */
      storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
      /**
       * Countries
       * Filter for regions in the provided list of countries.
       */
      countries?:
        | "AE"
        | "AU"
        | "BE"
        | "BH"
        | "BR"
        | "CA"
        | "CH"
        | "CL"
        | "CN"
        | "DE"
        | "ES"
        | "FI"
        | "FR"
        | "GB"
        | "HK"
        | "ID"
        | "IE"
        | "IL"
        | "IT"
        | "IN"
        | "JP"
        | "KR"
        | "NL"
        | "PL"
        | "QA"
        | "SA"
        | "SE"
        | "SG"
        | "TW"
        | "US"
        | "ZA";
      /**
       * GPU count
       * Minimum number of GPUs.
       */
      gpu_min?: number | null;
      /**
       * GPU memory
       * Minimum amount of GPU memory in GBs.
       */
      gpu_memory_min?: number | null;
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
      /**
       * Currency
       * Currency used for prices.
       * @default "USD"
       */
      currency?: string;
      /**
       * Add Total Count Header
       * Add the X-Total-Count header to the response with the overall number of items (without paging). Note that it might reduce response times.
       * @default false
       */
      add_total_count_header?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchServerPricesServerPricesGetData;
  }
}
