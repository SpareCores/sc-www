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
       * Active only
       * Filter for active servers only.
       * @default true
       */
      only_active?: boolean | null;
      /**
       * Vendor id
       * Identifier of the cloud provider vendor.
       */
      vendor?: "hcloud" | "aws" | "gcp";
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
       * @default "vcpus"
       */
      order_by?: string;
      /**
       * Order Dir
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
