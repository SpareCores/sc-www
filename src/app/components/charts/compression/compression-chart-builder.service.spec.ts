import { TestBed } from "@angular/core/testing";

import { CompressionChartBuilderService } from "./compression-chart-builder.service";
import { radarDatasetColors } from "../shared/chart-colors.constants";
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

function createBenchmarkGroups(
  entries: Array<{
    config: CompressionBenchmarkScore["config"];
    ratio: number;
    compress: number;
    decompress: number;
  }>,
): CompressionBenchmarkGroup[] {
  return [
    {
      benchmark_id: "compression_text:ratio",
      benchmarks: entries.map((entry) =>
        createCompressionScore({
          benchmarkId: "compression_text:ratio",
          config: entry.config,
          score: entry.ratio,
        }),
      ),
    },
    {
      benchmark_id: "compression_text:compress",
      benchmarks: entries.map((entry) =>
        createCompressionScore({
          benchmarkId: "compression_text:compress",
          config: entry.config,
          score: entry.compress,
        }),
      ),
    },
    {
      benchmark_id: "compression_text:decompress",
      benchmarks: entries.map((entry) =>
        createCompressionScore({
          benchmarkId: "compression_text:decompress",
          config: entry.config,
          score: entry.decompress,
        }),
      ),
    },
  ];
}

