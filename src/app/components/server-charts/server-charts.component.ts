import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnChanges, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, ChartData, TooltipItem, TooltipModel } from 'chart.js';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { Benchmark } from '../../../../sdk/data-contracts';
import { staticWebChartTemplate, staticWebChartTemplateCallbacks, redisChartTemplate, redisChartTemplateCallbacks, ChartFromBenchmarkTemplate, ChartFromBenchmarkTemplateOptions } from '../../pages/server-details/chartFromBenchmarks';
import { radarChartOptions, lineChartOptionsBWM, lineChartOptionsComp, lineChartOptionsStressNG, lineChartOptionsStressNGPercent, barChartOptionsSSL, radarDatasetColors } from '../../pages/server-details/chartOptions';
import { DomSanitizer } from '@angular/platform-browser';
import { DropdownManagerService } from '../../services/dropdown-manager.service';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-server-charts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterModule, BaseChartDirective],
  templateUrl: './server-charts.component.html',
  styleUrl: './server-charts.component.scss'
})
export class ServerChartsComponent implements OnChanges {

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  @ViewChild('tooltipGeekbench') tooltipGB!: ElementRef;

  @Input() serverDetails: any;
  @Input() benchmarksByCategory: any[] = [];
  @Input() benchmarkMeta!: Benchmark[];
  @Input() showChart: string = 'all';
  @Input() isEmbedded: boolean = false;

  multiBarCharts: any[] = [
    {
      chart: JSON.parse(JSON.stringify(staticWebChartTemplate)),
      callbacks: staticWebChartTemplateCallbacks,
      dropdown: undefined,
    }, {
      chart: JSON.parse(JSON.stringify(redisChartTemplate)),
      callbacks: redisChartTemplateCallbacks,
      dropdown: undefined,
    }
  ];

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

  lineChartOptionsStressNG: ChartConfiguration<'line'>['options'] = JSON.parse(JSON.stringify(lineChartOptionsStressNG));
  lineChartOptionsStressNGPercent: ChartConfiguration<'line'>['options'] = JSON.parse(JSON.stringify(lineChartOptionsStressNGPercent));
  lineChartDataStressNG: ChartData<'line'> | undefined = undefined;
  lineChartDataStressNGPct: ChartData<'line'> | undefined = undefined;

  barChartType = 'bar' as const;
  barChartOptionsSSL: ChartConfiguration<'bar'>['options'] = barChartOptionsSSL;
  barChartDataSSL: ChartData<'bar'> | undefined = undefined;

  geekbenchHTML: any;

  geekScoreSingle: string = '0';
  geekScoreMulti: string = '0';

