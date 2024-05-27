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

  availabilityDatacenters: any[] = [];
  availabilityZones: any[] = [];
  pricesPerZone: any[] = [];

  dropdownAllocation: any;
  dropdownAllocation2: any;
  allocationFilters: any[] = [
    { name: 'Spot', selected: true },
    { name: 'Ondemand', selected: true }
  ];

  datacenterDropdown: any;
  datacenterFilters: any[] = [];

  @ViewChild('chart1') chart!: BaseChartDirective<'bar'> | undefined;
  @ViewChild('chart2') chart2!: BaseChartDirective<'bar'> | undefined;
  @ViewChild('chart3') chart3!: BaseChartDirective<'bar'> | undefined;

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {
        ticks: {
          color: '#FFF',
        },
        grid: {
          color: '#4B5563',
        },
      },
      y: {
        ticks: {
          color: '#FFF',
        },
        grid: {
          color: '#4B5563',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#FFF',
        }
      }
    },
  };
  public barChartType = 'bar' as const;

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Spot', backgroundColor: '#34D399'},
      { data: [], label: 'Ondemand', backgroundColor: '#E5E7EB'},
    ],
  };

  public barChartData2: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Spot', backgroundColor: '#34D399'},
      { data: [], label: 'Ondemand', backgroundColor: '#E5E7EB'},
    ],
  };

  public barChartData3: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Spot', backgroundColor: '#34D399'},
      { data: [], label: 'Ondemand', backgroundColor: '#E5E7EB'},
    ],
  };

  similarByFamily: Server[] = [];
  similarByPerformance: Server[] = [];

  openApiJson: any = require('../../../../sdk/openapi.json');
  instanceProperties: any[] = [];

  tooltipContent = '';

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

      this.keepreAPI.getServerMeta().then((data) => {
        this.instanceProperties = data?.body?.fields || [];
      });

      this.keepreAPI.getServer(vendor, id).then((data) => {
        if(data?.body){
          this.serverDetails = data.body as any;
          this.breadcrumbs[2] =
            { name: this.serverDetails.display_name, url: '/server/' + this.serverDetails.vendor.vendor_id + '/' + this.serverDetails.server_id };

          this.features = [];
          if(this.serverDetails.cpu_cores || this.serverDetails.vcpus) {
            this.features.push({name: 'vCPU', value: `${this.serverDetails.vcpus || this.serverDetails.cpu_cores}`});
          }
          if(this.serverDetails.memory) {
            this.features.push({name: 'Memory', value: this.getMemory()});
          }
          if(this.serverDetails.storage_size) {
            this.features.push({name: 'Storage', value: this.getStorage()});
          }
          if(this.serverDetails.gpu_count) {
            this.features.push({name: 'GPU', value: this.serverDetails.gpu_count});
          }

          this.datacenterFilters = [];
          this.serverDetails.prices.sort((a, b) => a.price - b.price);
          this.serverDetails.prices.forEach((price: ServerPricePKs) => {
              const datacenter = this.datacenterFilters.find((z) => z.datacenter_id === price.datacenter_id);
              if(!datacenter) {
                this.datacenterFilters.push({name: price.datacenter.display_name, datacenter_id: price.datacenter_id, selected: false});
              }
            });

          this.datacenterFilters[0].selected = true;

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
              answer: `The pricing for ${this.serverDetails.display_name} servers starts at $${this.serverDetails.prices[0].price} per hour, but the actual price depends on the selected datacenter, zone and server allocation method (e.g. on-demand versus spot pricing options). Currently, the maximum price stands at $${this.serverDetails.prices.slice(-1)[0].price}.`
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
                if(a.memory && b.memory && a.memory !== b.memory) {
                  return a.memory - b.memory
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
                return Math.abs(Number(this.serverDetails.memory) - Number(a.memory)) - Math.abs(Number(this.serverDetails.memory) - Number(b.memory));
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
              const targetElAllocation: HTMLElement | null = document.getElementById('datacenter_options');
              const triggerElAllocation: HTMLElement | null = document.getElementById('datacenter_button');

              if(targetElAllocation && triggerElAllocation) {
                this.datacenterDropdown = new Dropdown(
                  targetElAllocation,
                  triggerElAllocation,
                  options,
                  {
                    id: 'datacenter_options',
                    override: true
                  }
                );
                clearInterval(interval3);
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
    return ((memory || this.serverDetails.memory || 0) / 1024).toFixed(1) + 'GB';
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
    this.availabilityDatacenters = [];
    if(this.serverDetails.prices.length > 0) {

    this.serverDetails.prices.forEach((price: ServerPricePKs) => {
    const zone = this.availabilityDatacenters.find((z) => z.datacenter_id === price.datacenter_id);
      if(!zone) {
        const data: any = {
          datacenter_id: price.datacenter_id,
          display_name: price.datacenter.display_name,
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

        this.availabilityDatacenters.push(data);
      } else {
        zone[price.allocation || 'spot'].price += price.price;
        zone[price.allocation || 'spot'].count++;
      }
    });

    this.availabilityDatacenters.forEach((zone: any) => {
      if(zone.spot.count)
        zone.spot.price = Math.round(zone.spot.price / zone.spot.count * 1000000) / 1000000;
      if(zone.ondemand.count)
        zone.ondemand.price = Math.round(zone.ondemand.price / zone.ondemand.count * 1000000) / 1000000;
    });

    this.availabilityDatacenters.sort((a, b) => a.datacenter_id - b.datacenter_id);

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

    this.availabilityDatacenters.forEach((zone: any) => {
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
          datacenter_id: price.datacenter_id,
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

    this.availabilityZones.sort((a, b) => a.datacenter_id - b.datacenter_id);

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
      if(this.datacenterFilters.find((z) => z.datacenter_id === zone.datacenter_id)?.selected) {
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
    const description = this.instanceProperties?.find(x => x.name === content)?.description;
    if(description) {
      const tooltip = this.tooltip.nativeElement;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().top - 45 + scrollPosition}px`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';

      this.tooltipContent = description;
    }
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }
}
