import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  viewChild,
  OnDestroy,
  DOCUMENT,
  computed,
  inject,
  signal,
} from "@angular/core";
import { ComparePageController } from "../shared/compare-page/compare-page.controller";
import { CompareGuide } from "../../components/compare-guide/compare-guide";
import { CompareToolbar } from "../../components/compare-toolbar/compare-toolbar";
import { ScrollbarMirror } from "../../components/scrollbar-mirror/scrollbar-mirror";
import {
  INITIAL_SCROLLBAR_MIRROR_STATE,
  ScrollbarMirrorState,
} from "../shared/compare-table/scrollbar-mirror.controller";
import { CompareStickyLayoutController } from "../shared/compare-table/compare-sticky-layout.controller";
import { KeeperAPI } from "../../services/keeper-api";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Breadcrumbs } from "../../components/breadcrumbs/breadcrumbs";
import { PageHeader } from "../../components/page-header/page-header";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SeoHandler } from "../../services/seo-handler";
import {
  ComparedServer,
  CompareSelection,
  ZoneAndRegion,
} from "../../services/compare-selection";
import { Analytics } from "../../services/analytics";
import { CurrencyOption, availableCurrencies } from "../../tools/shared_data";
import { ExtendedServerDetails } from "../server-details/server-details.types";
import { ServerCompareCharts } from "../../components/server-compare-charts/server-compare-charts";
import { EmbedWidgetButton } from "../../components/embed-dialog/embed-widget-button";
import { EmbedWidgetOption } from "../../components/embed-dialog/embed-dialog.types";
import { Allocation } from "../../../../sdk/data-contracts";
import { showInvalidUrlParamToast } from "../../services/page-toast.helpers";
import { Toast } from "../../services/toast";
import {
  INVALID_SERVER_COMPARE_URL_TOAST_ACTION_LABEL,
  INVALID_SERVER_COMPARE_URL_TOAST_BODY,
} from "../../services/url-toast-content";
import {
  BAD_SERVER_COMPARE_URL_TOAST_ID,
  SERVER_COMPARE_ERROR_TOAST_ID,
} from "../../services/toast-ids";
import { LoadingSpinner } from "../../components/loading-spinner/loading-spinner";
import { Subscription } from "rxjs";
import serverComparesData from "./server-compares.js";
import { ChartTooltip } from "../../components/charts/shared/chart-tooltip";
import {
  decodeBase64JsonUrlState,
  isServerCompareUrlState,
} from "../../tools/encoded-url-state";
import { isCompareBaselineServer } from "../../components/charts/shared/server-compare-table.utils";
import { getCompareMemoryChartOption } from "../../components/charts/shared/memory-chart.types";
import {
  SERVER_COMPARE_FIRST_COL_ID,
  SERVER_COMPARE_TABLE_HOLDER_ID,
  SERVER_COMPARE_TABLE_ID,
} from "./server-compare.constants";
import { type MemoryBenchmarkConfig } from "../../components/charts/memory/memory-chart.types";
import { CollectionSaveModal } from "../../components/modals/collections/collection-save-modal/collection-save-modal";
import { CompareTableBenchmarkMeta } from "./server-compare.types";
import {
  SERVER_COMPARE_EMBEDDABLE_WIDGETS,
  SERVER_COMPARE_GUIDE_DESCRIPTION,
  SERVER_COMPARE_GUIDE_TITLE,
  SERVER_COMPARE_KEYWORDS,
  SERVER_COMPARE_PARENT_BREADCRUMB,
  SERVER_COMPARISON_TITLE,
} from "./server-compare.constants";

