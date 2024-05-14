import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { ServerPKsWithPrices, ServerPrice } from '../../../../sdk/data-contracts';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FaqComponent } from '../../components/faq/faq.component';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent, NgApexchartsModule } from "ng-apexcharts";
import { chartOptions1, chartOptions2, chartOptions3 } from './chartOptions';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownOptions } from 'flowbite';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};

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
  imports: [BreadcrumbsComponent, CommonModule, LucideAngularModule, FaqComponent, NgApexchartsModule, FormsModule],
  templateUrl: './server-details.component.html',
  styleUrl: './server-details.component.scss'
})
export class ServerDetailsComponent {

  serverDetails!: ServerPKsWithPrices;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Servers', url: '/servers' }
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

  datacenterDropwdown: any;
  datacenterFilters: any[] = [];

  public chartOptions: ChartOptions | any;
  public chartOptions2: ChartOptions | any;
  public chartOptions3: ChartOptions | any;


  @ViewChild('chart1') chart!: ChartComponent;
  @ViewChild('chart2') chart2!: ChartComponent;
  @ViewChild('chart3') chart3!: ChartComponent;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private route: ActivatedRoute,
              private keepreAPI: KeeperAPIService,
              private SEOHandler: SeoHandlerService) {

    this.chartOptions = chartOptions2;
    this.chartOptions2 = chartOptions3;
    this.chartOptions3 = chartOptions1;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params);
      let vendor = params['vendor'];
      let id = params['id'];

      this.keepreAPI.getServer(vendor, id).then((data) => {
        console.log('server', data);
        if(data?.body){
          this.serverDetails = data.body as any;
          this.breadcrumbs = [
            { name: 'Home', url: '/' },
            { name: 'Servers', url: '/servers' },
            { name: this.serverDetails.server_id, url: '/server/' + this.serverDetails.vendor.vendor_id + '/' + this.serverDetails.server_id }
          ];

          this.title = `${this.serverDetails.display_name} by ${this.serverDetails.vendor.name} - Spare Cores`;
          this.description =
            `${this.serverDetails.display_name} is a ${this.serverDetails.description} instance by ${this.serverDetails.vendor.name} with${this.serverDetails.cpu_cores ? ' ' + this.serverDetails.cpu_cores + 'CPUs' : ''}${this.serverDetails.vcpus ? ' ' + this.serverDetails.vcpus + 'vCPUs' : ''}, ${this.getMemory()} of memory and ${this.getStorage()} of storage.`;

          this.features = [];
          if(this.serverDetails.memory) {
            this.features.push({name: 'Memory', value: this.getMemory()});
          }
          if(this.serverDetails.storage_size) {
            this.features.push({name: 'Storage', value: this.getStorage()});
          }
          if(this.serverDetails.cpu_cores || this.serverDetails.vcpus) {
            this.features.push({name: 'CPU', value: `${this.serverDetails.cpu_cores || this.serverDetails.vcpus}x`});
          }

          let keywords = this.title + ', ' + this.serverDetails.server_id + ', ' + this.serverDetails.vendor.vendor_id;

          this.SEOHandler.updateTitleAndMetaTags(this.title, this.description, keywords);

          this.faqs = [
            {
              question: `What is ${this.serverDetails.display_name}?`,
              answer: this.description
            },
            {
              question: `How much does ${this.serverDetails.display_name} cost?`,
              answer: `${this.serverDetails.display_name} prices starting at $0.00001 per hour as spot instance.`
            },
            {
              question: `What is ${this.serverDetails.display_name} instance specification?`,
              answer: `${this.serverDetails.display_name} has ${this.serverDetails.cpu_cores || this.serverDetails.vcpus} CPUs, ${this.getMemory()} of memory and ${this.getStorage()} of storage.`
            }
          ];

          this.datacenterFilters = [];
          this.serverDetails.prices.forEach((price: ServerPrice) => {
              let datacenter = this.datacenterFilters.find((z) => z.datacenter_id === price.datacenter_id);
              if(!datacenter) {
                this.datacenterFilters.push({datacenter_id: price.datacenter_id, name: price.datacenter_id, selected: false});
              }
            });

            this.datacenterFilters[0].selected = true;

          this.refreshGraphs();

          if(isPlatformBrowser(this.platformId)) {
            let interval = setInterval(() => {
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
                console.log('dropdownAllocation', this.dropdownAllocation);
              }
            }, 150);

            let interval2 = setInterval(() => {
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
                console.log('dropdownAllocation', this.dropdownAllocation2);
              }
            }, 150);

            let interval3 = setInterval(() => {
              const targetElAllocation: HTMLElement | null = document.getElementById('datacenter_options');
              const triggerElAllocation: HTMLElement | null = document.getElementById('datacenter_button');

              if(targetElAllocation && triggerElAllocation) {
                this.datacenterDropwdown = new Dropdown(
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


  getMemory() {
    return ((this.serverDetails.memory || 0) / 1024).toFixed(1) + 'GB';
  }

  getStorage() {
    if(!this.serverDetails.storage_size) return '-';

    if(this.serverDetails.storage_size < 1000) return `${this.serverDetails.storage_size}GB`;

    return `${(this.serverDetails.storage_size / 1000).toFixed(1)}TB`;
  }

  openBox(boxId: string) {
    let el = document.getElementById(boxId);
    if(el) {
      el.classList.toggle('open');
    }
    let el2 = document.getElementById(boxId+'_more');
    if(el2) {
      el2.classList.toggle('hidden');
    }
    let el3 = document.getElementById(boxId+'_less');
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

    this.serverDetails.prices.sort((a, b) => a.price - b.price);

    this.serverDetails.prices.forEach((price: ServerPrice) => {
    let zone = this.availabilityDatacenters.find((z) => z.datacenter_id === price.datacenter_id);
      if(!zone) {
        let data: any = {
          datacenter_id: price.datacenter_id,
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

    let series: any = [];

    if(this.allocationFilters[0].selected) {
      series.push({  name: "Spot",
        data: [],
        color: '#34D399'});
    }

    if(this.allocationFilters[1].selected) {
      series.push({  name: "Ondemand",
        data: [],
        color: '#E5E7EB'});
    }

    console.log('series', series);

    let categories: any = [];

    let spotIdx = series.findIndex((s: any) => s.name === 'Spot');
    let ondemandIdx = series.findIndex((s: any) => s.name === 'Ondemand');

    this.availabilityDatacenters.forEach((zone: any) => {
      categories.push(zone.datacenter_id);
      if(spotIdx > -1) {
        series[spotIdx].data.push(zone.spot?.price || 0);
      }
      if(ondemandIdx > -1)
      {
        series[ondemandIdx].data.push(zone.ondemand?.price || 0);
      }
    });

    this.chartOptions.xaxis.categories = categories;
    this.chartOptions.series = series;

    this.chart?.updateOptions(this.chartOptions, true, true, true);

    }
  }

  updateChart2() {
    this.availabilityZones = [];
    if(this.serverDetails.prices.length > 0) {

    this.serverDetails.prices.sort((a, b) => a.price - b.price);

    this.serverDetails.prices.forEach((price: ServerPrice) => {
    let zone = this.availabilityZones.find((z) => z.zone_id === price.zone_id);
      if(!zone) {
        let data: any = {
          zone_id: price.zone_id,
          datacenter_id: price.datacenter_id,
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

    let series: any = [];

    if(this.allocationFilters[0].selected) {
      series.push({  name: "Spot",
        data: [],
        color: '#34D399'});
    }

    if(this.allocationFilters[1].selected) {
      series.push({  name: "Ondemand",
        data: [],
        color: '#E5E7EB'});
    }



    let categories: any = [];

    let spotIdx = series.findIndex((s: any) => s.name === 'Spot');
    let ondemandIdx = series.findIndex((s: any) => s.name === 'Ondemand');

    this.availabilityZones.forEach((zone: any) => {
      if(this.datacenterFilters.find((z) => z.name === zone.datacenter_id)?.selected) {
        categories.push(zone.zone_id);
        if(spotIdx > -1) {
          series[spotIdx].data.push(zone.spot?.price || 0);
        }
        if(ondemandIdx > -1)
        {
          series[ondemandIdx].data.push(zone.ondemand?.price || 0);
        }
      }
    });

    console.log('series2', series);

    this.chartOptions2.xaxis.categories = categories;
    this.chartOptions2.series = series;

    this.chart2?.updateOptions(this.chartOptions2, true, true, true);

    }
  }

  updateChart3() {
    let pricesPerZone: any[] = [];
    if(this.serverDetails.prices.length > 0) {


    for(let i = 0; i < this.serverDetails.prices.length && i < 10; i++) {
      let price = this.serverDetails.prices[i];
      let zone = pricesPerZone.find((z) => z.zone_id === price.zone_id);
      if(!zone) {
        let data: any = {
          zone_id: price.zone_id,
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
    };

    pricesPerZone.forEach((zone: any) => {
      if(zone.spot.count)
        zone.spot.price = Math.round(zone.spot.price / zone.spot.count * 1000000) / 1000000;
      if(zone.ondemand.count)
        zone.ondemand.price = Math.round(zone.ondemand.price / zone.ondemand.count * 1000000) / 1000000;
    });

    let series: any = [{
        name: "Spot",
        data: [],
        color: '#34D399'
      },
      {
        name: "Ondemand",
        data: [],
        color: '#E5E7EB'
      }
    ];
    let categories: any = [];

    pricesPerZone.forEach((zone: any) => {
      categories.push(zone.zone_id);
      series[0].data.push(zone.spot?.price || 0);
      series[1].data.push(zone.ondemand?.price || 0);
    });

    this.chartOptions3.xaxis.categories = categories;
    this.chartOptions3.series = series;

    this.chart3?.updateOptions(this.chartOptions3, true, true, true);
  }
  }

}
