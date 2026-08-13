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
  GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetData,
  GetDatabasePricesDatabaseVendorDatabasePricesGetData,
  GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetData,
} from "./data-contracts";

export namespace Database {
  /**
   * @description Query a single database by its vendor id and either the database id or its API reference.
   * @tags Database Details
   * @name GetDatabaseWithoutRelationsDatabaseVendorDatabaseGet
   * @summary Get Database Without Relations
   * @request GET:/database/{vendor}/{database}
   */
  export namespace GetDatabaseWithoutRelationsDatabaseVendorDatabaseGet {
    export type RequestParams = {
      /**
       * Vendor
       * A Vendor's ID.
       */
      vendor: string;
      /**
       * Database
       * A Database's ID or API reference.
       */
      database: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      GetDatabaseWithoutRelationsDatabaseVendorDatabaseGetData;
  }

  /**
   * @description Query the current prices of a single database by its vendor id and database id.
   * @tags Database Details
   * @name GetDatabasePricesDatabaseVendorDatabasePricesGet
   * @summary Get Database Prices
   * @request GET:/database/{vendor}/{database}/prices
   */
  export namespace GetDatabasePricesDatabaseVendorDatabasePricesGet {
    export type RequestParams = {
      /**
       * Vendor
       * A Vendor's ID.
       */
      vendor: string;
      /**
       * Database
       * A Database's ID or API reference.
       */
      database: string;
    };
    export type RequestQuery = {
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
        | "DK"
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
       * Vendor and region
       * Identifier of the vendor and region, separated by a tilde.
       */
      vendor_regions?:
        | "alicloud~ap-northeast-1"
        | "alicloud~ap-northeast-2"
        | "alicloud~ap-southeast-1"
        | "alicloud~ap-southeast-3"
        | "alicloud~ap-southeast-5"
        | "alicloud~ap-southeast-6"
        | "alicloud~ap-southeast-7"
        | "alicloud~ap-southeast-8"
        | "alicloud~cn-beijing"
        | "alicloud~cn-chengdu"
        | "alicloud~cn-fuzhou"
        | "alicloud~cn-guangzhou"
        | "alicloud~cn-hangzhou"
        | "alicloud~cn-hangzhou-acdr-ut-3"
        | "alicloud~cn-heyuan"
        | "alicloud~cn-hongkong"
        | "alicloud~cn-huhehaote"
        | "alicloud~cn-nanjing"
        | "alicloud~cn-qingdao"
        | "alicloud~cn-shanghai"
        | "alicloud~cn-shenzhen"
        | "alicloud~cn-wuhan-lr"
        | "alicloud~cn-wulanchabu"
        | "alicloud~cn-zhangjiakou"
        | "alicloud~cn-zhongwei"
        | "alicloud~eu-central-1"
        | "alicloud~eu-west-1"
        | "alicloud~eu-west-2"
        | "alicloud~me-central-1"
        | "alicloud~me-east-1"
        | "alicloud~na-south-1"
        | "alicloud~sa-east-1"
        | "alicloud~us-east-1"
        | "alicloud~us-west-1"
        | "aws~af-south-1"
        | "aws~ap-east-1"
        | "aws~ap-east-2"
        | "aws~ap-northeast-1"
        | "aws~ap-northeast-2"
        | "aws~ap-northeast-3"
        | "aws~ap-south-1"
        | "aws~ap-south-2"
        | "aws~ap-southeast-1"
        | "aws~ap-southeast-2"
        | "aws~ap-southeast-3"
        | "aws~ap-southeast-4"
        | "aws~ap-southeast-5"
        | "aws~ap-southeast-6"
        | "aws~ap-southeast-7"
        | "aws~ca-central-1"
        | "aws~ca-west-1"
        | "aws~cn-north-1"
        | "aws~cn-northwest-1"
        | "aws~eu-central-1"
        | "aws~eu-central-2"
        | "aws~eu-north-1"
        | "aws~eu-south-1"
        | "aws~eu-south-2"
        | "aws~eu-west-1"
        | "aws~eu-west-2"
        | "aws~eu-west-3"
        | "aws~il-central-1"
        | "aws~me-central-1"
        | "aws~me-south-1"
        | "aws~mx-central-1"
        | "aws~sa-east-1"
        | "aws~us-east-1"
        | "aws~us-east-2"
        | "aws~us-west-1"
        | "aws~us-west-2"
        | "azure~australiacentral"
        | "azure~australiacentral2"
        | "azure~australiaeast"
        | "azure~australiasoutheast"
        | "azure~austriaeast"
        | "azure~belgiumcentral"
        | "azure~brazilsouth"
        | "azure~brazilsoutheast"
        | "azure~brazilus"
        | "azure~canadacentral"
        | "azure~canadaeast"
        | "azure~centralindia"
        | "azure~centralus"
        | "azure~centraluseuap"
        | "azure~chilecentral"
        | "azure~denmarkeast"
        | "azure~eastasia"
        | "azure~eastus"
        | "azure~eastus2"
        | "azure~eastus2euap"
        | "azure~eastusstg"
        | "azure~francecentral"
        | "azure~francesouth"
        | "azure~germanynorth"
        | "azure~germanywestcentral"
        | "azure~indiasouthcentral"
        | "azure~indonesiacentral"
        | "azure~israelcentral"
        | "azure~italynorth"
        | "azure~japaneast"
        | "azure~japanwest"
        | "azure~jioindiacentral"
        | "azure~jioindiawest"
        | "azure~koreacentral"
        | "azure~koreasouth"
        | "azure~malaysiawest"
        | "azure~mexicocentral"
        | "azure~newzealandnorth"
        | "azure~northcentralus"
        | "azure~northeurope"
        | "azure~norwayeast"
        | "azure~norwaywest"
        | "azure~polandcentral"
        | "azure~qatarcentral"
        | "azure~southafricanorth"
        | "azure~southafricawest"
        | "azure~southcentralus"
        | "azure~southcentralusstg"
        | "azure~southeastasia"
        | "azure~southindia"
        | "azure~spaincentral"
        | "azure~swedencentral"
        | "azure~switzerlandnorth"
        | "azure~switzerlandwest"
        | "azure~uaecentral"
        | "azure~uaenorth"
        | "azure~uksouth"
        | "azure~ukwest"
        | "azure~westcentralus"
        | "azure~westeurope"
        | "azure~westindia"
        | "azure~westus"
        | "azure~westus2"
        | "azure~westus3"
        | "gcp~1000"
        | "gcp~1100"
        | "gcp~1210"
        | "gcp~1220"
        | "gcp~1230"
        | "gcp~1250"
        | "gcp~1260"
        | "gcp~1270"
        | "gcp~1280"
        | "gcp~1290"
        | "gcp~1300"
        | "gcp~1310"
        | "gcp~1320"
        | "gcp~1330"
        | "gcp~1340"
        | "gcp~1350"
        | "gcp~1360"
        | "gcp~1370"
        | "gcp~1380"
        | "gcp~1390"
        | "gcp~1410"
        | "gcp~1420"
        | "gcp~1430"
        | "gcp~1440"
        | "gcp~1450"
        | "gcp~1460"
        | "gcp~1470"
        | "gcp~1480"
        | "gcp~1490"
        | "gcp~1510"
        | "gcp~1520"
        | "gcp~1530"
        | "gcp~1540"
        | "gcp~1550"
        | "gcp~1560"
        | "gcp~1570"
        | "gcp~1580"
        | "gcp~1590"
        | "gcp~1600"
        | "gcp~1610"
        | "gcp~1640"
        | "gcp~1650"
        | "gcp~1680"
        | "hcloud~2"
        | "hcloud~3"
        | "hcloud~4"
        | "hcloud~5"
        | "hcloud~6"
        | "hcloud~7"
        | "ovh~AP-SOUTH-MUM"
        | "ovh~AP-SOUTH-MUM-1"
        | "ovh~AP-SOUTHEAST-SYD"
        | "ovh~AP-SOUTHEAST-SYD-2"
        | "ovh~BHS"
        | "ovh~BHS5"
        | "ovh~CA-EAST-TOR"
        | "ovh~DE"
        | "ovh~DE1"
        | "ovh~EU-SOUTH-MIL"
        | "ovh~EU-WEST-PAR"
        | "ovh~GRA"
        | "ovh~GRA11"
        | "ovh~GRA7"
        | "ovh~GRA9"
        | "ovh~RBX"
        | "ovh~RBX-A"
        | "ovh~RBX-ARCHIVE"
        | "ovh~SBG"
        | "ovh~SBG5"
        | "ovh~SBG7"
        | "ovh~SGP"
        | "ovh~SGP1"
        | "ovh~SYD"
        | "ovh~SYD1"
        | "ovh~UK"
        | "ovh~UK1"
        | "ovh~WAW"
        | "ovh~WAW1"
        | "upcloud~au-syd1"
        | "upcloud~de-fra1"
        | "upcloud~dk-cph1"
        | "upcloud~es-mad1"
        | "upcloud~fi-hel1"
        | "upcloud~fi-hel2"
        | "upcloud~nl-ams1"
        | "upcloud~no-svg1"
        | "upcloud~pl-waw1"
        | "upcloud~se-sto1"
        | "upcloud~sg-sin1"
        | "upcloud~uk-lon1"
        | "upcloud~us-chi1"
        | "upcloud~us-nyc1"
        | "upcloud~us-sjo1"
        | "vultr~ams"
        | "vultr~atl"
        | "vultr~blr"
        | "vultr~bom"
        | "vultr~cdg"
        | "vultr~del"
        | "vultr~dfw"
        | "vultr~ewr"
        | "vultr~fra"
        | "vultr~hnl"
        | "vultr~icn"
        | "vultr~itm"
        | "vultr~jnb"
        | "vultr~lax"
        | "vultr~lhr"
        | "vultr~mad"
        | "vultr~man"
        | "vultr~mel"
        | "vultr~mex"
        | "vultr~mia"
        | "vultr~mxp"
        | "vultr~nrt"
        | "vultr~ord"
        | "vultr~sao"
        | "vultr~scl"
        | "vultr~sea"
        | "vultr~sgp"
        | "vultr~sjc"
        | "vultr~sto"
        | "vultr~syd"
        | "vultr~tlv"
        | "vultr~waw"
        | "vultr~yto";
      /**
       * Currency
       * Currency used for prices.
       * @default "USD"
       */
      currency?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      GetDatabasePricesDatabaseVendorDatabasePricesGetData;
  }

  /**
   * @description Query the current benchmark scores of a single database.
   * @tags Database Details
   * @name GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGet
   * @summary Get Database Benchmarks
   * @request GET:/database/{vendor}/{database}/benchmarks
   */
  export namespace GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGet {
    export type RequestParams = {
      /**
       * Vendor
       * A Vendor's ID.
       */
      vendor: string;
      /**
       * Database
       * A Database's ID or API reference.
       */
      database: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      GetDatabaseBenchmarksDatabaseVendorDatabaseBenchmarksGetData;
  }
}
