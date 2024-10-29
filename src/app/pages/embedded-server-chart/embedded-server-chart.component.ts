import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';
import { AnalyticsService } from '../../services/analytics.service';
import { DropdownManagerService } from '../../services/dropdown-manager.service';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { ServerCompareService } from '../../services/server-compare.service';
import { initGiscus } from '../../tools/initGiscus';
import { ExtendedServerPrice } from '../server-details/server-details.component';
import { Benchmark } from '../../../../sdk/data-contracts';
import { ServerChartsComponent } from '../../components/server-charts/server-charts.component';

@Component({
  selector: 'app-embedded-server-chart',
  standalone: true,
  imports: [ServerChartsComponent],
  templateUrl: './embedded-server-chart.component.html',
  styleUrl: './embedded-server-chart.component.scss'
})
export class EmbeddedServerChartComponent {

  benchmarkMeta!: Benchmark[];
  benchmarksByCategory!: any[];
  serverDetails!: any;
  showChart: string = 'all';

  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private analytics: AnalyticsService,
    private keeperAPI: KeeperAPIService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const vendor = params['vendor'];
      const id = params['id'];
      const chartname = params['chartname'];

      this.showChart = chartname || 'all';

      Promise.all([
        this.keeperAPI.getServerMeta(),
        this.keeperAPI.getServerBenchmarkMeta(),
        this.keeperAPI.getServerBenchmark(vendor, id),
        this.keeperAPI.getServerV2(vendor, id),
        this.keeperAPI.getVendors(),
      ]).then((dataAll) => {
        const promisAllResponses = dataAll.map((d) => d.body);
        const [serverMeta, benchmarkMeta, benchmarks, serverDetails, vendors] = promisAllResponses;

        this.benchmarkMeta = benchmarkMeta || {};

        if(serverDetails){
          this.serverDetails = JSON.parse(JSON.stringify(serverDetails)) as any;

          this.serverDetails.benchmark_scores = benchmarks;
          this.serverDetails.vendor = vendors.find((v: any) => v.vendor_id === this.serverDetails.vendor_id);
          this.serverDetails.score = this.serverDetails.benchmark_scores?.find((b: any) => b.benchmark_id === 'stress_ng:bestn')?.score;
          this.serverDetails.score_per_price = this.serverDetails.min_price && this.serverDetails.score ? this.serverDetails.score / this.serverDetails.min_price : (this.serverDetails.score || 0);

          this.benchmarksByCategory = [];
          this.serverDetails.benchmark_scores?.forEach((b: any) => {
            const group = this.benchmarksByCategory.find((g) => g.benchmark_id === b.benchmark_id);
            if(!group) {
              this.benchmarksByCategory.push({benchmark_id: b.benchmark_id, benchmarks: [b]});
            } else {
              group.benchmarks.push(b);
            }
          });
        }
      }).catch((error) => {
        console.error(error);
        if(error?.status === 500) {
          this.analytics.SentryException(error, {tags: { location: this.constructor.name, function: 'getServers' }});
        } else {
          this.analytics.SentryException(error, {tags: { location: this.constructor.name, function: 'getServers' }});
        }
      });
    });
  }

}
