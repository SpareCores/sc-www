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

import { OrderDir, SearchTrafficPricesTrafficPricesGetData } from "./data-contracts";

export namespace TrafficPrices {
  /**
   * No description
   * @tags Query Resources
   * @name SearchTrafficPricesTrafficPricesGet
   * @summary Search Traffic Prices
   * @request GET:/traffic_prices
   */
  export namespace SearchTrafficPricesTrafficPricesGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Vendor id
       * Identifier of the cloud provider vendor.
       */
      vendor?: "aws" | "azure" | "gcp" | "hcloud";
      /**
       * Green energy
       * Filter for regions with kow CO2 emission only.
       */
      green_energy?: boolean | null;
      /**
       * Compliance Framework id
       * Compliance framework implemented at the vendor.
       */
      compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
      /**
       * Region id
       * Identifier of the region.
       */
      regions?:
        | "1000"
        | "1100"
        | "1210"
        | "1220"
        | "1230"
        | "1250"
        | "1260"
        | "1270"
        | "1280"
        | "1290"
        | "1300"
        | "1310"
        | "1320"
        | "1330"
        | "1340"
        | "1350"
        | "1360"
        | "1370"
        | "1380"
        | "1390"
        | "1410"
        | "1420"
        | "1430"
        | "1440"
        | "1450"
        | "1460"
        | "1470"
        | "1480"
        | "1490"
        | "1510"
        | "1520"
        | "1530"
        | "1540"
        | "1550"
        | "1560"
        | "1570"
        | "1580"
        | "1590"
        | "1600"
        | "1610"
        | "2"
        | "3"
        | "4"
        | "5"
        | "6"
        | "7"
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
        | "australiacentral"
        | "australiacentral2"
        | "australiaeast"
        | "australiasoutheast"
        | "brazilsouth"
        | "brazilsoutheast"
        | "brazilus"
        | "ca-central-1"
        | "canadacentral"
        | "canadaeast"
        | "ca-west-1"
        | "centralindia"
        | "centralus"
        | "centraluseuap"
        | "cn-north-1"
        | "cn-northwest-1"
        | "eastasia"
        | "eastus"
        | "eastus2"
        | "eastus2euap"
        | "eastusstg"
        | "eu-central-1"
        | "eu-central-2"
        | "eu-north-1"
        | "eu-south-1"
        | "eu-south-2"
        | "eu-west-1"
        | "eu-west-2"
        | "eu-west-3"
        | "francecentral"
        | "francesouth"
        | "germanynorth"
        | "germanywestcentral"
        | "il-central-1"
        | "israelcentral"
        | "italynorth"
        | "japaneast"
        | "japanwest"
        | "jioindiacentral"
        | "jioindiawest"
        | "koreacentral"
        | "koreasouth"
        | "me-central-1"
        | "me-south-1"
        | "mexicocentral"
        | "northcentralus"
        | "northeurope"
        | "norwayeast"
        | "norwaywest"
        | "polandcentral"
        | "qatarcentral"
        | "sa-east-1"
        | "southafricanorth"
        | "southafricawest"
        | "southcentralus"
        | "southcentralusstg"
        | "southeastasia"
        | "southindia"
        | "spaincentral"
        | "swedencentral"
        | "switzerlandnorth"
        | "switzerlandwest"
        | "uaecentral"
        | "uaenorth"
        | "uksouth"
        | "ukwest"
        | "us-east-1"
        | "us-east-2"
        | "us-west-1"
        | "us-west-2"
        | "westcentralus"
        | "westeurope"
        | "westindia"
        | "westus"
        | "westus2"
        | "westus3";
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
        | "IN"
        | "IT"
        | "JP"
        | "KR"
        | "NL"
        | "NO"
        | "PL"
        | "QA"
        | "SA"
        | "SE"
        | "SG"
        | "TW"
        | "US"
        | "ZA";
      /**
       * Direction
       * Direction of the Internet traffic.
       * @default ["outbound"]
       */
      direction?: "inbound" | "outbound";
      /**
       * Monthly Overall Traffic
       * Overall amount of monthly traffic (GBs).
       * @default 1
       */
      monthly_traffic?: number | null;
      /**
       * Limit
       * Maximum number of results. Set to -1 for unlimited.
       * @default 10
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
      currency?: string | null;
      /**
       * Add Total Count Header
       * Add the X-Total-Count header to the response with the overall number of items (without paging). Note that it might reduce response times.
       * @default false
       */
      add_total_count_header?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchTrafficPricesTrafficPricesGetData;
  }
}
