/* eslint-disable prefer-const */
import { AfterViewInit, Component, ElementRef, HostBinding, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Allocation, ServerPKs, ServerPKsWithPrices } from '../../../../sdk/data-contracts';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { Chart, ChartConfiguration, ChartData, TooltipItem, TooltipModel } from 'chart.js';
import { barChartOptionsSSLCompare, lineChartOptionsBWM, lineChartOptionsCompareCompress, lineChartOptionsCompareDecompress, radarChartOptions, radarDatasetColors } from '../server-details/chartOptions';
import annotationPlugin from 'chartjs-plugin-annotation';
import { BaseChartDirective } from 'ng2-charts';
import { Dropdown, DropdownOptions } from 'flowbite';
import { DomSanitizer } from '@angular/platform-browser';
import { ServerCompareService } from '../../services/server-compare.service';

Chart.register(annotationPlugin);


const options: DropdownOptions = {
  placement: 'bottom',
  triggerType: 'click',
  offsetSkidding: 0,
  offsetDistance: 10,
  delay: 300
};

@Component({
  selector: 'app-server-compare',
  standalone: true,
  imports: [BreadcrumbsComponent, LucideAngularModule, CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './server-compare.component.html',
  styleUrl: './server-compare.component.scss',
})
export class ServerCompareComponent implements OnInit, AfterViewInit {

  @HostBinding('attr.ngSkipHydration') ngSkipHydration = 'true';

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Compare Servers', url: '/compare' }
  ];

  isLoading = true;

  servers: ServerPKsWithPrices[] = [];

  fields: any[] = [
    { name: 'Vendor', key: 'vendor' },
    { name: 'Processor', key: 'processor' },
    { name: 'Memory', key: 'memory' },
    { name: 'Storage', key: 'storage' },
    { name: 'GPU', key: 'gpu' },
    { name: 'GPU Memory', key: 'gpu_memory' }
  ];

  clipboardIcon = 'clipboard';

  instanceProperties: any[] = [];

  benchmarkMeta: any;

  instancePropertyCategories: any[] = [
    { name: 'CPU', category: 'cpu', properties: [] },
    { name: 'Memory', category: 'memory', properties: [] },
    { name: 'GPU', category: 'gpu', properties: [] },
    { name: 'Storage', category: 'storage', properties: [] },
    { name: 'Network', category: 'network', properties: [] },
  ];

  bestCellStyle = 'font-weight: 600; color: #34D399';

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  @ViewChild('tooltipGeekbench') tooltipGB!: ElementRef;
  tooltipContent = '';
  geekbenchHTML: any;

  radarChartType = 'radar' as const;
  radarChartOptionsMulti: ChartConfiguration<'radar'>['options'] = JSON.parse(JSON.stringify(radarChartOptions));
  radarChartOptionsSingle: ChartConfiguration<'radar'>['options'] = JSON.parse(JSON.stringify(radarChartOptions));
  radarChartDataGeekMulti: ChartData<'radar'> | undefined = undefined;
  radarChartDataGeekSingle: ChartData<'radar'> | undefined = undefined;

  lineChartType = 'line' as const;
  lineChartOptionsBWMem: ChartConfiguration<'line'>['options'] = lineChartOptionsBWM;
  lineChartDataBWmem: ChartData<'line'> | undefined = undefined;

  barChartType = 'bar' as const;
  barChartOptionsSSL: ChartConfiguration<'bar'>['options'] = barChartOptionsSSLCompare;
  barChartDataSSL: ChartData<'bar'> | undefined = undefined;


  lineChartOptionsCompress: ChartConfiguration<'line'>['options'] = lineChartOptionsCompareCompress;
  lineChartOptionsDecompress: ChartConfiguration<'line'>['options'] = lineChartOptionsCompareDecompress;
  lineChartDataCompress: ChartData<'line'> | undefined = undefined;
  lineChartDataDecompress: ChartData<'line'> | undefined = undefined;

  dropdownCurrency: any;
  availableCurrencies = [
    {name: 'US dollar', slug: 'USD', symbol: '$'},
    {name: 'Euro', slug: 'EUR', symbol: '€'},
    {name: 'British Pound', slug: 'GBP', symbol: '£'},
    {name: 'Swedish Krona', slug: 'SEK', symbol: 'kr'},
    {name: 'Danish Krone', slug: 'DKK', symbol: 'kr'},
    {name: 'Norwegian Krone', slug: 'NOK', symbol: 'kr'},
    {name: 'Swiss Franc', slug: 'CHF', symbol: 'CHF'},
    {name: 'Australian Dollar', slug: 'AUD', symbol: '$'},
    {name: 'Canadian Dollar', slug: 'CAD', symbol: '$'},
    {name: 'Japanese Yen', slug: 'JPY', symbol: '¥'},
    {name: 'Chinese Yuan', slug: 'CNY', symbol: '¥'},
    {name: 'Indian Rupee', slug: 'INR', symbol: '₹'},
    {name: 'Brazilian Real', slug: 'BRL', symbol: 'R$'},
    {name: 'South African Rand', slug: 'ZAR', symbol: 'R'},
  ];

  dropdownBWmem: any;
  availableBWmem = [
    {name: 'Read', value: 'rd'},
    {name: 'Write', value: 'wr'},
    {name: 'Read/Write', value: 'rdwr'},
  ];

  selectedBWMemOperation = this.availableBWmem[2];

  dropdownSSL: any;
  availableSSLAlgos = [
    { name: 'AES-256-CBC', value: 'AES-256-CBC' },
    { name: 'ARIA-256-CBC', value: 'ARIA-256-CBC' },
    { name: 'CAMELLIA-256-CBC', value: 'CAMELLIA-256-CBC' },
    { name: 'SM4-CBC', value: 'SM4-CBC'},
    { name: 'blake2b512', value: 'blake2b512' },
    { name: 'sha256', value: 'sha256' },
    { name: 'sha3-256', value: 'sha3-256' },
    { name: 'sha3-512', value: 'sha3-512'},
    { name: 'sha512', value: 'sha512'},
    { name: 'shake128', value: 'shake128' },
    { name: 'shake256', value: 'shake256'}
  ];

  selectedSSLAlgo = this.availableSSLAlgos[5];

  compressDropdown: any;
  availableCompressMethods: any[] = [];
  selectedCompressMethod: any;

  selectedCurrency = this.availableCurrencies[0];

  benchmarkCategories: any[] = [
    { name: 'Geekbench',
      id: 'geekbench',
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
      "geekbench:asset_compression"
      ],
      data: [],
      show_more: false
    },
    {
      name: 'Memory bandwidth',
      id: 'bw_mem',
      benchmarks: ['bw_mem'],
      data: [],
      show_more: false
    },
    {
      name: 'OpenSSL speed',
      id: 'openssl',
      benchmarks: [ 'openssl' ],
      data: [],
      show_more: false
    },
    {
      name: 'Compression',
      id: 'compress',
      benchmarks: [ 'compression_text:ratio', 'compression_text:decompress', 'compression_text:compress' ],
      data: [],
      show_more: false
    },
  ];

  @ViewChild('mainTable') mainTable!: ElementRef;
  @ViewChild('tableHolder') tableHolder!: ElementRef;
  isTableOutsideViewport = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private keeperAPI: KeeperAPIService,
    private seoHandler: SeoHandlerService,
    private sanitizer: DomSanitizer,
    private serverCompare: ServerCompareService,
    private route: ActivatedRoute) { }

  ngOnInit() {

    console.log("test netlify");
    console.log(this.route);
    const title = 'Compare Servers';
    const description = 'Compare cloud server characteristics and benchmark scores.';
    const keywords = 'compare, servers, server, hosting, cloud, vps, dedicated, comparison';

    this.seoHandler.updateTitleAndMetaTags(title, description, keywords);

    (this.radarChartOptionsSingle as any).plugins.legend.display = true;
    (this.radarChartOptionsMulti as any).plugins.legend.display = true;

    (this.radarChartOptionsSingle as any).plugins.title = {
      display: true,
      text: 'Single-core performance',
      color: '#FFF',
    };
    (this.radarChartOptionsMulti as any).plugins.title = {
      display: true,
      text: 'Multi-core performance',
      color: '#FFF',
    };

    console.log(this.route);
    this.route.queryParams.subscribe(params => {
      console.log(params);
      const param = params['instances'];
      if(param){
          this.isLoading = true;

          const decodedParams = JSON.parse(atob(param));

          let promises: Promise<any>[] = [
            this.keeperAPI.getServerMeta(),
            this.keeperAPI.getServerBenchmarkMeta()
          ];
          decodedParams?.forEach((instance: any) => {
            promises.push(
              this.keeperAPI.getServer(instance.vendor, instance.server, this.selectedCurrency.slug)
            );
          });
          Promise.all(promises).then((data) => {
            this.instanceProperties = data[0].body.fields;

            this.instancePropertyCategories.forEach((c) => {
              c.properties = [];
            });

            this.servers = [];
            this.serverCompare.clearCompare();

            for(let i = 2; i < data.length; i++){
              this.servers.push(data[i].body);
              this.serverCompare.toggleCompare(true, data[i].body);
            }

            this.instanceProperties.forEach((p: any) => {
              const group = this.instancePropertyCategories.find((g) => g.category === p.category);
              const hasValue =
                this.servers.some((s: any) =>
                  s[p.id] !== undefined &&
                  s[p.id] !== null &&
                  s[p.id] !== '' &&
                  !Array.isArray(s[p.id]));

              if(group && hasValue) {
                group.properties.push(p);
              }
            });

            this.benchmarkMeta = data[1].body
              ?.filter((benchmark: any) => {
                let found = false;
                this.servers.forEach((s: any) => {
                  if(s.benchmark_scores?.find((score: any) => score.benchmark_id === benchmark.benchmark_id)){
                    found = true;
                  }
                });
                return found;
              })
              .map((b: any) => {
              return {
                ...b,
                collapsed: true,
                configs: []
              }
            });

            this.benchmarkMeta.forEach((benchmark: any) => {
              this.servers.forEach((server: any) => {
                const scores = server.benchmark_scores?.filter((s: any) => s.benchmark_id === benchmark.benchmark_id);
                if(scores) {
                  scores.forEach((score: any) => {
                    const config = benchmark.configs.find((c: any) => {
                      return JSON.stringify(c.config) === JSON.stringify(score.config);
                    });
                    if(!config) {
                      benchmark.configs.push({
                        config: score.config,
                        values: []
                      });
                    }
                  });
                }
              });
            });

            this.benchmarkMeta.forEach((benchmark: any) => {
              benchmark.configs.forEach((config: any) => {
                this.servers.forEach((server: any) => {
                  const score = server.benchmark_scores
                    ?.find((s: any) => s.benchmark_id === benchmark.benchmark_id && JSON.stringify(s.config) === JSON.stringify(config.config));
                    config.values.push(
                      score ? (Math.floor(score.score * 100) / 100) : '-'
                    );
                });
              });
            });

            this.benchmarkCategories.forEach((category) => {
              category.data = this.benchmarkMeta.filter((b: any) => category.benchmarks.includes(b.benchmark_id));
            });

            if(isPlatformBrowser(this.platformId)) {

              this.getCompressChartOptions();

              this.generateChartsData();
              this.generateBWMemChart();
              this.generateSSLChart();
              this.generateCompressChart();

              const targetElCurrency: HTMLElement | null = document.getElementById('currency_options');
              const triggerElCurrency: HTMLElement | null = document.getElementById('currency_button');

              this.dropdownCurrency = new Dropdown(
                  targetElCurrency,
                  triggerElCurrency,
                  options,
                  {
                    id: 'currency_options',
                    override: true
                  }
              );
              this.dropdownCurrency.init();
            }
          }).catch((err) => {
            console.error(err);
          }).finally(() => {
            this.isLoading = false;
          });
      }
    });
  }

  ngAfterViewInit() {
    if(isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', () => {
        const rect = this.mainTable?.nativeElement.getBoundingClientRect();
        if (rect?.top < 70) {
          this.isTableOutsideViewport = true;
        } else {
          this.isTableOutsideViewport = false;
        }
      });
    }
  }

  toUpper(text: string) {
    return text?.toUpperCase();
  }

  clipboardURL(event: any) {
    const url = window.location.href;
    navigator.clipboard.writeText(url);

    this.clipboardIcon = 'check';

    this.showTooltip(event, 'Link copied to clipboard!', true);

    setTimeout(() => {
      this.clipboardIcon = 'clipboard';
    }, 3000);
  }

  getMemory(item: ServerPKsWithPrices) {
    return ((item.memory_amount || 0) / 1024).toFixed((item.memory_amount || 0) > 1024 ? 0 : 1) + ' GiB';
  }

  getGPUMemory(item: ServerPKsWithPrices) {
    return ((item.gpu_memory_min || 0) / 1024).toFixed(1) + ' GB';
  }

  getStorage(item: ServerPKsWithPrices) {
    if(!item.storage_size) return '-';

    if(item.storage_size < 1000) return `${item.storage_size} GB`;

    return `${(item.storage_size / 1000).toFixed(1)} TB`;
  }

  bytesToSize(bytes: number) {
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(0) + ' ' + sizes[i];
  }

  getProperty(column: any, server: ServerPKsWithPrices) {
    const name = column.id
    const prop = (server as any)[name];

    if(prop === undefined || prop === null) {
      return undefined;
    }

    if(name === 'memory_amount') {
      return this.getMemory(server);
    }

    if(name === 'gpu_memory_min' || name === 'gpu_memory_total') {
      return this.getGPUMemory(server);
    }

    if(name === 'storage_size') {
      return this.getStorage(server);
    }

    if( typeof prop === 'number') {
      if(column.unit === 'byte') {
        return this.bytesToSize(prop);
      }
      return `${prop} ${column.unit || ''}`;
    }

    if( typeof prop === 'string') {
      return prop;
    }
    if(Array.isArray(prop)) {
      // if the items are Objects, return undefined for now
      if(prop.length > 0 && typeof prop[0] === 'object') {
        return undefined;
      } else {
        return prop.join(', ');
      }
    }

    return '-';
  }

  getBestCellStyle(name: string, server: ServerPKsWithPrices) {
    const prop = (server as any)[name];

    if(prop === undefined || prop === null || prop === 0) {
      return '';
    }

    if( typeof prop === 'number') {
      let isBest = true;
      this.servers?.forEach((s: any) => {
        if(s[name] > prop) {
          isBest = false;
        }
      });
      return isBest ? this.bestCellStyle : '';
    }

    return '';
  }

  getBestPriceStyle(server: ServerPKsWithPrices) {
    const prop = server.prices.filter(x => x.allocation === Allocation.Ondemand).sort((a,b) => a.price - b.price)[0]?.price;

    if(prop === undefined || prop === null || prop === 0) {
      return '';
    }

    let isBest = true;
    this.servers?.forEach((s: ServerPKsWithPrices) => {
      const temp = s.prices.filter(x => x.allocation === Allocation.Ondemand).sort((a, b) => a.price - b.price)[0]?.price;
      if(temp < prop) {
        isBest = false;
      }
    });
    return isBest ? this.bestCellStyle : '';
  }

  getSScoreStyle(server: ServerPKsWithPrices) {
    const prop = server.score_per_price;

    if(!prop) {
      return '';
    }

    let isBest = true;
    this.servers?.forEach((s: ServerPKsWithPrices) => {
      const temp = s.score_per_price || -1;
      if(temp > prop) {
        isBest = false;
      }
    });
    return isBest ? this.bestCellStyle : '';
  }

  getBecnchmarkStyle(server: ServerPKsWithPrices, isMulti: boolean) {
    const prop = server.benchmark_scores
    ?.find((b) =>
        b.benchmark_id === 'stress_ng:cpu_all'
        && (isMulti ? ((b.config as any)?.cores !== 1) :(b.config as any)?.cores === 1))?.score;

    if(prop === undefined || prop === null || prop === 0) {
      return '';
    }

    let isBest = true;
    this.servers?.forEach((s: ServerPKsWithPrices) => {
      const temp = s.benchmark_scores?.find((b) =>
        b.benchmark_id === 'stress_ng:cpu_all' &&
        (isMulti ? ((b.config as any)?.cores !== 1) :(b.config as any)?.cores === 1))?.score || 0;
      if(temp > prop) {
        isBest = false;
      }
    });
    return isBest ? this.bestCellStyle : '';
  }

  isBestStyle(value: any, values: any[], benchmark: any) {
    if(value === '-' || value === 0) return '';
    let isBest = true;
    values.forEach((v) => {
      if(!isNaN(v)) {
        if(benchmark.higher_is_better === false && v < value) {
          isBest = false;
        } else if(v > value) {
          isBest = false;
        }
      }
    });

    return isBest ? this.bestCellStyle : '';
  }

  viewServer(server: ServerPKsWithPrices) {
    window.open(`/server/${server.vendor_id}/${server.api_reference}`, '_blank');
  }

  showTooltip(el: any, content?: string, autoHide = false) {
      const tooltip = this.tooltip.nativeElement;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5 + scrollPosition}px`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';

      this.tooltipContent = content || '';

      if(autoHide) {
        setTimeout(() => {
          this.hideTooltip();
        }, 3000);
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

  getStyle() {
    return `width: ${100 / (this.servers.length + 1)}%; max-width: ${100 / (this.servers.length + 1)}%;`
  }

  getBenchmark(server: ServerPKsWithPrices, isMulti: boolean) {
    if(!isMulti) {
      return server.benchmark_scores?.find((b) => b.benchmark_id === 'stress_ng:cpu_all' && (b.config as any)?.cores === 1)?.score?.toFixed(0) || '-';
    } else {
      return server.benchmark_scores?.find((b) => b.benchmark_id === 'stress_ng:cpu_all' && (b.config as any)?.cores === server.vcpus)?.score?.toFixed(0) || '-';
    }
  }

  getSScore(server: ServerPKsWithPrices) {
    if(!server.score_per_price) {
      return '-';
    }
    return this.numberWithCommas(Math.round(server.score_per_price)) + '/USD';
  }

  getBestPrice(server: ServerPKsWithPrices, allocation: Allocation = Allocation.Ondemand) {
    if(server.prices?.find((p) => p.allocation === allocation)){
      const best = server.prices.filter(x => x.allocation === allocation).sort((a,b) => a.price - b.price)[0];
      return `${best.price} ${best.currency}`;
    } else {
      return '-';
    }
  }

  toggleBenchmark(benchmark: any) {
    benchmark.collapsed = !benchmark.collapsed;
  }

  benchmarkIcon(benchmark: any) {
    return benchmark.collapsed ? 'chevron-down' : 'chevron-up';
  }

  serializeConfig(config: any) {
    let result = '<ul>';
    Object.keys(config).forEach((key) => {
      result += `<li>${key.replace('_', ' ')}: ${config[key]} </li>`;
    });

    result += '</ul>';

    return result;
  }

  public numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  public generateChartsData() {

    let geekbenchScores = this.benchmarkMeta
    .filter((x: any) => x.benchmark_id.includes('geekbench') && x.benchmark_id !== 'geekbench:score')
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

    const GBScore = this.benchmarkMeta.find((x: any) => x.benchmark_id === 'geekbench:score');

    if(GBScore) {
      geekbenchScores.unshift(GBScore);
    }

    if(!geekbenchScores || geekbenchScores.length === 0) {
      return;
    }

    this.geekbenchHTML =
    `<div> The following benchmark scenarios were run using Geekbench 6: </div> <ul> `;

    geekbenchScores.forEach((benchmark: any) => {
      const name: string = benchmark.name.replace('Geekbench:', '');
      const desc = benchmark.description.replace('The score is calibrated against a baseline score of 2,500 (Dell Precision 3460 with a Core i7-12700 processor) as per the Geekbench 6 Benchmark Internals.', '') || '';
      this.geekbenchHTML += `<li> - ${name}: ${desc} </li>`;
    });

    this.geekbenchHTML += `</ul>`;

    this.geekbenchHTML = this.sanitizer.bypassSecurityTrustHtml(this.geekbenchHTML);

    const labels = geekbenchScores.map((x: any) => x.benchmark_id);
    //scales = dataSet[0].benchmarks.sort((a: any, b:any) => (a.config.cores as string).localeCompare(b.config.cores)).map((b: any) => b.config.cores);

    let chartData: any = {
      labels: labels
        .map((s: string) =>
          (this.benchmarkMeta.find((b: any) => b.benchmark_id === s)?.name || s)
            .replace('geekbench:', '')
            .replace('Geekbench: ', '')),
      datasets: [
        this.servers.map((server: any, index: number) => {
        return {
          data: [],
          label: server.display_name,
          borderColor: radarDatasetColors[index % 8].borderColor,
          backgroundColor: radarDatasetColors[index % 8].backgroundColor};
        }),
        this.servers.map((server: any, index: number) => {
          return {
            data: [],
            label: server.display_name,
            borderColor: radarDatasetColors[index % 8].borderColor,
            backgroundColor: radarDatasetColors[index % 8].backgroundColor};
          })
      ]
    };

    labels.forEach((label: string) => {
      this.servers.forEach((server, index) => {
        const scores = server.benchmark_scores?.filter((x: any) => label === x.benchmark_id).sort((a: any, b:any) => (a.config.cores as string).localeCompare(b.config.cores));
        if(scores?.length === 2) {
          scores.forEach((score: any, j) => {
            chartData.datasets[j][index].data.push({value: score.score, tooltip: score.note});
          });
        } else {
          chartData.datasets[0][index].data.push({value: null, tooltip: ''});
          chartData.datasets[1][index].data.push({value: null, tooltip: ''});
        }
      });
    });

    this.radarChartDataGeekMulti = {
      labels: chartData.labels,
      datasets: chartData.datasets[0]
    };
    this.radarChartDataGeekSingle = {
      labels: chartData.labels,
      datasets: chartData.datasets[1]
    };
  }

  generateBWMemChart() {
    const scaleField = 'size';
    const benchmark_id = 'bw_mem';

    const selectedOperation = this.selectedBWMemOperation.value;
    const selectedName = this.selectedBWMemOperation.name;

    const dataSet = this.benchmarkMeta?.find((x: any) => x.benchmark_id === benchmark_id);

    if(dataSet) {
      let scales: number[] = [];
      dataSet.configs.filter((x: any) => x.config.operation === selectedOperation).forEach((item: any) => {
        if((item.config[scaleField] || item.config[scaleField] === 0) && scales.indexOf(item.config[scaleField]) === -1) {
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
            backgroundColor: radarDatasetColors[index % 8].backgroundColor };
          })
      };

      this.servers.forEach((server: any, i: number) => {
        scales.forEach((size: number) => {
          const item = server.benchmark_scores.find((b: any) => b.config.operation === selectedOperation && b.config[scaleField] === size);
          if(item) {
            chartData.datasets[i].data.push(item.score);
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      });

      this.lineChartDataBWmem = { labels: chartData.labels, datasets: chartData.datasets };

      (this.lineChartOptionsBWMem as any).plugins.tooltip.callbacks.title = function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
        return selectedName + ' ops with ' + tooltipItems[0].label + ' MB block size';
      };

      setTimeout(() => {
        const targetElBWmem: HTMLElement | null = document.getElementById('bw_mem_options');
        const triggerElBWmem: HTMLElement | null = document.getElementById('bw_mem_button');

        this.dropdownBWmem = new Dropdown(
            targetElBWmem,
            triggerElBWmem,
            options,
            {
              id: 'bw_mem_options',
              override: true
            }
        );
        this.dropdownBWmem.init();
      }, 500);
    }
  }

  generateSSLChart() {
    const scaleField = 'block_size';
    const benchmark_id = 'openssl';

    const selectedAlgo = this.selectedSSLAlgo.value;
    const selectedName = this.selectedSSLAlgo.name;

    const dataSet = this.benchmarkMeta?.find((x: any) => x.benchmark_id === benchmark_id);

    if(dataSet) {
      let scales: number[] = [];
      dataSet.configs.filter((x: any) => x.config.algo === selectedAlgo).forEach((item: any) => {
        if((item.config[scaleField] || item.config[scaleField] === 0) && scales.indexOf(item.config[scaleField]) === -1) {
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
            backgroundColor: radarDatasetColors[index % 8].borderColor };
          })
      };

      this.servers.forEach((server: any, i: number) => {
        scales.forEach((size: number) => {
          const item = server.benchmark_scores.find((b: any) => b.config.algo === selectedAlgo && b.config[scaleField] === size);
          if(item) {
            chartData.datasets[i].data.push(item.score);
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      });


      this.barChartDataSSL = { labels: chartData.labels, datasets: chartData.datasets };

      (this.barChartOptionsSSL as any).plugins.tooltip.callbacks.title = function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
        return selectedName + ' with ' + tooltipItems[0].label + '-byte block size';
      };

      setTimeout(() => {
        const targetElSSL: HTMLElement | null = document.getElementById('ssl_options');
        const triggerElSSL: HTMLElement | null = document.getElementById('ssl_button');

        this.dropdownSSL = new Dropdown(
            targetElSSL,
            triggerElSSL,
            options,
            {
              id: 'ssl_options',
              override: true
            }
        );
        this.dropdownSSL.init();
      }, 500);
    }
  }

  getCompressChartOptions() {
    let dataSet = this.benchmarkMeta?.find((x: any) => x.benchmark_id === 'compression_text:ratio');
    let options: any = [];
    dataSet?.configs.forEach((config: any) => {
      let temp = { ...config.config };
      delete temp.compression_level;

      const found = options.find((b: any) => {
        return Object.entries(temp).every(([key, value]) => {
          return b[key] === value;
        });
      });

      if(!found) {
        options.push(temp);
      }

    });
    this.availableCompressMethods = options.sort((a: any, b: any) => {
      return a.algo.localeCompare(b.algo);
    }).map((item: any) => {
      return {
        options: item,
        name: Object.keys(item).map((key: string) => { return `${key.replace('_', ' ')}: ${item[key]}` }).join(', ')
      };
    });
    this.selectedCompressMethod = this.availableCompressMethods[0];
  }

  generateCompressChart() {
    const selectedConfig = this.selectedCompressMethod?.options;
    const selectedName = this.selectedCompressMethod?.name;

    if(!selectedConfig) {
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
          backgroundColor: radarDatasetColors[index % 8].borderColor };
        })
    };

    let labels: any[] = [];

    this.servers.forEach((server: any) => {
        const items = server.benchmark_scores.filter((b: any) =>
          b.benchmark_id === 'compression_text:ratio' &&
          b.config.algo === selectedConfig.algo &&
          b.config.threads === selectedConfig.threads
        );

        items.forEach((item: any) => {
          if(item?.score && labels.indexOf(item.score) === -1) {
            labels.push(item.score);
          }
        });
    });

    chartData.labels = labels.sort((a, b) => a - b);

    this.servers.forEach((server: any, i: number) => {
      labels.forEach((size: number) => {
        const item = server.benchmark_scores.find((b: any) =>
          b.benchmark_id === 'compression_text:ratio' &&
          b.config.algo === selectedConfig.algo &&
          b.config.threads === selectedConfig.threads &&
          b.score === size
        );
        if(item) {
          const item2 = server.benchmark_scores.find((b: any) => {
            return b.benchmark_id === 'compression_text:compress' && Object.entries(item.config).every(([key, value]) => {
              return b.config[key] === value;
            });
          });

          const item3 = server.benchmark_scores.find((b: any) => {
            return b.benchmark_id === 'compression_text:decompress' && Object.entries(item.config).every(([key, value]) => {
              return b.config[key] === value;
            });
          });

          let tooltip = ``;
          Object.keys(item.config).forEach((key: string) => {
            if(key === 'compression_level') {
              tooltip += `${key.replace('_', ' ')}: ${item.config[key]}`;
            }
          });

          chartData.datasets[i].data.push({
              config: item.config,
              ratio: Math.floor(item.score * 100) / 100,
              compression_level: item.config.compression_level,
              tooltip: tooltip,
              compress: item2?.score,
              decompress: item3?.score
            });
        } else {
          chartData.datasets[i].data.push(null);
        }
      });
    });

    chartData.labels = chartData.labels.map((label: any) => {
      return Math.floor(label * 100) / 100;
    })

    this.lineChartDataCompress = { labels: chartData.labels, datasets: chartData.datasets };
    this.lineChartDataDecompress = { labels: chartData.labels, datasets: chartData.datasets };

    (this.lineChartOptionsCompress as any).plugins.tooltip.callbacks.title =  function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
      return tooltipItems[0].label + '% compression ratio (' + selectedName + ')';
    };
    (this.lineChartOptionsDecompress as any).plugins.tooltip.callbacks.title =  function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
      return tooltipItems[0].label + '% compression ratio (' + selectedName + ')';
    };

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

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  showTooltipGB(el: any) {
    const tooltip = this.tooltipGB.nativeElement;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    tooltip.style.left = `${20}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5 + scrollPosition}px`;
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
  }

  hideTooltipGB() {
    const tooltip = this.tooltipGB.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }


  selectCurrency(currency: any) {
    this.selectedCurrency = currency;

    let promises: Promise<any>[] = [
    ];
    this.servers?.forEach((instance: any) => {
      promises.push(
        this.keeperAPI.getServer(instance.vendor_id, instance.server_id, this.selectedCurrency.slug)
      );
    });

    Promise.all(promises).then((data) => {
      this.servers = [];
      for(let i = 0; i < data.length; i++){
        this.servers.push(data[i].body);
      }
    });

    this.dropdownCurrency?.hide();
  }

  selectBWMemOperation(operation: any) {
    this.selectedBWMemOperation = operation;
    this.generateBWMemChart();
  }

  selecSSLAlgorithm(algo: any) {
    this.selectedSSLAlgo = algo;
    this.generateSSLChart();
  }

  selectCompressMethod(method: any) {
    this.selectedCompressMethod = method;
    this.generateCompressChart();
  }

  getBenchmarksForCategory(category: any) {
    if(!category) {
      return this.benchmarkMeta?.filter((b: any) => this.isUncagorizedBenchmark(b));
    }
    return this.benchmarkMeta?.filter((b: any) => this.isInBenchmarkCategory(category, b));
  }

  isInBenchmarkCategory(benchmark_category:any, benchmark: any) {
    return benchmark_category.benchmarks.includes(benchmark.benchmark_id);
  }

  isUncagorizedBenchmark(benchmark: any) {
    return !this.benchmarkCategories.some((c: any) => c.benchmarks.includes(benchmark.benchmark_id));
  }

  toggleBenchmarkCategory(category: any) {
    category.show_more = !category.show_more;

    // single item lists are auto toggled
    if(category.data?.length === 1) {
      category.data[0].collapsed = !category.show_more;
    }

  }

  getMainTableWidth() {
    const thead = document?.querySelector('#main-table thead');
    const rect = this.mainTable?.nativeElement.getBoundingClientRect();
    const rect2 = this.tableHolder?.nativeElement.getBoundingClientRect();
    const posLeft = rect && rect2 ? rect.x - rect2.x : 0;
    return `width: ${thead?.clientWidth}px; left: ${posLeft}px`;
  }

  getFixedDivStyle() {
    const div = document?.getElementById('table_holder');
    return `width: ${div?.clientWidth}px; overflow: hidden;`;
  }
}
