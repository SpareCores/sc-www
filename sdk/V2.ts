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
  GetServerWithoutRelationsV2ServerVendorServerGetData,
  GetServerWithoutRelationsV2ServerVendorServerGetParams,
  HTTPValidationError,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class V2<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Query a single server by its vendor id and either the server id or its API reference.
   *
   * @tags Server Details
   * @name GetServerWithoutRelationsV2ServerVendorServerGet
   * @summary Get Server Without Relations
   * @request GET:/v2/server/{vendor}/{server}
   */
  getServerWithoutRelationsV2ServerVendorServerGet = (
    {
      vendor,
      server,
      ...query
    }: GetServerWithoutRelationsV2ServerVendorServerGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      GetServerWithoutRelationsV2ServerVendorServerGetData,
      HTTPValidationError
    >({
      path: `/v2/server/${vendor}/${server}`,
      method: "GET",
      format: "json",
      ...params,
    });
}
