import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  PLATFORM_ID,
  ViewChild,
  OnInit,
  OnChanges,
  inject,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { ExtendedServerDetails } from "../../pages/server-details/server-details.component";
import {
  TooltipModel,
  TooltipItem,
  ChartConfiguration,
  ChartData,
} from "chart.js";
import { Allocation, ServerPKs } from "../../../../sdk/data-contracts";
import {
  ChartFromBenchmarkTemplate,
  ChartFromBenchmarkTemplateOptions,
  redisChartTemplate,
  redisChartTemplateCallbacks,
  staticWebChartCompareTemplate,
  staticWebChartTemplateCallbacks,
} from "../../pages/server-details/chartFromBenchmarks";
import {
  barChartOptionsRedisCompare,
  barChartOptionsSSLCompare,
  barChartOptionsStaticWebCompare,
  lineChartOptionsBWM,
  lineChartOptionsCompareCompress,
  lineChartOptionsCompareDecompress,
  lineChartOptionsStressNG,
  lineChartOptionsStressNGPercent,
  radarChartOptions,
  radarDatasetColors,
} from "../../pages/server-details/chartOptions";
import { DomSanitizer } from "@angular/platform-browser";
import { DropdownManagerService } from "../../services/dropdown-manager.service";
import { BaseChartDirective } from "ng2-charts";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-server-compare-charts",
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    BaseChartDirective,
  ],
  templateUrl: "./server-compare-charts.component.html",
  styleUrl: "./server-compare-charts.component.scss",
})
export class ServerCompareChartsComponent implements OnInit, OnChanges {
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  private dropdownManager = inject(DropdownManagerService);
  private toastService = inject(ToastService);

  @Input() servers: ExtendedServerDetails[] = [];
  @Input() instanceProperties: any[] = [];
  @Input() benchmarkMeta: any;
  @Input() benchmarkCategories: any[] = [];
  @Input() instancePropertyCategories: any[] = [];
  @Input() isEmbedded = false;
  @Input() showChart = "all";
  @Input() showZone = false;

  @ViewChild("tooltipcompareDefault") tooltip!: ElementRef;
  @ViewChild("tooltipGeekbench") tooltipGB!: ElementRef;

  tooltipContent = "";
  geekbenchHTML: any;

  bestCellStyle = "font-weight: 600; color: #34D399";
  SSCoreTooltip =
    "Performance benchmark score using stress-ng's div16 method (doing 16 bit unsigned integer divisions for 20 seconds): simulating CPU heavy workload that scales well on any number of (v)CPUs. The score/price value shows the div16 performance measured for 1 USD/hour -- when otherwise not noted, using the best (usually spot) price of all zones.";

  radarChartType = "radar" as const;
  radarChartOptionsMulti: ChartConfiguration<"radar">["options"] = JSON.parse(
    JSON.stringify(radarChartOptions),
  );
  radarChartOptionsSingle: ChartConfiguration<"radar">["options"] = JSON.parse(
    JSON.stringify(radarChartOptions),
  );
  radarChartDataGeekMulti: ChartData<"radar"> | undefined = undefined;
  radarChartDataGeekSingle: ChartData<"radar"> | undefined = undefined;

  lineChartType = "line" as const;
  lineChartOptionsBWMem: ChartConfiguration<"line">["options"] =
    lineChartOptionsBWM;
  lineChartDataBWmem: ChartData<"line"> | undefined = undefined;

  lineChartOptionsStressNG: ChartConfiguration<"line">["options"] = JSON.parse(
    JSON.stringify(lineChartOptionsStressNG),
  );
  lineChartOptionsStressNGPercent: ChartConfiguration<"line">["options"] =
    JSON.parse(JSON.stringify(lineChartOptionsStressNGPercent));
  lineChartDataStressNG: ChartData<"line"> | undefined = undefined;

  barChartType = "bar" as const;
  barChartOptionsSSL: ChartConfiguration<"bar">["options"] =
    barChartOptionsSSLCompare;
  barChartDataSSL: ChartData<"bar"> | undefined = undefined;

  barChartOptionsStaticWeb: ChartConfiguration<"bar">["options"] =
    barChartOptionsStaticWebCompare;
  barChartDataStaticWeb: ChartData<"bar"> | undefined = undefined;

  barChartOptionsRedis: ChartConfiguration<"bar">["options"] =
    barChartOptionsRedisCompare;
  barChartDataRedis: ChartData<"bar"> | undefined = undefined;

  lineChartOptionsCompress: ChartConfiguration<"line">["options"] =
    lineChartOptionsCompareCompress;
  lineChartOptionsDecompress: ChartConfiguration<"line">["options"] =
    lineChartOptionsCompareDecompress;
  lineChartDataCompress: ChartData<"line"> | undefined = undefined;
  lineChartDataDecompress: ChartData<"line"> | undefined = undefined;

