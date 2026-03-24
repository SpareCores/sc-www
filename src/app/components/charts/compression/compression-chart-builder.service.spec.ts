import { TestBed } from "@angular/core/testing";

import { CompressionChartBuilderService } from "./compression-chart-builder.service";
import {
  CompareCompressionOption,
  CompressionBenchmarkGroup,
  CompressionBenchmarkScore,
  CompressionMutableChartOptions,
  CompressionServer,
} from "./compression-chart.types";

function createCompressionScore(params: {
  benchmarkId: string;
  score: number;
  config: CompressionBenchmarkScore["config"];
}): CompressionBenchmarkScore {
  return {
    vendor_id: "vendor-a",
    server_id: "server-a",
    benchmark_id: params.benchmarkId,
    config: params.config,
    score: params.score,
  };
}

describe("CompressionChartBuilderService", () => {
  let service: CompressionChartBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressionChartBuilderService);
  });

  it("builds details compression data", () => {
    const benchmarksByCategory: CompressionBenchmarkGroup[] = [
      {
        benchmark_id: "compression_text:ratio",
        benchmarks: [
          createCompressionScore({
            benchmarkId: "compression_text:ratio",
            config: { algo: "gzip", compression_level: 1 },
            score: 0.5,
          }),
        ],
      },
      {
        benchmark_id: "compression_text:compress",
        benchmarks: [
          createCompressionScore({
            benchmarkId: "compression_text:compress",
            config: { algo: "gzip", compression_level: 1 },
            score: 10,
          }),
        ],
      },
      {
        benchmark_id: "compression_text:decompress",
        benchmarks: [
          createCompressionScore({
            benchmarkId: "compression_text:decompress",
            config: { algo: "gzip", compression_level: 1 },
            score: 20,
          }),
        ],
      },
    ];
    const baseOptions: CompressionMutableChartOptions = {
      parsing: {},
      scales: { x: { title: {} }, y: { title: {} } },
    };

    const result = service.buildDetailsChart({
      benchmarksByCategory,
      mode: service.getDetailsModes()[0],
      baseOptions,
    });

    expect(result?.data.datasets.length).toBe(1);
    expect(result?.options.scales?.x?.title?.text).toBe("Compression Level");
  });

  it("builds compare compression data", () => {
    const servers: CompressionServer[] = [
      {
        display_name: "A",
        benchmark_scores: [
          createCompressionScore({
            benchmarkId: "compression_text:ratio",
            config: { algo: "gzip", threads: 1, compression_level: 1 },
            score: 0.5,
          }),
          createCompressionScore({
            benchmarkId: "compression_text:compress",
            config: { algo: "gzip", threads: 1, compression_level: 1 },
            score: 10,
          }),
          createCompressionScore({
            benchmarkId: "compression_text:decompress",
            config: { algo: "gzip", threads: 1, compression_level: 1 },
            score: 20,
          }),
        ],
      },
    ];
    const selectedOption: CompareCompressionOption = {
      name: "algo: gzip, threads: 1",
      options: { algo: "gzip", threads: 1 },
    };
    const compareOptionsBase: CompressionMutableChartOptions = {
      plugins: { tooltip: { callbacks: {} } },
    };

    const result = service.buildCompareCharts({
      servers,
      selectedOption,
      compressOptionsBase: compareOptionsBase,
      decompressOptionsBase: compareOptionsBase,
    });

    expect(result?.compressData.datasets.length).toBe(1);
    expect(result?.decompressData.datasets.length).toBe(1);
  });
});
