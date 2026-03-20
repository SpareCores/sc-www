import { CommonModule, isPlatformBrowser } from "@angular/common";
import { CompactNumberPipe } from "../../pipes/compact-number.pipe";
import {
  Component,
  ElementRef,
  Input,
  PLATFORM_ID,
  ViewChild,
  OnChanges,
  inject,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { ExtendedServerDetails } from "../../pages/server-details/server-details.component";
import { Allocation } from "../../../../sdk/data-contracts";
import {
  redisChartTemplate,
  redisChartTemplateCallbacks,
  staticWebChartCompareTemplate,
  staticWebChartTemplateCallbacks,
} from "../../pages/server-details/chartFromBenchmarks";
import { ToastService } from "../../services/toast.service";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";
import { BenchmarkLineChartComponent } from "../charts/line/benchmark-line-chart.component";
import { CompressionChartComponent } from "../charts/compression/compression-chart.component";
import {
  CompressionBenchmarkMeta,
  CompressionServer,
} from "../charts/compression/compression-chart.types";
import { GeekbenchRadarChartComponent } from "../charts/geekbench/geekbench-radar-chart.component";
import { GeekbenchRadarChartBuilderService } from "../charts/geekbench/geekbench-radar-chart-builder.service";
import { LlmInferenceChartComponent } from "../charts/llm/llm-inference-chart.component";
import {
  GeekbenchBenchmarkMeta,
  GeekbenchCompareServer,
} from "../charts/geekbench/geekbench-radar-chart.types";
import { LlmChartServer } from "../charts/llm/llm-inference-chart.types";
import { ServerCompareMemoryChartComponent } from "../charts/memory/server-compare-memory-chart.component";
import {
  MemoryBenchmarkMeta,
  MemoryChartServer,
} from "../charts/memory/memory-chart.types";
import {
  LineBenchmarkMeta,
  LineChartServer,
} from "../charts/line/benchmark-line-chart.types";
import { BenchmarkMultiBarChartComponent } from "../charts/multi-bar/benchmark-multi-bar-chart.component";
import {
  BenchmarkMultiBarChartItem,
  MultiBarBenchmarkMeta,
  MultiBarServer,
} from "../charts/multi-bar/benchmark-multi-bar-chart.types";
import { ChartTooltipService } from "../charts/shared/chart-tooltip.service";
import {
  formatNumberWithCommas,
  getBestBenchmarkCellStyle,
  getBestPropertyCellStyle,
  getServerPropertyValue,
} from "../charts/shared/server-compare-table.utils";

@Component({
  selector: "app-server-compare-charts",
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    CompactNumberPipe,
    BenchmarkIconPipe,
    BenchmarkLineChartComponent,
    CompressionChartComponent,
    GeekbenchRadarChartComponent,
    LlmInferenceChartComponent,
    ServerCompareMemoryChartComponent,
    BenchmarkMultiBarChartComponent,
  ],
  templateUrl: "./server-compare-charts.component.html",
  styleUrl: "./server-compare-charts.component.scss",
})
export class ServerCompareChartsComponent implements OnChanges {
  private platformId = inject(PLATFORM_ID);
  private toastService = inject(ToastService);
  private tooltipService = inject(ChartTooltipService);
  private geekbenchBuilder = inject(GeekbenchRadarChartBuilderService);

  @Input() servers: ExtendedServerDetails[] = [];
  @Input() instanceProperties: any[] = [];
  @Input() benchmarkMeta: any;
  @Input() benchmarkCategories: any[] = [];
  @Input() instancePropertyCategories: any[] = [];
  @Input() isEmbedded = false;
  @Input() showChart = "all";
  @Input() showZone = false;

  @ViewChild("tooltipcompareDefault") tooltip!: ElementRef<HTMLElement>;

  tooltipContent = "";
  tooltipHtml = "";

  bestCellStyle = "font-weight: 600; color: #34D399";
  SSCoreTooltip =
    "Performance benchmark score using stress-ng's div16 method (doing 16 bit unsigned integer divisions for 20 seconds): simulating CPU heavy workload that scales well on any number of (v)CPUs. The score/price value shows the div16 performance measured for 1 USD/hour -- when otherwise not noted, using the best (usually spot) price of all zones.";

  multiBarCharts: Array<BenchmarkMultiBarChartItem & { callbacks: unknown }> = [
    {
      chart: JSON.parse(JSON.stringify(staticWebChartCompareTemplate)),
      callbacks: staticWebChartTemplateCallbacks,
      data: [],
      show_more: false,
      hidden: false,
    },
    {
      chart: JSON.parse(JSON.stringify(redisChartTemplate)),
      callbacks: redisChartTemplateCallbacks,
      data: [],
      show_more: false,
      hidden: false,
    },
  ];

