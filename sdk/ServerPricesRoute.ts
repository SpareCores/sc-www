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
      cpu_manufacturer?: "AMD" | "AWS" | "Ampere" | "Apple" | "Intel" | "Microsoft";
      /** Processor family */
      cpu_family?: "ARM" | "ARMv8" | "Ampere Altra" | "EPYC" | "Xeon";
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
      vendor?: "aws" | "azure" | "gcp" | "hcloud" | "upcloud";
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
        | "au-syd1"
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
        | "de-fra1"
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
        | "eu-west-1"
        | "eu-west-2"
        | "eu-west-3"
        | "fi-hel1"
        | "fi-hel2"
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
        | "newzealandnorth"
        | "nl-ams1"
        | "northcentralus"
        | "northeurope"
        | "norwayeast"
        | "norwaywest"
        | "pl-waw1"
        | "polandcentral"
        | "qatarcentral"
        | "sa-east-1"
        | "se-sto1"
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
        | "uaecentral"
        | "uaenorth"
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
        | "NL"
        | "NO"
        | "NZ"
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
        | "Gaudi"
        | "Hopper"
        | "Kepler"
        | "Maxwell"
        | "Radeon Pro Navi"
        | "Turing"
        | "Volta";
      /** GPU model */
      gpu_model?:
        | "A100"
        | "A10G"
        | "H100"
        | "H200"
        | "HL-205"
        | "K80"
        | "L4"
        | "L40S"
        | "M60"
        | "NVIDIA"
        | "T4"
        | "T4G"
        | "V100"
        | "V520"
        | "nvidia-h200-141gb";
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
