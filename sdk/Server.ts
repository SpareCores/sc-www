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
  GetServerServerVendorServerGetData,
  GetServerServerVendorServerGetParams,
  HTTPValidationError,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Server<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Query a single server by its vendor id and either the server or, or its API reference. Return dictionary includes all server fields, along with the current prices per zone, and the available benchmark scores.
   *
   * @tags Query Resources
   * @name GetServerServerVendorServerGet
   * @summary Get Server
   * @request GET:/server/{vendor}/{server}
   */
  getServerServerVendorServerGet = (
    { vendor, server, ...query }: GetServerServerVendorServerGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<GetServerServerVendorServerGetData, HTTPValidationError>({
      path: `/server/${vendor}/${server}`,
      method: "GET",
      query: query,
      ...params,
    });
}
