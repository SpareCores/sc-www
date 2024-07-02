import { CommonModule, } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ServerPKsWithPrices } from '../../../../sdk/data-contracts';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute } from '@angular/router';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { SeoHandlerService } from '../../services/seo-handler.service';

@Component({
  selector: 'app-server-og',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './server-og.component.html',
  styleUrl: './server-og.component.scss'
})
export class ServerOGComponent implements OnInit {

  serverDetails!: ServerPKsWithPrices;

  features: any[] = [];

  description = '';
  title = '';

  instanceProperties: any[] = [];
  benchmarkMeta: any;

   constructor(
              private route: ActivatedRoute,
              private keeperAPI: KeeperAPIService,
              private SEOHandler: SeoHandlerService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const vendor = params['vendor'];
      const id = params['id'];

      Promise.all([
        this.keeperAPI.getServerMeta(),
        this.keeperAPI.getServerBenchmarkMeta(),
        this.keeperAPI.getServer(vendor, id)
      ]).then((dataAll) => {
        this.instanceProperties = dataAll[0].body?.fields || [];

        this.benchmarkMeta = dataAll[1].body || {};

        if(dataAll[2].body){
          this.serverDetails = dataAll[2].body as any;

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

          this.SEOHandler.setNoFollow();

        }
      }).catch((error) => {
        console.error('Failed to load server data:', error);
      });
    });
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

  getBenchmark(isMulti: boolean) {
    if(!isMulti) {
      return this.serverDetails.benchmark_scores?.find((b) => b.benchmark_id === 'stress_ng:cpu_all' && (b.config as any)?.cores === 1)?.score?.toFixed(0) || '-';
    } else {
      return this.serverDetails.benchmark_scores?.find((b) => b.benchmark_id === 'stress_ng:cpu_all' && (b.config as any)?.cores === this.serverDetails.vcpus)?.score?.toFixed(0) || '-';
    }
  }
}
