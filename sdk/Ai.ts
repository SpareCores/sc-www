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

import {
  AssistServerFiltersAiAssistServerFiltersGetData,
  AssistServerFiltersAiAssistServerFiltersGetParams,
  AssistServerPriceFiltersAiAssistServerPriceFiltersGetData,
  AssistServerPriceFiltersAiAssistServerPriceFiltersGetParams,
  AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetData,
  AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetParams,
  HTTPValidationError,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Ai<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Extract Server JSON filters from freetext.
   *
   * @tags AI
   * @name AssistServerFiltersAiAssistServerFiltersGet
   * @summary Assist Server Filters
   * @request GET:/ai/assist_server_filters
   */
  assistServerFiltersAiAssistServerFiltersGet = (
    query: AssistServerFiltersAiAssistServerFiltersGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<AssistServerFiltersAiAssistServerFiltersGetData, HTTPValidationError>({
      path: `/ai/assist_server_filters`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Extract ServerPrice JSON filters from freetext.
   *
   * @tags AI
   * @name AssistServerPriceFiltersAiAssistServerPriceFiltersGet
   * @summary Assist Server Price Filters
   * @request GET:/ai/assist_server_price_filters
   */
  assistServerPriceFiltersAiAssistServerPriceFiltersGet = (
    query: AssistServerPriceFiltersAiAssistServerPriceFiltersGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<AssistServerPriceFiltersAiAssistServerPriceFiltersGetData, HTTPValidationError>({
      path: `/ai/assist_server_price_filters`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Extract StoragePrice JSON filters from freetext.
   *
   * @tags AI
   * @name AssistStoragePriceFiltersAiAssistStoragePriceFiltersGet
   * @summary Assist Storage Price Filters
   * @request GET:/ai/assist_storage_price_filters
   */
  assistStoragePriceFiltersAiAssistStoragePriceFiltersGet = (
    query: AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetData, HTTPValidationError>({
      path: `/ai/assist_storage_price_filters`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
}
