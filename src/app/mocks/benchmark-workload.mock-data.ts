import {
  BenchmarkHistogramBin,
  BenchmarkWorkloadMockData,
} from "./benchmark-workload.mock.interface";

// ---------------------------------------------------------------------------
// Helper: generate a plausible unimodal histogram with ~20 bins.
// bins: array of [low, high] ranges; counts: array of N values matching bins.
// ---------------------------------------------------------------------------
function makeBins(
  ranges: [number, number][],
  counts: number[],
): BenchmarkHistogramBin[] {
  return ranges.map(([low, high], i) => ({ low, high, N: counts[i] }));
}

// ---------------------------------------------------------------------------
// 1. bogomips
// ---------------------------------------------------------------------------
const bogomipsBins = makeBins(
  [
    [500, 1000],
    [1000, 1500],
    [1500, 2000],
    [2000, 2500],
    [2500, 3000],
    [3000, 3500],
    [3500, 4000],
    [4000, 4500],
    [4500, 5000],
    [5000, 5500],
    [5500, 6000],
    [6000, 6500],
    [6500, 7000],
    [7000, 7500],
    [7500, 8000],
    [8000, 8500],
    [8500, 9000],
    [9000, 9500],
    [9500, 10000],
    [10000, 11000],
  ],
  [
    12, 28, 54, 87, 135, 198, 271, 310, 342, 318, 275, 220, 175, 132, 98, 64,
    38, 22, 14, 7,
  ],
);

// ---------------------------------------------------------------------------
// 2. bw_mem (Memory Bandwidth)
// ---------------------------------------------------------------------------
const bwMemBins = makeBins(
  [
    [5000, 10000],
    [10000, 20000],
    [20000, 30000],
    [30000, 40000],
    [40000, 50000],
    [50000, 60000],
    [60000, 70000],
    [70000, 80000],
    [80000, 90000],
    [90000, 100000],
    [100000, 120000],
    [120000, 140000],
    [140000, 160000],
    [160000, 180000],
    [180000, 200000],
    [200000, 250000],
    [250000, 300000],
    [300000, 400000],
    [400000, 600000],
    [600000, 1000000],
  ],
  [
    8, 22, 58, 112, 178, 243, 295, 321, 308, 286, 248, 201, 163, 128, 95, 142,
    89, 52, 24, 11,
  ],
);

// ---------------------------------------------------------------------------
// 3. compression_text:compress (Compression Bandwidth)
// ---------------------------------------------------------------------------
const compressBwBins = makeBins(
  [
    [100, 500],
    [500, 1000],
    [1000, 2000],
    [2000, 3000],
    [3000, 4000],
    [4000, 5000],
    [5000, 6000],
    [6000, 7000],
    [7000, 8000],
    [8000, 9000],
    [9000, 10000],
    [10000, 12000],
    [12000, 14000],
    [14000, 16000],
    [16000, 18000],
    [18000, 20000],
    [20000, 22000],
    [22000, 25000],
    [25000, 28000],
    [28000, 35000],
  ],
  [
    14, 32, 76, 134, 195, 248, 289, 312, 328, 301, 268, 229, 185, 147, 112, 81,
    58, 34, 19, 8,
  ],
);

// ---------------------------------------------------------------------------
// 4. compression_text:decompress (Decompression Bandwidth)
// ---------------------------------------------------------------------------
const decompressBwBins = makeBins(
  [
    [200, 1000],
    [1000, 3000],
    [3000, 6000],
    [6000, 10000],
    [10000, 15000],
    [15000, 20000],
    [20000, 25000],
    [25000, 30000],
    [30000, 35000],
    [35000, 40000],
    [40000, 45000],
    [45000, 50000],
    [50000, 55000],
    [55000, 60000],
    [60000, 65000],
    [65000, 70000],
    [70000, 80000],
    [80000, 90000],
    [90000, 100000],
    [100000, 130000],
  ],
  [
    9, 25, 68, 124, 201, 268, 315, 342, 329, 298, 261, 224, 183, 148, 112, 82,
    97, 54, 28, 12,
  ],
);

