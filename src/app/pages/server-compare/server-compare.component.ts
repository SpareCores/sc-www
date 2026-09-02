import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  viewChild,
  OnDestroy,
  DOCUMENT,
  effect,
  inject,
  signal,
} from "@angular/core";
import {
  INITIAL_SCROLLBAR_MIRROR_STATE,
  ScrollbarMirrorController,
  ScrollbarMirrorState,
} from "../shared/compare-table/scrollbar-mirror.controller";
import { CompareStickyLayoutController } from "../shared/compare-table/compare-sticky-layout.controller";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import { Button } from "../../components/button/button";
import { PageHeader } from "../../components/page-header/page-header";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SeoHandlerService } from "../../services/seo-handler.service";
import {
  ServerCompare,
  ServerCompareService,
  ZoneAndRegion,
} from "../../services/server-compare.service";
import { FlowbiteDropdownDirective } from "../../directives/flowbite-dropdown.directive";
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
import serverComparesData from "./server-compares.js";
import { ChartTooltipService } from "../../components/charts/shared/chart-tooltip.service";
import {
  decodeBase64JsonUrlState,
  isServerCompareUrlState,
} from "../../tools/encoded-url-state";
import { encodeQueryParams } from "../../tools/queryParamFunctions";
import { isCompareBaselineServer } from "../../components/charts/shared/server-compare-table.utils";
import {
  getCompareMemoryChartOption,
  type CompareMemoryChartOption,
} from "../../components/charts/shared/memory-chart.types";
import {
  SERVER_COMPARE_FIRST_COL_ID,
  SERVER_COMPARE_TABLE_HOLDER_ID,
  SERVER_COMPARE_TABLE_ID,
} from "./server-compare.constants";
import { pushBrowserQueryState } from "./compare-url-state.utils";
import {
  type MemoryBenchmarkConfig,
  type MemoryBenchmarkMeta,
} from "../../components/charts/memory/memory-chart.types";
import { CompareCollectionsService } from "../../collections/compare-collections.service";
import { CollectionSaveModalComponent } from "../../components/collections/collection-save-modal/collection-save-modal.component";
import { Auth } from "../../services/auth/auth";
import { SAVED_ITEM_FALLBACK_NOTE } from "../../collections/collections.utils";

const optionsModal: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

const INVALID_COMPARE_URL_TOAST_ID = "bad-compare-url-param";
const INVALID_URL_TOAST_TITLE = "Invalid URL";
const INVALID_COMPARE_URL_TOAST_BODY =
  'Visit the <a href="/servers" class="underline font-semibold">Server Navigator page</a> to select servers to compare.';
const SERVER_COMPARE_GUIDE_TITLE = "Server Compare Guide";
const SERVER_COMPARISON_TITLE = "Server Comparison";
const SERVER_COMPARE_BREADCRUMB = "Compare";
const SERVER_COMPARE_PARENT_BREADCRUMB = "Servers";
const SERVER_CUSTOM_COMPARISON_BREADCRUMB = "Custom Comparison";
const SERVER_COMPARE_GUIDE_DESCRIPTION =
  "Compare cloud servers characteristics, such as CPU, GPU, memory and storage details, and the performance of the instances by various benchmarking workloads to find the optimal compute resource for your needs.";

type CompareTableBenchmarkConfig = {
  config: MemoryBenchmarkConfig;
  values: Array<number | "-">;
};

type CompareTableBenchmarkMeta = Omit<
  MemoryBenchmarkMeta,
  "configs" | "name"
