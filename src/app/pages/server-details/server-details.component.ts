/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { Component, ElementRef, Inject, PLATFORM_ID, OnInit, ViewChild, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { GetSimilarServersServerVendorServerSimilarServersByNGetData, Server, ServerPKs, ServerPKsWithPrices, ServerPricePKs, TableServerTableServerGetData } from '../../../../sdk/data-contracts';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FaqComponent } from '../../components/faq/faq.component';
import { FormsModule } from '@angular/forms';
import { DropdownOptions, initFlowbite } from 'flowbite';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { barChartDataEmpty, barChartOptions, barChartOptionsSSL, barChartOptionsStaticWeb, lineChartOptionsBWM, lineChartOptionsComp, lineChartOptionsCompRatio, radarChartOptions, radarDatasetColors } from './chartOptions';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { DomSanitizer } from '@angular/platform-browser';
import { ReduceUnitNamePipe } from '../../pipes/reduce-unit-name.pipe';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { ServerCompareService } from '../../services/server-compare.service';
import { initGiscus } from '../../tools/initGiscus';
import { Location } from '@angular/common';
import { DropdownManagerService } from '../../services/dropdown-manager.service';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-server-details',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, LucideAngularModule, FaqComponent, FormsModule, RouterModule, BaseChartDirective, ReduceUnitNamePipe, CountryIdtoNamePipe],
  templateUrl: './server-details.component.html',
  styleUrl: './server-details.component.scss'
})
export class ServerDetailsComponent implements OnInit, OnDestroy {

  serverDetails!: ServerPKsWithPrices;
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

  similarByFamily: GetSimilarServersServerVendorServerSimilarServersByNGetData = [];
  similarBySpecs: GetSimilarServersServerVendorServerSimilarServersByNGetData = [];

  similarServers: GetSimilarServersServerVendorServerSimilarServersByNGetData = [];

