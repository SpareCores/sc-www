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
  AssistDatabaseFiltersAiAssistDatabaseFiltersGetData,
  AssistServerFiltersAiAssistServerFiltersGetData,
  AssistServerPriceFiltersAiAssistServerPriceFiltersGetData,
  AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetData,
  AssistTrafficPriceFiltersAiAssistTrafficPriceFiltersGetData,
} from "./data-contracts";

export namespace Ai {
  /**
   * @description Extract Database JSON filters from freetext.
   * @tags AI
   * @name AssistDatabaseFiltersAiAssistDatabaseFiltersGet
   * @summary Assist Database Filters
   * @request GET:/ai/assist_database_filters
   */
  export namespace AssistDatabaseFiltersAiAssistDatabaseFiltersGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Text */
      text: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      AssistDatabaseFiltersAiAssistDatabaseFiltersGetData;
  }

  /**
   * @description Extract Server JSON filters from freetext.
   * @tags AI
   * @name AssistServerFiltersAiAssistServerFiltersGet
   * @summary Assist Server Filters
   * @request GET:/ai/assist_server_filters
   */
  export namespace AssistServerFiltersAiAssistServerFiltersGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Text */
      text: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AssistServerFiltersAiAssistServerFiltersGetData;
  }

  /**
   * @description Extract ServerPrice JSON filters from freetext.
   * @tags AI
   * @name AssistServerPriceFiltersAiAssistServerPriceFiltersGet
   * @summary Assist Server Price Filters
   * @request GET:/ai/assist_server_price_filters
   */
  export namespace AssistServerPriceFiltersAiAssistServerPriceFiltersGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Text */
      text: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      AssistServerPriceFiltersAiAssistServerPriceFiltersGetData;
  }

  /**
   * @description Extract StoragePrice JSON filters from freetext.
   * @tags AI
   * @name AssistStoragePriceFiltersAiAssistStoragePriceFiltersGet
   * @summary Assist Storage Price Filters
   * @request GET:/ai/assist_storage_price_filters
   */
  export namespace AssistStoragePriceFiltersAiAssistStoragePriceFiltersGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Text */
      text: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetData;
  }

  /**
   * @description Extract TrafficPrice JSON filters from freetext.
   * @tags AI
   * @name AssistTrafficPriceFiltersAiAssistTrafficPriceFiltersGet
   * @summary Assist Traffic Price Filters
   * @request GET:/ai/assist_traffic_price_filters
   */
  export namespace AssistTrafficPriceFiltersAiAssistTrafficPriceFiltersGet {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Text */
      text: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      AssistTrafficPriceFiltersAiAssistTrafficPriceFiltersGetData;
  }
}
