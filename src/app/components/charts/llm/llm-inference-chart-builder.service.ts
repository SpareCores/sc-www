import { Injectable } from "@angular/core";
import { TooltipItem, TooltipModel } from "chart.js";
import { radarDatasetColors } from "../shared/chart-colors.constants";
import { cloneChartOptions } from "../shared/chart-options.utils";
import { llmModelOrder } from "../shared/llm-model-order.constants";
import {
  LlmBarChartData,
  LlmBarChartOptions,
  LlmBenchmarkGroup,
  LlmBenchmarkMeta,
  LlmChartServer,
  LlmCompareChartsResult,
  LlmModelOption,
  MutableLlmBarChartOptions,
} from "./llm-inference-chart.types";

@Injectable({
  providedIn: "root",
})
export class LlmInferenceChartBuilderService {
  getAvailableModels(
    benchmarkMeta: LlmBenchmarkMeta[] | undefined,
  ): LlmModelOption[] {
    const llmPromptData = benchmarkMeta?.find(
      (category) => category.benchmark_id === "llm_speed:prompt_processing",
    );
    if (!llmPromptData?.configs) {
      return [];
    }

    const models = this.sortModels([
      ...new Set<string>(
        llmPromptData.configs
          .map((config) => config.config.model)
          .filter((model): model is string => typeof model === "string")
          .map((model) => String(model)),
      ),
    ]);

    return models.map((model) => ({
      name: model.replace(".gguf", ""),
      value: model,
    }));
  }

  buildDetailsBarChart(params: {
    benchmarksByCategory: LlmBenchmarkGroup[];
    benchmarkId: string;
    labelsField: "tokens";
    scaleField: "model";
  }): LlmBarChartData | undefined {
    const dataSet = params.benchmarksByCategory.find(
      (category) => category.benchmark_id === params.benchmarkId,
    );

    if (!dataSet?.benchmarks?.length) {
      return undefined;
    }

    const tokenLabels: number[] = [];
    const modelScales: string[] = [];

    dataSet.benchmarks.forEach((item) => {
      const tokenValue = item.config[params.labelsField];
      if (typeof tokenValue === "number" && !tokenLabels.includes(tokenValue)) {
        tokenLabels.push(tokenValue);
      }

      const modelValue = item.config[params.scaleField];
      if (typeof modelValue === "string" && !modelScales.includes(modelValue)) {
        modelScales.push(modelValue);
      }
    });

    if (!tokenLabels.length || !modelScales.length) {
      return undefined;
    }

    tokenLabels.sort((a, b) => a - b);
    const sortedModels = this.sortModels(modelScales);

    return {
      labels: tokenLabels,
      datasets: sortedModels.map((model, index) => ({
        data: tokenLabels.map((token) => {
          const item = dataSet.benchmarks?.find(
            (benchmark) =>
              benchmark.config[params.scaleField] === model &&
              benchmark.config[params.labelsField] === token,
          );
          return item?.score ?? null;
        }),
        label: model.replace(".gguf", ""),
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
      })),
    };
  }

  buildCompareCharts(params: {
    servers: LlmChartServer[];
    selectedModel: LlmModelOption | undefined;
    promptOptionsBase: LlmBarChartOptions;
    generationOptionsBase: LlmBarChartOptions;
  }): LlmCompareChartsResult | undefined {
    if (!params.selectedModel) {
      return undefined;
    }

    const promptData = this.buildCompareBarChart(
      params.servers,
      params.selectedModel.value,
      "llm_speed:prompt_processing",
    );
    const generationData = this.buildCompareBarChart(
      params.servers,
      params.selectedModel.value,
      "llm_speed:text_generation",
    );

    if (!promptData && !generationData) {
      return undefined;
    }

    return {
      promptData: promptData || { labels: [], datasets: [] },
      generationData: generationData || { labels: [], datasets: [] },
      promptOptions: this.createOptions(
        params.promptOptionsBase,
        "Prompt Processing",
        "Prompt's length (tokens).",
      ),
      generationOptions: this.createOptions(
        params.generationOptionsBase,
        "Text Generation",
        "Requested text length (tokens).",
      ),
    };
  }