  dropdownSimilar: any;
  similarOptions: any[] = [
    {name: 'By GPU, CPU and memory specs', key: 'bySpecs'},
    {name: 'By CPU performance', key: 'byScore'},
    //{name: 'By CPU performance per price', key: 'byPerformancePerPrice'}
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

  benchmarksByCategory: any[] = [];

  instanceProperties: any[] = [];
  benchmarkMeta: any;

  tooltipContent = '';

  // benchmark charts
  compressDropdown: any;
  compressMethods: any[] = [
    { name: 'Compression speed', key: 'compress', order: 'Higher is better.', icon: 'circle-arrow-up' },
    { name: 'Decompression speed', key: 'decompress', order: 'Higher is better.', icon: 'circle-arrow-up' },
    { name: 'Compression ratio', key: 'ratio', order: 'Lower is better.', icon: 'circle-arrow-down' },
    { name: 'Compression speed/ratio', key: 'ratio_compress', order: 'Higher is better.', icon: 'circle-arrow-up' },
    { name: 'Decompression speed/ratio', key: 'ratio_decompress', order: 'Higher is better.', icon: 'circle-arrow-up' },
  ];
  selectedCompressMethod = this.compressMethods[0];

  geekScoreSingle: string = '0';
  geekScoreMulti: string = '0';

  barChartOptions: ChartConfiguration<'bar'>['options'] = barChartOptions;
  barChartType = 'bar' as const;
  barChartData: ChartData<'bar'> = JSON.parse(JSON.stringify(barChartDataEmpty));
  barChartData2: ChartData<'bar'> = JSON.parse(JSON.stringify(barChartDataEmpty));
  barChartData3: ChartData<'bar'> = JSON.parse(JSON.stringify(barChartDataEmpty));

  radarChartType = 'radar' as const;
  radarChartOptions: ChartConfiguration<'radar'>['options'] = radarChartOptions;
  radarChartOptions2: ChartConfiguration<'radar'>['options'] = radarChartOptions;
  radarChartDataBWMem: ChartData<'radar'> | undefined = undefined;
  radarChartDataGeekMulti: ChartData<'radar'> | undefined = undefined;
  radarChartDataGeekSingle: ChartData<'radar'> | undefined = undefined;

  lineChartType = 'line' as const;
  lineChartOptionsBWMem: ChartConfiguration<'line'>['options'] = lineChartOptionsBWM;
  lineChartDataBWmem: ChartData<'line'> | undefined = undefined;

  lineChartOptionsCompress: ChartConfiguration<'line'>['options'] = lineChartOptionsComp;
  lineChartDataCompress: ChartData<'line'> | undefined = undefined;

  barChartOptionsSSL: ChartConfiguration<'bar'>['options'] = barChartOptionsSSL;
  barChartDataSSL: ChartData<'bar'> | undefined = undefined;

  barChartOptionsStaticWeb: ChartConfiguration<'bar'>['options'] = barChartOptionsStaticWeb;
  barChartDataStaticWeb: ChartData<'bar'> | undefined = undefined;

  geekbenchHTML: any;

  toastErrorMsg: string = 'Failed to load server data. Please try again later.';

  activeFAQ: number = -1;

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  @ViewChild('tooltipGeekbench') tooltipGB!: ElementRef;
  @ViewChild('giscusParent') giscusParent!: ElementRef;
  @ViewChild('toastDanger') toastDanger!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              @Inject(DOCUMENT) private document: Document,
              private route: ActivatedRoute,
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
        this.keeperAPI.getServer(vendor, id),
        this.keeperAPI.getServerSimilarServers(vendor, id, 'family', 7),
        this.keeperAPI.getServerSimilarServers(vendor, id, 'specs', 7)
      ]).then((dataAll) => {
        this.instanceProperties = dataAll[0].body?.fields || [];

        this.benchmarkMeta = dataAll[1].body || {};

        this.similarByFamily = dataAll[3].body;
        this.similarBySpecs = dataAll[4].body;

        if(dataAll[2].body){
          this.serverDetails = dataAll[2].body as any;

          // list all regions where the server is available
          this.serverDetails.prices?.forEach((price: ServerPricePKs) => {
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
            const group = this.benchmarksByCategory.find((g) => g.benchmark_id === b.benchmark_id);
            if(!group) {
              this.benchmarksByCategory.push({benchmark_id: b.benchmark_id, benchmarks: [b]});
            } else {
              group.benchmarks.push(b);
            }
          });

          this.regionFilters = [];

          this.serverDetails.prices?.sort((a, b) => a.price - b.price);
          this.serverDetails.prices?.forEach((price: ServerPricePKs) => {
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

          this.refreshGraphs();

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
                html: `Yes! In addition to the ${this.serverDetails.display_name} server, the ${this.serverDetails.family} server family includes ${this.similarByFamily.length} other sizes: ${this.similarByFamily.map((s) => this.serverUrl(s, true)).join(', ')}.`
              });

          }

          if(this.similarBySpecs?.length > 0) {
            this.faqs.push(
              {
                question: `What other servers offer similar performance to ${this.serverDetails.display_name}?`,
                html: `Looking at the number of GPU, vCPUs, and memory amount, the following top 10 servers come with similar specs: ${this.similarBySpecs.map((s) => this.serverUrl(s, true)).join(', ')}.`
              });
          }

          this.generateSchemaJSON();

          if(isPlatformBrowser(this.platformId)) {

            this.generateBenchmarkCharts();

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

            setTimeout(() => {
              initFlowbite();

              let baseUrl = this.SEOHandler.getBaseURL();
              initGiscus(this.renderer, this.giscusParent, baseUrl, 'Servers', 'DIC_kwDOLesFQM4CgznN', 'pathname');

            }, 2000);

            this.selectSimilarServerOption(this.selectedSimilarOption);

            this.dropdownManager.initDropdown('allocation_button', 'allocation_options');

            this.dropdownManager.initDropdown('allocation_button2', 'allocation_options2');

            this.dropdownManager.initDropdown('region_button', 'region_options').then((dropdown) => {
              this.compressDropdown = dropdown;
            });

            this.dropdownManager.initDropdown('compress_method_button', 'compress_method_options').then((dropdown) => {
              this.compressDropdown = dropdown;
            });

            this.dropdownManager.initDropdown('similar_type_button', 'similar_server_options').then((dropdown) => {
              this.dropdownSimilar = dropdown;
            });
          }
        }
      }).catch((error) => {
        console.error('Failed to load server data:', error);
        if(error?.status === 404) {
          this.toastErrorMsg = 'Server not found. Please try again later.';
        }
        if(error?.status === 500) {
          this.toastErrorMsg = 'Internal server error. Please try again later.';
        } else {
          this.toastErrorMsg = 'Failed to load server data. Please try again later.';
        }
        if(isPlatformBrowser(this.platformId)) {
          this.showToast();
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
    return ((memoryAmount) / 1024).toFixed((memoryAmount ? 0 : 1)) + ' GiB';
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

  refreshGraphs() {
    this.updateChart1();
    this.updateChart2();
    this.updateChart3();
  }

  updateChart1() {
    this.availabilityRegions = [];
    if(this.serverDetails.prices.length > 0) {

    this.serverDetails.prices.forEach((price: ServerPricePKs) => {
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

    this.serverDetails.prices.forEach((price: ServerPricePKs) => {
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

  showTooltip(el: any, content: string) {
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

  showTooltipChart(el: any, type: string) {
    let content = this.benchmarkMeta.find((b: any) => b.benchmark_id === type)?.description;
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

  showTooltipGB(el: any) {
      const tooltip = this.tooltipGB.nativeElement;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      tooltip.style.left = `${20}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5 + scrollPosition}px`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

  hideTooltipGB() {
    const tooltip = this.tooltipGB.nativeElement;
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
        html += `<li>${s.size} GB ${s.storage_type ? s.storage_type : ''}</li>`;
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

  refreshCompressChart(chart: any) {
    this.selectedCompressMethod = chart;
    this.generateCompressChart();
    this.compressDropdown?.hide();
  }

  generateBenchmarkCharts() {

    const BWMemData = this.generateLineChart('bw_mem', 'operation', 'size');

    if(BWMemData) {
      this.lineChartDataBWmem = { labels: BWMemData.labels, datasets: BWMemData.datasets };

      if(this.lineChartOptionsBWMem?.plugins?.annotation) {
        if(this.serverDetails.cpu_l1_cache || this.serverDetails.cpu_l2_cache || this.serverDetails.cpu_l3_cache) {
          let annotations: any = { };
          if(this.serverDetails.cpu_l1_cache) {
            annotations.line1 = {
                  type: 'line',
                  scaleID: 'x',
                  borderWidth: 3,
                  borderColor: '#EF4444',
                  value: this.serverDetails.cpu_l1_cache / (1024 * 1024),
                  label: {
                    rotation: 'auto',
                    position: 'end',
                    content: 'L1 Cache',
                    backgroundColor: '#EF4444',
                    display: true
                  }
                }
          }
          if(this.serverDetails.cpu_l2_cache) {
            annotations.line2 = {
                  type: 'line',
                  scaleID: 'x',
                  borderWidth: 3,
                  borderColor: '#EF4444',
                  value: this.serverDetails.cpu_l2_cache / (1024 * 1024),
                  label: {
                    rotation: 'auto',
                    position: 'start',
                    content: 'L2 Cache',
                    backgroundColor: '#EF4444',
                    display: true
                  }
                }
          }
          if(this.serverDetails.cpu_l3_cache) {
            annotations.line3 = {
                  type: 'line',
                  scaleID: 'x',
                  borderWidth: 3,
                  borderColor: '#EF4444',
                  value: this.serverDetails.cpu_l3_cache / (1024 * 1024),
                  label: {
                    rotation: 'auto',
                    position: 'start',
                    content: 'L3 Cache',
                    backgroundColor: '#EF4444',
                    display: true
                  }
                }
          }
          this.lineChartOptionsBWMem.plugins.annotation = {
            annotations: annotations
          };
        }
      }

    } else {
      this.lineChartDataBWmem = undefined;
    }

    let data = this.generateLineChart('openssl', 'block_size', 'algo', false);

    if(data) {
      this.barChartDataSSL = { labels: data.labels, datasets: data.datasets };
    } else {
      this.barChartDataSSL = undefined;
    }

    let data2 = this.generateLineChart('app:static_web', 'size', 'threads_per_cpu', false);

    if(data2) {
      this.barChartDataStaticWeb = { labels: data2.labels, datasets: data2.datasets };
    } else {
      this.barChartDataStaticWeb = undefined;
    }

    this.generateCompressChart();
    this.generateGeekbenchChart();
  }

  generateCompressChart() {
    let dataSet1 = this.benchmarksByCategory?.find(x => x.benchmark_id === 'compression_text:ratio')?.benchmarks || [];

    if(!dataSet1 || !dataSet1.length) {
      this.lineChartDataCompress = undefined;
      return;
    }

    let dataSet2 = this.benchmarksByCategory?.find(x => x.benchmark_id === 'compression_text:compress')?.benchmarks || [];
    let dataSet3 = this.benchmarksByCategory?.find(x => x.benchmark_id === 'compression_text:decompress')?.benchmarks || [];

    dataSet1 = dataSet1?.filter((item: any) => {
      return !item.config.threads  || item.config.threads === 1;
    });

    dataSet2 = dataSet2?.filter((item: any) => {
      return !item.config.threads  || item.config.threads === 1;
    });

    dataSet3 = dataSet3?.filter((item: any) => {
      return !item.config.threads  || item.config.threads === 1;
    });

    let data: any = {
      labels: [],
      datasets: []
    };

    dataSet1.forEach((item: any) => {
      let found = data.datasets.find((d: any) => { return d.config.algo === item.config.algo });

      let tooltip = ``;
      Object.keys(item.config).forEach((key: string) => {
        if(key !== 'algo') {
          if(tooltip.length > 0){
            tooltip += ', ';
          }
          tooltip += `${key.replace('_', ' ')}: ${item.config[key]}`;
        }
      });

      if(!found) {
        data.datasets.push({
          data: [{
            config: item.config,
            ratio: Math.floor(item.score * 100) / 100,
            algo: item.config.algo,
            compression_level: item.config.compression_level,
            tooltip: tooltip
          }],
          label: item.config.algo,
          spanGaps: true,
          config: item.config,
          borderColor: radarDatasetColors[data.datasets.length].borderColor,
          backgroundColor: radarDatasetColors[data.datasets.length].backgroundColor
        });
      } else {
        found.data.push({
          config: item.config,
          ratio: Math.floor(item.score * 100) / 100,
          algo: item.config.algo,
          compression_level: item.config.compression_level,
          tooltip: tooltip
        });
      }
    });

    data.datasets.forEach((dataset: any) => {
      dataset.data.forEach((item: any) => {
        const item2 = dataSet2.find((dataItem: any) => {
          return Object.entries(item.config).every(([key, value]) => {
            return dataItem.config[key] === value;
          });
        });
        let item3 = dataSet3.find((dataItem: any) => {
          return Object.entries(item.config).every(([key, value]) => {
            return dataItem.config[key] === value;
          });
        });
        if(item2 && item3) {
          item.compress = item2.score;
          item.decompress = item3.score;
        }
      });
    });

    switch(this.selectedCompressMethod.key) {
      case 'compress':
      case 'decompress':
      case 'ratio': {
        let labels: any[] = [];
        dataSet1.forEach((item: any) => {
          if((item.config['compression_level'] || item.config['compression_level'] == 0) && labels.indexOf(item.config['compression_level']) === -1) {
            labels.push(item.config['compression_level']);
          }
        });

        data.datasets.forEach((dataset: any) => {
          dataset.data = dataset.data.sort((a: any, b: any) => a.compression_level - b.compression_level);
        });

        data.labels = labels.sort((a, b) => a - b);

        if((this.lineChartOptionsCompress as any).parsing.yAxisKey) {
          (this.lineChartOptionsCompress as any).parsing = {
            yAxisKey: this.selectedCompressMethod.key,
            xAxisKey: 'compression_level',
          };
          (this.lineChartOptionsCompress as any).scales.x.title.text = 'Compression Level';
          if(this.selectedCompressMethod.key === 'ratio') {
            (this.lineChartOptionsCompress as any).scales.y.title.text = 'Percentage';
          } else {
            (this.lineChartOptionsCompress as any).scales.y.title.text = 'byte/s';
          }
        }

        break;
      }
      case 'ratio_compress':
      case 'ratio_decompress': {
        let labels: any[] = [];

        data.datasets.forEach((dataset: any) => {
          dataset.data.forEach((item: any) => {
            if(item.ratio && labels.indexOf(item.ratio) === -1) {
              labels.push(item.ratio);
            }
          });
        });

        data.labels = labels.sort((a, b) => a - b);

        data.datasets.forEach((dataset: any) => {
          dataset.data = dataset.data.sort((a: any, b: any) => a.ratio - b.ratio);
        });

        if((this.lineChartOptionsCompress as any).parsing.yAxisKey) {
          (this.lineChartOptionsCompress as any).parsing = {
            yAxisKey:  this.selectedCompressMethod.key === 'ratio_compress' ? 'compress' : 'decompress',
            xAxisKey: 'ratio',
          };
          (this.lineChartOptionsCompress as any).scales.x.title.text = 'Compression Ratio';
          (this.lineChartOptionsCompress as any).scales.y.title.text = 'byte/s';
        }
      }
    }
    if(data) {
      this.lineChartDataCompress = { labels: data.labels, datasets: data.datasets };
    } else {
      this.lineChartDataCompress = undefined;
    }

  }

  generateLineChart(benchmark_id: string, labelsField: string, scaleField: string, isLineChart: boolean = true) {
    const dataSet = this.benchmarksByCategory?.find(x => x.benchmark_id === benchmark_id);
    if(dataSet && dataSet.benchmarks?.length) {
      let labels: any[] = [];
      let scales: number[] = [];
      dataSet.benchmarks.forEach((item: any) => {
        if(item.config[labelsField] && labels.indexOf(item.config[labelsField]) === -1) {
          labels.push(item.config[labelsField]);
        }
        if((item.config[scaleField] || item.config[scaleField] === 0) && scales.indexOf(item.config[scaleField]) === -1) {
          scales.push(item.config[scaleField]);
        }
      });


      if(labels) {
        labels.sort((a, b) => {
          if(!isNaN(a) && !isNaN(b)) {
            return a - b;
          }
          const valueA = parseInt(a.replace(/\D/g,''), 10);
          const valueB = parseInt(b.replace(/\D/g,''), 10);
          if(valueA && valueB) {
            return valueA - valueB;
          }

          return a.localeCompare(b);
        });
      }

      scales.sort((a, b) => a - b);

      let charData: any = {
        labels: scales, //scales.map((s) => s.toString()),
        datasets: labels.map((label: string, index: number) => {
          return {
            data: [],
            label: label,
            spanGaps: isLineChart,
            borderColor: radarDatasetColors[index].borderColor,
            backgroundColor: isLineChart ? radarDatasetColors[index].backgroundColor : radarDatasetColors[index].borderColor };
          })
      };

      labels.forEach((label: string, i: number) => {
        scales.forEach((size: number) => {
          const item = dataSet.benchmarks.find((b: any) => b.config[labelsField] === label && b.config[scaleField] === size);
          if(item) {
            charData.datasets[i].data.push(item.score);
          } else {
            charData.datasets[i].data.push(null);
          }
        });
      });

      return charData;

    } else {
      this.lineChartDataCompress = undefined;

      return undefined;
    }
  }

  generateGeekbenchChart() {
    const dataSet = this.benchmarksByCategory?.filter(x => (x.benchmark_id as string).includes('geekbench'));

    this.geekbenchHTML =
    `<div> The following benchmark scenarios were run using Geekbench 6: </div> <ul> `;

    let GBScoreText = this.benchmarkMeta.find((x: any) => x.benchmark_id === 'geekbench:score');
    if(GBScoreText) {
      const name: string = GBScoreText.name.replace('Geekbench:', '');
      const desc = GBScoreText.description.replace('The score is calibrated against a baseline score of 2,500 (Dell Precision 3460 with a Core i7-12700 processor) as per the Geekbench 6 Benchmark Internals.', '') || '';
      this.geekbenchHTML += `<li> - ${name}: ${desc} </li>`;
    }

    this.benchmarkMeta
      .filter((x: any) => x.benchmark_id.includes('geekbench') && x.benchmark_id !== 'geekbench:score')
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      ?.forEach((data: any) =>
      {
      const name: string = data.name.replace('Geekbench:', '');
      const desc = data.description.replace('The score is calibrated against a baseline score of 2,500 (Dell Precision 3460 with a Core i7-12700 processor) as per the Geekbench 6 Benchmark Internals.', '') || '';
      this.geekbenchHTML += `<li> - ${name}: ${desc} </li>`;
    });

    this.geekbenchHTML += `</ul>`;

    this.geekbenchHTML = this.sanitizer.bypassSecurityTrustHtml(this.geekbenchHTML);

    if(dataSet && dataSet.length) {
      let labels: string[] = [];
      let scales: string[] = [];

      const geekBenchScore = dataSet?.find(x => (x.benchmark_id as string).includes('geekbench:score'));

      if(geekBenchScore && geekBenchScore.benchmarks.length) {
        this.geekScoreSingle = this.numberWithCommas(geekBenchScore.benchmarks.find((x: any) => x.config.cores === 'Single-Core Performance')?.score || 0);
        this.geekScoreMulti = this.numberWithCommas(geekBenchScore.benchmarks.find((x: any) => x.config.cores === 'Multi-Core Performance')?.score || 0);
      }

      labels = dataSet.filter(x => x.benchmark_id !== 'geekbench:score').map(x => x.benchmark_id);
      scales = dataSet[0].benchmarks.sort((a: any, b:any) => (a.config.cores as string).localeCompare(b.config.cores)).map((b: any) => b.config.cores);

      let charData: any = {
        labels: labels
          .map((s) =>
            (this.benchmarkMeta.find((b: any) => b.benchmark_id === s)?.name || s)
              .replace('geekbench:', '')
              .replace('Geekbench: ', '')),
        datasets: scales.map((label: string, index: number) => {
          return {
            data: [],
            label: label,
            borderColor: radarDatasetColors[index].borderColor,
            backgroundColor: radarDatasetColors[index].backgroundColor};
          })
      };

      scales.forEach((size: string, i: number) => {
        labels.forEach((label: string) => {
          const item = dataSet.find((b: any) => b.benchmark_id === label)?.benchmarks.find((b: any) => b.config.cores === size);
          if(item) {
            charData.datasets[i].data.push({value: item.score, tooltip: item.note});
          } else {
            charData.datasets[i].data.push({value: 0});
          }
        });
      });

      this.radarChartDataGeekMulti = {
        labels: charData.labels,
        datasets: [charData.datasets[0]]
      };
      this.radarChartDataGeekSingle = {
        labels: charData.labels,
        datasets: [charData.datasets[1]]
      };

      return charData;
    } else {
      this.radarChartDataGeekMulti = undefined;
      this.radarChartDataGeekSingle = undefined;

      return undefined;
    }

  }

  public numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getBenchmark(isMulti: boolean) {
    if(!isMulti) {
      return this.serverDetails.benchmark_scores?.find((b) => b.benchmark_id === 'stress_ng:cpu_all' && (b.config as any)?.cores === 1)?.score?.toFixed(0) || '-';
    } else {
      return this.serverDetails.benchmark_scores?.find((b) => b.benchmark_id === 'stress_ng:cpu_all' && (b.config as any)?.cores === this.serverDetails.vcpus)?.score?.toFixed(0) || '-';
    }
  }

  addToCompare() {
    this.serverCompare.toggleCompare(!this.serverCompare.isSelected(this.serverDetails), this.serverDetails);
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
      json['isSimilarTo'] = this.similarByFamily.map((s) => {
        return {
          "@type": "Product",
          "name": `${s.display_name} (${s.vendor_id})`,
          "url": `https://www.sparecores.com/server/${s.vendor_id}/${s.api_reference}`
        }
      });
    }

    this.SEOHandler.setupStructuredData(this.document, [JSON.stringify(json)]);
  }

  showToast() {
    this.renderer.addClass(this.toastDanger.nativeElement, 'show');
  }

  diffBy(s: ServerPKs, field: keyof ServerPKs) {
    return Math.abs(Number(this.serverDetails[field]) - Number(s[field]));
  }

  diffSpec(s: ServerPKs) {
    return Math.abs(Number(this.serverDetails.gpu_count) - Number(s.gpu_count)) * 10e6 +
           Math.abs(Number(this.serverDetails.vcpus) - Number(s.vcpus)) * 10e3 +
           Math.abs(Number(this.serverDetails.memory_amount) - Number(s.memory_amount)) / 1e03;
  }

  selectSimilarServerOption(event: any) {
    this.selectedSimilarOption = event;
    switch(this.selectedSimilarOption.key) {
      case 'byScore':
        this.keeperAPI.getServerSimilarServers(this.serverDetails.vendor_id, this.serverDetails.api_reference, 'score', 7)
          .then((servers: any) => {
          this.similarServers = servers?.body;

        });
        break;
      /*
      case 'byPerformancePerPrice':

      break;
      */
      case 'bySpecs':
        this.keeperAPI.getServerSimilarServers(this.serverDetails.vendor_id, this.serverDetails.api_reference, 'specs', 7)
        .then((servers: any) => {
          this.similarServers = servers?.body;
        });
        break;
    }

    if(this.selectedSimilarOption.key !== this.similarOptions[1].key) {
      this.location.go(`server/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}`, `similarCategory=${this.selectedSimilarOption.key}`);
    } else {
      this.location.go(`server/${this.serverDetails.vendor_id}/${this.serverDetails.api_reference}`);
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

}
