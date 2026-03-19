import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LlmInferenceChartComponent } from "./llm-inference-chart.component";
import { DropdownManagerService } from "../../../services/dropdown-manager.service";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";
import {
  LlmBarChartData,
  LlmChartServer,
  LlmBenchmarkMeta,
} from "./llm-inference-chart.types";

const detailsPromptData: LlmBarChartData = {
  labels: [128],
  datasets: [{ data: [10], label: "A" }],
};

const detailsGenerationData: LlmBarChartData = {
  labels: [128],
  datasets: [{ data: [8], label: "A" }],
};

describe("LlmInferenceChartComponent", () => {
  let component: LlmInferenceChartComponent;
  let fixture: ComponentFixture<LlmInferenceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlmInferenceChartComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: DropdownManagerService,
          useValue: { initDropdown: () => Promise.resolve(undefined) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LlmInferenceChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("promptData", detailsPromptData);
    fixture.componentRef.setInput("promptOptions", {});
    fixture.componentRef.setInput("generationData", detailsGenerationData);
    fixture.componentRef.setInput("generationOptions", {});
    fixture.detectChanges();
  });

  it("creates details layout", () => {
    expect(component).toBeTruthy();
  });

  it("builds details data from benchmark groups when chart inputs are omitted", () => {
    fixture.componentRef.setInput("promptData", undefined);
    fixture.componentRef.setInput("promptOptions", undefined);
    fixture.componentRef.setInput("generationData", undefined);
    fixture.componentRef.setInput("generationOptions", undefined);
    fixture.componentRef.setInput("benchmarksByCategory", [
      {
        benchmark_id: "llm_speed:prompt_processing",
        benchmarks: [
          {
            vendor_id: "vendor-a",
            server_id: "server-a",
            benchmark_id: "llm_speed:prompt_processing",
            config: { model: "phi-4-q4.gguf", tokens: 128 },
            score: 10,
          },
        ],
      },
      {
        benchmark_id: "llm_speed:text_generation",
        benchmarks: [
          {
            vendor_id: "vendor-a",
            server_id: "server-a",
            benchmark_id: "llm_speed:text_generation",
            config: { model: "phi-4-q4.gguf", tokens: 128 },
            score: 8,
          },
        ],
      },
    ]);
    fixture.detectChanges();

    expect(component.detailsPromptData()?.labels).toEqual([128]);
    expect(component.detailsGenerationData()?.labels).toEqual([128]);
  });

  it("builds compare state from typed inputs", () => {
    const benchmarkMeta: LlmBenchmarkMeta[] = [
      {
        benchmark_id: "llm_speed:prompt_processing",
        name: "Prompt processing",
        description: null,
        framework: "llama.cpp",
        configs: [{ config: { model: "phi-4-q4.gguf" } }],
      },
    ];
    const servers: LlmChartServer[] = [
      {
        display_name: "Server A",
        benchmark_scores: [
          {
            vendor_id: "vendor-a",
            server_id: "server-a",
            benchmark_id: "llm_speed:prompt_processing",
            config: { model: "phi-4-q4.gguf", tokens: 128 },
            score: 10,
          },
          {
            vendor_id: "vendor-a",
            server_id: "server-a",
            benchmark_id: "llm_speed:text_generation",
            config: { model: "phi-4-q4.gguf", tokens: 128 },
            score: 8,
          },
        ],
      },
    ];

    fixture.componentRef.setInput("layout", "compare");
    fixture.componentRef.setInput("benchmarkMeta", benchmarkMeta);
    fixture.componentRef.setInput("servers", servers);
    fixture.detectChanges();

    expect(component.availableModels().length).toBe(1);
    expect(component.comparePromptData()?.labels).toEqual([128]);
  });
});
