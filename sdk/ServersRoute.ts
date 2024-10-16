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

import { OrderDir, SearchServersServersGetData } from "./data-contracts";

export namespace Servers {
  /**
   * No description
   * @tags Query Resources
   * @name SearchServersServersGet
   * @summary Search Servers
   * @request GET:/servers
   */
  export namespace SearchServersServersGet {
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
      cpu_manufacturer?: "AMD" | "AWS" | "Ampere" | "Apple" | "Intel";
      /** Processor family */
      cpu_family?: "ARMv8" | "Ampere Altra" | "EPYC" | "Xeon";
      /**
       * SCore
       * Minimum stress-ng div16 CPU workload score.
       */
      benchmark_score_stressng_cpu_min?: number | null;
      /**
       * $Core
       * Minimum stress-ng div16 CPU workload score per USD/hr.
       */
      benchmark_score_per_price_stressng_cpu_min?: number | null;
      /**
       * Minimum memory
       * Minimum amount of memory in GBs.
       */
      memory_min?: number | null;
      /**
       * Active only
       * Filter for active servers only.
       * @default true
       */
      only_active?: boolean | null;
      /**
       * Vendor id
       * Identifier of the cloud provider vendor.
       */
      vendor?: "aws" | "azure" | "gcp" | "hcloud";
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
        | "T4"
        | "T4G"
        | "V100"
        | "V520";
      /**
       * Limit
       * Maximum number of results. Set to -1 for unlimited.
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
       * @default "vcpus"
       */
      order_by?: string;
      /**
       * Order direction.
       * @default "asc"
       */
      order_dir?: OrderDir;
      /**
       * Add Total Count Header
       * Add the X-Total-Count header to the response with the overall number of items (without paging). Note that it might reduce response times.
       * @default false
       */
      add_total_count_header?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchServersServersGetData;
  }
}