  resizeTimeout: any;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
  @Inject(DOCUMENT) private document: Document,
  private dropdownManager: DropdownManagerService,
  private sanitizer: DomSanitizer) {
  }

  ngOnChanges() {
    if(this.serverDetails && this.benchmarksByCategory && this.isBrowser()) {
      this.initializeBenchmarkCharts();
      this.generateBenchmarkCharts();

      this.dropdownManager.initDropdown('compress_method_button', 'compress_method_options').then((dropdown) => {
        this.compressDropdown = dropdown;
      });

      this.multiBarCharts.forEach((chart) => {
        this.dropdownManager.initDropdown(chart.chart.id + '_button', chart.chart.id + '_options').then((dropdown) => {
          chart.dropdown = dropdown;
        });
      });
    }
  }

  isChartShown(id: string): boolean {
    if(!this.showChart || this.showChart === 'all') {
      return true;
    }
    return this.showChart === id;
  }

  selectChartTemplateOption(template: any, option: number) {
    template.chart.selectedOption = option;
    this.generateMultiBarChart(template.chart);
    template.dropdown?.hide();
  }

  initializeBenchmarkCharts() {
    this.multiBarCharts.forEach((chartItem: any) => {
      chartItem.chart.chartOptions.plugins.tooltip.callbacks = chartItem.callbacks;
      this.initializeMultiBarChart(chartItem.chart);
    });
  }

  initializeMultiBarChart(chartTemplate: ChartFromBenchmarkTemplate) {
    chartTemplate.options.forEach((option: ChartFromBenchmarkTemplateOptions) => {
      const benchmark = this.benchmarkMeta.find((b: any) => b.benchmark_id === option.benchmark_id);
      if(benchmark) {
        option.name = benchmark.name;
        option.unit = benchmark.unit;
        option.higher_is_better = benchmark.higher_is_better;
        option.icon = benchmark.higher_is_better ? 'circle-arrow-up' : 'circle-arrow-down';
        option.tooltip = benchmark.higher_is_better ? 'Higher is better' : 'Lower is better';
        option.title = benchmark.config_fields ? ((benchmark.config_fields as any)[option.labelsField] as string) : '';
        option.XLabel = benchmark.config_fields ? ((benchmark.config_fields as any)[option.scaleField] as string) : '';
        option.YLabel = benchmark.unit;
      }
    });
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
        } else {
          this.lineChartOptionsBWMem.plugins.annotation = {};
        }
      }

    } else {
      this.lineChartDataBWmem = undefined;
    }

    this.lineChartDataStressNG = this.generateStressNGChart('stress_ng:div16', 'cores');

    let data = this.generateLineChart('openssl', 'block_size', 'algo', false);

    if(data) {
      this.barChartDataSSL = { labels: data.labels, datasets: data.datasets };
    } else {
      this.barChartDataSSL = undefined;
    }

    this.generateGeekbenchChart();

    this.generateCompressChart();

    this.multiBarCharts.forEach((chartItem: any) => {
      this.generateMultiBarChart(chartItem.chart);
    });
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

      let chartData: any = {
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
            chartData.datasets[i].data.push(item.score);
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      });

      return chartData;

    } else {
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
      const desc = GBScoreText.description?.replace('The score is calibrated against a baseline score of 2,500 (Dell Precision 3460 with a Core i7-12700 processor) as per the Geekbench 6 Benchmark Internals.', '') || '';
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

      let chartData: any = {
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
            chartData.datasets[i].data.push({value: item.score, tooltip: item.note});
          } else {
            chartData.datasets[i].data.push({value: 0});
          }
        });
      });

      this.radarChartDataGeekMulti = {
        labels: chartData.labels,
        datasets: [chartData.datasets[0]]
      };
      this.radarChartDataGeekSingle = {
        labels: chartData.labels,
        datasets: [chartData.datasets[1]]
      };

      return chartData;
    } else {
      this.radarChartDataGeekMulti = undefined;
      this.radarChartDataGeekSingle = undefined;

      return undefined;
    }
  }

  public generateMultiBarChart(chartTemplate: ChartFromBenchmarkTemplate) {

    const chartConf = chartTemplate.options[chartTemplate.selectedOption];
    const labelsField = chartConf.labelsField;
    const scaleField = chartConf.scaleField;
    const dataSet = this.benchmarksByCategory?.find(x => x.benchmark_id === chartConf.benchmark_id);

    let chartData: any;

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

      chartData = {
        labels: scales, //scales.map((s) => s.toString()),
        datasets: labels.map((label: string, index: number) => {
          return {
            data: [],
            label: label,
            borderColor: radarDatasetColors[index].borderColor,
            backgroundColor: radarDatasetColors[index].borderColor
          };
          })
      };

      labels.forEach((label: string, i: number) => {
        scales.forEach((size: number) => {
          const item = dataSet.benchmarks.find((b: any) => b.config[labelsField] === label && b.config[scaleField] === size);
          if(item) {
            chartData.datasets[i].data.push(
              { data:item.score,
                label: size,
                unit: chartConf.YLabel,
                note: item.note
              });
          } else {
            chartData.datasets[i].data.push(null);
          }
        });
      });
    }

    if(chartData) {
      chartTemplate.chartOptions.scales.y.title.text = chartConf.YLabel;
      chartTemplate.chartOptions.scales.x.title.text = chartConf.XLabel;
      chartTemplate.chartOptions.plugins.title.text = chartConf.title;

      chartTemplate.chartData = { labels: chartData.labels, datasets: chartData.datasets };

    } else {
      chartTemplate.chartData = undefined;
    }
  }

  generateStressNGChart(benchmark_id: string, scaleField: string, isLineChart: boolean = true) {
    const dataSet = this.benchmarksByCategory?.find(x => x.benchmark_id === benchmark_id);

    if(dataSet && dataSet.benchmarks?.length) {
      let scales: number[] = [];
      dataSet.benchmarks.forEach((item: any) => {
        if((item.config[scaleField] || item.config[scaleField] === 0) && scales.indexOf(item.config[scaleField]) === -1) {
          scales.push(item.config[scaleField]);
        }
      });

      scales.sort((a, b) => a - b);

      // chart with only 1 point, looks odd better not to show anything at all
      if(scales.length <= 1) {
        return undefined;
      }

      let score1 = dataSet.benchmarks.find((x: any) => x.config[scaleField] === 1)?.score || dataSet.benchmarks[0].score;

      let chartData: any = {
        labels: scales,
        datasets: [{
              data: [],
              label: this.serverDetails.display_name,
              spanGaps: isLineChart,
              borderColor: radarDatasetColors[0].borderColor,
              backgroundColor: isLineChart ? radarDatasetColors[0].backgroundColor : radarDatasetColors[0].borderColor
            }]
      };

      scales.forEach((size: number) => {
        const item = dataSet.benchmarks.find((b: any) => b.config[scaleField] === size);
        if(item) {
          chartData.datasets[0].data.push({cores: size, score: item.score, percent: (item.score / (size * score1)) * 100});
        } else {
          chartData.datasets[0].data.push(null);
        }
      });

      (this.lineChartOptionsStressNG!.plugins as any).legend.display = false;
      (this.lineChartOptionsStressNGPercent!.plugins as any).legend.display = false;

      (this.lineChartOptionsStressNGPercent!.plugins as any).tooltip = {
        callbacks: {
          label: function(this: TooltipModel<"line">, tooltipItem: TooltipItem<"line">) {
            return `Performance: ${tooltipItem.formattedValue}% (${tooltipItem.dataset.label})`;
          },
          title: function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
            return `${tooltipItems[0].label} vCPUs`;
          }
        }
      };

      (this.lineChartOptionsStressNG!.plugins as any).tooltip = {
        callbacks: {
          label: function(this: TooltipModel<"line">, tooltipItem: TooltipItem<"line">) {
            return `Performance: ${tooltipItem.formattedValue} (${tooltipItem.dataset.label})`;
          },
          title: function(this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
            return `${tooltipItems[0].label} vCPUs`;
          }
        }
      };

      if(this.serverDetails.cpu_cores) {
        let idx = scales.findIndex((d: any) => d === this.serverDetails.cpu_cores);
        if(idx > -1) {
          let annotationLine = {
              type: 'line',
              borderWidth: 3,
              borderColor: '#EF4444',
              xMin: idx,
              xMax: idx,
              label: {
                rotation: 'auto',
                position: 'start',
                content: 'CPU cores',
                backgroundColor: '#EF4444',
                display: true
              }
          };

          (this.lineChartOptionsStressNG! as any).plugins.annotation = {
            annotations: {
              line1: annotationLine
            }
          };
          (this.lineChartOptionsStressNGPercent! as any).plugins.annotation = {
            annotations: {
              line1: annotationLine
            }
          };
        }
      }

      return chartData;

    } else {
      return undefined;
    }
  }

  refreshCompressChart(chart: any) {
    this.selectedCompressMethod = chart;
    this.generateCompressChart();
    this.compressDropdown?.hide();
  }


  public numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  showTooltip(el: any, content: string | undefined) {
    if(content) {
      const tooltip = this.tooltip.nativeElement;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      tooltip.style.left = `${el.target.getBoundingClientRect().right + 5}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().top - 25 + scrollPosition}px`;
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
      tooltip.style.top = `${el.target.getBoundingClientRect().top - 25 + scrollPosition}px`;
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

  hideTooltipGB() {
    const tooltip = this.tooltipGB.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

}
