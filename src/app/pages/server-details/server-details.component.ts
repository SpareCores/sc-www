/* eslint-disable prefer-const */
import { Component, ElementRef, Inject, PLATFORM_ID, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { Server, ServerPKsWithPrices, ServerPricePKs, TableServerTableServerGetData } from '../../../../sdk/data-contracts';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FaqComponent } from '../../components/faq/faq.component';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownOptions, initFlowbite } from 'flowbite';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { barChartDataEmpty, barChartOptions, barChartOptionsSSL, lineChartOptionsBWM, lineChartOptionsComp, lineChartOptionsCompRatio, radarChartOptions, radatDatasetColors } from './chartOptions';

const options: DropdownOptions = {
  placement: 'bottom',
  triggerType: 'click',
  offsetSkidding: 0,
  offsetDistance: 10,
  delay: 300
};

@Component({
  selector: 'app-server-details',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, LucideAngularModule, FaqComponent, FormsModule, RouterModule, BaseChartDirective],
  templateUrl: './server-details.component.html',
  styleUrl: './server-details.component.scss'
})
export class ServerDetailsComponent implements OnInit {

  serverDetails!: ServerPKsWithPrices;

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

  regionDropdown: any;
  regionFilters: any[] = [];

  similarByFamily: Server[] = [];
  similarByPerformance: Server[] = [];

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
    { name: 'Compress', key: 'compression_text:compress' },
    { name: 'Decompress', key: 'compression_text:decompress' },
    { name: 'Ratio', key: 'compression_text:ratio' }
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