  createDetailsOptions(
    baseOptions: LlmBarChartOptions,
    xAxisTitle: string,
  ): MutableLlmBarChartOptions {
    const options = cloneChartOptions(
      baseOptions ?? {},
    ) as MutableLlmBarChartOptions;

    options.plugins = {
      ...options.plugins,
      title: {
        ...(typeof options.plugins?.title === "object"
          ? options.plugins.title
          : {}),
        display: false,
      },
    };
    options.scales = {
      ...options.scales,
      y: {
        ...options.scales?.y,
        title: {
          ...(options.scales?.y?.title || {}),
          display: true,
          text: "Tokens/second",
          color: "#FFF",
        },
      },
      x: {
        ...options.scales?.x,
        title: {
          ...(options.scales?.x?.title || {}),
          display: true,
          text: xAxisTitle,
          color: "#FFFFFF",
        },
      },
    };

    return options;
  }

  private buildCompareBarChart(
    servers: LlmChartServer[],
    selectedModelValue: string,
    benchmarkId: string,
  ): LlmBarChartData | undefined {
    const scaleField = "tokens";
    const scales: number[] = [];

    servers.forEach((server) => {
      server.benchmark_scores
        .filter(
          (score) =>
            score.benchmark_id === benchmarkId &&
            score.config?.model === selectedModelValue &&
            typeof score.config?.[scaleField] === "number",
        )
        .forEach((score) => {
          const tokenValue = score.config?.[scaleField];
          if (typeof tokenValue === "number" && !scales.includes(tokenValue)) {
            scales.push(tokenValue);
          }
        });
    });

    if (!scales.length) {
      return undefined;
    }

    scales.sort((a, b) => a - b);

    return {
      labels: scales,
      datasets: servers.map((server, index) => ({
        data: scales.map((tokenCount) => {
          const item = server.benchmark_scores.find(
            (score) =>
              score.benchmark_id === benchmarkId &&
              score.config?.model === selectedModelValue &&
              score.config?.[scaleField] === tokenCount,
          );
          return item ? item.score : null;
        }),
        label: server.display_name,
        borderColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
        backgroundColor:
          radarDatasetColors[index % radarDatasetColors.length].borderColor,
      })),
    };
  }

  private createOptions(
    baseOptions: LlmBarChartOptions,
    title: string,
    xAxisTitle: string,
  ): MutableLlmBarChartOptions {
    const options = cloneChartOptions(
      baseOptions ?? {},
    ) as MutableLlmBarChartOptions;
    options.plugins = {
      ...options.plugins,
      title: { display: true, text: title, color: "#FFF" },
      tooltip: {
        ...options.plugins?.tooltip,
        callbacks: {
          ...options.plugins?.tooltip?.callbacks,
          title: function (
            this: TooltipModel<"bar">,
            tooltipItems: TooltipItem<"bar">[],
          ) {
            return `${tooltipItems[0].label} Tokens (${tooltipItems[0].dataset.label})`;
          },
          label: function (
            this: TooltipModel<"bar">,
            tooltipItem: TooltipItem<"bar">,
          ) {
            return `Speed: ${tooltipItem.formattedValue} tokens/sec`;
          },
        },
      },
    };
    options.scales = {
      ...options.scales,
      y: {
        ...options.scales?.y,
        title: { display: true, text: "Tokens/second", color: "#FFF" },
      },
      x: {
        ...options.scales?.x,
        title: { display: true, text: xAxisTitle, color: "#FFF" },
      },
    };
    options.layout = { padding: { bottom: 20 } };
    return options;
  }
  private sortModels(models: string[]): string[] {
    return models.sort((a, b) => {
      const indexA = llmModelOrder.indexOf(a);
      const indexB = llmModelOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }
}