// ---------------------------------------------------------------------------
// 5. compression_text:ratio (Compression Ratio)
// ---------------------------------------------------------------------------
const compressRatioBins = makeBins(
  [
    [1.0, 1.2],
    [1.2, 1.4],
    [1.4, 1.6],
    [1.6, 1.8],
    [1.8, 2.0],
    [2.0, 2.2],
    [2.2, 2.4],
    [2.4, 2.6],
    [2.6, 2.8],
    [2.8, 3.0],
    [3.0, 3.2],
    [3.2, 3.4],
    [3.4, 3.6],
    [3.6, 3.8],
    [3.8, 4.0],
    [4.0, 4.5],
    [4.5, 5.0],
    [5.0, 5.5],
    [5.5, 6.0],
    [6.0, 7.0],
  ],
  [
    4, 12, 28, 54, 98, 152, 213, 278, 319, 332, 308, 274, 235, 193, 156, 178,
    112, 68, 34, 16,
  ],
);

// ---------------------------------------------------------------------------
// 6. geekbench:score (Geekbench aggregate score)
// ---------------------------------------------------------------------------
const geekbenchScoreBins = makeBins(
  [
    [200, 500],
    [500, 800],
    [800, 1100],
    [1100, 1400],
    [1400, 1700],
    [1700, 2000],
    [2000, 2500],
    [2500, 3000],
    [3000, 4000],
    [4000, 5000],
    [5000, 6000],
    [6000, 7000],
    [7000, 8000],
    [8000, 9000],
    [9000, 10000],
    [10000, 12000],
    [12000, 14000],
    [14000, 17000],
    [17000, 20000],
    [20000, 25000],
  ],
  [
    6, 18, 45, 89, 146, 208, 312, 378, 421, 389, 342, 286, 231, 178, 134, 189,
    112, 68, 32, 14,
  ],
);

// ---------------------------------------------------------------------------
// 7. geekbench:hdr (Geekbench HDR workload)
// ---------------------------------------------------------------------------
const geekbenchHdrBins = makeBins(
  [
    [100, 300],
    [300, 600],
    [600, 900],
    [900, 1200],
    [1200, 1600],
    [1600, 2000],
    [2000, 2500],
    [2500, 3000],
    [3000, 3500],
    [3500, 4000],
    [4000, 4500],
    [4500, 5000],
    [5000, 6000],
    [6000, 7000],
    [7000, 8000],
    [8000, 9000],
    [9000, 10000],
    [10000, 12000],
    [12000, 15000],
    [15000, 20000],
  ],
  [
    5, 15, 38, 74, 128, 192, 267, 312, 335, 318, 289, 254, 342, 274, 201, 148,
    103, 124, 67, 28,
  ],
);

// ---------------------------------------------------------------------------
// 8. openssl (OpenSSL throughput)
// ---------------------------------------------------------------------------
const opensslBins = makeBins(
  [
    [50, 200],
    [200, 500],
    [500, 1000],
    [1000, 2000],
    [2000, 3000],
    [3000, 4000],
    [4000, 5000],
    [5000, 6000],
    [6000, 7000],
    [7000, 8000],
    [8000, 9000],
    [9000, 10000],
    [10000, 11000],
    [11000, 12000],
    [12000, 13000],
    [13000, 14000],
    [14000, 15000],
    [15000, 17000],
    [17000, 20000],
    [20000, 25000],
  ],
  [
    8, 24, 56, 112, 178, 238, 289, 318, 334, 312, 278, 245, 209, 172, 138, 104,
    78, 89, 48, 19,
  ],
);

// ---------------------------------------------------------------------------
// 9. redis:rps (Redis Requests Per Second)
// ---------------------------------------------------------------------------
const redisRpsBins = makeBins(
  [
    [10000, 30000],
    [30000, 60000],
    [60000, 90000],
    [90000, 120000],
    [120000, 160000],
    [160000, 200000],
    [200000, 250000],
    [250000, 300000],
    [300000, 350000],
    [350000, 400000],
    [400000, 450000],
    [450000, 500000],
    [500000, 600000],
    [600000, 700000],
    [700000, 800000],
    [800000, 900000],
    [900000, 1000000],
    [1000000, 1200000],
    [1200000, 1500000],
    [1500000, 2000000],
  ],
  [
    4, 14, 36, 72, 128, 192, 258, 312, 345, 328, 296, 262, 384, 278, 201, 145,
    98, 112, 58, 22,
  ],
);

// ---------------------------------------------------------------------------
// 10. redis:latency (Redis Latency)
// ---------------------------------------------------------------------------
const redisLatencyBins = makeBins(
  [
    [0.01, 0.05],
    [0.05, 0.1],
    [0.1, 0.15],
    [0.15, 0.2],
    [0.2, 0.25],
    [0.25, 0.3],
    [0.3, 0.35],
    [0.35, 0.4],
    [0.4, 0.5],
    [0.5, 0.6],
    [0.6, 0.7],
    [0.7, 0.8],
    [0.8, 0.9],
    [0.9, 1.0],
    [1.0, 1.25],
    [1.25, 1.5],
    [1.5, 2.0],
    [2.0, 3.0],
    [3.0, 5.0],
    [5.0, 10.0],
  ],
  [
    12, 48, 98, 178, 252, 312, 345, 328, 456, 398, 312, 248, 189, 142, 198, 128,
    98, 56, 24, 9,
  ],
);

