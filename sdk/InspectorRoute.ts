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
  ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetData,
  TaskBlockReasonCodesInspectorTaskBlockReasonCodesGetData,
} from "./data-contracts";

export namespace Inspector {
  /**
   * @description Return block reason codes for the requested server's inspector tasks.
   * @tags Inspector
   * @name ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGet
   * @summary Server Task Block Reason Codes
   * @request GET:/inspector/server/{vendor}/{server}/task_block_reason_codes
   */
  export namespace ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGet {
    export type RequestParams = {
      /**
       * Vendor
       * A Vendor's ID.
       */
      vendor: string;
      /**
       * Server
       * A Server's ID or API reference.
       */
      server: string;
    };
    export type RequestQuery = {
      /**
       * Tasks
       * Inspector task names to evaluate.
       */
      tasks: string[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      ServerTaskBlockReasonCodesInspectorServerVendorServerTaskBlockReasonCodesGetData;
  }

  /**
   * @description Return block reason codes for every active server, nested by vendor ID then server API reference.
   * @tags Inspector
   * @name TaskBlockReasonCodesInspectorTaskBlockReasonCodesGet
   * @summary Task Block Reason Codes
   * @request GET:/inspector/task_block_reason_codes
   */
  export namespace TaskBlockReasonCodesInspectorTaskBlockReasonCodesGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Tasks
       * Inspector task names to evaluate.
       */
      tasks: string[];
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      TaskBlockReasonCodesInspectorTaskBlockReasonCodesGetData;
  }
}
