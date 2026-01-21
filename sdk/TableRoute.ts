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
  TableBenchmarkTableBenchmarkGetData,
  TableComplianceFrameworksTableComplianceFrameworkGetData,
  TableCountryTableCountryGetData,
  TableMetadataServerTableServerMetaGetData,
  TableRegionTableRegionGetData,
  TableServerPricesTableServerPricesGetData,
  TableServerTableServerGetData,
  TableStorageTableStorageGetData,
  TableVendorTableVendorGetData,
  TableZoneTableZoneGetData,
} from "./data-contracts";

export namespace Table {
  /**
   * @description Return the Benchmark table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableBenchmarkTableBenchmarkGet
   * @summary Table Benchmark
   * @request GET:/table/benchmark
   */
  export namespace TableBenchmarkTableBenchmarkGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableBenchmarkTableBenchmarkGetData;
  }

  /**
   * @description Return the Country table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableCountryTableCountryGet
   * @summary Table Country
   * @request GET:/table/country
   */
  export namespace TableCountryTableCountryGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableCountryTableCountryGetData;
  }

  /**
   * @description Return the ComplianceFramework table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableComplianceFrameworksTableComplianceFrameworkGet
   * @summary Table Compliance Frameworks
   * @request GET:/table/compliance_framework
   */
  export namespace TableComplianceFrameworksTableComplianceFrameworkGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      TableComplianceFrameworksTableComplianceFrameworkGetData;
  }

  /**
   * @description Return the Vendor table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableVendorTableVendorGet
   * @summary Table Vendor
   * @request GET:/table/vendor
   */
  export namespace TableVendorTableVendorGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableVendorTableVendorGetData;
  }

  /**
   * @description Return the Region table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableRegionTableRegionGet
   * @summary Table Region
   * @request GET:/table/region
   */
  export namespace TableRegionTableRegionGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableRegionTableRegionGetData;
  }

  /**
   * @description Return the Zone table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableZoneTableZoneGet
   * @summary Table Zone
   * @request GET:/table/zone
   */
  export namespace TableZoneTableZoneGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableZoneTableZoneGetData;
  }

  /**
   * @description Return the Server table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableServerTableServerGet
   * @summary Table Server
   * @request GET:/table/server
   */
  export namespace TableServerTableServerGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableServerTableServerGetData;
  }

  /**
   * @description Query ServerPrices records without relationships resolved.
   * @tags Table dumps
   * @name TableServerPricesTableServerPricesGet
   * @summary Table Server Prices
   * @request GET:/table/server_prices
   * @secure
   */
  export namespace TableServerPricesTableServerPricesGet {
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
       * Region id
       * Identifier of the region.
       */
      region?:
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
       * Allocation
       * Server allocation method.
       */
      allocation?: "ondemand" | "reserved" | "spot";
      /**
       * Active only
       * Filter for active servers only.
       * @default true
       */
      only_active?: boolean | null;
      /**
       * Currency
       * Currency used for prices.
       */
      currency?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableServerPricesTableServerPricesGetData;
  }

  /**
   * @description Return the Storage table as-is, without filtering options or relationships resolved.
   * @tags Table dumps
   * @name TableStorageTableStorageGet
   * @summary Table Storage
   * @request GET:/table/storage
   */
  export namespace TableStorageTableStorageGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableStorageTableStorageGetData;
  }

  /**
   * @description Server table and column names and comments.
   * @tags Table metadata
   * @name TableMetadataServerTableServerMetaGet
   * @summary Table Metadata Server
   * @request GET:/table/server/meta
   */
  export namespace TableMetadataServerTableServerMetaGet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableMetadataServerTableServerMetaGetData;
  }
}
