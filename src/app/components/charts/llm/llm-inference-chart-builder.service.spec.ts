import { TestBed } from "@angular/core/testing";

import { LlmInferenceChartBuilderService } from "./llm-inference-chart-builder.service";
import {
  LlmBenchmarkMeta,
  LlmChartServer,
  LlmModelOption,
} from "./llm-inference-chart.types";

describe("LlmInferenceChartBuilderService", () => {
  let service: LlmInferenceChartBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LlmInferenceChartBuilderService);
  });

  it("extracts sorted compare models", () => {
    const models = service.getAvailableModels([
      {
        benchmark_id: "llm_speed:prompt_processing",
        name: "Prompt processing",
        description: null,
        framework: "llama.cpp",
        configs: [
          { config: { model: "phi-4-q4.gguf" } },
          { config: { model: "gemma-2b.Q4_K_M.gguf" } },
        ],
      },
    ] as LlmBenchmarkMeta[]);

    expect(models.length).toBe(2);
    expect(models[0].name).toBe("gemma-2b.Q4_K_M");
  });

  it("builds details charts with sorted token labels and ordered models", () => {
    const result = service.buildDetailsBarChart({
      benchmarksByCategory: [
        {
          benchmark_id: "llm_speed:prompt_processing",
          benchmarks: [
            {
              vendor_id: "vendor-a",
              server_id: "server-a",
              benchmark_id: "llm_speed:prompt_processing",
              config: { model: "phi-4-q4.gguf", tokens: 256 },
              score: 11,
            },
            {
              vendor_id: "vendor-a",
              server_id: "server-a",
              benchmark_id: "llm_speed:prompt_processing",
              config: { model: "gemma-2b.Q4_K_M.gguf", tokens: 128 },
              score: 9,
            },
          ],
        },
      ],
      benchmarkId: "llm_speed:prompt_processing",
      labelsField: "tokens",
      scaleField: "model",
    });

    expect(result?.labels).toEqual([128, 256]);
    expect(result?.datasets[0].label).toBe("gemma-2b.Q4_K_M");
  });

  it("returns undefined details data while benchmark groups are unavailable", () => {
    const result = service.buildDetailsBarChart({
      benchmarksByCategory: undefined,
      benchmarkId: "llm_speed:prompt_processing",
      labelsField: "tokens",
      scaleField: "model",
    });

    expect(result).toBeUndefined();
  });

  it("builds compare charts for the selected model", () => {
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
    const selectedModel: LlmModelOption = {
      name: "phi-4-q4",
      value: "phi-4-q4.gguf",
    };

    const result = service.buildCompareCharts({
      servers,
      selectedModel,
      promptOptionsBase: {},
      generationOptionsBase: {},
    });

    expect(result?.promptData.labels).toEqual([128]);
    expect(result?.generationData.datasets[0].data).toEqual([8]);
  });

  it("ignores servers that do not have compare benchmark scores yet", () => {
    const servers = [
      {
        display_name: "Server A",
      },
      {
        display_name: "Server B",
        benchmark_scores: [
          {
            vendor_id: "vendor-b",
            server_id: "server-b",
            benchmark_id: "llm_speed:prompt_processing",
            config: { model: "phi-4-q4.gguf", tokens: 128 },
            score: 12,
          },
        ],
      },
    ] as LlmChartServer[];
    const selectedModel: LlmModelOption = {
      name: "phi-4-q4",
      value: "phi-4-q4.gguf",
    };

    const result = service.buildCompareCharts({
      servers,
      selectedModel,
      promptOptionsBase: {},
      generationOptionsBase: {},
    });

    expect(result?.promptData.labels).toEqual([128]);
    expect(result?.promptData.datasets[0].data).toEqual([null]);
    expect(result?.promptData.datasets[1].data).toEqual([12]);
  });
});
