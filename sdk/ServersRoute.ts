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
      cpu_manufacturer?:
        | "AMD"
        | "AWS"
        | "Alibaba"
        | "Ampere"
        | "Apple"
        | "Hygon"
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
       * Benchmark Id
       * Benchmark id to use as the main score for the server.
       */
      benchmark_id?: string;
      /**
       * Benchmark Config
       * Optional benchmark config dict JSON to filter results of a benchmark_id.
       */
      benchmark_config?: string | null;
      /**
       * Minimum benchmark score
       * Minimum value of the selected benchmark score.
       */
      benchmark_score_min?: number | null;
      /**
       * Minimum benchmark score/price
       * Minimum value of the selected benchmark score per USD/hr (using the best ondemand or spot price of all zones).
       */
      benchmark_score_per_price_min?: number | null;
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
      vendor?:
        | "alicloud"
        | "aws"
        | "azure"
        | "gcp"
        | "hcloud"
        | "ovh"
        | "upcloud";
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
        | "Maxwell"
        | "Radeon Pro Navi"
        | "Turing"
        | "Volta";
      /** GPU model */
      gpu_model?:
        | "A10"
        | "A100"
        | "A10G"
        | "A30"
        | "A800"
        | "A910E"
        | "A910X"
        | "A910Z"
        | "AGF 027"
        | "B200"
        | "B300"
        | "G39"
        | "G49"
        | "G49E"
        | "G59"
        | "GA107"
        | "GPU A"
        | "GPU H"
        | "GPU H-e"
        | "H100"
        | "H100 PCIe"
        | "H200"
        | "HL-205"
        | "INTEL ARRIA 10 GX 1150"
        | "L20"
        | "L20N"
        | "L4"
        | "L40S"
        | "M40"
        | "M60"
        | "P100"
        | "P4"
        | "PPU 810"
        | "RTX 5000"
        | "RTX 5880"
        | "RTX 6000"
        | "RTX Pro 6000"
        | "S7150"
        | "T4"
        | "T4G"
        | "V100"
        | "V100S"
        | "V520"
        | "Xilinx VU9p"
        | "intel SG1"
        | "vGPU8";
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
       * @default "min_price"
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
