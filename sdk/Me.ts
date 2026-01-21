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

import { MeMeGetData } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Me<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Return the current user after authentication.
   *
   * @tags Administrative endpoints
   * @name MeMeGet
   * @summary Me
   * @request GET:/me
   * @secure
   */
  meMeGet = (params: RequestParams = {}) =>
    this.http.request<MeMeGetData, any>({
      path: `/me`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
