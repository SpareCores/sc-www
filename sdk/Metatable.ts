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

import { HTTPValidationError, MetaTables, MetadataMetatableMetaTableGetData } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Metatable<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Return a table with metadata as-is, e.g. all countries or vendors.
   *
   * @tags Administrative endpoints
   * @name MetadataMetatableMetaTableGet
   * @summary Metadata
   * @request GET:/metatable/{meta_table}
   */
  metadataMetatableMetaTableGet = (metaTable: MetaTables, params: RequestParams = {}) =>
    this.http.request<MetadataMetatableMetaTableGetData, HTTPValidationError>({
      path: `/metatable/${metaTable}`,
      method: "GET",
      ...params,
    });
}