  dropdownBWmem: any;
  availableBWmem = [
    { name: "Read", value: "rd" },
    { name: "Write", value: "wr" },
    { name: "Read/Write", value: "rdwr" },
  ];

  selectedBWMemOperation = this.availableBWmem[2];

  dropdownSSL: any;
  availableSSLAlgos = [
    { name: "AES-256-CBC", value: "AES-256-CBC" },
    { name: "ARIA-256-CBC", value: "ARIA-256-CBC" },
    { name: "CAMELLIA-256-CBC", value: "CAMELLIA-256-CBC" },
    { name: "SM4-CBC", value: "SM4-CBC" },
    { name: "blake2b512", value: "blake2b512" },
    { name: "sha256", value: "sha256" },
    { name: "sha3-256", value: "sha3-256" },
    { name: "sha3-512", value: "sha3-512" },
    { name: "sha512", value: "sha512" },
    { name: "shake128", value: "shake128" },
    { name: "shake256", value: "shake256" },
  ];

  selectedSSLAlgo = this.availableSSLAlgos[5];

  multiBarCharts: any[] = [
    {
      chart: JSON.parse(JSON.stringify(staticWebChartCompareTemplate)),
      callbacks: staticWebChartTemplateCallbacks,
      dropdown: undefined,
      dropdown2: undefined,
      data: [],
      show_more: false,
      hidden: false,
    },
    {
      chart: JSON.parse(JSON.stringify(redisChartTemplate)),
      callbacks: redisChartTemplateCallbacks,
      dropdown: undefined,
      dropdown2: undefined,
      data: [],
      show_more: false,
      hidden: false,
    },
  ];

  compressDropdown: any;
  availableCompressMethods: any[] = [];
  selectedCompressMethod: any;

  barChartLLMPromptOptions: ChartConfiguration<"bar">["options"] = JSON.parse(
    JSON.stringify(barChartOptionsSSLCompare),
  );
  barChartLLMPromptData: ChartData<"bar"> | undefined = undefined;
  barChartLLMGenerationOptions: ChartConfiguration<"bar">["options"] =
    JSON.parse(JSON.stringify(barChartOptionsSSLCompare));
  barChartLLMGenerationData: ChartData<"bar"> | undefined = undefined;

  llmModelsDropdown: any;
  availableLLMModels: any[] = [];
  selectedLLMModel: any;

  clipboardIcon = "clipboard";

  ngOnInit() {
    (this.radarChartOptionsSingle as any).plugins.legend.display = true;
    (this.radarChartOptionsMulti as any).plugins.legend.display = true;

    (this.radarChartOptionsSingle as any).plugins.title = {
      display: true,
      text: "Single-core performance",
      color: "#FFF",
    };
    (this.radarChartOptionsMulti as any).plugins.title = {
      display: true,
      text: "Multi-core performance",
      color: "#FFF",
    };
  }

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

    this.getCompressChartOptions();

    this.multiBarCharts.forEach((chartTemplate) => {
      const benchmarks = chartTemplate.chart.options.map(
        (o: any) => o.benchmark_id,
      );
      chartTemplate.data = this.benchmarkMeta.filter((b: any) =>
        benchmarks.includes(b.benchmark_id),
      );

      chartTemplate.hidden = !(
        chartTemplate.chart.id === this.showChart || this.showChart === "all"
      );
    });

