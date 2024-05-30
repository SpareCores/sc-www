/* eslint-disable prefer-const */
import { Component, OnInit } from '@angular/core';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServerPKsWithPrices } from '../../../../sdk/data-contracts';
import { SeoHandlerService } from '../../services/seo-handler.service';

@Component({
  selector: 'app-server-compare',
  standalone: true,
  imports: [BreadcrumbsComponent, LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './server-compare.component.html',
  styleUrl: './server-compare.component.scss'
})
export class ServerCompareComponent implements OnInit {


  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'Compare Instances', url: '/compare' }
  ];

  isLoading = true;

  servers: ServerPKsWithPrices[] = [];

  fields: any[] = [
    { name: 'CPU', key: 'cpu' },
    { name: 'RAM', key: 'ram' },
    { name: 'Storage', key: 'storage' },
    { name: 'Network', key: 'network' },
    { name: 'Price', key: 'price' }
  ];

  constructor(
    private keeperAPI: KeeperAPIService,
    private seoHandler: SeoHandlerService,
    private route: ActivatedRoute) { }

  ngOnInit() {

    const title = 'Compare Servers';
    const description = 'Compare servers to find the best one for your needs';
    const keywords = 'compare, servers, server, hosting, cloud, vps, dedicated, comparison';

    this.seoHandler.updateTitleAndMetaTags(title, description, keywords);

    this.route.queryParams.subscribe(params => {
      const param = params['instances'];
      if(param){
          const decodedParams = JSON.parse(atob(param));
          let promises: Promise<any>[] = [];
          decodedParams?.forEach((instance: any) => {
            promises.push(
              this.keeperAPI.getServer(instance.vendor, instance.server)
            );
          });
          Promise.all(promises).then((data) => {
            data?.forEach((server: any) => {
              this.servers.push(server.body);
            });
            this.isLoading = false;
          });
      }
    });
  }

}
