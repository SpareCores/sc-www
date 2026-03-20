import { TestBed } from "@angular/core/testing";

import { BenchmarkLineChartBuilderService } from "./benchmark-line-chart-builder.service";
import {
  CompareSslOption,
  LineBenchmarkGroup,
  LineBenchmarkMeta,
  LineBenchmarkScore,
  LineChartServer,
  MutableBarChartOptions,
  MutableLineChartOptions,
} from "./benchmark-line-chart.types";

function createLineBenchmarkScore(params: {
  benchmarkId: string;
  score: number;
  config: LineBenchmarkScore["config"];
  note?: string;
}): LineBenchmarkScore {
  return {
    vendor_id: "vendor-a",
    server_id: "server-a",
    benchmark_id: params.benchmarkId,
    config: params.config,
    score: params.score,
    note: params.note,
  };
}

describe("BenchmarkLineChartBuilderService", () => {
  let service: BenchmarkLineChartBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenchmarkLineChartBuilderService);
  });

  it("builds details stress-ng charts with annotations", () => {
    const benchmarksByCategory: LineBenchmarkGroup[] = [
      {
        benchmark_id: "stress_ng:div16",
        benchmarks: [
          createLineBenchmarkScore({
            benchmarkId: "stress_ng:div16",
            config: { cores: 1 },
            score: 10,
          }),
          createLineBenchmarkScore({
            benchmarkId: "stress_ng:div16",
            config: { cores: 2 },
            score: 18,
          }),
        ],
      },
    ];
    const rawOptionsBase: MutableLineChartOptions = {
      plugins: { annotation: {}, legend: {} },
    };
    const percentOptionsBase: MutableLineChartOptions = {
      plugins: { annotation: {}, legend: {} },
    };

    const result = service.buildDetailsStressNgChart({
      serverDetails: { display_name: "Server A", cpu_cores: 2 },
      benchmarksByCategory,
      rawOptionsBase,
      percentOptionsBase,
    });

    const annotations = result?.rawOptions.plugins?.annotation?.annotations as
      | { line1?: { xMin?: number } }
      | undefined;

    expect(result?.data.labels).toEqual([1, 2]);
    expect(annotations?.line1?.xMin).toBe(1);
  });

  it("builds compare ssl charts for a selected algorithm", () => {
    const servers: LineChartServer[] = [
      {
        display_name: "Server A",
        benchmark_scores: [
          createLineBenchmarkScore({
            benchmarkId: "openssl",
            config: { algo: "sha256", block_size: 16 },
            score: 22,
          }),
        ],
      },
    ];
    const benchmarkMeta: LineBenchmarkMeta[] = [
      {
        benchmark_id: "openssl",
        name: "OpenSSL",
        description: null,
        framework: "openssl",
        configs: [{ config: { algo: "sha256", block_size: 16 } }],
      },
    ];
    const selectedAlgo: CompareSslOption = {
      name: "sha256",
      value: "sha256",
    };
    const baseOptions: MutableBarChartOptions = {
      plugins: { tooltip: { callbacks: {} } },
    };

    const result = service.buildCompareSslChart({
      servers,
      benchmarkMeta,
      selectedAlgo,
      baseOptions,
    });

    expect(result?.data.labels).toEqual([16]);
    expect(result?.data.datasets[0].data).toEqual([22]);
  });

  it("builds details ssl charts with algorithms on the x-axis", () => {
    const benchmarksByCategory: LineBenchmarkGroup[] = [
      {
        benchmark_id: "openssl",
        benchmarks: [
          createLineBenchmarkScore({
            benchmarkId: "openssl",
            config: { algo: "sha3-256", block_size: 16 },
            score: 20,
          }),
          createLineBenchmarkScore({
            benchmarkId: "openssl",
            config: { algo: "blake2b512", block_size: 16 },
            score: 10,
          }),
          createLineBenchmarkScore({
            benchmarkId: "openssl",
            config: { algo: "AES-256-CBC", block_size: 64 },
            score: 34,
          }),
          createLineBenchmarkScore({
            benchmarkId: "openssl",
            config: { algo: "sha256", block_size: 64 },
            score: 12,
          }),
        ],
      },
    ];

    const result = service.buildDetailsSslChart({
      benchmarksByCategory,
      baseOptions: {},
    });

    expect(result?.data.labels).toEqual([
      "AES-256-CBC",
      "blake2b512",
      "sha256",
      "sha3-256",
    ]);
    expect(result?.data.datasets.map((dataset) => dataset.label)).toEqual([
      "16",
      "64",
    ]);
    expect(result?.data.datasets[0].data).toEqual([null, 10, null, 20]);
    expect(result?.data.datasets[1].data).toEqual([34, null, 12, null]);
  });
});
