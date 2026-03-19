export type MemoryChartOptionBase = {
  id: string;
  name: string;
  infoBenchmarkId?: string;
  higherIsBetter?: boolean;
};

export type ServerDetailsMemoryChartOption = MemoryChartOptionBase & {
  benchmarkIds: string[];
  tooltip?: string;
  unitSuffix?: string;
  yAxisLabel?: string;
  perCore?: boolean;
  singleSeries?: boolean;
  legacyOperations?: string[];
};

export const serverDetailsMemoryChartOptions: ServerDetailsMemoryChartOption[] =
  [
    {
      id: "membench-bandwidth",
      name: "sc-membench: Bandwidth",
      benchmarkIds: [
        "membench:bandwidth_read",
        "membench:bandwidth_write",
        "membench:bandwidth_copy",
      ],
      infoBenchmarkId: "membench:bandwidth_copy",
      higherIsBetter: true,
    },
    {
      id: "membench-bandwidth-per-core",
      name: "sc-membench: Bandwidth per core",
      benchmarkIds: [
        "membench:bandwidth_read",
        "membench:bandwidth_write",
        "membench:bandwidth_copy",
      ],
      infoBenchmarkId: "membench:bandwidth_copy",
      higherIsBetter: true,
      perCore: true,
    },
    {
      id: "membench-latency",
      name: "sc-membench: Latency",
      benchmarkIds: ["membench:latency"],
      infoBenchmarkId: "membench:latency",
      higherIsBetter: false,
      singleSeries: true,
    },
    {
      id: "bw-mem-bandwidth",
      name: "bw_mem: Bandwidth",
      benchmarkIds: ["bw_mem"],
      infoBenchmarkId: "bw_mem",
      higherIsBetter: true,
      legacyOperations: ["rd", "wr", "rdwr"],
    },
  ];

export type CompareMemoryChartOption = MemoryChartOptionBase & {
  benchmarkId: string;
  legacyOperation?: string;
};

export type MemoryChartOption =
  | ServerDetailsMemoryChartOption
  | CompareMemoryChartOption;

export type MemoryScaleOption =
  | Pick<ServerDetailsMemoryChartOption, "benchmarkIds">
  | Pick<CompareMemoryChartOption, "benchmarkId">;

export type MemoryScaleBenchmark = {
  config?: {
    size?: number;
    size_kb?: number;
  };
};

export const compareMemoryChartOptions: CompareMemoryChartOption[] = [
  {
    id: "bw-mem-rd",
    name: "bw_mem: Read",
    benchmarkId: "bw_mem",
    infoBenchmarkId: "bw_mem",
    legacyOperation: "rd",
    higherIsBetter: true,
  },
  {
    id: "bw-mem-wr",
    name: "bw_mem: Write",
    benchmarkId: "bw_mem",
    infoBenchmarkId: "bw_mem",
    legacyOperation: "wr",
    higherIsBetter: true,
  },
  {
    id: "bw-mem-rdwr",
    name: "bw_mem: Read/Write",
    benchmarkId: "bw_mem",
    infoBenchmarkId: "bw_mem",
    legacyOperation: "rdwr",
    higherIsBetter: true,
  },
  {
    id: "membench-read",
    name: "sc-membench: Read",
    benchmarkId: "membench:bandwidth_read",
    infoBenchmarkId: "membench:bandwidth_read",
    higherIsBetter: true,
  },
  {
    id: "membench-write",
    name: "sc-membench: Write",
    benchmarkId: "membench:bandwidth_write",
    infoBenchmarkId: "membench:bandwidth_write",
    higherIsBetter: true,
  },
  {
    id: "membench-copy",
    name: "sc-membench: Copy (Read/Write)",
    benchmarkId: "membench:bandwidth_copy",
    infoBenchmarkId: "membench:bandwidth_copy",
    higherIsBetter: true,
  },
  {
    id: "membench-latency",
    name: "sc-membench: Latency",
    benchmarkId: "membench:latency",
    infoBenchmarkId: "membench:latency",
    higherIsBetter: false,
  },
];
