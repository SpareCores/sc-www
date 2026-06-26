import { TestBed } from "@angular/core/testing";

import { radarDatasetColors } from "../shared/chart-colors.constants";
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
  const membenchCopyCompareOption = {
    id: "membench-copy",
    name: "sc-membench: Copy (Read/Write)",
    benchmarkId: "membench:bandwidth_copy",
    infoBenchmarkId: "membench:bandwidth_copy",
  };
  const membenchCopyBenchmarkMeta: MemoryBenchmarkMeta[] = [
    { benchmark_id: "membench:bandwidth_copy", unit: "MB/s" },
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
        showCacheAnnotations: true,
      },
      serverDetails,
      benchmarkMeta,
      benchmarksByCategory,
    });

    expect(chart?.data.labels).toEqual([1]);
    expect(chart?.data.datasets.length).toBe(2);
    expect((chart?.options as any).scales.x.title.text).toBe(
      "Block sizes and CPU cache amounts",
    );
  });

  it("formats membench details x-axis labels as k and M", () => {
    const chart = service.buildServerDetailsChart({
      option: {
        id: "membench-bandwidth",
        name: "sc-membench: Bandwidth",
        benchmarkIds: ["membench:bandwidth_read"],
        infoBenchmarkId: "membench:bandwidth_read",
        showCacheAnnotations: false,
      },
      serverDetails: { cpu_cores: 4 },
      benchmarkMeta,
      benchmarksByCategory: [
        {
          benchmark_id: "membench:bandwidth_read",
          benchmarks: [
            {
              benchmark_id: "membench:bandwidth_read",
              config: { size_kb: 16 },
              score: 10,
            },
            {
              benchmark_id: "membench:bandwidth_read",
              config: { size_kb: 256 },
              score: 11,
            },
            {
              benchmark_id: "membench:bandwidth_read",
              config: { size_kb: 1024 },
              score: 12,
            },
          ],
        },
      ],
    });

    const xAxis = (chart?.options as any).scales.x;
    const scale = { ticks: [] as { value: number; label: string }[] };
    xAxis.afterBuildTicks(scale);

    expect(scale.ticks.map((tick) => tick.label)).toEqual([
      "16k",
      "256k",
      "1M",
    ]);

    const tooltipTitle = (chart?.options as any).plugins.tooltip.callbacks
      .title;
    expect(tooltipTitle([{ parsed: { x: 16 / 1024 } }])).toBe(
      "16 KiB block size",
    );
    expect(tooltipTitle([{ parsed: { x: 256 / 1024 } }])).toBe(
      "256 KiB block size",
    );
    expect(tooltipTitle([{ parsed: { x: 1 } }])).toBe("1 MiB block size");
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
        showCacheAnnotations: true,
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
        showCacheAnnotations: true,
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

  it("builds compare bw_mem charts with formatted block size axis", () => {
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
              config: { operation: "rdwr", size: 0.016384 },
              score: 50,
            },
            {
              benchmark_id: "bw_mem",
              config: { operation: "rdwr", size: 0.262144 },
              score: 75,
            },
            {
              benchmark_id: "bw_mem",
              config: { operation: "rdwr", size: 1 },
              score: 100,
            },
            {
              benchmark_id: "bw_mem",
              config: { operation: "rdwr", size: 2 },
              score: 110,
            },
            {
              benchmark_id: "bw_mem",
              config: { operation: "rdwr", size: 16 },
              score: 120,
            },
          ],
        },
      ],
    });

    expect(chart?.data.labels).toEqual([0.016384, 0.262144, 1, 2, 16]);
    expect(chart?.data.datasets[0].data).toEqual([50, 75, 100, 110, 120]);
    expect((chart?.options as any).scales.x.title.text).toBe(
      "Block sizes and CPU cache amounts",
    );

    const scale = { ticks: [] as { value: number; label: string }[] };
    (chart?.options as any).scales.x.afterBuildTicks(scale);
    expect(scale.ticks.map((tick) => tick.label)).toEqual([
      "16 KiB",
      "256 KiB",
      "1 MiB",
      "2 MiB",
      "16 MiB",
    ]);

    const tooltipTitle = (chart?.options as any).plugins.tooltip.callbacks
      .title;
    expect(tooltipTitle([{ parsed: { x: 0.016384 } }])).toBe(
      "bw_mem: Read/Write with 16 KiB block size",
    );
    expect(tooltipTitle([{ parsed: { x: 0.262144 } }])).toBe(
      "bw_mem: Read/Write with 256 KiB block size",
    );
    expect(tooltipTitle([{ parsed: { x: 1 } }])).toBe(
      "bw_mem: Read/Write with 1 MiB block size",
    );
    expect(tooltipTitle([{ parsed: { x: 2 } }])).toBe(
      "bw_mem: Read/Write with 2 MiB block size",
    );
    expect(tooltipTitle([{ parsed: { x: 16 } }])).toBe(
      "bw_mem: Read/Write with 16 MiB block size",
    );
  });

  it("formats membench compare block sizes as KiB and MiB labels", () => {
    const chart = service.buildServerCompareChart({
      option: membenchCopyCompareOption,
      benchmarkMeta: membenchCopyBenchmarkMeta,
      servers: [
        {
          display_name: "Server A",
          benchmark_scores: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 16 },
              score: 10,
            },
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 256 },
              score: 11,
            },
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 12,
            },
          ],
        },
      ],
    });

    const xAxis = (chart?.options as any).scales.x;
    expect(xAxis.title.text).toBe("Block sizes and CPU cache amounts");

    const scale = { ticks: [] as { value: number; label: string }[] };
    xAxis.afterBuildTicks(scale);
    expect(scale.ticks.map((tick) => tick.label)).toEqual([
      "16 KiB",
      "256 KiB",
      "1 MiB",
    ]);

    const tooltipTitle = (chart?.options as any).plugins.tooltip.callbacks
      .title;
    expect(tooltipTitle([{ parsed: { x: 16 / 1024 } }])).toBe(
      "sc-membench: Copy (Read/Write) with 16 KiB block size",
    );
    expect(tooltipTitle([{ parsed: { x: 256 / 1024 } }])).toBe(
      "sc-membench: Copy (Read/Write) with 256 KiB block size",
    );
    expect(tooltipTitle([{ parsed: { x: 1 } }])).toBe(
      "sc-membench: Copy (Read/Write) with 1 MiB block size",
    );
  });

  it("starts compare legend entries hidden for servers without matching memory data", () => {
    const chart = service.buildServerCompareChart({
      option: membenchCopyCompareOption,
      benchmarkMeta: membenchCopyBenchmarkMeta,
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

  it("places compare cache point annotations using KiB cache sizes", () => {
    const chart = service.buildServerCompareChart({
      option: membenchCopyCompareOption,
      benchmarkMeta: membenchCopyBenchmarkMeta,
      servers: [
        {
          display_name: "Server A",
          cpu_l1d_cache: 32,
          cpu_l2_cache: 2048,
          cpu_l3_cache: 32768,
          benchmark_scores: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 100,
            },
          ],
        },
      ],
    });

    const annotations = (chart?.options as any).plugins.annotation.annotations;
    const chartContext = {
      data: { datasets: chart?.data.datasets },
    };

    expect(annotations["cache-32"].type).toBe("point");
    expect(annotations["cache-32"].xValue).toBe(32 / 1024);
    expect(annotations["cache-2048"].xValue).toBe(2048 / 1024);
    expect(annotations["cache-32768"].xValue).toBe(32768 / 1024);
    expect(
      annotations["cache-32"].backgroundColor({ chart: chartContext }),
    ).toBe(`${radarDatasetColors[0].borderColor}20`);
    expect(annotations["cache-32"].borderColor({ chart: chartContext })).toBe(
      radarDatasetColors[0].borderColor,
    );
    expect((chart?.options as any).plugins.annotation.clip).toBeFalse();
    expect((chart?.options as any).scales.x.ticks.padding).toBe(10);

    const l1Label = annotations["cache-32-label"];
    const l2Label = annotations["cache-2048-label"];
    const l3Label = annotations["cache-32768-label"];
    expect(l1Label.content({ chart: chartContext })).toEqual([
      "Server A",
      "L1D Cache: 32 KiB",
    ]);
    expect(l2Label.content({ chart: chartContext })).toEqual([
      "Server A",
      "L2 Cache: 2 MiB",
    ]);
    expect(l3Label.content({ chart: chartContext })).toEqual([
      "Server A",
      "L3 Cache: 32 MiB",
    ]);
  });

  it("skips compare cache annotations for missing cache levels", () => {
    const chart = service.buildServerCompareChart({
      option: membenchCopyCompareOption,
      benchmarkMeta: membenchCopyBenchmarkMeta,
      servers: [
        {
          display_name: "Server A",
          cpu_l2_cache: 2048,
          benchmark_scores: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 100,
            },
          ],
        },
      ],
    });

    const annotations = (chart?.options as any).plugins.annotation.annotations;

    expect(annotations["cache-32"]).toBeUndefined();
    expect(annotations["cache-2048"].xValue).toBe(2);
    expect(annotations["cache-32768"]).toBeUndefined();
  });

  it("hides compare cache annotations when the server dataset is hidden", () => {
    const chart = service.buildServerCompareChart({
      option: membenchCopyCompareOption,
      benchmarkMeta: membenchCopyBenchmarkMeta,
      servers: [
        {
          display_name: "Visible",
          cpu_l1d_cache: 32,
          benchmark_scores: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 100,
            },
          ],
        },
        {
          display_name: "Hidden",
          cpu_l1d_cache: 64,
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

    const annotations = (chart?.options as any).plugins.annotation.annotations;
    const visibleDisplay = annotations["cache-32"].display({
      chart: { data: { datasets: chart?.data.datasets } },
    });
    const hiddenDisplay = annotations["cache-64"].display({
      chart: { data: { datasets: chart?.data.datasets } },
    });

    expect(visibleDisplay).toBeTrue();
    expect(hiddenDisplay).toBeFalse();
  });

  it("merges compare cache markers with the same cache size", () => {
    const chart = service.buildServerCompareChart({
      option: membenchCopyCompareOption,
      benchmarkMeta: membenchCopyBenchmarkMeta,
      servers: [
        {
          display_name: "Server A",
          cpu_l1d_cache: 32,
          benchmark_scores: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 100,
            },
          ],
        },
        {
          display_name: "Server B",
          cpu_l1d_cache: 32,
          benchmark_scores: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 90,
            },
          ],
        },
      ],
    });

    const annotations = (chart?.options as any).plugins.annotation.annotations;
    const marker = annotations["cache-32"];
    const label = annotations["cache-32-label"];
    const chartContext = {
      ctx: {
        createLinearGradient: () => ({
          addColorStop: jasmine.createSpy("addColorStop"),
        }),
      },
      scales: {
        x: { getPixelForValue: () => 100 },
        y: { min: 0 },
      },
      data: { datasets: chart?.data.datasets },
    };

    expect(marker.borderWidth({ chart: chartContext })).toBe(0);
    expect(marker.borderColor({ chart: chartContext })).toBeUndefined();
    expect(marker.radius({ chart: chartContext })).toBe(10.5);
    expect(typeof marker.backgroundColor).toBe("function");
    expect(marker.backgroundColor({ chart: chartContext })).toBeDefined();
    expect(label.content({ chart: chartContext })).toEqual([
      "Server A",
      "L1D Cache: 32 KiB",
      "",
      "Server B",
      "L1D Cache: 32 KiB",
    ]);
  });

  it("excludes hidden servers from merged compare cache tooltips", () => {
    const chart = service.buildServerCompareChart({
      option: membenchCopyCompareOption,
      benchmarkMeta: membenchCopyBenchmarkMeta,
      servers: [
        {
          display_name: "Visible",
          cpu_l1d_cache: 32,
          benchmark_scores: [
            {
              benchmark_id: "membench:bandwidth_copy",
              config: { size_kb: 1024 },
              score: 100,
            },
          ],
        },
        {
          display_name: "Hidden",
          cpu_l1d_cache: 32,
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

    const annotations = (chart?.options as any).plugins.annotation.annotations;
    const label = annotations["cache-32-label"];
    const chartContext = {
      data: { datasets: chart?.data.datasets },
    };

    expect(label.content({ chart: chartContext })).toEqual([
      "Visible",
      "L1D Cache: 32 KiB",
    ]);
    expect(annotations["cache-32"].display({ chart: chartContext })).toBeTrue();
    expect(annotations["cache-32"].borderWidth({ chart: chartContext })).toBe(
      2.5,
    );
    expect(annotations["cache-32"].radius({ chart: chartContext })).toBe(8);
    expect(annotations["cache-32"].borderColor({ chart: chartContext })).toBe(
      radarDatasetColors[0].borderColor,
    );
    expect(
      annotations["cache-32"].backgroundColor({ chart: chartContext }),
    ).toBe(`${radarDatasetColors[0].borderColor}20`);
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
