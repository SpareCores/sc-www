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
    expect(result?.rawOptions.plugins?.legend?.display).toBeFalse();
  });

  it("builds compare stress-ng charts with legends and server identity tooltips", () => {
    const servers: LineChartServer[] = [
      {
        display_name: "Server A",
        vendor_id: "aws",
        api_reference: "m7g.large",
        benchmark_scores: [
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
    const benchmarkMeta: LineBenchmarkMeta[] = [
      {
        benchmark_id: "stress_ng:div16",
        configs: [{ config: { cores: 1 } }, { config: { cores: 2 } }],
      },
    ];
    const rawOptionsBase: MutableLineChartOptions = {
      plugins: { legend: {} },
    };
    const percentOptionsBase: MutableLineChartOptions = {
      plugins: { legend: {} },
    };

    const result = service.buildCompareStressNgChart({
      servers,
      benchmarkMeta,
      rawOptionsBase,
      percentOptionsBase,
    });

    const title = result?.rawOptions.plugins?.tooltip?.callbacks?.title as
      | ((
          items: Array<{
            label: string;
            dataset: { serverTooltipIdentity?: string };
          }>,
        ) => string | string[])
      | undefined;

    expect(result?.rawOptions.plugins?.legend?.display).toBeTrue();
    expect(result?.percentOptions.plugins?.legend?.display).toBeTrue();
    expect(result?.data.datasets[0].label).toBe("Server A");
    expect(
      (result?.data.datasets[0] as { serverTooltipIdentity?: string })
        .serverTooltipIdentity,
    ).toBe("m7g.large by aws");
    expect(
      title?.([
        {
          label: "2",
          dataset: { serverTooltipIdentity: "m7g.large by aws" },
        },
      ]),
    ).toEqual(["m7g.large by aws", "2 vCPUs"]);
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

  it("builds a dual-axis pgbench chart with notes and a vCPU annotation", () => {
    const result = service.buildDetailsPgbenchChart({
      scores: [
        {
          benchmark_id: "pgbench:heavy_read_only",
          score: 120,
          note: "peak nearby",
          config: { concurrency: 2 },
          environment: { latency_avg_ms: 4.5 },
        },
        {
          benchmark_id: "pgbench:heavy_read_only",
          score: 200,
          config: { concurrency: 4 },
          environment: { latency_avg_ms: 8 },
        },
        {
          benchmark_id: "other",
          score: 1,
          config: { concurrency: 8 },
        },
      ],
      vcpus: 4,
      optionsBase: { plugins: { annotation: {}, legend: {} } },
      scoreUnit: "tps",
    });

    expect(result?.options.scales?.y?.title?.text).toBe("tps");
    expect(result?.data.datasets[0].yAxisID).toBe("y");
    expect(result?.data.datasets[1].yAxisID).toBe("y1");
    expect(result?.data.datasets[0].borderColor).toBe("#34D399");
    expect(result?.data.datasets[1].borderColor).toBe("#F97316");
    expect(result?.data.datasets[0].data).toEqual([
      { x: 2, y: 120, note: "peak nearby", unit: "tps" },
      { x: 4, y: 200, note: undefined, unit: "tps" },
    ]);
    expect(result?.data.datasets[1].data).toEqual([
      { x: 2, y: 4.5 },
      { x: 4, y: 8 },
    ]);

    const annotations = result?.options.plugins?.annotation?.annotations as
      | { line1?: { xMin?: number; content?: string } }
      | undefined;
    expect(annotations?.line1?.xMin).toBe(4);

    const label = result?.options.plugins?.tooltip?.callbacks?.label as
      | ((tooltipItem: {
          formattedValue: string;
          raw: { x: number; y: number; note?: string; unit?: string };
          dataset: { yAxisID?: string };
        }) => string)
      | undefined;
    expect(
      label?.({
        formattedValue: "120",
        raw: { x: 2, y: 120, note: "peak nearby", unit: "tps" },
        dataset: { yAxisID: "y" },
      }),
    ).toBe("Performance: 120 tps; Note: peak nearby");
    expect(
      label?.({
        formattedValue: "4.5",
        raw: { x: 2, y: 4.5 },
        dataset: { yAxisID: "y1" },
      }),
    ).toBe("Avg latency: 4.5 ms");
  });

  it("hides the pgbench chart when there are no matching scores", () => {
    expect(
      service.buildDetailsPgbenchChart({
        scores: [
          {
            benchmark_id: "other",
            score: 1,
            config: { concurrency: 1 },
          },
        ],
        optionsBase: {},
      }),
    ).toBeUndefined();
  });
});
