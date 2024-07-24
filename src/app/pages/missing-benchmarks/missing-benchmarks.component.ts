import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule, DOCUMENT } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { SeoHandlerService } from '../../services/seo-handler.service';

@Component({
  selector: 'app-missing-benchmarks',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './missing-benchmarks.component.html',
  styleUrl: './missing-benchmarks.component.scss'
})
export class MissingBenchmarksComponent implements OnInit {

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Debug', url: '/debug' },
  ];

  vendors: any[] = [];
  servers: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              @Inject(DOCUMENT) private document: Document,
              private keeperAPI: KeeperAPIService,
              private SEOHandler: SeoHandlerService) { }

  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
      'Server Benchmark Staticstics',
      'This page shows all servers that are missing benchmarks',
      'missing benchmarks, benchmark status'
    );

    Promise.all([
      this.keeperAPI.getVendors(),
      this.keeperAPI.searchServers({ limit: 10000 })
    ]).then(([vendors, servers]) => {
      this.vendors = vendors.body.map((vendor: any) => { return {
          name: vendor.name,
          id: vendor.vendor_id,
          servers: 0,
          missing: 0,
          evaluated: 0,
          percentage: 0,
          missing_servers: []
        }
      });
      this.servers = servers.body;

      this.servers.forEach((server: any) => {

        let vendor = this.vendors.find((vendor: any) => vendor.id === server.vendor.vendor_id);
        if(server.score) {
          vendor.evaluated++;
        } else {
          server.reason = server.price ?
            'We have run into a quota limit while running this server, or faced other technical issues.' :
            'This server is very likely not be GA (General Availability), as we have not found public pricing information.';
          vendor.missing++;
          vendor.missing_servers.push(server);
        }
        vendor.servers++;
      });

      this.vendors.forEach((vendor: any) => {
        if(vendor.servers > 0) {
          vendor.percentage = Math.round((vendor.missing / vendor.servers) * 100);
        }
        if(vendor.missing_servers.length > 0) {
          vendor.missing_servers.sort((a: any, b: any) => {
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
          });
        }
      });

      //console.log(this.servers);
      //console.log(this.vendors);
    });
  }

}