// ---------------------------------------------------------------------------
// 11. static_web:rps (Static Web Server Requests Per Second)
// ---------------------------------------------------------------------------
const staticWebRpsBins = makeBins(
  [
    [1000, 5000],
    [5000, 10000],
    [10000, 20000],
    [20000, 35000],
    [35000, 50000],
    [50000, 75000],
    [75000, 100000],
    [100000, 125000],
    [125000, 150000],
    [150000, 175000],
    [175000, 200000],
    [200000, 225000],
    [225000, 250000],
    [250000, 300000],
    [300000, 350000],
    [350000, 400000],
    [400000, 500000],
    [500000, 600000],
    [600000, 750000],
    [750000, 1000000],
  ],
  [
    7, 19, 46, 88, 148, 218, 289, 332, 348, 321, 285, 248, 209, 298, 218, 162,
    189, 112, 68, 28,
  ],
);

// ---------------------------------------------------------------------------
// 12. static_web:throughput (Static Web Server Throughput)
// ---------------------------------------------------------------------------
const staticWebThroughputBins = makeBins(
  [
    [10, 50],
    [50, 100],
    [100, 200],
    [200, 400],
    [400, 700],
    [700, 1000],
    [1000, 1500],
    [1500, 2000],
    [2000, 2500],
    [2500, 3000],
    [3000, 3500],
    [3500, 4000],
    [4000, 5000],
    [5000, 6000],
    [6000, 7000],
    [7000, 8000],
    [8000, 10000],
    [10000, 12000],
    [12000, 15000],
    [15000, 20000],
  ],
  [
    6, 17, 42, 84, 145, 215, 285, 328, 342, 315, 278, 238, 312, 218, 162, 118,
    142, 88, 48, 18,
  ],
);

// ---------------------------------------------------------------------------
// 13. static_web:latency (Static Web Server Latency)
// ---------------------------------------------------------------------------
const staticWebLatencyBins = makeBins(
  [
    [0.1, 0.5],
    [0.5, 1.0],
    [1.0, 1.5],
    [1.5, 2.0],
    [2.0, 2.5],
    [2.5, 3.0],
    [3.0, 3.5],
    [3.5, 4.0],
    [4.0, 5.0],
    [5.0, 6.0],
    [6.0, 7.0],
    [7.0, 8.0],
    [8.0, 9.0],
    [9.0, 10.0],
    [10.0, 12.0],
    [12.0, 15.0],
    [15.0, 20.0],
    [20.0, 30.0],
    [30.0, 50.0],
    [50.0, 100.0],
  ],
  [
    9, 28, 68, 128, 198, 268, 318, 342, 421, 368, 298, 245, 192, 148, 178, 124,
    98, 64, 32, 12,
  ],
);

// ---------------------------------------------------------------------------
// 14. stress_ng:div16 (stress-ng div16)
// ---------------------------------------------------------------------------
const stressNgDiv16Bins = makeBins(
  [
    [500, 1500],
    [1500, 3000],
    [3000, 5000],
    [5000, 8000],
    [8000, 12000],
    [12000, 16000],
    [16000, 20000],
    [20000, 25000],
    [25000, 30000],
    [30000, 35000],
    [35000, 40000],
    [40000, 50000],
    [50000, 60000],
    [60000, 70000],
    [70000, 80000],
    [80000, 90000],
    [90000, 100000],
    [100000, 120000],
    [120000, 150000],
    [150000, 200000],
  ],
  [
    5, 16, 38, 78, 142, 215, 289, 348, 398, 412, 378, 498, 368, 278, 208, 154,
    112, 134, 72, 28,
  ],
);