  @ViewChild('tooltipDefault') tooltip!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private route: ActivatedRoute,
              private keepreAPI: KeeperAPIService,
              private SEOHandler: SeoHandlerService) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const vendor = params['vendor'];
      const id = params['id'];

      Promise.all([
        this.keepreAPI.getServerMeta(),
        this.keepreAPI.getServerBenchmarkMeta(),
        this.keepreAPI.getServer(vendor, id)])
      .then((dataAll) => {
        this.instanceProperties = dataAll[0].body?.fields || [];

        this.benchmarkMeta = dataAll[1].body || {};

        console.log(dataAll);

        if(dataAll[2].body){
          this.serverDetails = dataAll[2].body as any;
          this.breadcrumbs[2] =
            { name: this.serverDetails.display_name, url: '/server/' + this.serverDetails.vendor.vendor_id + '/' + this.serverDetails.server_id };

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
            const value = this.getProperty(p.id);
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


          console.log(this.benchmarksByCategory);


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
            this.description += ` The pricing starts at $${this.serverDetails.prices[0].price} per hour.`;
          }

          this.faqs = [
            {
              question: `What is ${this.serverDetails.display_name}?`,
              answer: this.description
            },
            {
              question: `How much does the ${this.serverDetails.display_name} server cost?`,
              answer: `The pricing for ${this.serverDetails.display_name} servers starts at $${this.serverDetails.prices[0].price} per hour, but the actual price depends on the selected region, zone and server allocation method (e.g. on-demand versus spot pricing options). Currently, the maximum price stands at $${this.serverDetails.prices.slice(-1)[0].price}.`
            },
            {
              question: `What are the specs of the ${this.serverDetails.display_name} server?`,
              answer: `The ${this.serverDetails.display_name} server is equipped with ${this.serverDetails.vcpus || this.serverDetails.cpu_cores} vCPU(s), ${this.getMemory()} of memory, ${this.getStorage()} of storage, and ${this.serverDetails.gpu_count} GPU(s). Additional block storage can be attached as needed.`
            }
          ];

          const keywords = this.title + ', ' + this.serverDetails.server_id + ', ' + this.serverDetails.vendor.vendor_id;

          this.SEOHandler.updateTitleAndMetaTags(this.title, this.description, keywords);

          this.similarByFamily = [];
          this.similarByPerformance = [];
          this.keepreAPI.getServers().then((data) => {
            if(data?.body) {
              const allServers = data.body as TableServerTableServerGetData;
              allServers.forEach((s) => {
                if(s.family === this.serverDetails.family && s.server_id !== this.serverDetails.server_id) {
                  if(this.similarByFamily.length < 7 && this.similarByFamily.findIndex((s2) => s2.server_id === s.server_id) === -1) {
                    this.similarByFamily.push(s);
                  }
                } else {
                  if(
                    (this.serverDetails.vcpus && s.vcpus === this.serverDetails.vcpus)
                      && s.server_id !== this.serverDetails.server_id) {
                      this.similarByPerformance.push(s);
                  }
                }
              });
              this.similarByFamily = this.similarByFamily.sort((a, b) => {
                if(a.memory_amount && b.memory_amount && a.memory_amount !== b.memory_amount) {
                  return a.memory_amount - b.memory_amount
                } else if(a.vcpus && b.vcpus && a.vcpus !== b.vcpus) {
                  return a.vcpus - b.vcpus
                } else if(a.cpu_cores && b.cpu_cores && a.cpu_cores !== b.cpu_cores) {
                  return a.cpu_cores - b.cpu_cores
                } else {
                  return 0;
                }
              });
              // search for servers with the closest amount of memory
              this.similarByPerformance = this.similarByPerformance.sort((a, b) => {
                return Math.abs(Number(this.serverDetails.memory_amount) - Number(a.memory_amount)) - Math.abs(Number(this.serverDetails.memory_amount) - Number(b.memory_amount));
              });
              this.similarByPerformance = this.similarByPerformance.slice(0, 7);

              if (this.similarByFamily) {
                this.faqs.push(
                  {
                    question: `Are there any other sized servers in the ${this.serverDetails.family} server family?`,
                    html: `Yes! In addition to the ${this.serverDetails.display_name} server, the ${this.serverDetails.family} server family includes ${this.similarByFamily.length} other sizes: ${this.similarByFamily.map((s) => this.serverUrl(s)).join(', ')}.`
                  });
              }

              this.faqs.push(
                {
                  question: `What other servers offer similar performance to ${this.serverDetails.display_name}?`,
                  html: `Looking at the number of vCPUs and GPUs, also the amount of memory, the following servers come with similar specs: ${this.similarByPerformance.map((s) => this.serverUrl(s)).join(', ')}.`
                });

            }
          });

          if(isPlatformBrowser(this.platformId)) {

            this.generateBenchmarkCharts();

            setTimeout(() => {
              initFlowbite();
            }, 2000);

            const interval = setInterval(() => {
              const targetElAllocation: HTMLElement | null = document.getElementById('allocation_options');
              const triggerElAllocation: HTMLElement | null = document.getElementById('allocation_button');

              if(targetElAllocation && triggerElAllocation) {
                this.dropdownAllocation = new Dropdown(
                  targetElAllocation,
                  triggerElAllocation,
                  options,
                  {
                    id: 'allocation_options',
                    override: true
                  }
                );
                clearInterval(interval);
              }
            }, 150);

            const interval2 = setInterval(() => {
              const targetElAllocation: HTMLElement | null = document.getElementById('allocation_options2');
              const triggerElAllocation: HTMLElement | null = document.getElementById('allocation_button2');

              if(targetElAllocation && triggerElAllocation) {
                this.dropdownAllocation2 = new Dropdown(
                  targetElAllocation,
                  triggerElAllocation,
                  options,
                  {
                    id: 'allocation_options2',
                    override: true
                  }
                );
                clearInterval(interval2);
              }
            }, 150);

            const interval3 = setInterval(() => {
              const targetElAllocation: HTMLElement | null = document.getElementById('region_options');
              const triggerElAllocation: HTMLElement | null = document.getElementById('region_button');

              if(targetElAllocation && triggerElAllocation) {
                this.regionDropdown = new Dropdown(
                  targetElAllocation,
                  triggerElAllocation,
                  options,
                  {
                    id: 'region_options',
                    override: true
                  }
                );
                clearInterval(interval3);
              }
            }, 150);

            const interval4 = setInterval(() => {
              const targetElCompress: HTMLElement | null = document.getElementById('compress_method_options');
              const triggerElCompress: HTMLElement | null = document.getElementById('compress_method_button');

              if(targetElCompress && triggerElCompress) {
                this.compressDropdown = new Dropdown(
                  targetElCompress,
                  triggerElCompress,
                  options,
                  {
                    id: 'compress_method_options',
                    override: true
                  }
                );
                clearInterval(interval4);
              }
            }, 150);

          }
        }
      });
    });
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  getMemory(memory: number | undefined = undefined) {
    return ((memory || this.serverDetails.memory_amount || 0) / 1024).toFixed(1) + 'GB';
  }

  getStorage() {
    if(!this.serverDetails.storage_size) return '0GB';

    if(this.serverDetails.storage_size < 1000) return `${this.serverDetails.storage_size}GB`;

    return `${(this.serverDetails.storage_size / 1000).toFixed(1)}TB`;
  }

  serverUrl(server: Server): string {
    return(`<a class="underline decoration-dotted hover:text-gray-500"
      href="/server/${server.vendor_id}/${server.server_id}">
      ${server.display_name}</a>`)
  }

  openBox(boxId: string) {
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
      if(!zone) {
        const data: any = {
          region_id: price.region_id,
          display_name: price.region.display_name,
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

        this.availabilityRegions.push(data);
      } else {
        zone[price.allocation || 'spot'].price += price.price;
        zone[price.allocation || 'spot'].count++;
      }
    });

    this.availabilityRegions.forEach((zone: any) => {
      if(zone.spot.count)
        zone.spot.price = Math.round(zone.spot.price / zone.spot.count * 1000000) / 1000000;
      if(zone.ondemand.count)
        zone.ondemand.price = Math.round(zone.ondemand.price / zone.ondemand.count * 1000000) / 1000000;
    });

    this.availabilityRegions.sort((a, b) => a.region_id - b.region_id);

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

    this.availabilityZones.sort((a, b) => a.region_id - b.region_id);

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

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

  getProperty(name: string) {
    const prop = (this.serverDetails as any)[name];

    if(prop === undefined || prop === null) {
      return undefined;
    }

    if( typeof prop === 'number' || typeof prop === 'string') {
      return prop;
    }
    if(Array.isArray(prop)) {
      return prop.join(', ');
    }

    return '-';
  }

  refreshCompressChart(chart: any) {
    this.selectedCompressMethod = chart;
    this.generateCompressChart();
  }

  generateBenchmarkCharts() {

    const BWMemData = this.generateLineChart('bw_mem', 'operation', 'size');

    if(BWMemData) {
      this.lineChartDataBWmem = { labels: BWMemData.labels, datasets: BWMemData.datasets };
    } else {
      this.lineChartDataBWmem = undefined;
    }

    let data = this.generateLineChart('openssl', 'block_size', 'algo', false);

    console.log('openSSL', data);
    if(data) {
      this.barChartDataSSL = { labels: data.labels, datasets: data.datasets };
    } else {
      this.barChartDataSSL = undefined;
    }

    this.generateCompressChart();
    this.generateGeekbenchChart();
  }

  generateCompressChart() {
    let data: any;
    switch(this.selectedCompressMethod.key) {
      case 'compression_text:compress':
        data = this.generateLineChart('compression_text:compress', 'algo', 'compression_level');
        this.lineChartOptionsCompress = lineChartOptionsComp;
        break;
      case 'compression_text:decompress':
        data = this.generateLineChart('compression_text:decompress', 'algo', 'compression_level');
        this.lineChartOptionsCompress = lineChartOptionsComp;
        break;
      case 'compression_text:ratio':
        data = this.generateLineChart('compression_text:ratio', 'algo', 'compression_level');
        this.lineChartOptionsCompress = lineChartOptionsCompRatio;
        break;
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


      if(labels && !isNaN(labels[0])) {
        labels.sort((a, b) => a - b);
      }

      scales.sort((a, b) => a - b);

      let charData: any = {
        labels: scales.map((s) => s.toString()),
        datasets: labels.map((label: string, index: number) => {
          return {
            data: [],
            label: label,
            spanGaps: isLineChart,
            borderColor: radatDatasetColors[index].borderColor,
            backgroundColor: isLineChart ? radatDatasetColors[index].backgroundColor : radatDatasetColors[index].borderColor };
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

      console.log(charData);

      return charData;

    } else {
      this.lineChartDataCompress = undefined;

      return undefined;
    }
  }

  generateGeekbenchChart() {
    const dataSet = this.benchmarksByCategory?.filter(x => (x.benchmark_id as string).includes('geekbench'));

    if(dataSet && dataSet.length) {
      let labels: string[] = [];
      let scales: string[] = [];

      const geekBenchScore = dataSet.find(x => (x.benchmark_id as string).includes('geekbench:score'));

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
            borderColor: radatDatasetColors[index].borderColor,
            backgroundColor: radatDatasetColors[index].backgroundColor};
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

      console.log('chartdata', charData);

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
}
