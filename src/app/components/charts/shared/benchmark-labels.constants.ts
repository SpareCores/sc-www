import { BenchmarkLabelMap } from "./benchmark-chart.types";

export const legacyBWMemOperationLabels: BenchmarkLabelMap = {
  rd: "Read",
  wr: "Write",
  rdwr: "Read/Write",
};

export const membenchSeriesLabels: BenchmarkLabelMap = {
  "membench:bandwidth_read": "Read",
  "membench:bandwidth_write": "Write",
  "membench:bandwidth_copy": "Copy",
  "membench:latency": "Latency",
};