// ---------------------------------------------------------------------------
// 15-17. Additional stress_ng variants (based on ticket)
// ---------------------------------------------------------------------------
const stressNgDiv16SingleBins = makeBins(
  [
    [200, 600],
    [600, 1200],
    [1200, 2000],
    [2000, 3000],
    [3000, 4000],
    [4000, 5000],
    [5000, 6000],
    [6000, 7000],
    [7000, 8000],
    [8000, 9000],
    [9000, 10000],
    [10000, 12000],
    [12000, 14000],
    [14000, 16000],
    [16000, 18000],
    [18000, 20000],
    [20000, 25000],
    [25000, 30000],
    [30000, 40000],
    [40000, 60000],
  ],
  [
    8, 22, 52, 98, 158, 228, 298, 345, 362, 338, 302, 398, 268, 201, 152, 112,
    142, 82, 44, 16,
  ],
);

const stressNgDiv16MultiBins = makeBins(
  [
    [2000, 5000],
    [5000, 10000],
    [10000, 20000],
    [20000, 35000],
    [35000, 50000],
    [50000, 75000],
    [75000, 100000],
    [100000, 125000],
    [125000, 150000],
    [150000, 175000],
    [175000, 200000],
    [200000, 250000],
    [250000, 300000],
    [300000, 350000],
    [350000, 400000],
    [400000, 450000],
    [450000, 500000],
    [500000, 600000],
    [600000, 750000],
    [750000, 1000000],
  ],
  [
    4, 14, 36, 72, 128, 198, 268, 325, 358, 338, 305, 412, 298, 218, 162, 118,
    88, 104, 56, 20,
  ],
);

const stressNgAllBins = makeBins(
  [
    [500, 2000],
    [2000, 5000],
    [5000, 10000],
    [10000, 20000],
    [20000, 35000],
    [35000, 50000],
    [50000, 75000],
    [75000, 100000],
    [100000, 130000],
    [130000, 160000],
    [160000, 190000],
    [190000, 220000],
    [220000, 260000],
    [260000, 300000],
    [300000, 350000],
    [350000, 400000],
    [400000, 500000],
    [500000, 650000],
    [650000, 850000],
    [850000, 1200000],
  ],
  [
    6, 18, 44, 86, 148, 218, 295, 352, 385, 358, 318, 278, 358, 258, 192, 142,
    168, 98, 52, 18,
  ],
);

// ---------------------------------------------------------------------------
// Shared histogram shapes reused across similar-distribution benchmarks
// ---------------------------------------------------------------------------
const geekbenchWorkloadBins = makeBins(
  [
    [80, 200],
    [200, 400],
    [400, 700],
    [700, 1000],
    [1000, 1400],
    [1400, 1800],
    [1800, 2400],
    [2400, 3200],
    [3200, 4200],
    [4200, 5400],
    [5400, 6800],
    [6800, 8500],
    [8500, 10000],
    [10000, 12000],
    [12000, 14000],
    [14000, 16000],
    [16000, 18000],
    [18000, 20000],
    [20000, 23000],
    [23000, 28000],
  ],
  [
    6, 16, 42, 84, 142, 208, 285, 345, 398, 372, 318, 262, 208, 162, 124, 92,
    68, 45, 28, 12,
  ],
);

// llm_speed histograms
const llmPromptProcessingBins = makeBins(
  [
    [10, 50],
    [50, 100],
    [100, 200],
    [200, 350],
    [350, 500],
    [500, 700],
    [700, 1000],
    [1000, 1400],
    [1400, 1900],
    [1900, 2500],
    [2500, 3200],
    [3200, 4000],
    [4000, 5000],
    [5000, 6500],
    [6500, 8000],
    [8000, 10000],
    [10000, 13000],
    [13000, 17000],
    [17000, 22000],
    [22000, 30000],
  ],
  [
    4, 12, 34, 72, 124, 186, 258, 322, 374, 352, 308, 258, 204, 298, 198, 142,
    178, 106, 58, 22,
  ],
);

const llmTextGenerationBins = makeBins(
  [
    [5, 15],
    [15, 30],
    [30, 50],
    [50, 80],
    [80, 120],
    [120, 170],
    [170, 220],
    [220, 280],
    [280, 350],
    [350, 430],
    [430, 520],
    [520, 620],
    [620, 730],
    [730, 860],
    [860, 1000],
    [1000, 1200],
    [1200, 1500],
    [1500, 2000],
    [2000, 2800],
    [2800, 4000],
  ],
  [
    5, 14, 38, 82, 148, 218, 295, 358, 412, 388, 342, 292, 238, 188, 142, 168,
    108, 78, 42, 16,
  ],
);

