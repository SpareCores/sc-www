/**
 * Benchmark Workloads Mock Data Interfaces
 *
 * These interfaces define the shape of mock/enrichment data that supplements
 * the Benchmark objects fetched from the /table/benchmark API endpoint.
 *
 * TODO: Replace mock data with real API responses once the relevant
 * endpoints are implemented (server counts, measurement stats, histograms).
 */

/**
 * A single bin in a histogram distribution of benchmark scores.
 * Represents the count of servers (N) whose benchmark score falls
 * within the [low, high) range.
 *
 * @example
 * { low: 5000, high: 10000, N: 142 }
 */
export interface BenchmarkHistogramBin {
  /** Lower bound of the score range (inclusive). */
  low: number;
  /** Upper bound of the score range (exclusive). */
  high: number;
  /** Number of server types whose score falls within [low, high). */
  N: number;
}

/**
 * Enrichment/mock data for a single benchmark workload.
 * Keyed to a `Benchmark` record from the API via `benchmark_id`.
 *
 * Fields that currently use mocked values are marked with @mock.
 * Fields that mirror API data are marked with @api-fallback (used as
 * a fallback when the API field is null/undefined).
 */
export interface BenchmarkWorkloadMockData {
  /**
   * Unique identifier matching `Benchmark.benchmark_id` from the API.
   * This is the join key between the API data and this mock record.
   */
  benchmark_id: string;

  /**
   * @mock Number of distinct server types that have been evaluated
   * for this benchmark.
   * TODO: replace with real value from stats endpoint.
   */
  server_count: number;

  /**
   * @mock Total number of individual measurements (across all server
   * instances, regions, and configuration variants).
   * TODO: replace with real value from stats endpoint.
   */
  measurement_count: number;

  /**
   * @mock Lowest observed score for this benchmark across all servers.
   * TODO: replace with real value from stats endpoint.
   */
  measurement_min: number;

  /**
   * @mock Highest observed score for this benchmark across all servers.
   * TODO: replace with real value from stats endpoint.
   */
  measurement_max: number;

  /**
   * @api-fallback Human-readable unit of measurement (e.g. "MB/sec",
   * "score", "ratio", "ops/sec"). Used as a fallback when
   * `Benchmark.unit` from the API is null or undefined.
   */
  unit: string;

  /**
   * @mock Example values for each key in `Benchmark.config_fields`.
   * The record key corresponds to a config field name and the value
   * is an array of representative example values for that field.
   *
   * @example
   * {
   *   "operation": ["rd", "rdwr", "wr"],
   *   "size": ["1", "4", "16", "64", "256"]
   * }
   *
   * TODO: replace with real values from benchmark configs endpoint.
   */
  config_examples: Record<string, string[]>;

  /**
   * @mock Histogram distribution of benchmark scores across server types.
   * Up to 20 bins; each bin covers a contiguous score range.
   * TODO: replace with real values from stats/histogram endpoint.
   */
  histogram: BenchmarkHistogramBin[];
}
