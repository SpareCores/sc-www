import { TestBed } from "@angular/core/testing";

import { MemoryChartBuilderService } from "./memory-chart-builder.service";
import {
  MemoryBenchmarkGroup,
  MemoryBenchmarkMeta,
  MemoryChartServer,
  MemoryDetailsServer,
} from "./memory-chart.types";

describe("MemoryChartBuilderService", () => {
  let service: MemoryChartBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemoryChartBuilderService);
  });

  const benchmarkMeta: MemoryBenchmarkMeta[] = [
    {
      benchmark_id: "membench:bandwidth_copy",
      unit: "MB/s",
      higher_is_better: true,
    },
  ];

  it("builds details membench charts from size_kb scales", () => {
    const serverDetails: MemoryDetailsServer = { cpu_cores: 4 };
    const benchmarksByCategory: MemoryBenchmarkGroup[] = [
      {
        benchmark_id: "membench:bandwidth_read",
        benchmarks: [
          {
            benchmark_id: "membench:bandwidth_read",
            config: { size_kb: 1024 },
            score: 10,
          },
        ],
      },
      {
        benchmark_id: "membench:bandwidth_copy",
        benchmarks: [
          {
            benchmark_id: "membench:bandwidth_copy",
            config: { size_kb: 1024 },
            score: 12,
          },
        ],
      },
    ];

    const chart = service.buildServerDetailsChart({
      option: {
        id: "membench-bandwidth",
        name: "sc-membench: Bandwidth",
        benchmarkIds: ["membench:bandwidth_read", "membench:bandwidth_copy"],
        infoBenchmarkId: "membench:bandwidth_copy",
      },
      serverDetails,
      benchmarkMeta,
      benchmarksByCategory,
    });

    expect(chart?.data.labels).toEqual([1]);
    expect(chart?.data.datasets.length).toBe(2);
    expect((chart?.options as any).scales.x.title.text).toBe("MiB");
  });

  it("places cache annotations on the memory chart using KiB cache sizes", () => {
    const serverDetails: MemoryDetailsServer = {
      cpu_cores: 4,
      cpu_l1d_cache: 32,
      cpu_l2_cache: 2048,
      cpu_l3_cache: 32768,
    };

    const chart = service.buildServerDetailsChart({
      option: {
        id: "membench-bandwidth",
        name: "sc-membench: Bandwidth",
        benchmarkIds: ["membench:bandwidth_read", "membench:bandwidth_copy"],
        infoBenchmarkId: "membench:bandwidth_copy",
      },
      serverDetails,
      benchmarkMeta,
      benchmarksByCategory: [
        {
          benchmark_id: "membench:bandwidth_read",
          benchmarks: [
            {
              benchmark_id: "membench:bandwidth_read",
              config: { size_kb: 32 },
              score: 10,
            },
          ],
        },
        {
          benchmark_id: "membench:bandwidth_copy",
          benchmarks: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 12,
            },
          ],
        },
      ],
    });

    expect(
      (chart?.options as any).plugins.annotation.annotations.line1.value,
    ).toBe(32 / 1024);
    expect(
      (chart?.options as any).plugins.annotation.annotations.line2.value,
    ).toBe(2048 / 1024);
    expect(
      (chart?.options as any).plugins.annotation.annotations.line3.value,
    ).toBe(32768 / 1024);
  });

  it("shows cache annotations for the sc-membench latency details chart", () => {
    const chart = service.buildServerDetailsChart({
      option: {
        id: "membench-latency",
        name: "sc-membench: Latency",
        benchmarkIds: ["membench:latency"],
        infoBenchmarkId: "membench:latency",
        higherIsBetter: false,
        singleSeries: true,
      },
      serverDetails: {
        cpu_cores: 4,
        cpu_l1d_cache: 32,
        cpu_l2_cache: 2048,
        cpu_l3_cache: 32768,
      },
      benchmarkMeta: [
        {
          benchmark_id: "membench:latency",
          unit: "ns",
          higher_is_better: false,
        },
      ],
      benchmarksByCategory: [
        {
          benchmark_id: "membench:latency",
          benchmarks: [
            {
              benchmark_id: "membench:latency",
              config: { size_kb: 32 },
              score: 3.1,
            },
            {
              benchmark_id: "membench:latency",
              config: { size_kb: 1024 },
              score: 4.2,
            },
          ],
        },
      ],
    });

    expect(
      (chart?.options as any).plugins.annotation.annotations.line1.label
        .content,
    ).toBe("L1D Cache");
    expect(
      (chart?.options as any).plugins.annotation.annotations.line2.label
        .content,
    ).toBe("L2 Cache");
    expect(
      (chart?.options as any).plugins.annotation.annotations.line3.label
        .content,
    ).toBe("L3 Cache");
  });

  it("builds compare bw_mem charts with legacy MB scale", () => {
    const chart = service.buildServerCompareChart({
      option: {
        id: "bw-mem-rdwr",
        name: "bw_mem: Read/Write",
        benchmarkId: "bw_mem",
        infoBenchmarkId: "bw_mem",
        legacyOperation: "rdwr",
      },
      benchmarkMeta: [{ benchmark_id: "bw_mem", unit: "MB/s" }],
      servers: [
        {
          display_name: "A",
          benchmark_scores: [
            {
              benchmark_id: "bw_mem",
              config: { operation: "rdwr", size: 1 },
              score: 100,
            },
          ],
        },
      ],
    });

    expect(chart?.data.labels).toEqual([1]);
    expect(chart?.data.datasets[0].data).toEqual([100]);
    expect((chart?.options as any).scales.x.title.text).toBe("MB");
  });

  it("starts compare legend entries hidden for servers without matching memory data", () => {
    const chart = service.buildServerCompareChart({
      option: {
        id: "membench-copy",
        name: "sc-membench: Copy (Read/Write)",
        benchmarkId: "membench:bandwidth_copy",
        infoBenchmarkId: "membench:bandwidth_copy",
      },
      benchmarkMeta: [
        { benchmark_id: "membench:bandwidth_copy", unit: "MB/s" },
      ],
      servers: [
        {
          display_name: "Has data",
          benchmark_scores: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 100,
            },
          ],
        },
        {
          display_name: "No data",
          benchmark_scores: [
            {
              benchmark_id: "membench:latency",
              config: { size_kb: 1024 },
              score: 4,
            },
          ],
        },
      ],
    });

    expect(chart?.data.datasets[0].hidden).toBeFalse();
    expect(chart?.data.datasets[1].data).toEqual([null]);
    expect(chart?.data.datasets[1].hidden).toBeTrue();
  });

  it("returns sc-membench compare options when membench scores exist", () => {
    const servers: MemoryChartServer[] = [
      {
        display_name: "Server A",
        benchmark_scores: [
          {
            benchmark_id: "membench:bandwidth_copy",
            config: { size_kb: 1024 },
            score: 12,
          },
          {
            benchmark_id: "membench:latency",
            config: { size_kb: 1024 },
            score: 4,
          },
        ],
      },
    ];

    const options = service.getAvailableCompareOptions(servers);

    expect(options.map((option) => option.id)).toEqual([
      "membench-copy",
      "membench-latency",
    ]);
  });

  it("prefers sc-membench compare options before legacy bw_mem defaults", () => {
    const preferred = service.getPreferredCompareOption([
      {
        id: "bw-mem-rdwr",
        name: "bw_mem: Read/Write",
        benchmarkId: "bw_mem",
      },
      {
        id: "membench-copy",
        name: "sc-membench: Copy (Read/Write)",
        benchmarkId: "membench:bandwidth_copy",
      },
    ]);

    expect(preferred?.id).toBe("membench-copy");
  });

  it("uses option metadata to resolve lower-is-better tooltip and icon", () => {
    const option = {
      id: "membench-latency",
      name: "sc-membench: Latency",
      benchmarkId: "membench:latency",
      infoBenchmarkId: "membench:latency",
    };
    const meta: MemoryBenchmarkMeta[] = [
      {
        benchmark_id: "membench:latency",
        higher_is_better: false,
      },
    ];

    expect(service.getOrderTooltip(option, meta)).toBe("Lower is better.");
    expect(service.getDirectionIcon(option, meta)).toBe("circle-arrow-down");
  });

  it("lets option flags override metadata when resolving tooltip direction", () => {
    const option = {
      id: "membench-latency",
      name: "sc-membench: Latency",
      benchmarkId: "membench:latency",
      infoBenchmarkId: "membench:latency",
      higherIsBetter: true,
    };
    const meta: MemoryBenchmarkMeta[] = [
      {
        benchmark_id: "membench:latency",
        higher_is_better: false,
      },
    ];

    expect(service.getOrderTooltip(option, meta)).toBe("Higher is better.");
    expect(service.getDirectionIcon(option, meta)).toBe("circle-arrow-up");
  });
});
