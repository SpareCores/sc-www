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
  TableServerSelectTableServerSelectGetData,
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
   * @description Return the Server table with column selection.
   * @tags Table dumps
   * @name TableServerSelectTableServerSelectGet
   * @summary Table Server Select
   * @request GET:/table/server/select
   */
  export namespace TableServerSelectTableServerSelectGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Server columns
       * Selected server columns.
       */
      columns?:
        | "vendor_id"
        | "server_id"
        | "name"
        | "api_reference"
        | "display_name"
        | "description"
        | "family"
        | "vcpus"
        | "hypervisor"
        | "cpu_allocation"
        | "cpu_cores"
        | "cpu_speed"
        | "cpu_architecture"
        | "cpu_manufacturer"
        | "cpu_family"
        | "cpu_model"
        | "cpu_l1d_cache"
        | "cpu_l1d_cache_total"
        | "cpu_l1i_cache"
        | "cpu_l1i_cache_total"
        | "cpu_l2_cache"
        | "cpu_l2_cache_total"
        | "cpu_l3_cache"
        | "cpu_l3_cache_total"
        | "cpu_flags"
        | "cpus"
        | "memory_amount"
        | "memory_generation"
        | "memory_speed"
        | "memory_ecc"
        | "gpu_count"
        | "gpu_memory_min"
        | "gpu_memory_total"
        | "gpu_manufacturer"
        | "gpu_family"
        | "gpu_model"
        | "gpus"
        | "storage_size"
        | "storage_type"
        | "storages"
        | "network_speed"
        | "inbound_traffic"
        | "outbound_traffic"
        | "ipv4"
        | "status"
        | "observed_at";
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TableServerSelectTableServerSelectGetData;
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
       * Identifier of the region. Note that region ids are not vendor-specific, so when you select a region, you might get results from multiple vendors. For more precise filtering, use vendor_regions instead.
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
        | "cn-hangzhou-acdr-ut-3"
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
        | "cn-zhongwei"
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
       * Vendor and region id
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
        | "alicloud~me-central-1"
        | "alicloud~me-east-1"
        | "alicloud~na-south-1"
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
        | "upcloud~us-sjo1";
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