> & {
  name: string;
  collapsed: boolean;
  configs: CompareTableBenchmarkConfig[];
  benchmark_key?: string;
  legacyOperation?: CompareMemoryChartOption["legacyOperation"];
};

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
    Button,
    PageHeader,
    BreadcrumbsComponent,
    CommonModule,
    FormsModule,
    RouterModule,
    ServerCompareChartsComponent,
    EmbedComparePreviewComponent,
    LoadingSpinnerComponent,
    FlowbiteDropdownDirective,
    CollectionSaveModalComponent,
  ],
  templateUrl: "./server-compare.component.html",
  styleUrl: "./server-compare.component.scss",
})
export class ServerCompareComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private prismService = inject(PrismService);
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);
  private keeperAPI = inject(KeeperAPIService);
  private seoHandler = inject(SeoHandlerService);
  private serverCompare = inject(ServerCompareService);
  currencyDropdown = viewChild<FlowbiteDropdownDirective>("currencyDropdown");
  baselineDropdown = viewChild<FlowbiteDropdownDirective>("baselineDropdown");
  private analytics = inject(AnalyticsService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private tooltipService = inject(ChartTooltipService);
  private compareCollections = inject(CompareCollectionsService);
  private auth = inject(Auth);
  saveComparisonModal = viewChild(CollectionSaveModalComponent);

  @ViewChild("tableFirstCol") tableFirstCol!: ElementRef;
  @HostBinding("attr.ngSkipHydration") ngSkipHydration = "true";
  @ViewChild("comparesDiv") comparesDiv!: ElementRef;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: "Home", url: "/" },
    { name: SERVER_COMPARE_PARENT_BREADCRUMB, url: "/servers" },
    { name: SERVER_COMPARE_BREADCRUMB, url: "/servers/compare" },
  ];

  isLoading = false;

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
    { name: "Metadata", category: "meta", properties: [] },
    { name: "CPU", category: "cpu", properties: [] },
    { name: "Memory", category: "memory", properties: [] },
    { name: "GPU", category: "gpu", properties: [] },
    { name: "Storage", category: "storage", properties: [] },
    { name: "Network", category: "network", properties: [] },
  ];

  availableCurrencies: CurrencyOption[] = availableCurrencies;
  selectedCurrency = this.availableCurrencies[0];
  selectedBaselineServer: ExtendedServerDetails | null = null;

  private lastEncodedCompareQuery: string | null = null;
  private compareLoadId = 0;

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
  scrollbarMirrorBottomEl = viewChild<ElementRef>("scrollbarMirrorBottomRef");
  readonly scrollbarMirrorController = ScrollbarMirrorController;
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

  title = SERVER_COMPARE_GUIDE_TITLE;
  description = SERVER_COMPARE_GUIDE_DESCRIPTION;
  showSavedStar = false;
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
    { id: "pgbench", name: "PostgreSQL heavy read-only throughput" },
  ];

  modalEmbed: any;

  serverCompares: any[] = serverComparesData;

  showZoneIds = false;

  private subscription = new Subscription();
  private checkExistInterval: ReturnType<typeof setInterval> | null = null;
  private readonly pendingSaveComparisonClose = signal(false);
  private readonly editingComparisonId = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.compareCollections.store.savedComparisons();
      this.syncSavedComparisonChrome();
    });

    effect(() => {
      if (!this.pendingSaveComparisonClose()) {
        return;
      }

      this.compareCollections.store.savedComparisons();
      const editingId = this.editingComparisonId();
      const saved = this.activeSavedComparison();
      const id =
        editingId ??
        this.compareCollections.buildComparisonId(
          this.getCompareInstancesForSave(),
        );
      const saving = this.compareCollections.isSavingComparison(id);
      const updating = editingId
        ? this.compareCollections.isUpdatingComparison(editingId)
        : saved
          ? this.compareCollections.isUpdatingComparison(saved.id)
          : false;

      if (saving || updating) {
        return;
      }

      this.pendingSaveComparisonClose.set(false);
      if (editingId || saved) {
        this.saveComparisonModal()?.close();
      }
    });
  }

  ngOnInit() {
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

    if (this.checkExistInterval !== null) {
      clearInterval(this.checkExistInterval);
      this.checkExistInterval = null;
    }

    this.stickyLayout.destroy();
  }

  setup() {
    const loadId = ++this.compareLoadId;
    const id = this.route.snapshot.paramMap.get("id");
    const param = this.route.snapshot.queryParams["instances"];

    this.instances = [];
    this.instancesRaw = "";
    this.stickyLayout.reset();

    if (id) {
      const serverCompare = this.serverCompares.find((x: any) => x.id === id);
      if (serverCompare) {
        this.instances = serverCompare.instances;
        this.instancesRaw = btoa(JSON.stringify(this.instances));
        this.toastService.removeToast(INVALID_COMPARE_URL_TOAST_ID);
        this.applyComparisonChrome(
          serverCompare.title,
          serverCompare.description,
        );
        this.setPremadeCompareBreadcrumb(serverCompare.title, serverCompare.id);
      } else {
        this.toastService.removeToast(INVALID_COMPARE_URL_TOAST_ID);
        this.applyGuideChrome();
      }
    } else if (param) {
      const decodedInstances = decodeBase64JsonUrlState(
        param,
        isServerCompareUrlState,
      );

      if (!decodedInstances.value) {
        console.warn("Invalid instances data in URL:", decodedInstances.error);
        this.applyGuideChrome();
        if (isPlatformBrowser(this.platformId)) {
          this.toastService.show({
            title: INVALID_URL_TOAST_TITLE,
            body: INVALID_COMPARE_URL_TOAST_BODY,
            type: "error",
            id: INVALID_COMPARE_URL_TOAST_ID,
          });
        }
        this.isLoading = false;
        return;
      }

      this.instances = decodedInstances.value;
      this.instancesRaw = this.instances.length > 0 ? param : "";
      this.toastService.removeToast(INVALID_COMPARE_URL_TOAST_ID);

      if (this.instances?.length) {
        this.syncSavedComparisonChrome();
      } else {
        this.applyGuideChrome();
      }
    } else {
      this.toastService.removeToast(INVALID_COMPARE_URL_TOAST_ID);
      this.applyGuideChrome();
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
          if (loadId !== this.compareLoadId) {
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

          if (isPlatformBrowser(this.platformId)) {
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
          if (loadId !== this.compareLoadId) {
            return;
          }

          this.analytics.SentryException(err, {
            tags: { location: this.constructor.name, function: "compareInit" },
          });
          console.error(err);
        })
        .finally(() => {
          if (loadId !== this.compareLoadId) {
            return;
          }

          this.isLoading = false;
          this.restoreBaselineFromUrl();
          this.stickyLayout.scheduleDeferredUpdate();
        });
    } else {
      this.isLoading = false;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.checkExistInterval = setInterval(() => {
        if (this.comparesDiv) {
          this.prismService.highlightAll();
          if (this.checkExistInterval !== null) {
            clearInterval(this.checkExistInterval);
            this.checkExistInterval = null;
          }
        }
      }, 100);
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

    this.currencyDropdown()?.hide();
  }

  getBaselineServerLabel(): string {
    return this.selectedBaselineServer?.display_name || "Baseline server";
  }

  isBaselineServer(server: ExtendedServerDetails): boolean {
    return isCompareBaselineServer(server, this.selectedBaselineServer);
  }

  selectBaselineServer(server: ExtendedServerDetails | null): void {
    this.selectedBaselineServer = server;
    this.syncBaselineToCompareService();
    this.syncCompareUrlState();
    this.baselineDropdown()?.hide();
  }

  getCompareUrlQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};

    if (this.instancesRaw) {
      params.instances = this.instancesRaw;
    }

    if (this.selectedBaselineServer) {
      params.baseline_vendor = this.selectedBaselineServer.vendor_id;
      params.baseline_server = this.selectedBaselineServer.api_reference;
    }

    return params;
  }

  private restoreBaselineFromUrl(): void {
    const baselineVendor = this.route.snapshot.queryParams["baseline_vendor"];
    const baselineServerRef =
      this.route.snapshot.queryParams["baseline_server"];

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
    this.lastEncodedCompareQuery = encodeQueryParams(
      this.getCompareUrlQueryParams(),
    );
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
      this.syncCompareUrlState();
    }
  }

  private applyCompareSelectionFromService(selection: ServerCompare[]): void {
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
      this.syncSavedComparisonChrome();
      this.syncCompareUrlState();
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
    this.syncSavedComparisonChrome();

    if (
      this.selectedBaselineServer &&
      !this.servers.some((server) =>
        isCompareBaselineServer(server, this.selectedBaselineServer),
      )
    ) {
      this.selectedBaselineServer = null;
    }

    this.syncCompareUrlState();
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

  private applyGuideChrome(): void {
    this.title = SERVER_COMPARE_GUIDE_TITLE;
    this.description = SERVER_COMPARE_GUIDE_DESCRIPTION;
    this.showSavedStar = false;
    this.breadcrumbs = this.baseCompareBreadcrumbs();
    this.seoHandler.updateTitleAndMetaTags(
      this.title,
      this.description,
      this.keywords,
    );
  }

  private applyComparisonChrome(title?: string, description?: string): void {
    this.title = title || SERVER_COMPARISON_TITLE;
    this.description = description || SERVER_COMPARE_GUIDE_DESCRIPTION;
    this.showSavedStar = false;
    this.breadcrumbs = this.baseCompareBreadcrumbs();
    this.seoHandler.updateTitleAndMetaTags(
      this.title,
      this.description,
      this.keywords,
    );
  }

  private baseCompareBreadcrumbs(): BreadcrumbSegment[] {
    return [
      { name: "Home", url: "/" },
      { name: SERVER_COMPARE_PARENT_BREADCRUMB, url: "/servers" },
      { name: SERVER_COMPARE_BREADCRUMB, url: "/servers/compare" },
    ];
  }

  private setPremadeCompareBreadcrumb(title: string, id: string): void {
    this.breadcrumbs = [
      ...this.baseCompareBreadcrumbs(),
      { name: title, url: `/servers/compare/${id}` },
    ];
  }

  private syncSavedComparisonChrome(): void {
    if (this.route.snapshot.paramMap.get("id")) {
      return;
    }

    const saved = this.activeSavedComparison();

    if (saved && this.instances.length) {
      this.title = saved.name;
      this.description = saved.note?.trim() || SAVED_ITEM_FALLBACK_NOTE;
      this.showSavedStar = true;
      this.breadcrumbs = [
        ...this.baseCompareBreadcrumbs(),
        { name: saved.name, url: this.compareCollections.compareUrl() },
      ];
      this.seoHandler.updateTitleAndMetaTags(
        `${saved.name} - Spare Cores`,
        this.description,
        this.keywords,
      );
      return;
    }

    if (this.instances.length) {
      this.title = SERVER_COMPARISON_TITLE;
      this.description = SERVER_COMPARE_GUIDE_DESCRIPTION;
      this.showSavedStar = false;
      this.breadcrumbs = [
        ...this.baseCompareBreadcrumbs(),
        {
          name: `${SERVER_CUSTOM_COMPARISON_BREADCRUMB} (${this.instances.length})`,
          url: `/servers/compare`,
          queryParams: this.instancesRaw
            ? { instances: this.instancesRaw }
            : undefined,
        },
      ];
      this.seoHandler.updateTitleAndMetaTags(
        `${this.title} - Spare Cores`,
        this.description,
        this.keywords,
      );
      return;
    }

    this.applyGuideChrome();
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  activeSavedComparison() {
    return this.compareCollections.activeSavedComparison();
  }

  canSaveComparison(): boolean {
    return this.isAuthenticated() && this.instances.length >= 2;
  }

  openSaveComparisonModal(): void {
    if (!this.isAuthenticated()) {
      this.auth.signIn();
      return;
    }

    const saved = this.activeSavedComparison();
    this.editingComparisonId.set(saved?.id ?? null);
    this.saveComparisonModal()?.open(saved?.name ?? "", saved?.note ?? "");
  }

  isSaveComparisonPending(): boolean {
    const editingId = this.editingComparisonId();
    if (editingId) {
      return this.compareCollections.isUpdatingComparison(editingId);
    }

    const saved = this.activeSavedComparison();
    const id = this.compareCollections.buildComparisonId(
      this.getCompareInstancesForSave(),
    );

    if (saved) {
      return this.compareCollections.isUpdatingComparison(saved.id);
    }

    return this.compareCollections.isSavingComparison(id);
  }

  confirmSaveComparison(payload: { name: string; note?: string }): void {
    const instances = this.getCompareInstancesForSave();
    const editingId = this.editingComparisonId();
    const saved = this.activeSavedComparison();
    const id =
      editingId ??
      saved?.id ??
      this.compareCollections.buildComparisonId(instances);
    this.pendingSaveComparisonClose.set(true);

    if (editingId || saved) {
      this.compareCollections.updateComparison(
        id,
        instances,
        payload.name,
        payload.note,
      );
      return;
    }

    this.compareCollections.saveComparison(
      id,
      instances,
      payload.name,
      payload.note,
    );
  }

  deleteSavedComparison(): void {
    const saved = this.activeSavedComparison();
    if (!saved) {
      return;
    }

    this.compareCollections.deleteComparison(saved.id);
  }

  private getCompareInstancesForSave(): ServerCompare[] {
    return this.instances.map((instance) => ({
      display_name: instance.display_name,
      vendor: instance.vendor,
      server: instance.server,
      zonesRegions: instance.zonesRegions ?? [],
    }));
  }

  private syncCompareUrlState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const encodedQuery = encodeQueryParams(this.getCompareUrlQueryParams());

    if (encodedQuery === this.lastEncodedCompareQuery) {
      return;
    }

    this.lastEncodedCompareQuery = encodedQuery;
    pushBrowserQueryState(encodedQuery);
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

  openModal() {
    this.modalEmbed?.show();
  }

  closeModal() {
    this.modalEmbed?.hide();
  }
}
