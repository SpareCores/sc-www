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

import {
  OrderDir,
  SearchTrafficPricesTrafficPricesGetData,
} from "./data-contracts";

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
      vendor?:
        | "alicloud"
        | "aws"
        | "azure"
        | "gcp"
        | "hcloud"
        | "ovh"
        | "upcloud";
      /**
       * Green energy
       * Filter for regions that are 100% powered by renewable energy.
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
        | "1640"
        | "1650"
        | "1680"
        | "2"
        | "3"
        | "4"
        | "5"
        | "6"
        | "7"
        | "af-south-1"
        | "ap-east-1"
        | "ap-east-2"
        | "ap-northeast-1"
        | "ap-northeast-2"
        | "ap-northeast-3"
        | "ap-south-1"
        | "ap-south-2"
        | "ap-southeast-1"
        | "ap-southeast-2"
        | "ap-southeast-3"
        | "ap-southeast-4"
        | "ap-southeast-5"
        | "ap-southeast-6"
        | "ap-southeast-7"
        | "AP-SOUTHEAST-SYD"
        | "AP-SOUTHEAST-SYD-2"
        | "AP-SOUTH-MUM"
        | "AP-SOUTH-MUM-1"
        | "australiacentral"
        | "australiacentral2"
        | "australiaeast"
        | "australiasoutheast"
        | "austriaeast"
        | "au-syd1"
        | "belgiumcentral"
        | "BHS"
        | "BHS5"
        | "brazilsouth"
        | "brazilsoutheast"
        | "brazilus"
        | "ca-central-1"
        | "CA-EAST-TOR"
        | "canadacentral"
        | "canadaeast"
        | "ca-west-1"
        | "centralindia"
        | "centralus"
        | "centraluseuap"
        | "chilecentral"
        | "cn-beijing"
        | "cn-chengdu"
        | "cn-fuzhou"
        | "cn-guangzhou"
        | "cn-hangzhou"
        | "cn-heyuan"
        | "cn-hongkong"
        | "cn-huhehaote"
        | "cn-nanjing"
        | "cn-north-1"
        | "cn-northwest-1"
        | "cn-qingdao"
        | "cn-shanghai"
        | "cn-shenzhen"
        | "cn-wuhan-lr"
        | "cn-wulanchabu"
        | "cn-zhangjiakou"
        | "DE"
        | "DE1"
        | "de-fra1"
        | "denmarkeast"
        | "dk-cph1"
        | "eastasia"
        | "eastus"
        | "eastus2"
        | "eastus2euap"
        | "eastusstg"
        | "es-mad1"
        | "eu-central-1"
        | "eu-central-2"
        | "eu-north-1"
        | "eu-south-1"
        | "eu-south-2"
        | "EU-SOUTH-MIL"
        | "eu-west-1"
        | "eu-west-2"
        | "eu-west-3"
        | "EU-WEST-PAR"
        | "fi-hel1"
        | "fi-hel2"
        | "francecentral"
        | "francesouth"
        | "germanynorth"
        | "germanywestcentral"
        | "GRA"
        | "GRA11"
        | "GRA7"
        | "GRA9"
        | "il-central-1"
        | "indonesiacentral"
        | "israelcentral"
        | "italynorth"
        | "japaneast"
        | "japanwest"
        | "jioindiacentral"
        | "jioindiawest"
        | "koreacentral"
        | "koreasouth"
        | "malaysiawest"
        | "me-central-1"
        | "me-east-1"
        | "me-south-1"
        | "mexicocentral"
        | "mx-central-1"
        | "na-south-1"
        | "newzealandnorth"
        | "nl-ams1"
        | "northcentralus"
        | "northeurope"
        | "norwayeast"
        | "norwaywest"
        | "no-svg1"
        | "pl-waw1"
        | "polandcentral"
        | "qatarcentral"
        | "RBX"
        | "RBX-A"
        | "RBX-ARCHIVE"
        | "sa-east-1"
        | "SBG"
        | "SBG5"
        | "SBG7"
        | "se-sto1"
        | "SGP"
        | "SGP1"
        | "sg-sin1"
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
        | "SYD"
        | "SYD1"
        | "uaecentral"
        | "uaenorth"
        | "UK"
        | "UK1"
        | "uk-lon1"
        | "uksouth"
        | "ukwest"
        | "us-chi1"
        | "us-east-1"
        | "us-east-2"
        | "us-nyc1"
        | "us-sjo1"
        | "us-west-1"
        | "us-west-2"
        | "WAW"
        | "WAW1"
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
        | "AT"
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
        | "MX"
        | "MY"
        | "NL"
        | "NO"
        | "NZ"
        | "PH"
        | "PL"
        | "QA"
        | "SA"
        | "SE"
        | "SG"
        | "TH"
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