function hasMeaningfulCompareTableValue(value: unknown): boolean {
  if (value === "-" || value == null || value === "") {
    return false;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric !== 0;
}

@Component({
  selector: "sc-server-compare",
  imports: [
    PageHeader,
    Breadcrumbs,
    CommonModule,
    FormsModule,
    RouterModule,
    ServerCompareCharts,
    EmbedWidgetButton,
    LoadingSpinner,
    CollectionSaveModal,
    CompareGuide,
    CompareToolbar,
    ScrollbarMirror,
  ],
  templateUrl: "./server-compare.html",
  styleUrl: "./server-compare.css",
})
export class ServerCompare implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);
  private keeperAPI = inject(KeeperAPI);
  private seoHandler = inject(SeoHandler);
  private serverCompare = inject(CompareSelection);
  private analytics = inject(Analytics);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(Toast);
  private destroyRef = inject(DestroyRef);
  private tooltipService = inject(ChartTooltip);
  saveComparisonModal = viewChild(CollectionSaveModal);
  readonly comparePage = new ComparePageController(
    {
      collectionTarget: "compare-servers",
      comparePath: "/servers/compare",
      parentBreadcrumb: {
        name: SERVER_COMPARE_PARENT_BREADCRUMB,
        url: "/servers",
      },
      guideTitle: SERVER_COMPARE_GUIDE_TITLE,
      guideDescription: SERVER_COMPARE_GUIDE_DESCRIPTION,
      comparisonTitle: SERVER_COMPARISON_TITLE,
      baselineIdParam: "baseline_server",
      keywords: SERVER_COMPARE_KEYWORDS,
      premadeComparisons: serverComparesData,
    },
    {
      instances: () => this.getCompareInstancesForSave(),
      instancesRaw: () => this.instancesRaw,
      baseline: () => this.selectedBaselineServer,
      currency: () => this.selectedCurrency,
      isLoading: () => this.isLoading,
      compareDataReady: () => this.compareDataReady,
      saveModal: () => this.saveComparisonModal(),
      onLoadFinished: () => {
        this.isLoading = false;
        this.stickyLayout.scheduleDeferredUpdate();
      },
    },
  );
  compareCharts = viewChild(ServerCompareCharts);

  @ViewChild("tableFirstCol") tableFirstCol!: ElementRef;
  @HostBinding("attr.ngSkipHydration") ngSkipHydration = "true";

  isLoading = true;

  servers: ExtendedServerDetails[] = [];

  zones: any[] = [];
  regions: any[] = [];

  instanceProperties: any[] = [];

  benchmarkMeta: any;

  @ViewChild("tooltipDefault") tooltip!: ElementRef;
  @ViewChild("tooltipGeekbench") tooltipGB!: ElementRef;
  tooltipContent = "";

  instancePropertyCategories: any[] = [
    { name: "Metadata", category: "meta", properties: [] },
    { name: "CPU", category: "cpu", properties: [] },
    { name: "Memory", category: "memory", properties: [] },
    { name: "Accelerators", category: "gpu", properties: [] },
    { name: "Storage", category: "storage", properties: [] },
    { name: "Network", category: "network", properties: [] },
  ];

  selectedCurrency: CurrencyOption = availableCurrencies[0];
  selectedBaselineServer: ExtendedServerDetails | null = null;

  private compareLoadId = 0;
  private compareDataReady = false;

  benchmarkCategories: any[] = [
    {
      name: "Memory Bandwidth",
      id: "bw_mem",
      benchmarks: [
        "bw_mem",
        "membench:bandwidth_read",
        "membench:bandwidth_write",
        "membench:bandwidth_copy",
        "membench:latency",
      ],
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
  private scrollbarMirrorComponent = viewChild(ScrollbarMirror);
  scrollbarMirrorBottomEl = computed(() =>
    this.scrollbarMirrorComponent()?.element(),
  );
  readonly isTableOutsideViewport = signal(false);
  readonly scrollbarMirror = signal<ScrollbarMirrorState>({
    ...INITIAL_SCROLLBAR_MIRROR_STATE,
  });
  readonly stickyFixedDivStyle = signal("");
  readonly stickyMainTableStyle = signal("");
  readonly stickyFirstColStyle = signal<{ width?: string }>({});
  readonly stickyColumnStyles = signal<string[]>([]);
  private stickyLayout = new CompareStickyLayoutController({
    document: this.document,
    isBrowser: () => this.isBrowser(),
    tableHolder: () => this.tableHolder,
    bottomMirror: this.scrollbarMirrorBottomEl,
    scrollbarMirror: this.scrollbarMirror,
    isTableOutsideViewport: this.isTableOutsideViewport,
    stickyStyles: {
      fixedDivStyle: this.stickyFixedDivStyle,
      mainTableStyle: this.stickyMainTableStyle,
      firstColStyle: this.stickyFirstColStyle,
      columnStyles: this.stickyColumnStyles,
    },
    ids: {
      tableId: SERVER_COMPARE_TABLE_ID,
      tableHolderId: SERVER_COMPARE_TABLE_HOLDER_ID,
      firstColId: SERVER_COMPARE_FIRST_COL_ID,
    },
    itemCount: () => this.servers.length,
  });

  instances: any[] = [];
  instancesRaw!: string;

  embeddableWidgets: EmbedWidgetOption[] = SERVER_COMPARE_EMBEDDABLE_WIDGETS;

  serverCompares: any[] = serverComparesData;

  showZoneIds = false;

  private subscription = new Subscription();

  ngOnInit() {
    this.seoHandler.updateTitleAndMetaTags(
      this.comparePage.title,
      this.comparePage.description,
      this.comparePage.keywords,
    );

    this.comparePage.watchRoute(() => this.setup());

    this.subscription.add(
      this.serverCompare.baselineChanged.subscribe((baseline) => {
        this.applyBaselineFromCompareService(baseline);
      }),
    );

    this.subscription.add(
      this.serverCompare.selectionChanged.subscribe((selection) => {
        this.applyCompareSelectionFromService(selection);
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    this.stickyLayout.destroy();
    this.toastService.removeToast(SERVER_COMPARE_ERROR_TOAST_ID);
    this.toastService.removeToast(BAD_SERVER_COMPARE_URL_TOAST_ID);
  }

  setup() {
    const loadId = ++this.compareLoadId;
    const id = this.route.snapshot.paramMap.get("id");
    const param = this.route.snapshot.queryParams["instances"];
    this.toastService.removeToast(SERVER_COMPARE_ERROR_TOAST_ID);

    this.instances = [];
    this.instancesRaw = "";
    this.servers = [];
    this.selectedBaselineServer = null;
    this.benchmarkMeta = [];
    this.compareDataReady = false;
    this.benchmarkCategories.forEach((category) => {
      category.data = [];
    });
    this.stickyLayout.reset();
    this.selectedCurrency = this.comparePage.currencyFromUrl();

    if (id || param) {
      this.isLoading = true;
      this.comparePage.breadcrumbs = this.comparePage.baseBreadcrumbs();
    }

    if (id) {
      const serverCompare = this.serverCompares.find((x: any) => x.id === id);
      if (serverCompare) {
        this.instances = serverCompare.instances;
        this.instancesRaw = btoa(JSON.stringify(this.instances));
        this.toastService.removeToast(BAD_SERVER_COMPARE_URL_TOAST_ID);
      } else {
        this.comparePage.applyGuideChrome();
        showInvalidUrlParamToast(this.toastService, this.platformId, {
          id: BAD_SERVER_COMPARE_URL_TOAST_ID,
          body: INVALID_SERVER_COMPARE_URL_TOAST_BODY,
          action: {
            label: INVALID_SERVER_COMPARE_URL_TOAST_ACTION_LABEL,
            onClick: () => this.router.navigate(["/servers"]),
          },
        });
        this.isLoading = false;
      }
    } else if (param) {
      const decodedInstances = decodeBase64JsonUrlState(
        param,
        isServerCompareUrlState,
      );

      if (!decodedInstances.value) {
        console.warn("Invalid instances data in URL:", decodedInstances.error);
        this.comparePage.applyGuideChrome();
        showInvalidUrlParamToast(this.toastService, this.platformId, {
          id: BAD_SERVER_COMPARE_URL_TOAST_ID,
          body: INVALID_SERVER_COMPARE_URL_TOAST_BODY,
          action: {
            label: INVALID_SERVER_COMPARE_URL_TOAST_ACTION_LABEL,
            onClick: () => this.router.navigate(["/servers"]),
          },
        });
        this.isLoading = false;
      } else {
        this.instances = decodedInstances.value;
        this.instancesRaw = this.instances.length > 0 ? param : "";
        this.toastService.removeToast(BAD_SERVER_COMPARE_URL_TOAST_ID);

        if (!this.instances?.length) {
          this.comparePage.applyGuideChrome();
          this.isLoading = false;
        }
      }
    } else {
      this.toastService.removeToast(BAD_SERVER_COMPARE_URL_TOAST_ID);
      this.comparePage.applyGuideChrome();
      this.isLoading = false;
    }

    if (this.instances?.length > 0) {
      this.isLoading = true;

      const loadInstances = this.instances.slice();
      const serverCount = loadInstances.length;

      let promises: Promise<any>[] = [
        this.keeperAPI.getServerMeta(),
        this.keeperAPI.getServerBenchmarkMeta(),
        this.keeperAPI.getVendors(),
        this.keeperAPI.getRegions(),
        this.keeperAPI.getZones(),
      ];
      loadInstances.forEach((instance: any) => {
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
          if (this.destroyRef.destroyed || loadId !== this.compareLoadId) {
            return;
          }

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
              loadInstances[i].zonesRegions || [];

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
            server.vendor_name = server.vendor?.name;

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
          }

          this.serverCompare.replaceServerCompareSelection(
            this.buildServerCompareSelectionFromLoaded(
              this.servers,
              loadInstances,
            ),
          );

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
                const rawScore = score?.score;
                config.values.push(
                  hasMeaningfulCompareTableValue(rawScore) ? rawScore : "-",
                );
              });
            });
          });

          this.benchmarkMeta = this.buildDisplayBenchmarkMeta(
            this.benchmarkMeta,
          );

          this.refreshBenchmarkCategoryData();
          this.toastService.removeToast(SERVER_COMPARE_ERROR_TOAST_ID);
        })
        .catch((err) => {
          if (this.destroyRef.destroyed || loadId !== this.compareLoadId) {
            return;
          }

          this.analytics.SentryException(err, {
            tags: { location: this.constructor.name, function: "compareInit" },
          });
          console.error(err);
          this.toastService.showHttpError(err, {
            id: SERVER_COMPARE_ERROR_TOAST_ID,
            title: "Failed to load server comparison",
          });
        })
        .finally(() => {
          if (this.destroyRef.destroyed || loadId !== this.compareLoadId) {
            return;
          }

          this.restoreBaselineFromUrl();
          const specialId = this.route.snapshot.paramMap.get("id");
          if (specialId && !this.comparePage.exactSavedComparison()) {
            this.comparePage.applyPremadeComparisonPageInfo(specialId);
          }
          this.compareDataReady = true;
          this.comparePage.finishLoadIfReady();
        });
    } else {
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.stickyLayout.init();
      this.adjustScrollForFragment();
    }
  }

  private adjustScrollForFragment() {
    const fragment = window.location.hash;
    if (fragment) {
      const interval = setInterval(() => {
        const element = this.document.querySelector(fragment);
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

  showTooltip(el: any, content?: string, autoHide = false) {
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

  showTooltipChart(el: any, type: string) {
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

  hideTooltip() {
    this.tooltipService.hide(this.tooltip?.nativeElement);
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  private buildDisplayBenchmarkMeta(
    benchmarkMeta: CompareTableBenchmarkMeta[],
  ): CompareTableBenchmarkMeta[] {
    return benchmarkMeta.flatMap((benchmark) =>
      this.buildDisplayBenchmarkEntries(benchmark),
    );
  }

  private buildDisplayBenchmarkEntries(
    benchmark: CompareTableBenchmarkMeta,
  ): CompareTableBenchmarkMeta[] {
    if (benchmark.benchmark_id === "bw_mem") {
      const splitBenchmarks = ["rd", "wr", "rdwr"].reduce<
        CompareTableBenchmarkMeta[]
      >((entries, legacyOperation) => {
        const option = getCompareMemoryChartOption(
          benchmark.benchmark_id,
          legacyOperation,
        );
        const configs = benchmark.configs.filter(
          (config) => config.config.operation === legacyOperation,
        );

        if (!option || !configs.length) {
          return entries;
        }

        entries.push({
          ...benchmark,
          benchmark_key: `${benchmark.benchmark_id}:${legacyOperation}`,
          configs: configs.map((config) => {
            const displayConfig: MemoryBenchmarkConfig = { ...config.config };
            delete displayConfig.operation;

            return {
              ...config,
              config: displayConfig,
            };
          }),
          legacyOperation,
          name: option.name,
        });

        return entries;
      }, []);

      if (splitBenchmarks.length) {
        return splitBenchmarks;
      }
    }

    const option = getCompareMemoryChartOption(benchmark.benchmark_id);

    return [
      {
        ...benchmark,
        benchmark_key: benchmark.benchmark_id,
        name: option?.name ?? benchmark.name,
      },
    ];
  }

  selectCurrency(currency: any) {
    this.selectedCurrency = currency;
    this.comparePage.syncUrlState();

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
  }

  isBaselineServer(server: ExtendedServerDetails): boolean {
    return isCompareBaselineServer(server, this.selectedBaselineServer);
  }

  selectBaselineServer(server: ExtendedServerDetails | null): void {
    this.selectedBaselineServer = server;
    this.syncBaselineToCompareService();
    this.comparePage.syncUrlState();
  }

  private restoreBaselineFromUrl(): void {
    const params = isPlatformBrowser(this.platformId)
      ? Object.fromEntries(new URLSearchParams(window.location.search))
      : this.route.snapshot.queryParams;
    const baselineVendor = params["baseline_vendor"];
    const baselineServerRef = params["baseline_server"];

    if (baselineVendor && baselineServerRef && this.servers.length) {
      this.selectedBaselineServer =
        this.servers.find(
          (server) =>
            server.vendor_id === baselineVendor &&
            server.api_reference === baselineServerRef,
        ) || null;
    } else {
      this.selectedBaselineServer = null;
    }

    this.syncBaselineToCompareService();
    this.comparePage.rememberUrlState();
  }

  private syncBaselineToCompareService(): void {
    if (!this.selectedBaselineServer) {
      this.serverCompare.setBaselineServer(null);
      return;
    }

    this.serverCompare.setBaselineServer({
      vendor: this.selectedBaselineServer.vendor_id,
      server: this.selectedBaselineServer.api_reference,
    });
  }

  private applyBaselineFromCompareService(
    baseline: { vendor: string; server: string } | null,
  ): void {
    const nextBaseline = baseline
      ? (this.servers.find(
          (server) =>
            server.vendor_id === baseline.vendor &&
            server.api_reference === baseline.server,
        ) ?? null)
      : null;

    const unchanged =
      (!nextBaseline && !this.selectedBaselineServer) ||
      (!!nextBaseline &&
        isCompareBaselineServer(nextBaseline, this.selectedBaselineServer));

    if (unchanged) {
      return;
    }

    this.selectedBaselineServer = nextBaseline;
    if (this.servers.length) {
      this.comparePage.syncUrlState();
    }
  }

  private applyCompareSelectionFromService(selection: ComparedServer[]): void {
    if (this.isLoading) {
      return;
    }

    if (!selection.length) {
      if (!this.servers.length && !this.instances.length) {
        return;
      }

      this.servers = [];
      this.instances = [];
      this.instancesRaw = "";
      this.benchmarkMeta = [];
      this.benchmarkCategories.forEach((category) => {
        category.data = [];
      });
      this.selectedBaselineServer = null;
      this.comparePage.syncSavedComparisonChrome();
      if (this.route.snapshot.paramMap.get("id")) {
        this.serverCompare.syncCompareRoute();
      } else {
        this.comparePage.syncUrlState();
      }
      return;
    }

    const nextServers: ExtendedServerDetails[] = [];
    const indexMap: number[] = [];

    for (const item of selection) {
      const oldIndex = this.servers.findIndex(
        (server) =>
          server.vendor_id === item.vendor &&
          server.api_reference === item.server,
      );

      if (oldIndex === -1) {
        this.serverCompare.syncCompareRoute();
        return;
      }

      indexMap.push(oldIndex);
      nextServers.push(this.servers[oldIndex]);
    }

    const orderUnchanged =
      indexMap.length === this.servers.length &&
      indexMap.every((oldIndex, index) => oldIndex === index);

    if (orderUnchanged) {
      return;
    }

    if (this.route.snapshot.paramMap.get("id")) {
      this.serverCompare.syncCompareRoute();
    }

    this.remapBenchmarkConfigValues(indexMap);
    this.refreshBenchmarkCategoryData();
    this.servers = nextServers;
    this.instances = selection.map((item) => ({
      display_name: item.display_name,
      vendor: item.vendor,
      server: item.server,
      zonesRegions: item.zonesRegions ? [...item.zonesRegions] : [],
    }));
    this.instancesRaw = btoa(JSON.stringify(this.instances));
    this.comparePage.syncSavedComparisonChrome();

    if (
      this.selectedBaselineServer &&
      !this.servers.some((server) =>
        isCompareBaselineServer(server, this.selectedBaselineServer),
      )
    ) {
      this.selectedBaselineServer = null;
    }

    if (!this.route.snapshot.paramMap.get("id")) {
      this.comparePage.syncUrlState();
    }
    this.onCompareTableLayoutChange();
  }

  private remapBenchmarkConfigValues(indexMap: number[]): void {
    this.benchmarkMeta?.forEach((benchmark: any) => {
      benchmark.configs?.forEach((config: { values?: unknown[] }) => {
        if (!Array.isArray(config.values) || !config.values.length) {
          return;
        }

        config.values = indexMap.map((oldIndex) => config.values?.[oldIndex]);
      });
    });
  }

  private refreshBenchmarkCategoryData(): void {
    this.benchmarkCategories.forEach((category) => {
      category.data = (
        (this.benchmarkMeta ?? []) as CompareTableBenchmarkMeta[]
      ).filter(
        (benchmark) =>
          !!category.benchmarks?.includes(benchmark.benchmark_id) &&
          !!benchmark.configs?.some(
            (config) =>
              !!config.values?.some((value) =>
                hasMeaningfulCompareTableValue(value),
              ),
          ),
      );
      category.data.forEach((benchmark: CompareTableBenchmarkMeta) => {
        if (!benchmark.name) {
          return;
        }
        benchmark.name = benchmark.name
          .replace(/PassMark: CPU (.*?) Test|PassMark: CPU (.*?)/, "$1$2")
          .replace(/PassMark: (.*?) Test|PassMark: (.*?)/, "$1$2");
      });
    });

    const stressNgData: CompareTableBenchmarkMeta[] =
      this.benchmarkCategories.find((category) => category.id === "stress_ng")
        ?.data ?? [];
    if (stressNgData.length > 0) {
      stressNgData[0].configs = stressNgData[0].configs.sort(
        (left, right) =>
          Number(left.config.cores ?? 0) - Number(right.config.cores ?? 0),
      );
    }

    const stressPctCategory = this.benchmarkCategories.find(
      (category) => category.id === "stress_ng_pct",
    );
    if (stressPctCategory) {
      stressPctCategory.data = stressNgData;
    }
  }

  private getCompareInstancesForSave(): ComparedServer[] {
    return this.instances.map((instance) => ({
      display_name: instance.display_name,
      vendor: instance.vendor,
      server: instance.server,
      zonesRegions: instance.zonesRegions ?? [],
    }));
  }

  private buildServerCompareSelectionFromLoaded(
    servers: ExtendedServerDetails[],
    loadInstances: Array<{
      vendor?: string;
      server?: string;
      zonesRegions?: ZoneAndRegion[];
    }>,
  ): ComparedServer[] {
    const selection: ComparedServer[] = [];

    for (let i = 0; i < servers.length; i++) {
      const server = servers[i];
      const zones = (loadInstances[i]?.zonesRegions ?? []).map((zone) => ({
        ...zone,
      }));
      const existing = selection.find(
        (item) =>
          item.vendor === server.vendor_id &&
          item.server === server.api_reference,
      );

      if (!existing) {
        selection.push({
          display_name: server.display_name,
          vendor: server.vendor_id,
          server: server.api_reference,
          zonesRegions: zones,
        });
        continue;
      }

      for (const zone of zones) {
        if (
          !existing.zonesRegions.some(
            (entry) => entry.region === zone.region && entry.zone === zone.zone,
          )
        ) {
          existing.zonesRegions.push(zone);
        }
      }
    }

    return selection;
  }

  onMirrorScroll(event: Event) {
    this.stickyLayout.syncFromMirror(event.target as HTMLElement);
  }

  onCompareTableLayoutChange(): void {
    this.stickyLayout.scheduleDeferredUpdate();
  }

  updateMirrorLayout(): void {
    this.stickyLayout.scheduleUpdate();
  }

  updateEmbeddableWidgets() {
    const compareCharts = this.compareCharts();
    this.embeddableWidgets = compareCharts
      ? SERVER_COMPARE_EMBEDDABLE_WIDGETS.filter((widget) =>
          compareCharts.hasEmbeddableWidget(widget.id),
        )
      : SERVER_COMPARE_EMBEDDABLE_WIDGETS;
  }
}