// passmark histograms
const passmarkScoreBins = makeBins(
  [
    [500, 1500],
    [1500, 3000],
    [3000, 5000],
    [5000, 8000],
    [8000, 12000],
    [12000, 16000],
    [16000, 20000],
    [20000, 25000],
    [25000, 30000],
    [30000, 36000],
    [36000, 42000],
    [42000, 50000],
    [50000, 60000],
    [60000, 70000],
    [70000, 80000],
    [80000, 90000],
    [90000, 100000],
    [100000, 120000],
    [120000, 150000],
    [150000, 200000],
  ],
  [
    5, 14, 36, 74, 138, 208, 286, 354, 408, 384, 338, 282, 498, 348, 258, 188,
    138, 162, 92, 34,
  ],
);

const passmarkMemoryMsBins = makeBins(
  [
    [0.5, 1.5],
    [1.5, 3.0],
    [3.0, 5.0],
    [5.0, 8.0],
    [8.0, 12.0],
    [12.0, 17.0],
    [17.0, 23.0],
    [23.0, 30.0],
    [30.0, 38.0],
    [38.0, 48.0],
    [48.0, 60.0],
    [60.0, 75.0],
    [75.0, 90.0],
    [90.0, 110.0],
    [110.0, 130.0],
    [130.0, 155.0],
    [155.0, 185.0],
    [185.0, 220.0],
    [220.0, 270.0],
    [270.0, 350.0],
  ],
  [
    8, 24, 58, 112, 178, 248, 318, 378, 422, 398, 352, 298, 242, 192, 148, 112,
    82, 58, 34, 14,
  ],
);

const passmarkMemoryBwBins = makeBins(
  [
    [1000, 3000],
    [3000, 6000],
    [6000, 10000],
    [10000, 15000],
    [15000, 21000],
    [21000, 28000],
    [28000, 36000],
    [36000, 45000],
    [45000, 56000],
    [56000, 68000],
    [68000, 82000],
    [82000, 98000],
    [98000, 115000],
    [115000, 134000],
    [134000, 155000],
    [155000, 178000],
    [178000, 205000],
    [205000, 238000],
    [238000, 278000],
    [278000, 340000],
  ],
  [
    6, 18, 46, 92, 158, 228, 302, 368, 418, 392, 344, 288, 232, 182, 138, 102,
    74, 52, 28, 10,
  ],
);

