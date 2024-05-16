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
  AssistFiltersAiAssistFiltersGetData,
  AssistFiltersAiAssistFiltersGetParams,
  HTTPValidationError,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Ai<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Extract JSON filters from freetext.
   *
   * @tags AI
   * @name AssistFiltersAiAssistFiltersGet
   * @summary Assist Filters
   * @request GET:/ai/assist_filters
   */
  assistFiltersAiAssistFiltersGet = (query: AssistFiltersAiAssistFiltersGetParams, params: RequestParams = {}) =>
    this.http.request<AssistFiltersAiAssistFiltersGetData, HTTPValidationError>({
      path: `/ai/assist_filters`,
      method: "GET",
      query: query,
      ...params,
    });
}
