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
  SearchServerPricesServerPricesGetData,
} from "./data-contracts";

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
       * Partial name or id
       * Freetext, case-insensitive search on the server_id, name, api_reference or display_name.
       */
      partial_name_or_id?: string | null;
      /**
       * Minimum vCPUs
       * Minimum number of virtual CPUs.
       * @min 1
       * @max 256
       * @default 1
       */
      vcpus_min?: number;
      /**
       * Maximum vCPUs
       * Maximum number of virtual CPUs.
       */
      vcpus_max?: number | null;
      /**
       * Processor architecture
       * Processor architecture.
       */
      architecture?: "arm64" | "arm64_mac" | "i386" | "x86_64" | "x86_64_mac";
      /** Processor manufacturer */
      cpu_manufacturer?:
        | "AMD"
        | "AWS"
        | "Alibaba"
        | "Ampere"
        | "Apple"
        | "Intel"
        | "Microsoft";
      /** Processor family */
      cpu_family?:
        | "ARM"
        | "ARMv8"
        | "ARMv9"
        | "Ampere Altra"
        | "EPYC"
        | "Xeon"
        | "Yitian";
      /**
       * CPU allocation
       * Allocation of the CPU(s) to the server, e.g. shared, burstable or dedicated.
       */
      cpu_allocation?: "Shared" | "Burstable" | "Dedicated";
      /**
       * Minimum SCore
       * Minimum stress-ng div16 CPU workload score.
       */
      benchmark_score_stressng_cpu_min?: number | null;
      /**
       * Minimum $Core
       * Minimum stress-ng div16 CPU workload score per USD/hr (using the best ondemand or spot price of all zones).
       */
      benchmark_score_per_price_stressng_cpu_min?: number | null;
      /**
       * Minimum memory
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
       * Filter for regions that are 100% powered by renewable energy.
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
       * Compliance Framework id
       * Compliance framework implemented at the vendor.
       */
      compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
      /**
       * Storage Size
       * Minimum amount of storage (GBs).
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
       * GPU count
       * Minimum number of GPUs.
       */
      gpu_min?: number | null;
      /**
       * Minimum GPU memory
       * Minimum amount of GPU memory (GB) in each GPU.
       */
      gpu_memory_min?: number | null;
      /**
       * Total GPU memory
       * Minimum amount of total GPU memory (GBs) in all GPUs.
       */
      gpu_memory_total?: number | null;
      /** GPU manufacturer */
      gpu_manufacturer?: "AMD" | "Habana" | "NVIDIA";
      /** GPU family */
      gpu_family?:
        | "Ada Lovelace"
        | "Ampere"
        | "Blackwell"
        | "Gaudi"
        | "Hopper"
        | "Maxwell"
        | "Radeon Pro Navi"
        | "Turing"
        | "Volta";
      /** GPU model */
      gpu_model?:
        | "A10"
        | "A100"
        | "A10G"
        | "B200"
        | "B300"
        | "G49"
        | "G49E"
        | "G59"
        | "GPU H"
        | "H100"
        | "H200"
        | "HL-205"
        | "L20"
        | "L4"
        | "L40S"
        | "M60"
        | "P100"
        | "P4"
        | "RTX 5000"
        | "RTX Pro 6000"
        | "T4"
        | "T4G"
        | "V100"
        | "V100S"
        | "V520"
        | "V620"
        | "V710"
        | "nvidia-gb200"
        | "vGPU8";
      /**
       * Limit
       * Maximum number of results.
       * @max 250
       * @default 25
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
    export type ResponseBody = SearchServerPricesServerPricesGetData;
  }
}
