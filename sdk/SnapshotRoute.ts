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
  SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGetData,
  SnapshotBenchmarkSnapshotHashBenchmarkGetData,
  SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGetData,
  SnapshotCountrySnapshotHashCountryGetData,
  SnapshotCurrencySnapshotHashCurrencyGetData,
  SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGetData,
  SnapshotDatabaseSnapshotHashDatabaseVendorGetData,
  SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGetData,
  SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGetData,
  SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGetData,
  SnapshotManifestSnapshotHashGetData,
  SnapshotRegionSnapshotHashRegionVendorGetData,
  SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGetData,
  SnapshotServerPriceSnapshotHashServerPriceVendorGetData,
  SnapshotServerSnapshotHashServerVendorGetData,
  SnapshotStoragePriceSnapshotHashStoragePriceVendorGetData,
  SnapshotStorageSnapshotHashStorageVendorGetData,
  SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGetData,
  SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGetData,
  SnapshotVendorSnapshotHashVendorGetData,
  SnapshotZoneSnapshotHashZoneVendorGetData,
} from "./data-contracts";

export namespace Snapshot {
  /**
   * @description Every snapshot file of a database hash, sorted by path: its route below `/snapshot/{hash}/` (`path`), its number of rows (`rows`), and the SHA-256 of its uncompressed JSON (`sha256`). Compare the checksums with your last refresh to skip files that didn't change, e.g. specs, regions and zones, which rarely do. The manifest also lists which tables, vendors and benchmarks the hash has. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotManifestSnapshotHashGet
   * @summary Snapshot manifest
   * @request GET:/snapshot/{hash}
   * @secure
   */
  export namespace SnapshotManifestSnapshotHashGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotManifestSnapshotHashGetData;
  }

  /**
   * @description Snapshot of the `vendor` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotVendorSnapshotHashVendorGet
   * @summary Snapshot of vendor
   * @request GET:/snapshot/{hash}/vendor
   * @secure
   */
  export namespace SnapshotVendorSnapshotHashVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotVendorSnapshotHashVendorGetData;
  }

  /**
   * @description Snapshot of the `country` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotCountrySnapshotHashCountryGet
   * @summary Snapshot of country
   * @request GET:/snapshot/{hash}/country
   * @secure
   */
  export namespace SnapshotCountrySnapshotHashCountryGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotCountrySnapshotHashCountryGetData;
  }

  /**
   * @description Snapshot of the `compliance_framework` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGet
   * @summary Snapshot of compliance_framework
   * @request GET:/snapshot/{hash}/compliance_framework
   * @secure
   */
  export namespace SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotComplianceFrameworkSnapshotHashComplianceFrameworkGetData;
  }

  /**
   * @description Snapshot of the `benchmark` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotBenchmarkSnapshotHashBenchmarkGet
   * @summary Snapshot of benchmark
   * @request GET:/snapshot/{hash}/benchmark
   * @secure
   */
  export namespace SnapshotBenchmarkSnapshotHashBenchmarkGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotBenchmarkSnapshotHashBenchmarkGetData;
  }

  /**
   * @description Snapshot of the `currency` table. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotCurrencySnapshotHashCurrencyGet
   * @summary Snapshot of currency
   * @request GET:/snapshot/{hash}/currency
   * @secure
   */
  export namespace SnapshotCurrencySnapshotHashCurrencyGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotCurrencySnapshotHashCurrencyGetData;
  }

  /**
   * @description Snapshot of the `region` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotRegionSnapshotHashRegionVendorGet
   * @summary Snapshot of region
   * @request GET:/snapshot/{hash}/region/{vendor}
   * @secure
   */
  export namespace SnapshotRegionSnapshotHashRegionVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotRegionSnapshotHashRegionVendorGetData;
  }

  /**
   * @description Snapshot of the `zone` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotZoneSnapshotHashZoneVendorGet
   * @summary Snapshot of zone
   * @request GET:/snapshot/{hash}/zone/{vendor}
   * @secure
   */
  export namespace SnapshotZoneSnapshotHashZoneVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotZoneSnapshotHashZoneVendorGetData;
  }

  /**
   * @description Snapshot of the `server` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotServerSnapshotHashServerVendorGet
   * @summary Snapshot of server
   * @request GET:/snapshot/{hash}/server/{vendor}
   * @secure
   */
  export namespace SnapshotServerSnapshotHashServerVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotServerSnapshotHashServerVendorGetData;
  }

  /**
   * @description Snapshot of the `server_description` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGet
   * @summary Snapshot of server_description
   * @request GET:/snapshot/{hash}/server_description/{vendor}
   * @secure
   */
  export namespace SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotServerDescriptionSnapshotHashServerDescriptionVendorGetData;
  }

  /**
   * @description Snapshot of the `server_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotServerPriceSnapshotHashServerPriceVendorGet
   * @summary Snapshot of server_price
   * @request GET:/snapshot/{hash}/server_price/{vendor}
   * @secure
   */
  export namespace SnapshotServerPriceSnapshotHashServerPriceVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotServerPriceSnapshotHashServerPriceVendorGetData;
  }

  /**
   * @description Snapshot of the `storage` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotStorageSnapshotHashStorageVendorGet
   * @summary Snapshot of storage
   * @request GET:/snapshot/{hash}/storage/{vendor}
   * @secure
   */
  export namespace SnapshotStorageSnapshotHashStorageVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SnapshotStorageSnapshotHashStorageVendorGetData;
  }

  /**
   * @description Snapshot of the `storage_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotStoragePriceSnapshotHashStoragePriceVendorGet
   * @summary Snapshot of storage_price
   * @request GET:/snapshot/{hash}/storage_price/{vendor}
   * @secure
   */
  export namespace SnapshotStoragePriceSnapshotHashStoragePriceVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotStoragePriceSnapshotHashStoragePriceVendorGetData;
  }

  /**
   * @description Snapshot of the `traffic_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGet
   * @summary Snapshot of traffic_price
   * @request GET:/snapshot/{hash}/traffic_price/{vendor}
   * @secure
   */
  export namespace SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotTrafficPriceSnapshotHashTrafficPriceVendorGetData;
  }

  /**
   * @description Snapshot of the `ipv4_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGet
   * @summary Snapshot of ipv4_price
   * @request GET:/snapshot/{hash}/ipv4_price/{vendor}
   * @secure
   */
  export namespace SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotIpv4PriceSnapshotHashIpv4PriceVendorGetData;
  }

  /**
   * @description Snapshot of the `database` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotDatabaseSnapshotHashDatabaseVendorGet
   * @summary Snapshot of database
   * @request GET:/snapshot/{hash}/database/{vendor}
   * @secure
   */
  export namespace SnapshotDatabaseSnapshotHashDatabaseVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotDatabaseSnapshotHashDatabaseVendorGetData;
  }

  /**
   * @description Snapshot of the `database_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGet
   * @summary Snapshot of database_price
   * @request GET:/snapshot/{hash}/database_price/{vendor}
   * @secure
   */
  export namespace SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotDatabasePriceSnapshotHashDatabasePriceVendorGetData;
  }

  /**
   * @description Snapshot of the `database_storage` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGet
   * @summary Snapshot of database_storage
   * @request GET:/snapshot/{hash}/database_storage/{vendor}
   * @secure
   */
  export namespace SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotDatabaseStorageSnapshotHashDatabaseStorageVendorGetData;
  }

  /**
   * @description Snapshot of the `database_storage_price` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Prices (`price`, `price_upfront`, `price_monthly` and the tiers of `price_tiered`) converted to USD, unrounded, with `currency` set to `USD`. Rows whose prices can't be converted (a currency missing from the exchange rates) are left out. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGet
   * @summary Snapshot of database_storage_price
   * @request GET:/snapshot/{hash}/database_storage_price/{vendor}
   * @secure
   */
  export namespace SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotDatabaseStoragePriceSnapshotHashDatabaseStoragePriceVendorGetData;
  }

  /**
   * @description Snapshot of the `vendor_compliance_link` table for one vendor. A vendor without rows in the table gets empty arrays. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGet
   * @summary Snapshot of vendor_compliance_link
   * @request GET:/snapshot/{hash}/vendor_compliance_link/{vendor}
   * @secure
   */
  export namespace SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotVendorComplianceLinkSnapshotHashVendorComplianceLinkVendorGetData;
  }

  /**
   * @description Benchmark scores of one vendor and benchmark, with every config, for servers and databases (`resource_type`). Tell configs apart by the `config` column, and join `resource_id` to the `server_id` of the `server` snapshot (or the `database_id` of the `database` snapshot), e.g. to get `api_reference`, which differs from the id at some vendors. A benchmark without rows for the vendor gets empty arrays. The `benchmark` snapshot lists every benchmark. Snapshots let you read several tables from the same version of the database: every file of one `{hash}` comes from the same database, so references between them always resolve, e.g. every price's server is in the `server` snapshot of that hash. Pin `database_hash` from `/healthcheck` at the start of a refresh, and fetch every file with it. `/snapshot/{hash}` lists the files with checksums, so you can skip the ones that didn't change since your last refresh. Contents: - Only available records: status `active` or `planned-for-retirement`. Inactive and retired records are left out, and so are rows that reference them (e.g. the prices of a retired server, or of an inactive zone). - Every column of the table except `observed_at`: the hash already identifies the data version. For per-row timestamps, use `/table/*`. - Sorted by the table's primary key. - Columnar JSON: one array per column, with one element per row, all arrays of the same length. The response is immutable for a hash, requires an API key, and is sent gzipped only: send `Accept-Encoding: gzip` (e.g. `curl --compressed`), or you get a `406`. A `503` of type `/problems/snapshot-preparing` means the replica is still downloading or building the hash: retry the same request after `Retry-After` seconds (for about a minute at most). A `404` of type `/problems/snapshot-not-available` means the hash isn't available: switch to the `current` hash in the response body, and fetch again the files you already fetched. A `404` of type `/problems/not-found` is an unknown table, vendor or id: don't retry.
   * @tags Table Snapshots
   * @name SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGet
   * @summary Snapshot of benchmark_score
   * @request GET:/snapshot/{hash}/benchmark_score/{vendor}/{benchmark_id}
   * @secure
   */
  export namespace SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGet {
    export type RequestParams = {
      /**
       * Database hash
       * Database hash, e.g. `database_hash` of `/healthcheck`.
       */
      hash: string;
      /**
       * Vendor
       * Vendor id, e.g. `aws`.
       */
      vendor: string;
      /**
       * Benchmark
       * Benchmark id, e.g. `stress_ng:bestn`.
       */
      benchmarkId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody =
      SnapshotBenchmarkScoreSnapshotHashBenchmarkScoreVendorBenchmarkIdGetData;
  }
}