// ---------------------------------------------------------------------------
// Exported mock data array
// ---------------------------------------------------------------------------
export const BENCHMARK_MOCK_DATA: BenchmarkWorkloadMockData[] = [
  // -------------------------------------------------------------------------
  // 1. bogomips
  // -------------------------------------------------------------------------
  {
    benchmark_id: "bogomips",
    server_count: 2403,
    measurement_count: 4806,
    measurement_min: 524,
    measurement_max: 10969,
    unit: "bogomips",
    config_examples: {},
    histogram: bogomipsBins,
  },

  // -------------------------------------------------------------------------
  // 2. bw_mem — Memory Bandwidth
  // -------------------------------------------------------------------------
  {
    benchmark_id: "bw_mem",
    server_count: 2403,
    measurement_count: 79226,
    measurement_min: 100,
    measurement_max: 35166907,
    unit: "MB/sec",
    config_examples: {
      operation: ["rd", "rdwr", "wr"],
      size: [
        "0.016384",
        "0.262144",
        "1",
        "2",
        "4",
        "8",
        "16",
        "32",
        "64",
        "256",
        "512",
      ],
    },
    histogram: bwMemBins,
  },

  // -------------------------------------------------------------------------
  // 3. compression_text:compress — Compression Bandwidth
  // -------------------------------------------------------------------------
  {
    benchmark_id: "compression_text:compress",
    server_count: 824,
    measurement_count: 14832,
    measurement_min: 105,
    measurement_max: 34218,
    unit: "MB/sec",
    config_examples: {
      algo: ["brotli", "gzip", "lz4", "zstd"],
      level: ["1", "3", "6", "9"],
    },
    histogram: compressBwBins,
  },

  // -------------------------------------------------------------------------
  // 4. compression_text:decompress — Decompression Bandwidth
  // -------------------------------------------------------------------------
  {
    benchmark_id: "compression_text:decompress",
    server_count: 824,
    measurement_count: 14832,
    measurement_min: 218,
    measurement_max: 128542,
    unit: "MB/sec",
    config_examples: {
      algo: ["brotli", "gzip", "lz4", "zstd"],
      level: ["1", "3", "6", "9"],
    },
    histogram: decompressBwBins,
  },

  // -------------------------------------------------------------------------
  // 5. compression_text:ratio — Compression Ratio
  // -------------------------------------------------------------------------
  {
    benchmark_id: "compression_text:ratio",
    server_count: 824,
    measurement_count: 14832,
    measurement_min: 1.02,
    measurement_max: 6.84,
    unit: "ratio",
    config_examples: {
      algo: ["brotli", "gzip", "lz4", "zstd"],
      level: ["1", "3", "6", "9"],
    },
    histogram: compressRatioBins,
  },

  // -------------------------------------------------------------------------
  // 6. geekbench:score — Geekbench aggregate score
  // -------------------------------------------------------------------------
  {
    benchmark_id: "geekbench:score",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 198,
    measurement_max: 24872,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchScoreBins,
  },

  // -------------------------------------------------------------------------
  // 7. geekbench:hdr — Geekbench HDR workload
  // -------------------------------------------------------------------------
  {
    benchmark_id: "geekbench:hdr",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 112,
    measurement_max: 19845,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchHdrBins,
  },

  // -------------------------------------------------------------------------
  // 8. geekbench:text_processing — Geekbench Text Processing
  // -------------------------------------------------------------------------
  {
    benchmark_id: "geekbench:text_processing",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 98,
    measurement_max: 18234,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchHdrBins,
  },

  // -------------------------------------------------------------------------
  // 9. geekbench:clang — Geekbench Clang (compile workload)
  // -------------------------------------------------------------------------
  {
    benchmark_id: "geekbench:clang",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 85,
    measurement_max: 21456,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchScoreBins,
  },

  // -------------------------------------------------------------------------
  // 10. openssl — OpenSSL throughput
  // -------------------------------------------------------------------------
  {
    benchmark_id: "openssl",
    server_count: 1512,
    measurement_count: 45360,
    measurement_min: 48,
    measurement_max: 24672,
    unit: "MB/sec",
    config_examples: {
      algo: [
        "aes-128-cbc",
        "aes-256-cbc",
        "aes-128-gcm",
        "aes-256-gcm",
        "sha256",
        "rsa2048",
      ],
      block_size: ["16", "64", "256", "1024", "8192", "16384"],
    },
    histogram: opensslBins,
  },

  // -------------------------------------------------------------------------
  // 11. redis:rps — Redis Requests Per Second
  // -------------------------------------------------------------------------
  {
    benchmark_id: "redis:rps",
    server_count: 1248,
    measurement_count: 24960,
    measurement_min: 10421,
    measurement_max: 1982345,
    unit: "req/sec",
    config_examples: {
      operation: ["GET", "SET", "LPUSH", "RPOP", "SADD", "HSET", "ZADD"],
      pipeline: ["1", "2", "4", "8", "16", "32"],
    },
    histogram: redisRpsBins,
  },

  // -------------------------------------------------------------------------
  // 12. redis:rps-extrapolated — Redis RPS (extrapolated to 1 vCPU baseline)
  // -------------------------------------------------------------------------
  {
    benchmark_id: "redis:rps-extrapolated",
    server_count: 1248,
    measurement_count: 24960,
    measurement_min: 8245,
    measurement_max: 892456,
    unit: "req/sec",
    config_examples: {
      operation: ["GET", "SET", "LPUSH", "RPOP", "SADD", "HSET", "ZADD"],
      pipeline: ["1", "2", "4", "8", "16", "32"],
    },
    histogram: redisRpsBins,
  },

  // -------------------------------------------------------------------------
  // 13. redis:latency — Redis Latency
  // -------------------------------------------------------------------------
  {
    benchmark_id: "redis:latency",
    server_count: 1248,
    measurement_count: 24960,
    measurement_min: 0.012,
    measurement_max: 9.845,
    unit: "ms",
    config_examples: {
      operation: ["GET", "SET", "LPUSH", "RPOP", "SADD", "HSET", "ZADD"],
      pipeline: ["1", "2", "4", "8", "16", "32"],
    },
    histogram: redisLatencyBins,
  },

  // -------------------------------------------------------------------------
  // 14. static_web:rps — Static Web Server Requests Per Second
  // -------------------------------------------------------------------------
  {
    benchmark_id: "static_web:rps",
    server_count: 1198,
    measurement_count: 47920,
    measurement_min: 1245,
    measurement_max: 982456,
    unit: "req/sec",
    config_examples: {
      connections_per_vcpus: ["1", "2", "4", "8", "16", "32"],
      size: ["0.0", "0.001", "0.01", "0.1", "1", "10", "100", "1000"],
    },
    histogram: staticWebRpsBins,
  },

  // -------------------------------------------------------------------------
  // 15. static_web:rps-extrapolated
  // -------------------------------------------------------------------------
  {
    benchmark_id: "static_web:rps-extrapolated",
    server_count: 1198,
    measurement_count: 47920,
    measurement_min: 982,
    measurement_max: 524812,
    unit: "req/sec",
    config_examples: {
      connections_per_vcpus: ["1", "2", "4", "8", "16", "32"],
      size: ["0.0", "0.001", "0.01", "0.1", "1", "10", "100", "1000"],
    },
    histogram: staticWebRpsBins,
  },

  // -------------------------------------------------------------------------
  // 16. static_web:throughput
  // -------------------------------------------------------------------------
  {
    benchmark_id: "static_web:throughput",
    server_count: 1198,
    measurement_count: 47920,
    measurement_min: 12,
    measurement_max: 19845,
    unit: "MB/sec",
    config_examples: {
      connections_per_vcpus: ["1", "2", "4", "8", "16", "32"],
      size: ["0.0", "0.001", "0.01", "0.1", "1", "10", "100", "1000"],
    },
    histogram: staticWebThroughputBins,
  },

  // -------------------------------------------------------------------------
  // 17. static_web:throughput-extrapolated
  // -------------------------------------------------------------------------
  {
    benchmark_id: "static_web:throughput-extrapolated",
    server_count: 1198,
    measurement_count: 47920,
    measurement_min: 9,
    measurement_max: 14256,
    unit: "MB/sec",
    config_examples: {
      connections_per_vcpus: ["1", "2", "4", "8", "16", "32"],
      size: ["0.0", "0.001", "0.01", "0.1", "1", "10", "100", "1000"],
    },
    histogram: staticWebThroughputBins,
  },

  // -------------------------------------------------------------------------
  // 18. static_web:latency
  // -------------------------------------------------------------------------
  {
    benchmark_id: "static_web:latency",
    server_count: 1198,
    measurement_count: 47920,
    measurement_min: 0.14,
    measurement_max: 98.42,
    unit: "ms",
    config_examples: {
      connections_per_vcpus: ["1", "2", "4", "8", "16", "32"],
      size: ["0.0", "0.001", "0.01", "0.1", "1", "10", "100", "1000"],
    },
    histogram: staticWebLatencyBins,
  },

  // -------------------------------------------------------------------------
  // 19. stress_ng:div16 — stress-ng div16 (all cores)
  // -------------------------------------------------------------------------
  {
    benchmark_id: "stress_ng:div16",
    server_count: 2087,
    measurement_count: 6261,
    measurement_min: 512,
    measurement_max: 1284562,
    unit: "ops/sec",
    config_examples: {
      cpu_count: ["1", "2", "4", "8", "16", "32", "64", "128"],
      timeout: ["60", "120"],
    },
    histogram: stressNgDiv16Bins,
  },

  // -------------------------------------------------------------------------
  // 20. stress_ng:div16_single — stress-ng div16 single-core
  // -------------------------------------------------------------------------
  {
    benchmark_id: "stress_ng:div16_single",
    server_count: 2087,
    measurement_count: 6261,
    measurement_min: 198,
    measurement_max: 62456,
    unit: "ops/sec",
    config_examples: {
      cpu_count: ["1"],
      timeout: ["60", "120"],
    },
    histogram: stressNgDiv16SingleBins,
  },

  // -------------------------------------------------------------------------
  // 21. stress_ng:div16_multi — stress-ng div16 multi-core
  // -------------------------------------------------------------------------
  {
    benchmark_id: "stress_ng:div16_multi",
    server_count: 2087,
    measurement_count: 6261,
    measurement_min: 2048,
    measurement_max: 984512,
    unit: "ops/sec",
    config_examples: {
      cpu_count: ["2", "4", "8", "16", "32", "64", "128"],
      timeout: ["60", "120"],
    },
    histogram: stressNgDiv16MultiBins,
  },

  // -------------------------------------------------------------------------
  // 22. stress_ng:all — stress-ng all CPU stressors
  // -------------------------------------------------------------------------
  {
    benchmark_id: "stress_ng:all",
    server_count: 2087,
    measurement_count: 6261,
    measurement_min: 512,
    measurement_max: 1248965,
    unit: "ops/sec",
    config_examples: {
      cpu_count: ["1", "2", "4", "8", "16", "32", "64", "128"],
      timeout: ["60", "120"],
    },
    histogram: stressNgAllBins,
  },

  // =========================================================================
  // 23–35. geekbench — additional workloads
  // =========================================================================

  {
    benchmark_id: "geekbench:asset_compression",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 92,
    measurement_max: 21348,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:background_blur",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 88,
    measurement_max: 19876,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:file_compression",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 105,
    measurement_max: 22654,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:horizon_detection",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 96,
    measurement_max: 20412,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:html5_browser",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 78,
    measurement_max: 18934,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:navigation",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 84,
    measurement_max: 19245,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:object_detection",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 72,
    measurement_max: 17823,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:object_remover",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 81,
    measurement_max: 18456,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:pdf_renderer",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 94,
    measurement_max: 20678,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:photo_filter",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 88,
    measurement_max: 19432,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:photo_library",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 76,
    measurement_max: 18124,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:ray_tracer",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 102,
    measurement_max: 21854,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  {
    benchmark_id: "geekbench:structure_from_motion",
    server_count: 1892,
    measurement_count: 5676,
    measurement_min: 86,
    measurement_max: 19867,
    unit: "score",
    config_examples: {
      cores: ["Single-Core", "Multi-Core"],
      framework_version: ["6.3.0", "6.2.2", "6.1.0"],
    },
    histogram: geekbenchWorkloadBins,
  },

  // =========================================================================
  // 36–37. llm_speed — LLM inference speed
  // =========================================================================

  {
    benchmark_id: "llm_speed:prompt_processing",
    server_count: 384,
    measurement_count: 2688,
    measurement_min: 12,
    measurement_max: 28456,
    unit: "tokens/sec",
    config_examples: {
      model: ["llama-3.1-8b", "llama-3.1-70b", "llama-3.2-3b", "mistral-7b"],
      framework: ["llama.cpp", "vllm", "ollama"],
      precision: ["fp32", "fp16", "int8", "int4"],
    },
    histogram: llmPromptProcessingBins,
  },

  {
    benchmark_id: "llm_speed:text_generation",
    server_count: 384,
    measurement_count: 2688,
    measurement_min: 5,
    measurement_max: 3842,
    unit: "tokens/sec",
    config_examples: {
      model: ["llama-3.1-8b", "llama-3.1-70b", "llama-3.2-3b", "mistral-7b"],
      framework: ["llama.cpp", "vllm", "ollama"],
      precision: ["fp32", "fp16", "int8", "int4"],
    },
    histogram: llmTextGenerationBins,
  },

  // =========================================================================
  // 38–53. passmark — PassMark CPU and memory benchmarks
  // =========================================================================

  {
    benchmark_id: "passmark:cpu_compression",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 2845,
    measurement_max: 198456,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_encryption",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 1256,
    measurement_max: 248965,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_extended_instructions",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 845,
    measurement_max: 186432,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_floating_point_maths",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 1845,
    measurement_max: 212456,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_integer_maths",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 2145,
    measurement_max: 228965,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_mark",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 1245,
    measurement_max: 338456,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_physics",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 845,
    measurement_max: 178456,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_prime_numbers",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 1245,
    measurement_max: 168965,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_single_threaded",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 645,
    measurement_max: 4856,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:cpu_string_sorting",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 1125,
    measurement_max: 148965,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:database_operations",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 1845,
    measurement_max: 128456,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:memory_latency",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 0.8,
    measurement_max: 328.5,
    unit: "ns",
    config_examples: {},
    histogram: passmarkMemoryMsBins,
  },

  {
    benchmark_id: "passmark:memory_mark",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 845,
    measurement_max: 18456,
    unit: "score",
    config_examples: {},
    histogram: passmarkScoreBins,
  },

  {
    benchmark_id: "passmark:memory_read_cached",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 2456,
    measurement_max: 348965,
    unit: "MB/sec",
    config_examples: {},
    histogram: passmarkMemoryBwBins,
  },

  {
    benchmark_id: "passmark:memory_read_uncached",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 1245,
    measurement_max: 268456,
    unit: "MB/sec",
    config_examples: {},
    histogram: passmarkMemoryBwBins,
  },

  {
    benchmark_id: "passmark:memory_write",
    server_count: 1645,
    measurement_count: 4935,
    measurement_min: 1845,
    measurement_max: 298456,
    unit: "MB/sec",
    config_examples: {},
    histogram: passmarkMemoryBwBins,
  },
];

/**
 ** Look up mock enrichment data for a given benchmark_id.
 ** Returns undefined if no mock data is registered for that benchmark.
 **/
export function getMockData(
  benchmark_id: string,
): BenchmarkWorkloadMockData | undefined {
  return BENCHMARK_MOCK_DATA.find((m) => m.benchmark_id === benchmark_id);
}
