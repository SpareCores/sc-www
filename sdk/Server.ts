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

import { GetServerServerVendorIdServerIdGetData, HTTPValidationError } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Server<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags Query Server(s)
   * @name GetServerServerVendorIdServerIdGet
   * @summary Get Server
   * @request GET:/server/{vendor_id}/{server_id}
   */
  getServerServerVendorIdServerIdGet = (vendorId: string, serverId: string, params: RequestParams = {}) =>
    this.http.request<GetServerServerVendorIdServerIdGetData, HTTPValidationError>({
      path: `/server/${vendorId}/${serverId}`,
      method: "GET",
      ...params,
    });
}
