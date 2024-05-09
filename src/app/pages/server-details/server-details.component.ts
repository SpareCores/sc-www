import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { ServerPriceWithPKs } from '../../../../sdk/data-contracts';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FaqComponent } from '../../components/faq/faq.component';

@Component({
  selector: 'app-server-details',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, LucideAngularModule, FaqComponent],
  templateUrl: './server-details.component.html',
  styleUrl: './server-details.component.scss'
})
export class ServerDetailsComponent {

  serverDetails!: any;

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Servers', url: '/servers' }
  ];

  features: any[] = [];

  description = '';
  title = '';

  faqs: any[] = [];

  constructor(private route: ActivatedRoute,
              private keepreAPI: KeeperAPIService,
              private SEOHandler: SeoHandlerService) {
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

          this.title = `${this.serverDetails.server_id} by ${this.serverDetails.vendor.name} - Spare Cores`;
          this.description =
            `${this.serverDetails.server_id} by ${this.serverDetails.vendor.name} instance with ${this.serverDetails.cpu_cores ? this.serverDetails.cpu_cores + 'CPUs' : ''}${this.serverDetails.vcpus ? this.serverDetails.vcpus + 'vCPUs' : ''}, ${this.getMemory()} of memory and ${this.getStorage()} of storage.`;

          this.features = [];
          if(this.serverDetails.memory) {
            this.features.push({name: 'Memory', value: this.getMemory()});
          }
          if(this.serverDetails.storage_size) {
            this.features.push({name: 'Storage', value: this.getStorage()});
          }
          if(this.serverDetails.cpu_cores || this.serverDetails.server.vcpus) {
            this.features.push({name: 'x CPU', value: `${this.serverDetails.cpu_cores || this.serverDetails.server.vcpus}x`});
          }

          let keywords = this.title + ', ' + this.serverDetails.server_id + ', ' + this.serverDetails.vendor.vendor_id;

          this.SEOHandler.updateTitleAndMetaTags(this.title, this.description, keywords);

          this.faqs = [
            {
              question: `What is ${this.serverDetails.server_id}?`,
              answer: this.description
            },
            {
              question: `How much does ${this.serverDetails.server_id} cost?`,
              answer: `${this.serverDetails.server_id} prices starting at $0.00001 per hour as spot instance.`
            },
            {
              question: `What is ${this.serverDetails.server_id} instance specification?`,
              answer: `${this.serverDetails.server_id} has ${this.serverDetails.cpu_cores || this.serverDetails.vcpus} CPUs, ${this.getMemory()} of memory and ${this.getStorage()} of storage.`
            }
          ];

        }
      });

    });
  }

  ngOnInit() {
  }

  getMemory() {
    return ((this.serverDetails.memory || 0) / 1024).toFixed(1) + 'GB';
  }

  getStorage() {
    if(!this.serverDetails.storage_size) return '-';

    if(this.serverDetails.storage_size < 1000) return `${this.serverDetails.storage_size}GB`;

    return `${(this.serverDetails.storage_size / 1000).toFixed(1)}TB`;
  }
}
