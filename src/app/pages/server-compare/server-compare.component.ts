/* eslint-disable prefer-const */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
    { name: 'Processor', key: 'processor' },
    { name: 'Memory', key: 'memory' },
    { name: 'Storage', key: 'storage' },
    { name: 'GPU', key: 'gpu' },
    { name: 'GPU Memory', key: 'gpu_memory' }
  ];

  clipboardIcon = 'clipboard';

  @ViewChild('tooltipDefault') tooltip!: ElementRef;

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

  toUpper(text: string) {
    return text.toUpperCase();
  }

  clipboardURL(event: any) {
    const url = window.location.href;
    navigator.clipboard.writeText(url);

    this.clipboardIcon = 'check';

    this.showTooltip(event);

    setTimeout(() => {
      this.clipboardIcon = 'clipboard';
    }, 3000);

  }

  getMemory(item: ServerPKsWithPrices) {
    return ((item.memory || 0) / 1024).toFixed(1) + ' GB';
  }

  getGPUMemory(item: ServerPKsWithPrices) {
    return ((item.gpu_memory_min || 0) / 1024).toFixed(1) + ' GB';
  }

  getStorage(item: ServerPKsWithPrices) {
    if(!item.storage_size) return '-';

    if(item.storage_size < 1000) return `${item.storage_size} GB`;

    return `${(item.storage_size / 1000).toFixed(1)} TB`;
  }

  viewServer(server: ServerPKsWithPrices) {
    window.open(`/server/${server.vendor_id}/${server.server_id}`, '_blank');
  }

  showTooltip(el: any) {
      const tooltip = this.tooltip.nativeElement;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
      tooltip.style.top = `${el.target.getBoundingClientRect().top - 45 + scrollPosition}px`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';

      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

}
