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
  HTTPValidationError,
  SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGetData,
  SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGetParams,
  SnapshotBenchmarkSnapshotHashBenchmarkGetData,
  SnapshotBenchmarkSnapshotHashBenchmarkGetParams,
  SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGetData,
  SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGetParams,
  SnapshotCountrySnapshotHashCountryGetData,
  SnapshotCountrySnapshotHashCountryGetParams,
  SnapshotCurrencySnapshotHashCurrencyGetData,
  SnapshotCurrencySnapshotHashCurrencyGetParams,
  SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGetData,
  SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGetParams,
  SnapshotDatabaseSnapshotHashDatabaseVendorGetData,
  SnapshotDatabaseSnapshotHashDatabaseVendorGetParams,
  SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGetData,
  SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGetParams,
  SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGetData,
  SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGetParams,
  SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGetData,
  SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGetParams,
  SnapshotManifestSnapshotHashGetData,
  SnapshotManifestSnapshotHashGetParams,
  SnapshotRegionSnapshotHashRegionVendorGetData,
  SnapshotRegionSnapshotHashRegionVendorGetParams,
  SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGetData,
  SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGetParams,
  SnapshotServerPriceSnapshotHashServerPriceVendorGetData,
  SnapshotServerPriceSnapshotHashServerPriceVendorGetParams,
  SnapshotServerSnapshotHashServerVendorGetData,
  SnapshotServerSnapshotHashServerVendorGetParams,
  SnapshotStoragePriceSnapshotHashStoragePriceVendorGetData,
  SnapshotStoragePriceSnapshotHashStoragePriceVendorGetParams,
  SnapshotStorageSnapshotHashStorageVendorGetData,
  SnapshotStorageSnapshotHashStorageVendorGetParams,
  SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGetData,
  SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGetParams,
  SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGetData,
  SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGetParams,
  SnapshotVendorSnapshotHashVendorGetData,
  SnapshotVendorSnapshotHashVendorGetParams,
  SnapshotZoneSnapshotHashZoneVendorGetData,
  SnapshotZoneSnapshotHashZoneVendorGetParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Snapshot<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Every snapshot file of a database hash, sorted by path: its route below `/snapshot/{hash}/` (`path`), its number of rows (`rows`), and the SHA-256 of its uncompressed JSON (`sha256`). Compare the checksums with your last refresh to skip files that didn't change, e.g. specs, regions and zones, which rarely do. The manifest also lists which tables, vendors and benchmarks the hash has. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotManifestSnapshotHashGet
   * @summary Snapshot manifest
   * @request GET:/snapshot/{hash}
   * @secure
   */
  snapshotManifestSnapshotHashGet = (
    { hash }: SnapshotManifestSnapshotHashGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotManifestSnapshotHashGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `vendor` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotVendorSnapshotHashVendorGet
   * @summary Snapshot of vendor
   * @request GET:/snapshot/{hash}/vendor
   * @secure
   */
  snapshotVendorSnapshotHashVendorGet = (
    { hash }: SnapshotVendorSnapshotHashVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotVendorSnapshotHashVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/vendor`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `country` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotCountrySnapshotHashCountryGet
   * @summary Snapshot of country
   * @request GET:/snapshot/{hash}/country
   * @secure
   */
  snapshotCountrySnapshotHashCountryGet = (
    { hash }: SnapshotCountrySnapshotHashCountryGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotCountrySnapshotHashCountryGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/country`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `compliance_framework` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGet
   * @summary Snapshot of compliance_framework
   * @request GET:/snapshot/{hash}/compliance_framework
   * @secure
   */
  snapshotComplianceFrameworkSnapshotHashComplianceFrameworkGet = (
    {
      hash,
    }: SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/compliance_framework`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `benchmark` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotBenchmarkSnapshotHashBenchmarkGet
   * @summary Snapshot of benchmark
   * @request GET:/snapshot/{hash}/benchmark
   * @secure
   */
  snapshotBenchmarkSnapshotHashBenchmarkGet = (
    { hash }: SnapshotBenchmarkSnapshotHashBenchmarkGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotBenchmarkSnapshotHashBenchmarkGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/benchmark`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `currency` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotCurrencySnapshotHashCurrencyGet
   * @summary Snapshot of currency
   * @request GET:/snapshot/{hash}/currency
   * @secure
   */
  snapshotCurrencySnapshotHashCurrencyGet = (
    { hash }: SnapshotCurrencySnapshotHashCurrencyGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotCurrencySnapshotHashCurrencyGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/currency`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `region` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotRegionSnapshotHashRegionVendorGet
   * @summary Snapshot of region
   * @request GET:/snapshot/{hash}/region/{vendor}
   * @secure
   */
  snapshotRegionSnapshotHashRegionVendorGet = (
    { hash, vendor }: SnapshotRegionSnapshotHashRegionVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotRegionSnapshotHashRegionVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/region/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `zone` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotZoneSnapshotHashZoneVendorGet
   * @summary Snapshot of zone
   * @request GET:/snapshot/{hash}/zone/{vendor}
   * @secure
   */
  snapshotZoneSnapshotHashZoneVendorGet = (
    { hash, vendor }: SnapshotZoneSnapshotHashZoneVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotZoneSnapshotHashZoneVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/zone/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `server` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotServerSnapshotHashServerVendorGet
   * @summary Snapshot of server
   * @request GET:/snapshot/{hash}/server/{vendor}
   * @secure
   */
  snapshotServerSnapshotHashServerVendorGet = (
    { hash, vendor }: SnapshotServerSnapshotHashServerVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotServerSnapshotHashServerVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/server/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `server_description` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGet
   * @summary Snapshot of server_description
   * @request GET:/snapshot/{hash}/server_description/{vendor}
   * @secure
   */
  snapshotServerDescriptionSnapshotHashServerDescriptionVendorGet = (
    {
      hash,
      vendor,
    }: SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/server_description/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `server_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotServerPriceSnapshotHashServerPriceVendorGet
   * @summary Snapshot of server_price
   * @request GET:/snapshot/{hash}/server_price/{vendor}
   * @secure
   */
  snapshotServerPriceSnapshotHashServerPriceVendorGet = (
    { hash, vendor }: SnapshotServerPriceSnapshotHashServerPriceVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotServerPriceSnapshotHashServerPriceVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/server_price/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `storage` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotStorageSnapshotHashStorageVendorGet
   * @summary Snapshot of storage
   * @request GET:/snapshot/{hash}/storage/{vendor}
   * @secure
   */
  snapshotStorageSnapshotHashStorageVendorGet = (
    { hash, vendor }: SnapshotStorageSnapshotHashStorageVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotStorageSnapshotHashStorageVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/storage/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `storage_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotStoragePriceSnapshotHashStoragePriceVendorGet
   * @summary Snapshot of storage_price
   * @request GET:/snapshot/{hash}/storage_price/{vendor}
   * @secure
   */
  snapshotStoragePriceSnapshotHashStoragePriceVendorGet = (
    {
      hash,
      vendor,
    }: SnapshotStoragePriceSnapshotHashStoragePriceVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotStoragePriceSnapshotHashStoragePriceVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/storage_price/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `traffic_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGet
   * @summary Snapshot of traffic_price
   * @request GET:/snapshot/{hash}/traffic_price/{vendor}
   * @secure
   */
  snapshotTrafficPriceSnapshotHashTrafficPriceVendorGet = (
    {
      hash,
      vendor,
    }: SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/traffic_price/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `ipv4_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGet
   * @summary Snapshot of ipv4_price
   * @request GET:/snapshot/{hash}/ipv4_price/{vendor}
   * @secure
   */
  snapshotIpv4PriceSnapshotHashIpv4PriceVendorGet = (
    { hash, vendor }: SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/ipv4_price/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `database` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotDatabaseSnapshotHashDatabaseVendorGet
   * @summary Snapshot of database
   * @request GET:/snapshot/{hash}/database/{vendor}
   * @secure
   */
  snapshotDatabaseSnapshotHashDatabaseVendorGet = (
    { hash, vendor }: SnapshotDatabaseSnapshotHashDatabaseVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotDatabaseSnapshotHashDatabaseVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/database/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `database_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGet
   * @summary Snapshot of database_price
   * @request GET:/snapshot/{hash}/database_price/{vendor}
   * @secure
   */
  snapshotDatabasePriceSnapshotHashDatabasePriceVendorGet = (
    {
      hash,
      vendor,
    }: SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/database_price/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `database_storage` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGet
   * @summary Snapshot of database_storage
   * @request GET:/snapshot/{hash}/database_storage/{vendor}
   * @secure
   */
  snapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGet = (
    {
      hash,
      vendor,
    }: SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/database_storage/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `database_storage_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGet
   * @summary Snapshot of database_storage_price
   * @request GET:/snapshot/{hash}/database_storage_price/{vendor}
   * @secure
   */
  snapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGet = (
    {
      hash,
      vendor,
    }: SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/database_storage_price/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Snapshot of the `vendor_compliance_link` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGet
   * @summary Snapshot of vendor_compliance_link
   * @request GET:/snapshot/{hash}/vendor_compliance_link/{vendor}
   * @secure
   */
  snapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGet = (
    {
      hash,
      vendor,
    }: SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/vendor_compliance_link/${vendor}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Benchmark scores of one vendor and benchmark, with every config, for servers and databases (`resource_type`). Tell configs apart by the `config` column, and join `resource_id` to the `server_id` of the `server` snapshot (or the `database_id` of the `database` snapshot), e.g. to get `api_reference`, which differs from the id at some vendors. A benchmark without rows for the vendor gets empty arrays. The `benchmark` snapshot lists every benchmark. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   *
   * @tags Table Snapshots
   * @name SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGet
   * @summary Snapshot of benchmark_score
   * @request GET:/snapshot/{hash}/benchmark_score/{vendor}/{benchmark_id}
   * @secure
   */
  snapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGet = (
    {
      hash,
      vendor,
      benchmarkId,
    }: SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGetParams,
    params: RequestParams = {},
  ) =>
    this.http.request<
      SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGetData,
      void | HTTPValidationError
    >({
      path: `/snapshot/${hash}/benchmark_score/${vendor}/${benchmarkId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
