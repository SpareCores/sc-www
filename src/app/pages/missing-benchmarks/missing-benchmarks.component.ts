import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CommonModule, DOCUMENT } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { ServerCompareService } from '../../services/server-compare.service';

@Component({
  selector: 'app-missing-benchmarks',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './missing-benchmarks.component.html',
  styleUrl: './missing-benchmarks.component.scss'
})
export class MissingBenchmarksComponent {

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
      this.keeperAPI.getServers()
    ]).then(([vendors, servers]) => {
      this.vendors = vendors;
      this.servers = servers;
    });
  }

}