  clipboardIcon = "clipboard";

  ngOnChanges() {
    this.setup();
  }

  setup() {
    if (
      this.servers.length === 0 ||
      !this.benchmarkMeta ||
      !this.instanceProperties ||
      !this.benchmarkCategories
    ) {
      return;
    }

    this.multiBarCharts.forEach((chartTemplate) => {
      const benchmarks = chartTemplate.chart.options.map((o) => o.benchmark_id);
      chartTemplate.data = (
        this.benchmarkMeta as MultiBarBenchmarkMeta[]
      ).filter((b) => benchmarks.includes(b.benchmark_id));

      chartTemplate.hidden = !(
        chartTemplate.chart.id === this.showChart || this.showChart === "all"
      );
    });

    if (isPlatformBrowser(this.platformId)) {
      this.initializeBenchmarkCharts();
    }
  }

  isChartShown(id: string): boolean {
    if (!this.showChart || this.showChart === "all") {
      return true;
    }
    return this.showChart === id;
  }

  toUpper(text: string) {
    return text?.toUpperCase();
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  getStyle() {
    return `width: ${100 / (this.servers.length + 1)}%; max-width: ${100 / (this.servers.length + 1)}%;`;
  }

  getBenchmark(server: ExtendedServerDetails, isMulti: boolean) {
    return (
      server.benchmark_scores
        ?.find(
          (b) =>
            b.benchmark_id ===
            (isMulti ? "stress_ng:bestn" : "stress_ng:best1"),
        )
        ?.score?.toFixed(0) || "-"
    );
  }

  getSScore(server: ExtendedServerDetails) {
    if (!server.score_per_price) {
      return "-";
    }
    return this.numberWithCommas(Math.round(server.score_per_price)) + "/USD";
  }

  getSScoreCustom(server: ExtendedServerDetails, price: number | undefined) {
    let baseline =
      server.benchmark_scores?.find((b) => b.benchmark_id === "stress_ng:bestn")
        ?.score || 0;
    if (!baseline || !price) {
      return "-";
    }
    return this.numberWithCommas(Math.round(baseline / price)) + "/USD";
  }

  getBestPrice(
    server: ExtendedServerDetails,
    allocation: Allocation | string = Allocation.Ondemand,
  ) {
    let priceData = null;

    switch (allocation) {
      case Allocation.Ondemand:
        priceData = server.bestOndemandPrice;
        break;
      case Allocation.Spot:
        priceData = server.bestSpotPrice;
        break;
    }

    if (priceData) {
      return `${priceData.price} ${priceData.currency}`;
    } else {
      return "-";
    }
  }

  getBestZone(
    server: ExtendedServerDetails,
    allocation: Allocation | string = Allocation.Ondemand,
  ) {
    let priceData = null;

    switch (allocation) {
      case Allocation.Ondemand:
        priceData = server.bestOndemandPrice;
        break;
      case Allocation.Spot:
        priceData = server.bestSpotPrice;
        break;
    }

    if (priceData) {
      return `${priceData.zone.display_name}`;
    } else {
      return "-";
    }
  }

  isBestPrice(
    server: ExtendedServerDetails,
    allocation: Allocation | string = Allocation.Ondemand,
  ): boolean {
    const prices = server.prices
      .filter((x) => x.allocation === allocation)
      .sort((a, b) => a.price - b.price);

    if (!prices || prices.length === 0) {
      return false;
    }

    const prop = server.prices
      .filter((x) => x.allocation === allocation)
      .sort((a, b) => a.price - b.price)[0]?.price;

    if (prop === undefined || prop === null || prop === 0) {
      return false;
    }

    let isBest = true;
    this.servers?.forEach((s: ExtendedServerDetails) => {
      const temp = s.prices
        .filter((x) => x.allocation === allocation)
        .sort((a, b) => a.price - b.price)[0]?.price;
      if (temp < prop) {
        isBest = false;
      }
    });
    return isBest;
  }

  getBestPriceStyle(
    server: ExtendedServerDetails,
    allocation: Allocation | string = Allocation.Ondemand,
  ) {
    return this.isBestPrice(server, allocation) ? this.bestCellStyle : "";
  }

  isBestSSCore(server: ExtendedServerDetails): boolean {
    const prop = server.score_per_price;

    if (prop === undefined || prop === null || prop === 0) {
      return false;
    }

    let isBest = true;
    this.servers?.forEach((s: ExtendedServerDetails) => {
      const temp = s.score_per_price || -1;
      if (temp > prop) {
        isBest = false;
      }
    });
    return isBest;
  }

  getSScoreStyle(server: ExtendedServerDetails) {
    return this.isBestSSCore(server) ? this.bestCellStyle : "";
  }

  getBecnchmarkStyle(server: ExtendedServerDetails, isMulti: boolean) {
    const prop = server.benchmark_scores?.find(
      (b) =>
        b.benchmark_id === (isMulti ? "stress_ng:bestn" : "stress_ng:best1"),
    )?.score;

    if (prop === undefined || prop === null || prop === 0) {
      return "";
    }

    let isBest = true;
    this.servers?.forEach((s: ExtendedServerDetails) => {
      const temp =
        s.benchmark_scores?.find(
          (b) =>
            b.benchmark_id ===
            (isMulti ? "stress_ng:bestn" : "stress_ng:best1"),
        )?.score || 0;
      if (temp > prop) {
        isBest = false;
      }
    });
    return isBest ? this.bestCellStyle : "";
  }

  isBestStyle(
    value: number | string | null | undefined,
    values: Array<number | string | null | undefined>,
    benchmark: { higher_is_better?: boolean | null } | null | undefined,
  ) {
    return getBestBenchmarkCellStyle(
      value,
      values,
      benchmark,
      this.bestCellStyle,
    );
  }

  getBestCellStyle(name: string, server: ExtendedServerDetails) {
    return getBestPropertyCellStyle(
      name,
      server,
      this.servers,
      this.bestCellStyle,
    );
  }

  toggleBenchmark(benchmark: any) {
    benchmark.collapsed = !benchmark.collapsed;
  }

  benchmarkIcon(benchmark: any) {
    return benchmark.collapsed ? "chevron-down" : "chevron-up";
  }

  public numberWithCommas(x: number) {
    return formatNumberWithCommas(x);
  }

  showTooltip(el: MouseEvent, content?: string, autoHide = false) {
    this.tooltipHtml = "";
    const didShow = this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip?.nativeElement,
      event: el,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent = tooltipContent;
      },
    });

    if (didShow && autoHide) {
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
  }

  showTooltipChart(el: MouseEvent, type: string) {
    this.tooltipHtml = "";
    const content = this.benchmarkMeta.find(
      (b: any) => b.benchmark_id === type,
    )?.description;

    this.tooltipService.showIfPresent({
      tooltipElement: this.tooltip?.nativeElement,
      event: el,
      content,
      onShow: (tooltipContent) => {
        this.tooltipContent = tooltipContent;
      },
    });
  }

  showGeekbenchInfoTooltip(el: MouseEvent): void {
    const geekbenchMeta = this.geekbenchBenchmarkMeta.filter((b) =>
      b.benchmark_id?.includes("geekbench"),
    );
    const html = this.geekbenchBuilder.buildInfoTooltipHtml(geekbenchMeta);
    if (!html || !this.tooltip?.nativeElement) {
      return;
    }
    this.tooltipContent = "";
    this.tooltipHtml = html;
    this.tooltipService.show(this.tooltip.nativeElement, el);
  }

  hideTooltip() {
    this.tooltipService.hide(this.tooltip?.nativeElement);
    this.tooltipHtml = "";
  }

  getProperty(
    column: { id: string; unit?: string | null },
    server: ExtendedServerDetails,
  ) {
    return getServerPropertyValue(column, server);
  }

  initializeBenchmarkCharts() {
    this.multiBarCharts.forEach((chartItem) => {
      chartItem.chart.chartOptions.plugins.tooltip.callbacks =
        chartItem.callbacks;
    });
  }

  setBenchmarkCategoryHidden(category: { hidden?: boolean }, hidden: boolean) {
    category.hidden = hidden;
  }

  syncMultiBarHeaderOption(
    chartItem: BenchmarkMultiBarChartItem,
    optionIndex: number,
  ): void {
    if (!chartItem.chart.options[optionIndex]) {
      return;
    }

    chartItem.chart.selectedOption = optionIndex;
  }

  syncMultiBarHeaderSecondaryOption(
    chartItem: BenchmarkMultiBarChartItem,
    optionIndex: number,
  ): void {
    if (!chartItem.chart.secondaryOptions?.[optionIndex]) {
      return;
    }

    chartItem.chart.selectedSecondaryOption = optionIndex;
  }

  hasMultipleChartData(chartItem: BenchmarkMultiBarChartItem): boolean {
    return (chartItem.data?.length ?? 0) > 1;
  }

  get compressionServers(): CompressionServer[] {
    return this.servers as unknown as CompressionServer[];
  }

  get multiBarCompareServers(): MultiBarServer[] {
    return this.servers as unknown as MultiBarServer[];
  }

  get compressionBenchmarkMeta(): CompressionBenchmarkMeta[] {
    return this.benchmarkMeta as CompressionBenchmarkMeta[];
  }

  get memoryCompareServers(): MemoryChartServer[] {
    return this.servers as unknown as MemoryChartServer[];
  }

  get memoryBenchmarkMeta(): MemoryBenchmarkMeta[] {
    return this.benchmarkMeta as unknown as MemoryBenchmarkMeta[];
  }

  get geekbenchCompareServers(): GeekbenchCompareServer[] {
    return this.servers as unknown as GeekbenchCompareServer[];
  }

  get lineCompareServers(): LineChartServer[] {
    return this.servers as unknown as LineChartServer[];
  }

  get lineBenchmarkMeta(): LineBenchmarkMeta[] {
    return this.benchmarkMeta as unknown as LineBenchmarkMeta[];
  }

  get geekbenchBenchmarkMeta(): GeekbenchBenchmarkMeta[] {
    return this.benchmarkMeta as unknown as GeekbenchBenchmarkMeta[];
  }

  get llmCompareServers(): LlmChartServer[] {
    return this.servers as unknown as LlmChartServer[];
  }

  getUncategorizedBenchmarksCategories() {
    return this.benchmarkMeta?.filter((b: any) =>
      this.isUncagorizedBenchmark(b),
    );
  }

  isUncagorizedBenchmark(benchmark: any) {
    let found = false;
    this.multiBarCharts.forEach((chartTemplate) => {
      const benchmarks = chartTemplate.chart.options.map(
        (o: any) => o.benchmark_id,
      );
      found = found || benchmarks.includes(benchmark.benchmark_id);
    });
    return (
      !found &&
      !this.benchmarkCategories.some((c: any) =>
        c.benchmarks.includes(benchmark.benchmark_id),
      )
    );
  }

  toggleBenchmarkCategory(category: BenchmarkMultiBarChartItem): void {
    category.show_more = !category.show_more;

    // single item lists are auto toggled
    if (category.data?.length === 1) {
      category.data[0].collapsed = !category.show_more;
    }
  }

  getSectionColSpan() {
    return Math.max(this.servers.length + 1, 3);
  }

  clipboardURL(event: any, fragment?: string) {
    let url = window.location.href;

    if (fragment) {
      // replace url fragment
      url = url.replace(/#.*$/, "") + "#" + fragment;
    }

    navigator.clipboard.writeText(url);
    this.clipboardIcon = "check";

    this.toastService.show({
      title: "Link copied to clipboard!",
      type: "success",
      duration: 2000,
    });

    setTimeout(() => {
      this.clipboardIcon = "clipboard";
    }, 3000);
  }

  serializeConfig(config: any) {
    let result = "<ul>";
    Object.keys(config).forEach((key) => {
      result += `<li>${key.replace("_", " ")}: ${config[key]} </li>`;
    });

    result += "</ul>";

    return result;
  }

  viewServer(server: ExtendedServerDetails) {
    window.open(
      `/server/${server.vendor_id}/${server.api_reference}`,
      "_blank",
    );
  }

  private formatNumber(value: number): string {
    if (value === undefined || value === null) {
      return "-";
    }
    return value.toLocaleString("en-US");
  }

  sortLLMConfigs(configs: any[]): any[] {
    if (!configs) return [];

    const modelOrder = [
      "SmolLM-135M.Q4_K_M.gguf",
      "qwen1_5-0_5b-chat-q4_k_m.gguf",
      "gemma-2b.Q4_K_M.gguf",
      "llama-7b.Q4_K_M.gguf",
      "phi-4-q4.gguf",
      "Llama-3.3-70B-Instruct-Q4_K_M.gguf",
    ];

    return configs.sort((a, b) => {
      const modelA = a.config?.model;
      const modelB = b.config?.model;
      const tokensA = a.config?.tokens;
      const tokensB = b.config?.tokens;

      // model might be missing?
      if (!modelA || !modelB) return 0;

      const indexA = modelOrder.indexOf(modelA);
      const indexB = modelOrder.indexOf(modelB);

      if (indexA !== -1 && indexB !== -1) {
        if (indexA !== indexB) return indexA - indexB;
      } else if (indexA !== -1) {
        return -1;
      } else if (indexB !== -1) {
        return 1;
      } else {
        const modelCompare = modelA.localeCompare(modelB);
        if (modelCompare !== 0) return modelCompare;
      }

      if (tokensA !== undefined && tokensB !== undefined) {
        return tokensA - tokensB;
      }
      return 0;
    });
  }
}
