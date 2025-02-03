/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { Component, ElementRef, Inject, PLATFORM_ID, OnInit, ViewChild, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { Benchmark, BenchmarkScore, GetSimilarServersServerVendorServerSimilarServersByNumGetData, Server, ServerPKs, ServerPrice} from '../../../../sdk/data-contracts';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FaqComponent } from '../../components/faq/faq.component';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { barChartDataEmpty, barChartOptions } from './chartOptions';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { DomSanitizer } from '@angular/platform-browser';
import { ReduceUnitNamePipe } from '../../pipes/reduce-unit-name.pipe';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { ServerCompareService } from '../../services/server-compare.service';
import { initGiscus } from '../../tools/initGiscus';
import { Location } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { DropdownManagerService } from '../../services/dropdown-manager.service';
import { ServerChartsComponent } from '../../components/server-charts/server-charts.component';
import { Modal, ModalOptions } from 'flowbite';
import { EmbedDebugComponent } from '../embed-debug/embed-debug.component';

Chart.register(annotationPlugin);

const optionsModal: ModalOptions = {
  backdropClasses:
      'bg-gray-900/50 fixed inset-0 z-40',
  closable: true,
};

export interface ExtendedServerPrice extends ServerPrice {
  region: any;
  zone: any;
}

export interface ExtendedServerDetails extends ServerPKs {
  benchmark_scores: BenchmarkScore[],
  prices: ExtendedServerPrice[],
  bestOndemandPrice?: ExtendedServerPrice,
  bestSpotPrice?: ExtendedServerPrice,
  additionalOndemandPrices?: ExtendedServerPrice[],
  additionalSpotPrices?: ExtendedServerPrice[],
}

@Component({
  selector: 'app-server-details',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, LucideAngularModule, FaqComponent, FormsModule, RouterModule, BaseChartDirective, ReduceUnitNamePipe, CountryIdtoNamePipe, ServerChartsComponent, EmbedDebugComponent],
  templateUrl: './server-details.component.html',
  styleUrl: './server-details.component.scss'
})
export class ServerDetailsComponent implements OnInit, OnDestroy {