describe("CompressionChartBuilderService", () => {
  let service: CompressionChartBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressionChartBuilderService);
  });

  it("splits details datasets by block size and reuses per-algorithm colors", () => {
    const benchmarksByCategory = createBenchmarkGroups([
      {
        config: { algo: "gzip", compression_level: 1 },
        ratio: 0.5,
        compress: 10,
        decompress: 20,
      },
      {
        config: { algo: "bzip3", block_size: 1024 * 1024 },
        ratio: 0.6,
        compress: 11,
        decompress: 21,
      },
      {
        config: { algo: "bzip3", block_size: 64 * 1024 * 1024 },
        ratio: 0.7,
        compress: 12,
        decompress: 22,
      },
      {
        config: { algo: "lz4", compression_level: 0, block_size: 0 },
        ratio: 0.8,
        compress: 13,
        decompress: 23,
      },
      {
        config: { algo: "lz4", compression_level: 0, block_size: 4 },
        ratio: 0.81,
        compress: 14,
        decompress: 24,
      },
      {
        config: { algo: "lz4", compression_level: 0, block_size: 6 },
        ratio: 0.82,
        compress: 15,
        decompress: 25,
      },
      {
        config: { algo: "lz4", compression_level: 1, block_size: 0 },
        ratio: 0.83,
        compress: 16,
        decompress: 26,
      },
      {
        config: { algo: "lz4", compression_level: 1, block_size: 4 },
        ratio: 0.84,
        compress: 17,
        decompress: 27,
      },
      {
        config: { algo: "lz4", compression_level: 1, block_size: 6 },
        ratio: 0.85,
        compress: 18,
        decompress: 28,
      },
    ]);
    const baseOptions: CompressionMutableChartOptions = {
      parsing: {},
      scales: { x: { title: {} }, y: { title: {} } },
    };

    const result = service.buildDetailsChart({
      benchmarksByCategory,
      mode: service.getDetailsModes()[0],
      baseOptions,
    });

    expect(result?.data.labels).toEqual(["N/A", "0", "1"]);
    expect(result?.options.parsing).toEqual({
      xAxisKey: "compression_level_label",
      yAxisKey: "compress",
    });
    expect(result?.data.datasets.map((dataset) => dataset.label)).toEqual([
      "gzip",
      "bzip3 (block_size: 1 MiB)",
      "bzip3 (block_size: 64 MiB)",
      "lz4 (block_size: 64 KiB)",
      "lz4 (block_size: 1 MiB)",
      "lz4 (block_size: 4 MiB)",
    ]);

    const bzip3Datasets =
      result?.data.datasets.filter((dataset) =>
        dataset.label.startsWith("bzip3"),
      ) || [];
    const lz4Datasets =
      result?.data.datasets.filter((dataset) =>
        dataset.label.startsWith("lz4"),
      ) || [];

    expect(
      new Set(bzip3Datasets.map((dataset) => dataset.borderColor)).size,
    ).toBe(1);
    expect(
      new Set(lz4Datasets.map((dataset) => dataset.borderColor)).size,
    ).toBe(1);
    expect(bzip3Datasets[0]?.borderColor).not.toBe(lz4Datasets[0]?.borderColor);
    expect(bzip3Datasets[0]?.borderColor).toBe(
      radarDatasetColors[1].borderColor,
    );
    expect(lz4Datasets[0]?.borderColor).toBe(radarDatasetColors[2].borderColor);
    expect(
      bzip3Datasets.every(
        (dataset) => dataset.data[0]?.compression_level_label === "N/A",
      ),
    ).toBeTrue();
    expect(
      lz4Datasets.map((dataset) =>
        dataset.data.map((item) => item.compression_level_label),
      ),
    ).toEqual([
      ["0", "1"],
      ["0", "1"],
      ["0", "1"],
    ]);
    expect(lz4Datasets[0]?.data[0]?.tooltip).toContain("block size: 64 KiB");
    expect(result?.options.scales?.x?.title?.text).toBe("Compression Level");
  });

  it("omits the N/A label when every point has a compression level", () => {
    const benchmarksByCategory = createBenchmarkGroups([
      {
        config: { algo: "gzip", compression_level: 0 },
        ratio: 0.5,
        compress: 10,
        decompress: 20,
      },
      {
        config: { algo: "gzip", compression_level: 1 },
        ratio: 0.6,
        compress: 11,
        decompress: 21,
      },
    ]);
    const baseOptions: CompressionMutableChartOptions = {
      parsing: {},
      scales: { x: { title: {} }, y: { title: {} } },
    };

    const result = service.buildDetailsChart({
      benchmarksByCategory,
      mode: service.getDetailsModes()[2],
      baseOptions,
    });

    expect(result?.data.labels).toEqual(["0", "1"]);
    expect(result?.options.parsing).toEqual({
      xAxisKey: "compression_level_label",
      yAxisKey: "ratio",
    });
  });

  it("keeps ratio-based speed modes on the compression ratio axis", () => {
    const benchmarksByCategory = createBenchmarkGroups([
      {
        config: { algo: "bzip3", block_size: 1024 * 1024 },
        ratio: 5,
        compress: 25,
        decompress: 50,
      },
      {
        config: { algo: "lz4", compression_level: 0, block_size: 0 },
        ratio: 2,
        compress: 10,
        decompress: 20,
      },
      {
        config: { algo: "lz4", compression_level: 1, block_size: 0 },
        ratio: 4,
        compress: 20,
        decompress: 40,
      },
    ]);
    const baseOptions: CompressionMutableChartOptions = {
      parsing: {},
      scales: { x: { title: {} }, y: { title: {} } },
    };

    const result = service.buildDetailsChart({
      benchmarksByCategory,
      mode: service.getDetailsModes()[3],
      baseOptions,
    });

    expect(result?.data.labels).toEqual([2, 4, 5]);
    expect(result?.options.parsing).toEqual({
      xAxisKey: "ratio",
      yAxisKey: "compress",
    });
    expect(result?.options.scales?.x?.title?.text).toBe("Compression Ratio");

    const lz4Dataset = result?.data.datasets.find(
      (dataset) => dataset.label === "lz4 (block_size: 64 KiB)",
    );

    expect(lz4Dataset?.data.map((item) => item.ratio)).toEqual([2, 4]);
    expect(lz4Dataset?.data.map((item) => item.compress)).toEqual([10, 20]);
  });

  it("builds compare compression data", () => {
    const servers: CompressionServer[] = [
      {
        display_name: "A",
        benchmark_scores: [
          createCompressionScore({
            benchmarkId: "compression_text:ratio",
            config: { algo: "gzip", cores: "single", compression_level: 1 },
            score: 0.5,
          }),
          createCompressionScore({
            benchmarkId: "compression_text:compress",
            config: { algo: "gzip", cores: "single", compression_level: 1 },
            score: 10,
          }),
          createCompressionScore({
            benchmarkId: "compression_text:decompress",
            config: { algo: "gzip", cores: "single", compression_level: 1 },
            score: 20,
          }),
        ],
      },
    ];
    const selectedOption: CompareCompressionOption = {
      name: "algo: gzip, cores: single",
      options: { algo: "gzip", cores: "single" },
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
