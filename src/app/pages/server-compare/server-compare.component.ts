/* eslint-disable prefer-const */
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { LucideAngularModule } from "lucide-angular";
import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SeoHandlerService } from "../../services/seo-handler.service";
import {
  ServerCompareService,
  ZoneAndRegion,
} from "../../services/server-compare.service";
import { DropdownManagerService } from "../../services/dropdown-manager.service";
import { AnalyticsService } from "../../services/analytics.service";
import { CurrencyOption, availableCurrencies } from "../../tools/shared_data";
import { ExtendedServerDetails } from "../server-details/server-details.component";
import { ServerCompareChartsComponent } from "../../components/server-compare-charts/server-compare-charts.component";
import { EmbedComparePreviewComponent } from "../embed-compare-preview/embed-compare-preview.component";
import { Modal, ModalOptions } from "flowbite";
import { Allocation } from "../../../../sdk/data-contracts";
import { ToastService } from "../../services/toast.service";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { PrismService } from "../../services/prism.service";
import { Subscription } from "rxjs";

const optionsModal: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

@Component({
  selector: "app-server-compare",
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    LucideAngularModule,
    CommonModule,
    FormsModule,
    RouterModule,
    ServerCompareChartsComponent,
    EmbedComparePreviewComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: "./server-compare.component.html",
  styleUrl: "./server-compare.component.scss",
})
export class ServerCompareComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild("tableFirstCol") tableFirstCol!: ElementRef;
  @HostBinding("attr.ngSkipHydration") ngSkipHydration = "true";
  @ViewChild("comparesDiv") comparesDiv!: ElementRef;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: "Compare Servers", url: "/compare" },
  ];

  isLoading = true;

  servers: ExtendedServerDetails[] = [];

  zones: any[] = [];
  regions: any[] = [];

  fields: any[] = [
    { name: "Vendor", key: "vendor" },
    { name: "Processor", key: "processor" },
    { name: "Memory", key: "memory" },
    { name: "Storage", key: "storage" },
    { name: "GPU", key: "gpu" },
    { name: "GPU Memory", key: "gpu_memory" },
  ];

  clipboardIcon = "clipboard";

  instanceProperties: any[] = [];

  benchmarkMeta: any;

  @ViewChild("tooltipDefault") tooltip!: ElementRef;
  @ViewChild("tooltipGeekbench") tooltipGB!: ElementRef;
  tooltipContent = "";

  instancePropertyCategories: any[] = [
    { name: "CPU", category: "cpu", properties: [] },
    { name: "Memory", category: "memory", properties: [] },
    { name: "GPU", category: "gpu", properties: [] },
    { name: "Storage", category: "storage", properties: [] },
    { name: "Network", category: "network", properties: [] },
  ];

  dropdownCurrency: any;
  availableCurrencies: CurrencyOption[] = availableCurrencies;
  selectedCurrency = this.availableCurrencies[0];

  benchmarkCategories: any[] = [
    {
      name: "Memory Bandwidth",
      id: "bw_mem",
      benchmarks: ["bw_mem"],
      data: [],
      show_more: false,
    },
    {
      name: "Compression",
      id: "compress",
      benchmarks: [
        "compression_text:ratio",
        "compression_text:decompress",
        "compression_text:compress",
      ],
      data: [],
      show_more: false,
    },
    {
      name: "OpenSSL",
      id: "openssl",
      benchmarks: ["openssl"],
      data: [],
      show_more: false,
    },
    {
      name: "Geekbench",
      id: "geekbench",
      benchmarks: [
        "geekbench:text_processing",
        "geekbench:structure_from_motion",
        "geekbench:score",
        "geekbench:ray_tracer",
        "geekbench:photo_library",
        "geekbench:photo_filter",
        "geekbench:pdf_renderer",
        "geekbench:object_remover",
        "geekbench:object_detection",
        "geekbench:navigation",
        "geekbench:html5_browser",
        "geekbench:horizon_detection",
        "geekbench:hdr",
        "geekbench:file_compression",
        "geekbench:clang",
        "geekbench:background_blur",
        "geekbench:asset_compression",
      ],
      data: [],
      show_more: false,
      hidden: false,
    },
    {
      name: "PassMark (CPU)",
      id: "passmark_cpu",
      benchmarks: [
        "passmark:cpu_compression_test",
        "passmark:cpu_encryption_test",
        "passmark:cpu_extended_instructions_test",
        "passmark:cpu_floating_point_maths_test",
        "passmark:cpu_integer_maths_test",
        "passmark:cpu_mark",
        "passmark:cpu_physics_test",
        "passmark:cpu_prime_numbers_test",
        "passmark:cpu_single_threaded_test",
        "passmark:cpu_string_sorting_test",
      ],
      data: [],
      show_more: false,
      hidden: false,
    },
    {
      name: "PassMark (Memory)",
      id: "passmark_other",
      benchmarks: [
        "passmark:database_operations",
        "passmark:memory_latency",
        "passmark:memory_mark",
        "passmark:memory_read_cached",
        "passmark:memory_read_uncached",
        "passmark:memory_write",
      ],
      data: [],
      show_more: false,
      hidden: false,
    },
    {
      name: "Stress-ng div16 Raw Scores per vCPU",
      id: "stress_ng",
      benchmarks: ["stress_ng:div16"],
      data: [],
      show_more: false,
      hidden: false,
    },
    {
      name: "Stress-ng Relative Multicore Performance per vCPU",
      id: "stress_ng_pct",
      benchmarks: ["stress_ng:div16"],
      data: [],
      order: 2,
      show_more: false,
      icon: "circle-arrow-up",
      tooltip: "Higher is better.",
    },
    {
      id: "llm_inference",
      name: "LLM Inference Speed",
      benchmarks: ["llm_speed:prompt_processing", "llm_speed:text_generation"],
      description:
        "Compares the speed of LLM (Large Language Model) inference across servers for both prompt processing and text generation tasks.",
      data: [],
      order: 3,
      show_more: false,
      icon: "circle-arrow-up",
      tooltip: "Higher is better.",
    },
  ];

  @ViewChild("tableHolder") tableHolder!: ElementRef;
  isTableOutsideViewport = false;

  title = "Server Compare Guide";
  description =
    "Compare cloud servers characteristics, such as CPU, GPU, memory and storage details, and the performance of the instances by various benchmarking workloads to find the optimal compute resource for your needs.";
  keywords =
    "compare, servers, server, hosting, cloud, vps, dedicated, comparison";

  instances: any[] = [];
  instancesRaw!: string;

  embeddableCharts = [
    { id: "bw_mem", name: "Memory Bandwidth" },
    { id: "compress", name: "Compression" },
    { id: "geekbench", name: "Geekbench Single- and Multi-core" },
    { id: "geekbench_single", name: "Geekbench Single-core" },
    { id: "geekbench_multi", name: "Geekbench Multi-core" },
    { id: "openssl", name: "OpenSSL" },
    { id: "stress_ng", name: "Stress-ng div16" },
    { id: "stress_ng_pct", name: "Stress-ng Relative" },
    { id: "llm_inference", name: "LLM Inference" },
    { id: "static_web", name: "Static Web Server" },
    { id: "redis", name: "Redis" },
  ];

  modalEmbed: any;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  specialCompares: any[] = require("./special-compares");

  showZoneIds = false;

  private subscription = new Subscription();
  private checkExistInterval: any;

  constructor(
    private prismService: PrismService,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private keeperAPI: KeeperAPIService,
    private seoHandler: SeoHandlerService,
    private serverCompare: ServerCompareService,
    private dropdownManager: DropdownManagerService,
    private analytics: AnalyticsService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");

    if (id) {
      const specialCompare = this.specialCompares.find((x: any) => x.id === id);
      if (specialCompare) {
        this.title = specialCompare.title;
        this.description = specialCompare.description;
        this.breadcrumbs.push({
          name: specialCompare.title,
          url: `/compare/${specialCompare.id}`,
        });
      }
    }

    this.seoHandler.updateTitleAndMetaTags(
      this.title,
      this.description,
      this.keywords,
    );

    this.subscription.add(
      this.route.queryParams.subscribe(() => {
        this.setup();
      }),
    );

    this.subscription.add(
      this.route.params.subscribe(() => {
        this.setup();
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    if (this.checkExistInterval) {
      clearInterval(this.checkExistInterval);
    }
  }

  setup() {
    const id = this.route.snapshot.paramMap.get("id");
    const param = this.route.snapshot.queryParams["instances"];

    this.instances = [];

    if (id) {
      const specialCompare = this.specialCompares.find((x: any) => x.id === id);
      if (specialCompare) {
        this.instances = specialCompare.instances;
        this.instancesRaw = btoa(JSON.stringify(this.instances));
        let breadcrumb = {
          name: specialCompare.title,
          url: `/compare/${specialCompare.id}`,
        };
        if (this.breadcrumbs.length < 3) {
          this.breadcrumbs.push(breadcrumb);
        } else {
          this.breadcrumbs[2] = breadcrumb;
        }
      }
    } else if (param) {
      this.instancesRaw = param;
      this.instances = JSON.parse(atob(this.instancesRaw));

      if (this.instances?.length) {
        let breadcrumb = {
          name: `Compare (${this.instances?.length})`,
          url: `/compare`,
          queryParams: { instances: param },
        };
        if (this.breadcrumbs.length < 3) {
          this.breadcrumbs.push(breadcrumb);
        } else {
          this.breadcrumbs[2] = breadcrumb;
        }
      }
    } else {
      if (this.breadcrumbs.length > 2) {
        this.breadcrumbs.pop();
      }
    }

    if (this.instances?.length > 0) {
      this.isLoading = true;

      let serverCount = this.instances?.length || 0;

      let promises: Promise<any>[] = [
        this.keeperAPI.getServerMeta(),
        this.keeperAPI.getServerBenchmarkMeta(),
        this.keeperAPI.getVendors(),
        this.keeperAPI.getRegions(),
        this.keeperAPI.getZones(),
      ];
      this.instances?.forEach((instance: any) => {
        promises.push(
          this.keeperAPI.getServerV2(instance.vendor, instance.server),
        );
        promises.push(
          this.keeperAPI.getServerPrices(
            instance.vendor,
            instance.server,
            this.selectedCurrency.slug,
          ),
        );
        promises.push(
          this.keeperAPI.getServerBenchmark(instance.vendor, instance.server),
        );
      });
      Promise.all(promises)
        .then((data) => {
          const promiseAllData = data.map((x: any) => x.body);
          const [meta, benchmarkMeta, vendors, regions, zones, ...servers] =
            promiseAllData;

          this.zones = zones;
          this.regions = regions;

          this.instanceProperties = meta.fields;

          this.instancePropertyCategories.forEach((c) => {
            c.properties = [];
          });

          this.servers = [];
          this.serverCompare.clearCompare();

          for (let i = 0; i < serverCount; i++) {
            let server: ExtendedServerDetails = servers[i * 3];
            const selectedZones: ZoneAndRegion[] =
              this.instances[i].zonesRegions || [];

            if (selectedZones.length) {
              this.showZoneIds = true;
            }

            server.benchmark_scores = servers[i * 3 + 2];
            server.prices = servers[i * 3 + 1]?.sort(
              (a: any, b: any) => a.price - b.price,
            );

            server.vendor = vendors.find(
              (v: any) => v.vendor_id === server.vendor_id,
            );

            if (server.prices?.length > 0) {
              server.prices.forEach((price: any) => {
                price.region = regions.find(
                  (r: any) =>
                    r.vendor_id === price.vendor_id &&
                    r.region_id === price.region_id,
                );
                price.zone = zones.find(
                  (z: any) =>
                    z.vendor_id === price.vendor_id &&
                    z.region_id === price.region_id &&
                    z.zone_id === price.zone_id,
                );
              });

              server.bestOndemandPrice = server.prices
                .filter((x) => x.allocation === Allocation.Ondemand)
                .sort((a, b) => a.price - b.price)
                .at(0);
              server.bestSpotPrice = server.prices
                .filter((x) => x.allocation === Allocation.Spot)
                .sort((a, b) => a.price - b.price)
                .at(0);

              if (selectedZones.length) {
                server.additionalOndemandPrices = server.prices
                  .filter(
                    (x) =>
                      x.allocation === Allocation.Ondemand &&
                      selectedZones.findIndex(
                        (z: any) =>
                          z.region === x.region_id && z.zone === x.zone_id,
                      ) > -1,
                  )
                  .sort((a, b) => a.price - b.price);
                server.additionalSpotPrices = server.prices
                  .filter(
                    (x) =>
                      x.allocation === Allocation.Spot &&
                      selectedZones.findIndex(
                        (z: any) =>
                          z.region === x.region_id && z.zone === x.zone_id,
                      ) > -1,
                  )
                  .sort((a, b) => a.price - b.price);
              }
            }

            server.score = server.benchmark_scores?.find(
              (b: any) => b.benchmark_id === "stress_ng:bestn",
            )?.score;
            server.price = server.prices?.length ? server.prices[0].price : 0;
            server.score_per_price =
              server.price && server.score
                ? server.score / server.price
                : server.score || 0;

            this.servers.push(server);
            if (selectedZones.length) {
              selectedZones.forEach((zone: any) => {
                this.serverCompare.toggleCompare(true, {
                  server: server.api_reference,
                  vendor: server.vendor_id,
                  display_name: server.display_name,
                  zoneRegion: zone,
                });
              });
            } else {
              this.serverCompare.toggleCompare(true, {
                server: server.api_reference,
                vendor: server.vendor_id,
                display_name: server.display_name,
              });
            }
          }

          this.instanceProperties.forEach((p: any) => {
            const group = this.instancePropertyCategories.find(
              (g) => g.category === p.category,
            );
            const hasValue = this.servers.some(
              (s: any) =>
                s[p.id] !== undefined &&
                s[p.id] !== null &&
                s[p.id] !== "" &&
                !Array.isArray(s[p.id]),
            );

            if (group && hasValue) {
              group.properties.push(p);
            }
          });

          this.benchmarkMeta = benchmarkMeta
            ?.filter((benchmark: any) => {
              let found = false;
              this.servers.forEach((s: any) => {
                if (
                  s.benchmark_scores?.find(
                    (score: any) =>
                      score.benchmark_id === benchmark.benchmark_id,
                  )
                ) {
                  found = true;
                }
              });
              return found;
            })
            .map((b: any) => {
              return {
                ...b,
                collapsed: true,
                configs: [],
              };
            });

          this.benchmarkMeta.forEach((benchmark: any) => {
            this.servers.forEach((server: any) => {
              const scores = server.benchmark_scores?.filter(
                (s: any) => s.benchmark_id === benchmark.benchmark_id,
              );
              if (scores) {
                scores.forEach((score: any) => {
                  const config = benchmark.configs.find((c: any) => {
                    return (
                      JSON.stringify(c.config) === JSON.stringify(score.config)
                    );
                  });
                  if (!config) {
                    benchmark.configs.push({
                      config: score.config,
                      values: [],
                    });
                  }
                });
              }
            });
          });

          this.benchmarkMeta.forEach((benchmark: any) => {
            benchmark.configs.forEach((config: any) => {
              this.servers.forEach((server: any) => {
                const score = server.benchmark_scores?.find(
                  (s: any) =>
                    s.benchmark_id === benchmark.benchmark_id &&
                    JSON.stringify(s.config) === JSON.stringify(config.config),
                );
                config.values.push(
                  score ? Math.floor(score.score * 100) / 100 : "-",
                );
              });
            });
          });

          this.benchmarkCategories.forEach((category) => {
            category.data = this.benchmarkMeta.filter((b: any) =>
              category.benchmarks.includes(b.benchmark_id),
            );
            category.data?.forEach((d: any) => {
              d.name = d.name
                .replace(/PassMark: CPU (.*?) Test|PassMark: CPU (.*?)/, "$1$2")
                .replace(/PassMark: (.*?) Test|PassMark: (.*?)/, "$1$2");
            });
          });

          // sort the stress_ng and stress_ng_pct by config.cores
          let ngData: any[] = this.benchmarkCategories.find(
            (c) => c.id === "stress_ng",
          ).data;
          if (ngData?.length > 0) {
            ngData[0].configs = ngData[0].configs.sort((a: any, b: any) => {
              return a.config.cores - b.config.cores;
            });
          }

          this.benchmarkCategories.find((c) => c.id === "stress_ng_pct").data =
            ngData;

          if (isPlatformBrowser(this.platformId)) {
            this.dropdownManager
              .initDropdown("currency_button", "currency_options")
              .then((dropdown) => {
                this.dropdownCurrency = dropdown;
              });

            const targetElModal = document.getElementById(
              "embed-compare-modal",
            );

            this.modalEmbed = new Modal(targetElModal, optionsModal, {
              id: "embed-compare-modal",
              override: true,
            });
          }
        })
        .catch((err) => {
          this.analytics.SentryException(err, {
            tags: { location: this.constructor.name, function: "compareInit" },
          });
          console.error(err);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }

    if (isPlatformBrowser(this.platformId)) {
      this.checkExistInterval = setInterval(() => {
        if (this.comparesDiv) {
          this.prismService.highlightAll();
          clearInterval(this.checkExistInterval);
        }
      }, 100);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener("scroll", () => {
        // replace this with document getelementbyId()
        //const rect = this.mainTable?.nativeElement.getBoundingClientRect();
        const rect: any = document
          .getElementById("main-table")
          ?.getBoundingClientRect();
        if (rect?.top < 70) {
          this.isTableOutsideViewport = true;
        } else {
          this.isTableOutsideViewport = false;
        }
      });

      this.adjustScrollForFragment();
    }
  }

  private adjustScrollForFragment() {
    const fragment = window.location.hash;
    if (fragment) {
      const interval = setInterval(() => {
        const element = document.querySelector(fragment);
        if (element) {
          const headerOffset = 6.75 * 16;
          const elementPosition =
            element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
          clearInterval(interval);
        }
      }, 50);
    }
  }

  toUpper(text: string) {
    return text?.toUpperCase();
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

  showTooltip(el: any, content?: string, autoHide = false) {
    const tooltip = this.tooltip.nativeElement;
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5 + scrollPosition}px`;
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
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      tooltip.style.left = `${el.target.getBoundingClientRect().right + 5}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().top - 45 + scrollPosition}px`;
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

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  selectCurrency(currency: any) {
    this.selectedCurrency = currency;

    let promises: Promise<any>[] = [];
    this.servers?.forEach((instance: any) => {
      promises.push(
        this.keeperAPI.getServerPrices(
          instance.vendor_id,
          instance.server_id,
          this.selectedCurrency.slug,
        ),
      );
    });

    Promise.all(promises).then((data) => {
      for (let i = 0; i < data.length; i++) {
        let server = this.servers[i];
        server.prices = data[i].body;
        if (server.prices?.length > 0) {
          server.prices.forEach((price: any) => {
            price.region = this.regions.find(
              (r: any) =>
                r.vendor_id === price.vendor_id &&
                r.region_id === price.region_id,
            );
            price.zone = this.zones.find(
              (z: any) =>
                z.vendor_id === price.vendor_id &&
                z.region_id === price.region_id &&
                z.zone_id === price.zone_id,
            );
          });
          server.bestOndemandPrice = server.prices
            .filter((x) => x.allocation === Allocation.Ondemand)
            .sort((a, b) => a.price - b.price)
            .at(0);
          server.bestSpotPrice = server.prices
            .filter((x) => x.allocation === Allocation.Spot)
            .sort((a, b) => a.price - b.price)
            .at(0);
        }

        server.price = server.prices?.length ? server.prices[0].price : 0;
        server.score_per_price =
          server.price && server.score
            ? server.score / server.price
            : server.score || 0;
      }
    });

    this.dropdownCurrency?.hide();
  }

  getStyle(index: number) {
    // lookup the width of the corresponding column in the main table
    const mainTable = document.getElementById("main-table");
    if (mainTable) {
      const headerCells = mainTable.querySelectorAll("thead th");
      // 1st cell (index 0) is the label column, so add 1 to get the correct col
      if (headerCells && headerCells[index + 1]) {
        const width = headerCells[index + 1].getBoundingClientRect().width;
        return `width: ${width}px; min-width: ${width}px; max-width: ${width}px;`;
      }
    }
    // fallback to approximate calculation
    return `width: ${100 / (this.servers.length + 1)}%; max-width: ${100 / (this.servers.length + 1)}%;`;
  }

  getMainTableWidth() {
    const thead = document?.querySelector("#main-table thead");
    const rect = document.getElementById("main-table")?.getBoundingClientRect();
    const rect2 = this.tableHolder?.nativeElement.getBoundingClientRect();
    const posLeft = rect && rect2 ? rect.x - rect2.x : 0;
    return `width: ${thead?.clientWidth}px; left: ${posLeft}px`;
  }

  getFixedDivStyle() {
    const div = document?.getElementById("table_holder");
    return `width: ${div?.clientWidth}px; overflow: hidden;`;
  }

  getStickyHeaderFirstColStyle() {
    if (this.tableFirstCol && this.tableFirstCol.nativeElement) {
      const width = this.tableFirstCol.nativeElement.offsetWidth;
      return { width: `${width}px` };
    }
    return {};
  }

  openModal() {
    this.modalEmbed?.show();
  }

  closeModal() {
    this.modalEmbed?.hide();
  }
}