    if (isPlatformBrowser(this.platformId)) {
      this.initializeBenchmarkCharts();

      this.generateChartsData();
      this.generateBWMemChart();
      this.generateSSLChart();
      this.generateCompressChart();
      this.generateStressNGChart();
      this.initializeLLMModels();
      this.generateLLMCharts();

      this.multiBarCharts.forEach((chart) => {
        this.generateMultiBarChart(chart.chart);
      });

      this.multiBarCharts.forEach((chart) => {
        this.dropdownManager
          .initDropdown(chart.chart.id + "_button", chart.chart.id + "_options")
          .then((dropdown) => {
            chart.dropdown = dropdown;
          });
        if (chart.chart.secondaryOptions?.length > 1) {
          this.dropdownManager
            .initDropdown(
              chart.chart.id + "_button2",
              chart.chart.id + "_options2",
            )
            .then((dropdown) => {
              chart.dropdown2 = dropdown;
            });
        }
      });

      // Initialize LLM dropdown
      if (this.availableLLMModels?.length) {
        this.dropdownManager
          .initDropdown("llm_models_button", "llm_models_options")
          .then((dropdown) => {
            this.llmModelsDropdown = dropdown;
          });
      }
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

  isBestStyle(value: any, values: any[], benchmark: any) {
    if (value === "-" || value === 0) return "";
    let isBest = true;

    values.forEach((v) => {
      if (!isNaN(v)) {
        if (benchmark.higher_is_better === false) {
          if (v < value) {
            isBest = false;
          }
        } else if (v > value) {
          isBest = false;
        }
      }
    });

    return isBest ? this.bestCellStyle : "";
  }

  getBestCellStyle(name: string, server: ExtendedServerDetails) {
    const prop = (server as any)[name];

    if (prop === undefined || prop === null || prop === 0 || !this.servers) {
      return "";
    }

    if (typeof prop === "number") {
      const values = this.servers
        .map((server: any) => server[name])
        .filter((value: any) => typeof value === "number");

      if (values.length === 0) return "";

      const max = Math.max(...values);
      const min = Math.min(...values);

      if (prop === max && max > min) {
        return this.bestCellStyle;
      }
    }

    return "";
  }

  toggleBenchmark(benchmark: any) {
    benchmark.collapsed = !benchmark.collapsed;
  }

  benchmarkIcon(benchmark: any) {
    return benchmark.collapsed ? "chevron-down" : "chevron-up";
  }

  public numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  showTooltip(el: any, content?: string, autoHide = false) {
    const tooltip = this.tooltip.nativeElement;

    tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";

    this.tooltipContent = content || "";

    if (autoHide) {
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
  }

  showTooltipChart(el: any, type: string) {
    let content = this.benchmarkMeta.find(
      (b: any) => b.benchmark_id === type,
    )?.description;
    if (content) {
      const tooltip = this.tooltip.nativeElement;

      tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5}px`;
      tooltip.style.display = "block";
      tooltip.style.opacity = "1";

      this.tooltipContent = content;
    }
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
  }

  showTooltipGB(el: any) {
    const tooltip = this.tooltipGB.nativeElement;
    tooltip.style.left = `${20}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5}px`;
    tooltip.style.display = "block";
    tooltip.style.opacity = "1";
  }

  hideTooltipGB() {
    const tooltip = this.tooltipGB.nativeElement;
    tooltip.style.display = "none";
    tooltip.style.opacity = "0";
  }

  getMemory(item: ExtendedServerDetails) {
    return (
      ((item.memory_amount || 0) / 1024).toFixed(
        (item.memory_amount || 0) >= 1024 ? 0 : 1,
      ) + " GiB"
    );
  }

  getGPUMemory(item: ExtendedServerDetails) {
    return ((item.gpu_memory_min || 0) / 1024).toFixed(1) + " GB";
  }

  getStorage(item: ExtendedServerDetails) {
    if (!item.storage_size) return "-";

    if (item.storage_size < 1000) return `${item.storage_size} GB`;

    return `${(item.storage_size / 1000).toFixed(1)} TB`;
  }

  bytesToSize(bytes: number) {
    const sizes = ["Bytes", "KiB", "MiB", "GiB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(0) + " " + sizes[i];
  }

  getProperty(column: any, server: ExtendedServerDetails) {
    const name = column.id;
    const prop = (server as any)[name];

    if (prop === undefined || prop === null) {
      return undefined;
    }

    if (name === "memory_amount") {
      return this.getMemory(server);
    }

    if (name === "gpu_memory_min" || name === "gpu_memory_total") {
      return this.getGPUMemory(server);
    }

    if (name === "storage_size") {
      return this.getStorage(server);
    }

    if (typeof prop === "number") {
      if (column.unit === "byte") {
        return this.bytesToSize(prop);
      }
      return `${prop} ${column.unit || ""}`;
    }

    if (typeof prop === "string") {
      return prop;
    }
    if (Array.isArray(prop)) {
      // if the items are Objects, return undefined for now
      if (prop.length > 0 && typeof prop[0] === "object") {
        return undefined;
      } else {
        return prop.join(", ");
      }
    }

    return "-";
  }

  public generateChartsData() {
    let geekbenchScores = this.benchmarkMeta
      .filter(
        (x: any) =>
          x.benchmark_id.includes("geekbench") &&
          x.benchmark_id !== "geekbench:score",
      )
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    const GBScore = this.benchmarkMeta.find(
      (x: any) => x.benchmark_id === "geekbench:score",
    );

    if (GBScore) {
      geekbenchScores.unshift(GBScore);
    }

    if (!geekbenchScores || geekbenchScores.length === 0) {
      return;
    }

    this.geekbenchHTML = `<div> The following benchmark scenarios were run using Geekbench 6: </div> <ul> `;

    geekbenchScores.forEach((benchmark: any) => {
      const name: string = benchmark.name.replace("Geekbench:", "");
      const desc =
        benchmark.description.replace(
          "The score is calibrated against a baseline score of 2,500 (Dell Precision 3460 with a Core i7-12700 processor) as per the Geekbench 6 Benchmark Internals.",
          "",
        ) || "";
      this.geekbenchHTML += `<li> - ${name}: ${desc} </li>`;
    });

    this.geekbenchHTML += `</ul>`;

    this.geekbenchHTML = this.sanitizer.bypassSecurityTrustHtml(
      this.geekbenchHTML,
    );

    const labels = geekbenchScores.map((x: any) => x.benchmark_id);
    //scales = dataSet[0].benchmarks.sort((a: any, b:any) => (a.config.cores as string).localeCompare(b.config.cores)).map((b: any) => b.config.cores);

    let chartData: any = {
      labels: labels.map((s: string) =>
        (this.benchmarkMeta.find((b: any) => b.benchmark_id === s)?.name || s)
          .replace("geekbench:", "")
          .replace("Geekbench: ", ""),
      ),
      datasets: [
        this.servers.map((server: any, index: number) => {
          return {
            data: [],
            label: server.display_name,
            borderColor: radarDatasetColors[index % 8].borderColor,
            backgroundColor: radarDatasetColors[index % 8].backgroundColor,
          };
        }),
        this.servers.map((server: any, index: number) => {
          return {
            data: [],
            label: server.display_name,
            borderColor: radarDatasetColors[index % 8].borderColor,
            backgroundColor: radarDatasetColors[index % 8].backgroundColor,
          };
        }),
      ],
    };

    labels.forEach((label: string) => {
      this.servers.forEach((server, index) => {
        const scores = server.benchmark_scores
          ?.filter((x: any) => label === x.benchmark_id)
          .sort((a: any, b: any) =>
            (a.config.cores as string).localeCompare(b.config.cores),
          );
        if (scores?.length === 2) {
          scores.forEach((score: any, j) => {
            chartData.datasets[j][index].data.push({
              value: score.score,
              tooltip: score.note,
            });
          });
        } else {
          chartData.datasets[0][index].data.push({ value: null, tooltip: "" });
          chartData.datasets[1][index].data.push({ value: null, tooltip: "" });
        }
      });
    });

    this.radarChartDataGeekMulti = {
      labels: chartData.labels,
      datasets: chartData.datasets[0],
    };
    this.radarChartDataGeekSingle = {
      labels: chartData.labels,
      datasets: chartData.datasets[1],
    };
  }

  generateBWMemChart() {
    const scaleField = "size";
    const benchmark_id = "bw_mem";

    const selectedOperation = this.selectedBWMemOperation.value;
    const selectedName = this.selectedBWMemOperation.name;

    const dataSet = this.benchmarkMeta?.find(
      (x: any) => x.benchmark_id === benchmark_id,
    );

    if (dataSet) {
      let scales: number[] = [];
      dataSet.configs
        .filter((x: any) => x.config.operation === selectedOperation)
        .forEach((item: any) => {
          if (
            (item.config[scaleField] || item.config[scaleField] === 0) &&
            scales.indexOf(item.config[scaleField]) === -1
          ) {
            scales.push(item.config[scaleField]);
          }
        });

      scales.sort((a, b) => a - b);

      let chartData: any = {
        labels: scales, //scales.map((s) => s.toString()),
        datasets: this.servers.map((server: ServerPKs, index: number) => {
          return {
            data: [],
            label: server.display_name,
            spanGaps: true,
            borderColor: radarDatasetColors[index % 8].borderColor,
            backgroundColor: radarDatasetColors[index % 8].backgroundColor,
          };
        }),
      };

      this.servers.forEach((server: any, i: number) => {
        scales.forEach((size: number) => {
          const item = server.benchmark_scores.find(
            (b: any) =>
              b.config.operation === selectedOperation &&
              b.config[scaleField] === size,
          );
          if (item) {
            chartData.datasets[i].data.push(item.score);
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      });

      // reset the annotations
      if (this.lineChartOptionsBWMem?.plugins?.annotation) {
        this.lineChartOptionsBWMem.plugins.annotation = {};
      }

      this.lineChartDataBWmem = {
        labels: chartData.labels,
        datasets: chartData.datasets,
      };

      (this.lineChartOptionsBWMem as any).plugins.tooltip.callbacks.title =
        function (
          this: TooltipModel<"line">,
          tooltipItems: TooltipItem<"line">[],
        ) {
          return (
            selectedName +
            " ops with " +
            tooltipItems[0].label +
            " MB block size"
          );
        };

      if (!this.dropdownBWmem) {
        this.dropdownManager
          .initDropdown("bw_mem_button", "bw_mem_options")
          .then((dropdown) => {
            this.dropdownBWmem = dropdown;
          });
      }
    }
  }

  generateStressNGChart() {
    const scaleField = "cores";
    const benchmark_id = "stress_ng:div16";

    const dataSet = this.benchmarkMeta?.find(
      (x: any) => x.benchmark_id === benchmark_id,
    );

    if (dataSet) {
      let scales: number[] = [];
      dataSet.configs.forEach((item: any) => {
        if (
          item.config[scaleField] &&
          scales.indexOf(item.config[scaleField]) === -1
        ) {
          scales.push(item.config[scaleField]);
        }
      });

      scales.sort((a, b) => a - b);

      if (scales.length <= 1) {
        this.benchmarkCategories.find((c) => c.id === "stress_ng").hidden =
          true;
        this.benchmarkCategories.find((c) => c.id === "stress_ng_pct").hidden =
          true;
        return;
      }

      let chartData: any = {
        labels: scales, //scales.map((s) => s.toString()),
        datasets: this.servers.map((server: ServerPKs, index: number) => {
          return {
            data: [],
            label: server.display_name,
            spanGaps: true,
            borderColor: radarDatasetColors[index % 8].borderColor,
            backgroundColor: radarDatasetColors[index % 8].backgroundColor,
          };
        }),
      };

      this.servers.forEach((server: any, i: number) => {
        let score1 =
          server.benchmark_scores.find(
            (b: any) => b.benchmark_id === benchmark_id && b.config.cores === 1,
          )?.score || 1;

        scales.forEach((size: number) => {
          const item = server.benchmark_scores.find(
            (b: any) =>
              b.benchmark_id === benchmark_id && b.config[scaleField] === size,
          );
          if (item) {
            chartData.datasets[i].data.push({
              cores: size,
              score: item.score,
              percent: (item.score / (size * score1)) * 100,
            });
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      });

      this.lineChartDataStressNG = {
        labels: chartData.labels,
        datasets: chartData.datasets,
      };

      (this.lineChartOptionsStressNGPercent!.plugins as any).tooltip = {
        callbacks: {
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            return `Performance: ${tooltipItem.formattedValue}% (${tooltipItem.dataset.label})`;
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            return `${tooltipItems[0].label} vCPUs`;
          },
        },
      };

      (this.lineChartOptionsStressNG!.plugins as any).tooltip = {
        callbacks: {
          label: function (
            this: TooltipModel<"line">,
            tooltipItem: TooltipItem<"line">,
          ) {
            return `Performance: ${tooltipItem.formattedValue} (${tooltipItem.dataset.label})`;
          },
          title: function (
            this: TooltipModel<"line">,
            tooltipItems: TooltipItem<"line">[],
          ) {
            return `${tooltipItems[0].label} vCPUs`;
          },
        },
      };
    }
  }

  generateSSLChart() {
    const scaleField = "block_size";
    const benchmark_id = "openssl";

    const selectedAlgo = this.selectedSSLAlgo.value;
    const selectedName = this.selectedSSLAlgo.name;

    const dataSet = this.benchmarkMeta?.find(
      (x: any) => x.benchmark_id === benchmark_id,
    );

    if (dataSet) {
      let scales: number[] = [];
      dataSet.configs
        .filter((x: any) => x.config.algo === selectedAlgo)
        .forEach((item: any) => {
          if (
            (item.config[scaleField] || item.config[scaleField] === 0) &&
            scales.indexOf(item.config[scaleField]) === -1
          ) {
            scales.push(item.config[scaleField]);
          }
        });
      scales.sort((a, b) => a - b);

      let chartData: any = {
        labels: scales, //scales.map((s) => s.toString()),
        datasets: this.servers.map((server: ServerPKs, index: number) => {
          return {
            data: [],
            label: server.display_name,
            spanGaps: true,
            borderColor: radarDatasetColors[index % 8].borderColor,
            backgroundColor: radarDatasetColors[index % 8].borderColor,
          };
        }),
      };

      this.servers.forEach((server: any, i: number) => {
        scales.forEach((size: number) => {
          const item = server.benchmark_scores.find(
            (b: any) =>
              b.config.algo === selectedAlgo && b.config[scaleField] === size,
          );
          if (item) {
            chartData.datasets[i].data.push(item.score);
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      });

      this.barChartDataSSL = {
        labels: chartData.labels,
        datasets: chartData.datasets,
      };

      (this.barChartOptionsSSL as any).plugins.tooltip.callbacks.title =
        function (
          this: TooltipModel<"line">,
          tooltipItems: TooltipItem<"line">[],
        ) {
          return (
            selectedName + " with " + tooltipItems[0].label + "-byte block size"
          );
        };

      if (!this.dropdownSSL) {
        this.dropdownManager
          .initDropdown("ssl_button", "ssl_options")
          .then((dropdown) => {
            this.dropdownSSL = dropdown;
          });
      }
    }
  }

  generateMultiBarChart(chartTemplate: ChartFromBenchmarkTemplate) {
    const option: ChartFromBenchmarkTemplateOptions =
      chartTemplate.options[chartTemplate.selectedOption];
    const benchmark_id = option.benchmark_id;
    const labelsField = option.labelsField;
    const scaleField = option.scaleField;

    if (
      !chartTemplate.secondaryOptions ||
      chartTemplate.selectedSecondaryOption === undefined
    ) {
      return;
    }

    const optionsSecondary =
      chartTemplate.secondaryOptions[chartTemplate.selectedSecondaryOption];

    const labelValue = optionsSecondary.value;

    const dataSet = this.benchmarkMeta?.find(
      (x: any) => x.benchmark_id === benchmark_id,
    );

    if (dataSet) {
      let scales: any[] = [];
      dataSet.configs
        .filter((x: any) => x.config[labelsField] === labelValue)
        .forEach((item: any) => {
          if (
            (item.config[scaleField] || item.config[scaleField] === 0) &&
            scales.indexOf(item.config[scaleField]) === -1
          ) {
            scales.push(item.config[scaleField]);
          }
        });

      scales.sort((a, b) => {
        if (!isNaN(a) && !isNaN(b)) {
          return a - b;
        }
        const valueA = parseInt(a.replace(/\D/g, ""), 10);
        const valueB = parseInt(b.replace(/\D/g, ""), 10);
        if (valueA && valueB) {
          return valueA - valueB;
        }

        return a.localeCompare(b);
      });

      let chartData: any = {
        labels: scales, //scales.map((s) => s.toString()),
        datasets: this.servers.map((server: ServerPKs, index: number) => {
          return {
            data: [],
            label: server.display_name,
            spanGaps: true,
            borderColor: radarDatasetColors[index % 8].borderColor,
            backgroundColor: radarDatasetColors[index % 8].borderColor,
          };
        }),
      };

      this.servers.forEach((server: any, i: number) => {
        scales.forEach((size: number) => {
          const item = server.benchmark_scores.find(
            (b: any) =>
              b.benchmark_id === benchmark_id &&
              b.config[labelsField] === labelValue &&
              b.config[scaleField] === size,
          );
          if (item) {
            chartData.datasets[i].data.push({
              data: item.score,
              label: size,
              unit: option.YLabel,
              note: item.note,
            });
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      });

      if (chartData) {
        chartTemplate.chartData = {
          labels: chartData.labels,
          datasets: chartData.datasets,
        };
        chartTemplate.chartOptions.scales.y.title.text = option.YLabel;
        chartTemplate.chartOptions.scales.x.title.text = option.XLabel;
        chartTemplate.chartOptions.plugins.title.text = option.title;
      } else {
        chartTemplate.chartData = undefined;
      }
    }
  }

  getCompressChartOptions() {
    let dataSet = this.benchmarkMeta?.find(
      (x: any) => x.benchmark_id === "compression_text:ratio",
    );
    let options: any = [];
    dataSet?.configs.forEach((config: any) => {
      let temp = { ...config.config };
      delete temp.compression_level;

      const found = options.find((b: any) => {
        return Object.entries(temp).every(([key, value]) => {
          return b[key] === value;
        });
      });

      if (!found) {
        options.push(temp);
      }
    });
    this.availableCompressMethods = options
      .sort((a: any, b: any) => {
        return a.algo.localeCompare(b.algo);
      })
      .map((item: any) => {
        return {
          options: item,
          name: Object.keys(item)
            .map((key: string) => {
              return `${key.replace("_", " ")}: ${item[key]}`;
            })
            .join(", "),
        };
      });
    this.selectedCompressMethod = this.availableCompressMethods[0];
  }

  generateCompressChart() {
    const selectedConfig = this.selectedCompressMethod?.options;
    const selectedName = this.selectedCompressMethod?.name;

    if (!selectedConfig) {
      return;
    }

    let chartData: any = {
      labels: [],
      datasets: this.servers.map((server: ServerPKs, index: number) => {
        return {
          data: [],
          label: server.display_name,
          spanGaps: true,
          borderColor: radarDatasetColors[index % 8].borderColor,
          backgroundColor: radarDatasetColors[index % 8].borderColor,
        };
      }),
    };

    let labels: any[] = [];

    this.servers.forEach((server: any) => {
      const items = server.benchmark_scores.filter(
        (b: any) =>
          b.benchmark_id === "compression_text:ratio" &&
          b.config.algo === selectedConfig.algo &&
          b.config.threads === selectedConfig.threads,
      );

      items.forEach((item: any) => {
        if (item?.score && labels.indexOf(item.score) === -1) {
          labels.push(item.score);
        }
      });
    });

    chartData.labels = labels.sort((a, b) => a - b);

    this.servers.forEach((server: any, i: number) => {
      labels.forEach((size: number) => {
        const item = server.benchmark_scores.find(
          (b: any) =>
            b.benchmark_id === "compression_text:ratio" &&
            b.config.algo === selectedConfig.algo &&
            b.config.threads === selectedConfig.threads &&
            b.score === size,
        );
        if (item) {
          const item2 = server.benchmark_scores.find((b: any) => {
            return (
              b.benchmark_id === "compression_text:compress" &&
              Object.entries(item.config).every(([key, value]) => {
                return b.config[key] === value;
              })
            );
          });

          const item3 = server.benchmark_scores.find((b: any) => {
            return (
              b.benchmark_id === "compression_text:decompress" &&
              Object.entries(item.config).every(([key, value]) => {
                return b.config[key] === value;
              })
            );
          });

          let tooltip = ``;
          Object.keys(item.config).forEach((key: string) => {
            if (key === "compression_level") {
              tooltip += `${key.replace("_", " ")}: ${item.config[key]}`;
            }
          });

          chartData.datasets[i].data.push({
            config: item.config,
            ratio: Math.floor(item.score * 100) / 100,
            compression_level: item.config.compression_level,
            tooltip: tooltip,
            compress: item2?.score,
            decompress: item3?.score,
          });
        } else {
          chartData.datasets[i].data.push(null);
        }
      });
    });

    chartData.labels = chartData.labels.map((label: any) => {
      return Math.floor(label * 100) / 100;
    });

    this.lineChartDataCompress = {
      labels: chartData.labels,
      datasets: chartData.datasets,
    };
    this.lineChartDataDecompress = {
      labels: chartData.labels,
      datasets: chartData.datasets,
    };

    (this.lineChartOptionsCompress as any).plugins.tooltip.callbacks.title =
      function (
        this: TooltipModel<"line">,
        tooltipItems: TooltipItem<"line">[],
      ) {
        return (
          tooltipItems[0].label + "% compression ratio (" + selectedName + ")"
        );
      };
    (this.lineChartOptionsDecompress as any).plugins.tooltip.callbacks.title =
      function (
        this: TooltipModel<"line">,
        tooltipItems: TooltipItem<"line">[],
      ) {
        return (
          tooltipItems[0].label + "% compression ratio (" + selectedName + ")"
        );
      };

    if (!this.compressDropdown) {
      this.dropdownManager
        .initDropdown("compress_method_button", "compress_method_options")
        .then((dropdown) => {
          this.compressDropdown = dropdown;
        });
    }
  }

  initializeBenchmarkCharts() {
    this.multiBarCharts.forEach((chartItem: any) => {
      chartItem.chart.chartOptions.plugins.tooltip.callbacks =
        chartItem.callbacks;
      this.initializeMultiBarChart(chartItem.chart);
    });
  }

  initializeMultiBarChart(chartTemplate: ChartFromBenchmarkTemplate) {
    chartTemplate.options.forEach(
      (option: ChartFromBenchmarkTemplateOptions) => {
        const benchmark = this.benchmarkMeta.find(
          (b: any) => b.benchmark_id === option.benchmark_id,
        );
        if (benchmark) {
          option.name = benchmark.name;
          option.unit = benchmark.unit;
          option.higher_is_better = benchmark.higher_is_better;
          option.icon = benchmark.higher_is_better
            ? "circle-arrow-up"
            : "circle-arrow-down";
          option.tooltip = benchmark.higher_is_better
            ? "Higher is better"
            : "Lower is better";
          option.title = " ";
          option.XLabel = benchmark.config_fields
            ? ((benchmark.config_fields as any)[option.scaleField] as string)
            : "";
          option.YLabel = benchmark.unit;
        }
      },
    );
  }

  selecSSLAlgorithm(algo: any) {
    this.selectedSSLAlgo = algo;
    this.generateSSLChart();
    this.dropdownSSL?.hide();
  }

  selectChartTemplateOption(template: any, option: number) {
    template.chart.selectedOption = option;
    this.generateMultiBarChart(template.chart);
    template.dropdown?.hide();
  }

  selectChartTemplateOption2(template: any, option: number) {
    template.chart.selectedSecondaryOption = option;
    this.generateMultiBarChart(template.chart);
    template.dropdown2?.hide();
  }

  selectCompressMethod(method: any) {
    this.selectedCompressMethod = method;
    this.generateCompressChart();
    this.compressDropdown?.hide();
  }

  selectBWMemOperation(operation: any) {
    this.selectedBWMemOperation = operation;
    this.dropdownBWmem?.hide();
    this.generateBWMemChart();
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

  toggleBenchmarkCategory(category: any) {
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

  initializeLLMModels() {
    const llmPromptData = this.benchmarkMeta?.find(
      (category: any) =>
        category.benchmark_id === "llm_speed:prompt_processing",
    );
    if (!llmPromptData) {
      console.warn("No LLM prompt processing benchmark data found");
      return;
    }

    let models: any[] = [];
    if (llmPromptData.configs) {
      models = [
        ...new Set(
          llmPromptData.configs
            .filter((config: any) => config.config?.model)
            .map((config: any) => config.config.model),
        ),
      ];
    }
    if (models.length === 0) {
      console.warn("No LLM models found in benchmark data");
      return;
    }

    // custom model order (by size)
    const modelOrder = [
      "SmolLM-135M.Q4_K_M.gguf",
      "qwen1_5-0_5b-chat-q4_k_m.gguf",
      "gemma-2b.Q4_K_M.gguf",
      "llama-7b.Q4_K_M.gguf",
      "phi-4-q4.gguf",
      "Llama-3.3-70B-Instruct-Q4_K_M.gguf",
    ];

    models.sort((a, b) => {
      const aStr = String(a);
      const bStr = String(b);
      const indexA = modelOrder.indexOf(aStr);
      const indexB = modelOrder.indexOf(bStr);
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // sort models alphabetically if not in our predefined list
      return aStr.localeCompare(bStr);
    });

    this.availableLLMModels = models.map((model) => ({
      // drop .gguf extension for display
      name: String(model).replace(".gguf", ""),
      value: model,
    }));

    if (this.availableLLMModels.length > 0) {
      this.selectedLLMModel = this.availableLLMModels[0];
    }
  }

  generateLLMCharts() {
    if (!this.selectedLLMModel) {
      console.warn("No LLM model selected or available.");
      this.barChartLLMPromptData = undefined;
      this.barChartLLMGenerationData = undefined;
      return;
    }

    this.barChartLLMPromptData = this.generateLLMBarChart(
      "llm_speed:prompt_processing",
    );
    this.barChartLLMGenerationData = this.generateLLMBarChart(
      "llm_speed:text_generation",
    );

    const promptTitle = "Prompt Processing";
    const generationTitle = "Text Generation";
    const promptXAxisTitle = "Prompt's length (tokens).";
    const generationXAxisTitle = "Requested text length (tokens).";

    this.barChartLLMPromptOptions = {
      ...this.barChartLLMPromptOptions,
      plugins: {
        ...this.barChartLLMPromptOptions?.plugins,
        title: { display: true, text: promptTitle, color: "#FFF" },
        tooltip: {
          ...this.barChartLLMPromptOptions?.plugins?.tooltip,
          callbacks: {
            ...this.barChartLLMPromptOptions?.plugins?.tooltip?.callbacks,
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
      },
      scales: {
        ...this.barChartLLMPromptOptions?.scales,
        y: {
          ...this.barChartLLMPromptOptions?.scales?.y,
          title: { display: true, text: "Tokens/second", color: "#FFF" },
        },
        x: {
          ...this.barChartLLMPromptOptions?.scales?.x,
          title: { display: true, text: promptXAxisTitle, color: "#FFF" },
        },
      },
      layout: {
        padding: {
          bottom: 20,
        },
      },
    };

    this.barChartLLMGenerationOptions = {
      ...this.barChartLLMGenerationOptions,
      plugins: {
        ...this.barChartLLMGenerationOptions?.plugins,
        title: { display: true, text: generationTitle, color: "#FFF" },
        tooltip: {
          ...this.barChartLLMGenerationOptions?.plugins?.tooltip,
          callbacks: {
            ...this.barChartLLMGenerationOptions?.plugins?.tooltip?.callbacks,
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
      },
      scales: {
        ...this.barChartLLMGenerationOptions?.scales,
        y: {
          ...this.barChartLLMGenerationOptions?.scales?.y,
          title: { display: true, text: "Tokens/second", color: "#FFF" },
        },
        x: {
          ...this.barChartLLMGenerationOptions?.scales?.x,
          title: { display: true, text: generationXAxisTitle, color: "#FFF" },
        },
      },
      layout: {
        padding: {
          bottom: 20,
        },
      },
    };
  }

  generateLLMBarChart(benchmarkId: string): ChartData<"bar"> | undefined {
    const selectedModelValue = this.selectedLLMModel.value;
    const scaleField = "tokens";

    const dataSet = this.benchmarkMeta?.find(
      (x: any) => x.benchmark_id === benchmarkId,
    );
    if (!dataSet || !dataSet.configs) {
      console.warn(`No benchmark metadata or configs found for ${benchmarkId}`);
      return undefined;
    }

    let scales: number[] = [];
    this.servers.forEach((server) => {
      server.benchmark_scores
        .filter(
          (score) =>
            score.benchmark_id === benchmarkId &&
            (score.config as any)?.model === selectedModelValue &&
            (score.config as any)?.[scaleField],
        ) // Cast to any and use optional chaining
        .forEach((score) => {
          const tokenValue = (score.config as any)?.[scaleField]; // Cast to any and use optional chaining
          if (tokenValue !== undefined && scales.indexOf(tokenValue) === -1) {
            // Check if tokenValue is defined
            scales.push(tokenValue);
          }
        });
    });
    if (scales.length === 0) {
      return undefined;
    }
    scales.sort((a, b) => a - b); // Sort token counts numerically

    let chartData: any = {
      labels: scales,
      datasets: this.servers.map((server: ServerPKs, index: number) => ({
        data: [],
        label: server.display_name,
        borderColor: radarDatasetColors[index % 8].borderColor,
        backgroundColor: radarDatasetColors[index % 8].borderColor,
      })),
    };

    this.servers.forEach((server: any, i: number) => {
      scales.forEach((tokenCount: number) => {
        const item = server.benchmark_scores.find(
          (b: any) =>
            b.benchmark_id === benchmarkId &&
            (b.config as any)?.model === selectedModelValue &&
            (b.config as any)?.[scaleField] === tokenCount,
        );
        chartData.datasets[i].data.push(item ? item.score : null);
      });
    });

    return { labels: chartData.labels, datasets: chartData.datasets };
  }

  refreshLLMCharts(model: any) {
    this.selectedLLMModel = model;
    this.generateLLMCharts();
    this.llmModelsDropdown?.hide();
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