  serverDetails!: ExtendedServerDetails;
  serverZones: string[] = [];
  serverRegions: string[] = [];

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Servers', url: '/servers' },
    { name: '', url: ''}
  ];

  features: any[] = [];

  description = '';
  title = '';

  faqs: any[] = [];

  availabilityRegions: any[] = [];
  availabilityZones: any[] = [];
  pricesPerZone: any[] = [];

  dropdownAllocation: any;
  dropdownAllocation2: any;
  allocationFilters: any[] = [
    { name: 'Spot', selected: true },
    { name: 'Ondemand', selected: true }
  ];

  regionFilters: any[] = [];

  similarByFamily: GetSimilarServersServerVendorServerSimilarServersByNumGetData = [];
  similarBySpecs: GetSimilarServersServerVendorServerSimilarServersByNumGetData = [];
  similarServers: GetSimilarServersServerVendorServerSimilarServersByNumGetData = [];

  dropdownSimilar: any;
  similarOptions: any[] = [
    {name: 'By GPU, CPU and memory specs', key: 'bySpecs'},
    {name: 'By CPU performance', key: 'byScore'},
    {name: 'By CPU performance per price', key: 'byPerformancePerPrice'}
  ];
  selectedSimilarOption: any = this.similarOptions[0];

  instancePropertyCategories: any[] = [
    { name: 'General', category: 'meta', properties: [] },
    { name: 'CPU', category: 'cpu', properties: [] },
    { name: 'Memory', category: 'memory', properties: [] },
    { name: 'GPU', category: 'gpu', properties: [] },
    { name: 'Storage', category: 'storage', properties: [] },
    { name: 'Network', category: 'network', properties: [] },
  ];

  barChartOptions: ChartConfiguration<'bar'>['options'] = barChartOptions;
  barChartType = 'bar' as const;
  barChartData: ChartData<'bar'> = JSON.parse(JSON.stringify(barChartDataEmpty));
  barChartData2: ChartData<'bar'> = JSON.parse(JSON.stringify(barChartDataEmpty));
  barChartData3: ChartData<'bar'> = JSON.parse(JSON.stringify(barChartDataEmpty));

  benchmarksByCategory: any[] = [];

  instanceProperties: any[] = [];
  benchmarkMeta!: Benchmark[];

  tooltipContent = '';

  geekScoreSingle: string = '0';
  geekScoreMulti: string = '0';

  keeperResponseErrorMsg: string = 'Failed to load server data. Please try again later.';

  activeFAQ: number = -1;

  modalEmbed: any;

  embeddableCharts = [
    {id: 'bw_mem', name: 'Memory bandwidth' },
    {id: 'compress', name: 'Compression' },
    {id: 'geek_single', name: 'Geekbench single-core' },
    {id: 'geek_multi', name: 'Geekbench multi-core' },
    {id: 'ssl', name: 'OpenSSL speed' },
    {id: 'static_web', name: 'Static web server' },
    {id: 'redis', name: 'Redis' }
  ];

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  @ViewChild('tooltipGeekbench') tooltipGB!: ElementRef;
  @ViewChild('giscusParent') giscusParent!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              @Inject(DOCUMENT) private document: Document,
              private route: ActivatedRoute,
              private analytics: AnalyticsService,
              private keeperAPI: KeeperAPIService,
              private SEOHandler: SeoHandlerService,
              private serverCompare: ServerCompareService,
              private router: Router,
              private renderer: Renderer2,
              private location: Location,
              private dropdownManager: DropdownManagerService,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit() {

    const countryIdtoNamePipe = new CountryIdtoNamePipe();
    this.route.params.subscribe(params => {
      const vendor = params['vendor'];
      const id = params['id'];

      Promise.all([
        this.keeperAPI.getServerMeta(),
        this.keeperAPI.getServerBenchmarkMeta(),
        this.keeperAPI.getServerSimilarServers(vendor, id, 'family', 7),
        this.keeperAPI.getServerSimilarServers(vendor, id, 'specs', 7),
        this.keeperAPI.getServerPrices(vendor, id),
        this.keeperAPI.getServerBenchmark(vendor, id),
        this.keeperAPI.getServerV2(vendor, id),
        this.keeperAPI.getVendors(),
        this.keeperAPI.getRegions(),
        this.keeperAPI.getZones()
      ]).then((dataAll) => {
        const promisAllResponses = dataAll.map((d) => d.body);
        const [serverMeta, benchmarkMeta, similarByFamily, similarBySpecs, prices, benchmarks, serverDetails, vendors, regions, zones] = promisAllResponses;

        this.instanceProperties = serverMeta?.fields || [];

        this.benchmarkMeta = benchmarkMeta || {};

        this.similarByFamily = similarByFamily;
        this.similarBySpecs = similarBySpecs;

        if(serverDetails){
          this.serverDetails = JSON.parse(JSON.stringify(serverDetails)) as any;

          this.serverDetails.benchmark_scores = benchmarks;
          this.serverDetails.vendor = vendors.find((v: any) => v.vendor_id === this.serverDetails.vendor_id);
          this.serverDetails.score = this.serverDetails.benchmark_scores?.find((b) => b.benchmark_id === 'stress_ng:bestn')?.score;

          if(prices) {
            this.serverDetails.prices = JSON.parse(JSON.stringify(prices))?.sort((a: any, b: any) => a.price - b.price);

            if(this.serverDetails.prices?.length > 0) {
              this.serverDetails.min_price = this.serverDetails.prices ? this.serverDetails.prices[0].price : 0;
              this.serverDetails.prices.forEach((price: any) => {
                price.region = regions.find((r: any) => r.region_id === price.region_id);
                price.zone = zones.find((z: any) => z.zone_id === price.zone_id);
              });
            }
          }

          this.serverDetails.score_per_price = this.serverDetails.min_price && this.serverDetails.score ? this.serverDetails.score / this.serverDetails.min_price : (this.serverDetails.score || 0);

          // list all regions where the server is available
          this.serverDetails.prices?.forEach((price: ExtendedServerPrice) => {
            this.serverZones.push(price.zone.display_name);
            if(!this.serverRegions.includes(price.region.display_name)) {
              this.serverRegions.push(price.region.display_name);
            }
          })

          this.breadcrumbs[2] =
            { name: this.serverDetails.display_name, url: '/server/' + this.serverDetails.vendor.vendor_id + '/' + this.serverDetails.api_reference };

          const url = this.SEOHandler.getBaseURL() + '/server/' + this.serverDetails.vendor.vendor_id + '/' + this.serverDetails.api_reference;
          this.SEOHandler.updateCanonical(this.document, url);

          this.features = [];
          if(this.serverDetails.cpu_cores || this.serverDetails.vcpus) {
            this.features.push({name: 'vCPU', value: `${this.serverDetails.vcpus || this.serverDetails.cpu_cores}`});
          }
          if(this.serverDetails.memory_amount) {
            this.features.push({name: 'Memory', value: this.getMemory()});
          }
          if(this.serverDetails.storage_size) {
            this.features.push({name: 'Storage', value: this.getStorage()});
          }
          if(this.serverDetails.gpu_count) {
            this.features.push({name: 'GPU', value: this.serverDetails.gpu_count});
          }

          this.instancePropertyCategories.forEach((c) => {
            c.properties = [];
          });

          this.instanceProperties.forEach((p: any) => {
            const group = this.instancePropertyCategories.find((g) => g.category === p.category);
            const value = this.getProperty(p);
            if(group && value) {
              group.properties.push(p);
            }
          });

          this.benchmarksByCategory = [];
          this.serverDetails.benchmark_scores?.forEach((b: any) => {
            let group_id = b.benchmark_id;
            if(group_id.includes('passmark:')) {
              if(group_id.includes('passmark:cpu_')) {
                group_id = 'passmark:cpu';
              } else {
                group_id = 'passmark:other';
              }
            }
            const group = this.benchmarksByCategory.find((g) => g.benchmark_id === group_id);
            if(!group) {
              this.benchmarksByCategory.push({benchmark_id: group_id, benchmarks: [b]});
            } else {
              group.benchmarks.push(b);
            }
          });

          this.regionFilters = [];

          this.serverDetails.prices?.sort((a, b) => a.price - b.price);
          this.serverDetails.prices?.forEach((price: ExtendedServerPrice) => {
              const region = this.regionFilters.find((z) => z.region_id === price.region_id);
              if(!region) {
                this.regionFilters.push({name: price.region.display_name, region_id: price.region_id, selected: false});
              }
            });

          if(this.regionFilters[0]) {
            this.regionFilters[0].selected = true;
          }

          if(this.serverDetails.prices?.length > 0 && (this.barChartOptions?.scales as any)?.y?.title?.text) {
            (this.barChartOptions!.scales as any).y.title.text = `${this.serverDetails.prices[0].currency}/h`;
          }

          // This also initializes important underlying data has to be called here
          this.refreshPricesGraphs();

          this.title = `${this.serverDetails.display_name} by ${this.serverDetails.vendor.name} - Spare Cores`;
          this.description =
            `${this.serverDetails.display_name} is a ${this.serverDetails.description} server offered by ${this.serverDetails.vendor.name} with`;
          if(this.serverDetails.vcpus) {
            this.description += ` ${this.serverDetails.vcpus} vCPUs`;
          } else if(this.serverDetails.cpu_cores) {
            this.description += ` ${this.serverDetails.cpu_cores} CPUs`;
          }
          this.description += `, ${this.getMemory()} of memory and ${this.getStorage()} of storage.`;

          if(this.serverDetails.prices[0]) {
            this.description += ` The pricing starts at ${this.serverDetails.prices[0].price} ${this.serverDetails.prices[0].currency} per hour.`;
          }

          this.faqs = [
            {
              question: `What is ${this.serverDetails.display_name}?`,
              answer: this.description
            },
            {
              question: `What are the specs of the ${this.serverDetails.display_name} server?`,
              answer: `The ${this.serverDetails.display_name} server is equipped with ${this.serverDetails.vcpus} logical CPU core${this.serverDetails.vcpus! > 1 ? "s" : ""} on ${this.serverDetails.cpu_cores || "unknown number of"} ${this.serverDetails.cpu_manufacturer || ""} ${this.serverDetails.cpu_family || ""} ${this.serverDetails.cpu_model || ""} physical CPU core${this.serverDetails.cpu_cores ? this.serverDetails.cpu_cores! > 1 ? "s" : "" : "(s)"}${this.serverDetails.memory_speed ? " running at max. " + this.serverDetails.cpu_speed + " Ghz" : ""}, ${this.getMemory()} of ${this.serverDetails.memory_generation || ""} memory${this.serverDetails.memory_speed ? " with " + this.serverDetails.memory_speed + " Mhz clock rate" : ""}, ${this.getStorage()} of ${this.serverDetails.storage_type || ""} storage, and ${this.serverDetails.gpu_count! > 0 ? this.serverDetails.gpu_count : "no"} ${this.serverDetails.gpu_manufacturer || ""} ${this.serverDetails.gpu_family || ""} ${this.serverDetails.gpu_model || ""} GPU${this.serverDetails.gpu_count! > 1 ? "s" : ""}. Additional block storage can be attached as needed.`
            }
          ];

          if(this.serverDetails.benchmark_scores.length > 0) {
            const benchmarkFrameworks = new Set<string>();
            for (const item of this.serverDetails.benchmark_scores) {
              benchmarkFrameworks.add(item['benchmark_id']);
            }
            let answer = `We have run ${benchmarkFrameworks.size} frameworks on the ${this.serverDetails.display_name} server, and collected ${this.serverDetails.benchmark_scores.length} performance metrics. Depending on your use case, you might want to look at our Memory bandwidth, Compression algo, or OpenSSL speed benchmarks, among others.`;
            for (const item of this.serverDetails.benchmark_scores) {
              if (item.benchmark_id === "geekbench:score" && (item.config as any)?.cores === "Multi-Core Performance") {
                answer += ` As a baseline example, the multi-core Geekbench6 compound score suggests that the ${this.serverDetails.display_name} server is ${item.score/2500}x ${item.score > 2500 ? "faster" : "slower"} than the baseline Dell Precision 3460 with a Core i7-12700 processor.`;
              }
            }
            this.faqs.push(
              {
                question: `How fast is the ${this.serverDetails.display_name} server?`,
                answer: answer
              }
            );
          }

          if(this.serverDetails.prices[0]) {
            this.faqs.push(
              {
                question: `How much does the ${this.serverDetails.display_name} server cost?`,
                answer: `The pricing for ${this.serverDetails.display_name} servers starts at ${this.serverDetails.prices[0].price} ${this.serverDetails.prices[0].currency} per hour, but the actual price depends on the selected region, zone and server allocation method (e.g. on-demand versus spot pricing options): currently, we track the prices in ${this.serverDetails.prices.length} regions and zones every 5 minutes, and the maximum price stands at ${this.serverDetails.prices.slice(-1)[0].price} ${this.serverDetails.prices.slice(-1)[0].currency}.`
              }
            );
          }

          this.faqs.push(
              {
                question: `Who is the provider of the ${this.serverDetails.display_name} server?`,
                html: `The ${this.serverDetails.display_name} server is offered by ${this.serverDetails.vendor.name}, founded in ${this.serverDetails.vendor.founding_year}, headquartered in ${this.serverDetails.vendor.state}, ${countryIdtoNamePipe.transform(this.serverDetails.vendor.country_id)}. For more information, visit the <a href="${this.serverDetails.vendor.homepage}" target="_blank" rel="noopener" class="underline decoration-dotted hover:text-gray-500">${this.serverDetails.vendor.name} homepage</a>.`
                // TODO add compliance frameworks implemented
              }
            );

          if (this.serverRegions) {
            this.faqs.push(
              {
                question: `Where is the ${this.serverDetails.display_name} server available?`,
                html: `The ${this.serverDetails.display_name} server is available in ${this.serverZones.length} availability zones of the following ${this.serverRegions.length} regions: ${this.serverRegions.join(', ')}.`
              }
            );

          }
          const keywords = this.title + ', ' + this.serverDetails.server_id + ', ' + this.serverDetails.vendor.vendor_id;

          this.SEOHandler.updateTitleAndMetaTags(this.title, this.description, keywords);
          this.SEOHandler.updateThumbnail(`https://og.sparecores.com/images/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}.png`);

          if (this.similarByFamily?.length > 0) {
            this.faqs.push(
              {
                question: `Are there any other sized servers in the ${this.serverDetails.family} server family?`,
                html: `Yes! In addition to the ${this.serverDetails.display_name} server, the ${this.serverDetails.family} server family includes ${this.similarByFamily.length} other sizes: ${this.similarByFamily.map((s: any) => this.serverUrl(s, true)).join(', ')}.`
              });

          }

          if(this.similarBySpecs?.length > 0) {
            this.faqs.push(
              {
                question: `What other servers offer similar performance to ${this.serverDetails.display_name}?`,
                html: `Looking at the number of GPU, vCPUs, and memory amount, the following top 10 servers come with similar specs: ${this.similarBySpecs.map((s: any) => this.serverUrl(s, true)).join(', ')}.`
              });
          }

          this.generateSchemaJSON();

          if(this.serverDetails.vcpus && this.serverDetails.vcpus > 1) {
            this.embeddableCharts.push({id: 'stress_ng_div16', name: 'Stress-ng div16' });
            this.embeddableCharts.push({id: 'stress_ng_relative', name: 'Stress-ng relative' });
          }

          if(isPlatformBrowser(this.platformId)) {

            setTimeout(() => {
              const showDetails = this.route.snapshot.queryParams['showDetails'];
              const activeFAQ = this.route.snapshot.queryParams['openFAQ'];
              const similarCategory = this.route.snapshot.queryParams['similarCategory'];

              if(activeFAQ) {
                this.activeFAQ = parseInt(activeFAQ);
              }

              if(showDetails) {
                this.openBox('details', false);
              }

              if(similarCategory) {
                this.selectedSimilarOption = this.similarOptions.find((o) => o.key === similarCategory);
              }
            }, 100);


            const targetElModal = document.getElementById('large-modal');

            this.modalEmbed = new Modal(targetElModal, optionsModal,  {
              id: 'large-modal',
              override: true
            });

            // https://github.com/chartjs/Chart.js/issues/5387
            // TODO: check and remove later
            document.addEventListener('visibilitychange', event => {
              if (document.visibilityState === 'visible') {
                  // keep a instance for the chart
                 const allCharts = Object.values(Chart.instances);
                 allCharts?.forEach((chart: any) => {
                    chart.update();
                });
              }
            });

            let giscusInterval = setInterval(() => {

              if(this.giscusParent?.nativeElement) {
                let baseUrl = this.SEOHandler.getBaseURL();
                initGiscus(this.renderer, this.giscusParent, baseUrl, 'Servers', 'DIC_kwDOLesFQM4CgznN', 'pathname');
                clearInterval(giscusInterval);
              }
            }, 250);

            this.selectSimilarServerOption(this.selectedSimilarOption, false);

            this.dropdownManager.initDropdown('allocation_button', 'allocation_options');

            this.dropdownManager.initDropdown('allocation_button2', 'allocation_options2');

            this.dropdownManager.initDropdown('region_button', 'region_options').then((dropdown) => {
            });

            this.dropdownManager.initDropdown('similar_type_button', 'similar_server_options').then((dropdown) => {
              this.dropdownSimilar = dropdown;
            });

          }
        }
      }).catch((error) => {
        console.error(error);
        if(error?.status === 404) {
          this.keeperResponseErrorMsg = 'The requested server was not found.';
        } else if(error?.status === 500) {
          this.analytics.SentryException(error, {tags: { location: this.constructor.name, function: 'getServers' }});
          this.keeperResponseErrorMsg = 'Internal server error. Please try again later.';
        } else {
          this.analytics.SentryException(error, {tags: { location: this.constructor.name, function: 'getServers' }});
          this.keeperResponseErrorMsg = 'Failed to load server data. Please try again later.';
        }
      });
    });
  }

  ngOnDestroy() {
    this.SEOHandler.cleanupStructuredData(this.document);
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  getMemory(memory: number | undefined = undefined) {
    const memoryAmount = memory || this.serverDetails.memory_amount || 0;
    return ((memoryAmount) / 1024).toFixed((memoryAmount >= 1024 ? 0 : 1)) + ' GiB';
  }

  getStorage() {
    if(!this.serverDetails.storage_size) return '0 GB';

    if(this.serverDetails.storage_size < 1000) return `${this.serverDetails.storage_size} GB`;

    return `${(this.serverDetails.storage_size / 1000).toFixed(1)} TB`;
  }

  serverUrl(server: Server, appendVendor: boolean = false): string {
    return(`<a class="underline decoration-dotted hover:text-gray-500"
      href="/server/${server.vendor_id}/${server.api_reference}">
      ${server.display_name}${appendVendor ? " (" + server.vendor_id + ")" : ""}</a>`)
  }

  openBox(boxId: string, updateURL: boolean = true) {
    const el = document.getElementById(boxId);
    if(el) {
      el.classList.toggle('open');
    }
    const el2 = document.getElementById(boxId+'_more');
    if(el2) {
      el2.classList.toggle('hidden');
    }
    const el3 = document.getElementById(boxId+'_less');
    if(el3) {
      el3.classList.toggle('hidden');
    }

    if(updateURL){
      if(el?.classList.contains('open')) {
        this.location.go(`server/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}`, 'showDetails=true');
      } else {
        this.location.go(`server/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}`);
      }
    }
  }

  refreshPricesGraphs() {
    this.updateChart1();
    this.updateChart2();
    this.updateChart3();
  }

  updateChart1() {
    this.availabilityRegions = [];
    if(this.serverDetails.prices.length > 0) {

    this.serverDetails.prices.forEach((price: ExtendedServerPrice) => {
    const zone = this.availabilityRegions.find((z) => z.region_id === price.region_id);
      const allocation = price.allocation || 'spot';
      if(!zone) {
        const data: any = {
          region_id: price.region_id,
          display_name: price.region.display_name,
          api_reference: price.region.api_reference,
          spot: {
            price: 0,
            unit: price.unit,
            count: 0,
            currency: price.currency
          },
          ondemand: {
            price: 0,
            unit: price.unit,
            count: 0,
            currency: price.currency
          }
        };
        data[allocation].price += price.price;
        data[allocation].count++;

        this.availabilityRegions.push(data);
      } else {
        zone[allocation].price += price.price;
        zone[allocation].count++;
      }
    });

    this.availabilityRegions.forEach((zone: any) => {
      if(zone.spot.count)
        zone.spot.price = Math.round(zone.spot.price / zone.spot.count * 1000000) / 1000000;
      if(zone.ondemand.count)
        zone.ondemand.price = Math.round(zone.ondemand.price / zone.ondemand.count * 1000000) / 1000000;
    });

    this.availabilityRegions.sort((a, b) => a['ondemand'].price - b['ondemand'].price);

    const series: ChartData<'bar'> = {
      labels: [],
      datasets: [
      ],
    };

    if(this.allocationFilters[0].selected) {
      series.datasets.push( { data: [], label: 'Spot', backgroundColor: '#34D399'});
    }

    if(this.allocationFilters[1].selected) {
      series.datasets.push( { data: [], label: 'Ondemand', backgroundColor: '#E5E7EB'});
    }

    const spotIdx = series.datasets.findIndex((s: any) => s.label === 'Spot');
    const ondemandIdx = series.datasets.findIndex((s: any) => s.label === 'Ondemand');

    this.availabilityRegions.forEach((zone: any) => {
      series.labels!.push(zone.display_name);
      if(spotIdx > -1) {
        series.datasets[spotIdx].data.push(zone.spot?.price || 0);
      }
      if(ondemandIdx > -1)
      {
        series.datasets[ondemandIdx].data.push(zone.ondemand?.price || 0);
      }
    });

    this.barChartData = series;
    }
  }

  updateChart2() {
    this.availabilityZones = [];
    if(this.serverDetails.prices.length > 0) {

    this.serverDetails.prices.forEach((price: ExtendedServerPrice) => {
    const zone = this.availabilityZones.find((z) => z.zone_id === price.zone_id);
      if(!zone) {
        const data: any = {
          zone_id: price.zone_id,
          region_id: price.region_id,
          display_name: price.zone.display_name,
          spot: {
            price: 0,
            unit: price.unit,
            count: 0
          },
          ondemand: {
            price: 0,
            unit: price.unit,
            count: 0
          }
        };
        data[price.allocation || 'spot'].price += price.price;
        data[price.allocation || 'spot'].count++;

        this.availabilityZones.push(data);
      } else {
        zone[price.allocation || 'spot'].price += price.price;
        zone[price.allocation || 'spot'].count++;
      }
    });

    this.availabilityZones.forEach((zone: any) => {
      if(zone.spot.count)
        zone.spot.price = Math.round(zone.spot.price / zone.spot.count * 1000000) / 1000000;
      if(zone.ondemand.count)
        zone.ondemand.price = Math.round(zone.ondemand.price / zone.ondemand.count * 1000000) / 1000000;
    });

    this.availabilityZones.sort((a, b) => a['ondemand'].price - b['ondemand'].price);

    const series: ChartData<'bar'> = {
      labels: [],
      datasets: [
      ],
    };

    if(this.allocationFilters[0].selected) {
      series.datasets.push( { data: [], label: 'Spot', backgroundColor: '#34D399'});
    }

    if(this.allocationFilters[1].selected) {
      series.datasets.push( { data: [], label: 'Ondemand', backgroundColor: '#E5E7EB'});
    }

    const spotIdx = series.datasets.findIndex((s: any) => s.label === 'Spot');
    const ondemandIdx = series.datasets.findIndex((s: any) => s.label === 'Ondemand');

    this.availabilityZones.forEach((zone: any) => {
      if(this.regionFilters.find((z) => z.region_id === zone.region_id)?.selected) {
        series.labels!.push(zone.display_name);
        if(spotIdx > -1) {
          series.datasets[spotIdx].data.push(zone.spot?.price || 0);
        }
        if(ondemandIdx > -1)
        {
          series.datasets[ondemandIdx].data.push(zone.ondemand?.price || 0);
        }
      }
    });

    this.barChartData2 = series;
    }
  }

  updateChart3() {
    const pricesPerZone: any[] = [];
    if(this.serverDetails.prices.length > 0) {


    for(let i = 0; i < this.serverDetails.prices.length && i < 10; i++) {
      const price = this.serverDetails.prices[i];
      const zone = pricesPerZone.find((z) => z.zone_id === price.zone_id);
      if(!zone) {
        const data: any = {
          zone_id: price.zone_id,
          display_name: price.zone.display_name,
          spot: {
            price: 0,
            unit: price.unit,
            count: 0
          },
          ondemand: {
            price: 0,
            unit: price.unit,
            count: 0
          }
        };
        data[price.allocation || 'spot'].price += price.price;
        data[price.allocation || 'spot'].count++;

        pricesPerZone.push(data);
      } else {
        zone[price.allocation || 'spot'].price += price.price;
        zone[price.allocation || 'spot'].count++;
      }
    }

    pricesPerZone.forEach((zone: any) => {
      if(zone.spot.count)
        zone.spot.price = Math.round(zone.spot.price / zone.spot.count * 1000000) / 1000000;
      if(zone.ondemand.count)
        zone.ondemand.price = Math.round(zone.ondemand.price / zone.ondemand.count * 1000000) / 1000000;
    });

    const series: ChartData<'bar'> = {
      labels: [],
      datasets: [
      ],
    };

    series.datasets.push( { data: [], label: 'Spot', backgroundColor: '#34D399'});

    series.datasets.push( { data: [], label: 'Ondemand', backgroundColor: '#E5E7EB'});

    pricesPerZone.forEach((zone: any) => {
      series.labels!.push(zone.display_name);
      series.datasets[0].data.push(zone.spot?.price || 0);
      series.datasets[1].data.push(zone.ondemand?.price || 0);
    });

    this.barChartData3 = series;
  }
  }

  showTooltip(el: any, content: string | undefined) {
    if(content) {
      const tooltip = this.tooltip.nativeElement;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      tooltip.style.left = `${el.target.getBoundingClientRect().right + 5}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().top - 45 + scrollPosition}px`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';

      this.tooltipContent = content;
    }
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

  getProperty(column: any) {
    const name = column.id
    const prop = (this.serverDetails as any)[name];

    if(prop === undefined || prop === null) {
      return undefined;
    }

    if(name === 'storages') {
      let html = '<ul>';
      (prop as any[]).forEach((s: any, index: number) => {
        html += `<li>${s.size} GB ${s.storage_type ? s.storage_type : ''}${s.description ? ' (' + s.description + ')' : ''}</li>`;
      });
      html += '</ul>';
      return html;
    }

    if(name === 'gpus') {
      let html = '<ul>';
      (prop as any[]).forEach((s: any, index: number) => {
        html += `<li>${s.manufacturer || ""} ${s.family || ""} ${s.model || ""} `;
        const fields = ['memory', 'firmware_version', 'bios_version', 'graphics_clock'];
        const field_names = ['Memory amount', 'Firmware version', 'BIOS version', 'Clock rate'];
        let extraData = '';
        for(let i = 0; i < fields.length; i++) {
          if(s[fields[i]]) {
            if(extraData.length > 0) {
              extraData += ', ';
            } else {
              extraData += '(';
            }
            extraData += `${field_names[i]}: ${s[fields[i]]}`;
          }
        }
        if(extraData.length > 0) {
          html += extraData + ')';
        }

        html += '</li>'
      });
      html += '</ul>';
      return html;
    }

    if( typeof prop === 'number' ) {
      return this.roundBytes(prop, column.unit);
    }
    if( typeof prop === 'string') {
      return prop;
    }
    if(Array.isArray(prop)) {
      return prop.join(', ');
    }

    return '-';
  }

  roundBytes(bytes: number, unit: string) {
    const sizes = ['byte', 'KiB', 'MiB', 'GiB', 'TB'];

    let idx = sizes.indexOf(unit);

    if(idx < 0 || bytes === 0) {
      return `${bytes} ${unit || ''}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(0) + ' ' + sizes[i+idx];
  }

  getBenchmark(isMulti: boolean) {
    return this.serverDetails.benchmark_scores?.find((b: any) => b.benchmark_id === (isMulti ? 'stress_ng:bestn' : 'stress_ng:best1'))?.score?.toFixed(0) || '-';
  }

  addToCompare() {
    this.serverCompare.toggleCompare(
      !this.serverCompare.isSelected(
        this.serverDetails), {server: this.serverDetails.api_reference, vendor: this.serverDetails.vendor_id, display_name: this.serverDetails.display_name});
  }

  compareText() {
    return this.serverCompare.isSelected(this.serverDetails) ? "Don't Compare" : "Compare";
  }

  generateSchemaJSON() {
    // we need 'offers' to be filled to avoid Google critical error
    if(!this.serverDetails || !this.serverDetails.prices || !this.serverDetails.prices.length) {
      return;
    }

    const json: any =
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": this.serverDetails.display_name,
      "description": this.description,
      "category": `Servers > Cloud servers > ${this.serverDetails.vendor.name}`,
      "brand": {
        "@type": "Organization",
        "name": this.serverDetails.vendor.name,
        "logo": this.serverDetails.vendor.logo,
        "url": this.serverDetails.vendor.homepage
      },
      "offers": {
          "@type": "AggregateOffer",
          "offerCount": this.serverDetails.prices.length,
          "lowPrice": this.serverDetails.prices[0].price,
          "highPrice": this.serverDetails.prices[this.serverDetails.prices.length - 1].price,
          "priceCurrency": this.serverDetails.prices[0].currency
      },
      "hasMeasurement": [
          {"@type": "QuantitativeValue", "name": "Logical cores", "unitText": "VCPU(s)", "value": this.serverDetails.vcpus},
          {"@type": "QuantitativeValue", "name": "Memory", "unitText": "GiB", "value": this.serverDetails.memory_amount},
          {"@type": "QuantitativeValue", "name": "Storage", "unitText": "GB", "value": this.serverDetails.storage_size},
          {"@type": "QuantitativeValue", "name": "Graphics processing units", "unitText": "GPU(s)", "value": this.serverDetails.gpu_count},
      ],
    }

    if(this.similarByFamily.length) {
      json['isSimilarTo'] = this.similarByFamily.map((s: any) => {
        return {
          "@type": "Product",
          "name": `${s.display_name} (${s.vendor_id})`,
          "url": `https://www.sparecores.com/server/${s.vendor_id}/${s.api_reference}`
        }
      });
    }

    this.SEOHandler.setupStructuredData(this.document, [JSON.stringify(json)]);
  }

  diffBy(s: ServerPKs, field: keyof ServerPKs) {
    return Math.abs(Number(this.serverDetails[field]) - Number(s[field]));
  }

  diffSpec(s: ServerPKs) {
    return Math.abs(Number(this.serverDetails.gpu_count) - Number(s.gpu_count)) * 10e6 +
           Math.abs(Number(this.serverDetails.vcpus) - Number(s.vcpus)) * 10e3 +
           Math.abs(Number(this.serverDetails.memory_amount) - Number(s.memory_amount)) / 1e03;
  }

  selectSimilarServerOption(event: any, updateURL: boolean = true) {
    this.selectedSimilarOption = event;
    switch(this.selectedSimilarOption.key) {
      case 'byScore':
        this.keeperAPI.getServerSimilarServers(this.serverDetails.vendor_id, this.serverDetails.api_reference, 'score', 7)
          .then((servers: any) => {
          this.similarServers = servers?.body;

        });
        break;
      case 'byPerformancePerPrice':
        this.keeperAPI.getServerSimilarServers(this.serverDetails.vendor_id, this.serverDetails.api_reference, 'score_per_price', 7)
        .then((servers: any) => {
          this.similarServers = servers?.body;
        });
      break;
      case 'bySpecs':
        this.keeperAPI.getServerSimilarServers(this.serverDetails.vendor_id, this.serverDetails.api_reference, 'specs', 7)
        .then((servers: any) => {
          this.similarServers = servers?.body;
        });
        break;
    }

    if(updateURL) {
      if(this.selectedSimilarOption.key !== this.similarOptions[0].key) {
        this.location.go(`server/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}`, `similarCategory=${this.selectedSimilarOption.key}`);
      } else {
        this.location.go(`server/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}`);
      }
    }

    this.dropdownSimilar?.hide();
  }

  activeFAQChanged(event: any) {
    this.activeFAQ = event;
    if(this.activeFAQ > -1) {
      this.location.go(`server/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}`, `openFAQ=${event}`);
    } else {
      this.location.go(`server/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}`);
    }
  }

  openModal() {
    this.modalEmbed?.show();
  }

  closeModal(confirm: boolean) {
    this.modalEmbed?.hide();
  }

}
