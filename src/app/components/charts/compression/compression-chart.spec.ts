import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CompressionChart } from "./compression-chart";
import { DropdownManager } from "../../../services/dropdown-manager";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import {
  CompressionBenchmarkGroup,
  CompressionBenchmarkScore,
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

describe("CompressionChart", () => {
  let component: CompressionChart;
  let fixture: ComponentFixture<CompressionChart>;
  let benchmarksByCategory: CompressionBenchmarkGroup[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressionChart],
      providers: [
        ...sharedTestingProviders,
        {
          provide: DropdownManager,
          useValue: { initDropdown: () => Promise.resolve(undefined) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompressionChart);
    component = fixture.componentInstance;
    benchmarksByCategory = [
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

    fixture.componentRef.setInput("benchmarksByCategory", benchmarksByCategory);
    fixture.detectChanges();
  });

  it("creates details compression chart", () => {
    expect(component).toBeTruthy();
    expect(component.currentDetailsMode()?.name).toBe("Compression speed");
  });
});
