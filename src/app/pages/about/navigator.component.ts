import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeTextComponent } from '../../components/theme-text/theme-text.component';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-navigator',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent, LucideAngularModule, ThemeTextComponent, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './navigator.component.html',
  styleUrl: './navigator.component.scss'
})
export class AboutNavigatorComponent {

  constructor(@Inject(PLATFORM_ID) private platformId: object,
  private SEOHandler: SeoHandlerService) { }

  vendors: any[] = [
    '✅ Amazon Web Services (Done)',
    '✅ Google Cloud Platform (Done)',
    '✅ Hetzner Cloud (Done)',
    '✅ Microsoft Azure (Done)',
    '✅ UpCloud (Done)',
    '⚙️ Vultr (In Progress)',
    '🗓️ Oracle Cloud Infrastructure (Planned)',
    '🗓️ Scaleway (Planned)',
    '🗓️ Alibaba Cloud (Planned)',
    '🗓️ OVH Cloud (Planned)',
  ];

  features: any[] = [
    {
      count: '353',
      text: 'availability zones'
    },
    {
      count: '2344',
      text: 'server types'
    },
    {
      count: '970,000+',
      text: 'benchmark scores'
    },
    {
      count: '~310,000',
      text: 'live price records'
    },
    {
      count: '~5k',
      text: 'records updated hourly'
    },

    {
      count: '~45M',
      text: 'historical records'
    },
  ];

  quotes = [
    {
      quote: 'This is super cool. The folks at &#64;SpareCores built something that compares compute, storage, and transit across multiple providers, creating more transparency into cloud infra pricing. 💯',
      author: 'CEO &#64; The Duckbill Group',
      source: 'Twitter/X',
      source_url: 'https://x.com/mike_julian/status/1845555820635066462'
    }
  ];

  gitHubComponents: any[] = [
    {
      component: 'SC Crawler',
      status: 'Beta',
      github: 'sc-crawler',
      pypi: 'sparecores-crawler',
      docs: 'https://sparecores.github.io/sc-crawler',
      description: 'Inventory cloud resources into a SQlite database.',
    },
    {
      component: 'SC Inspector',
      status: 'Beta',
      description: 'Inspect and benchmark cloud resources.',
      github: 'sc-inspector',
      data: 'https://github.com/SpareCores/sc-inspector-data',
    },
    {
      component: 'SC Data',
      status: 'Beta',
      github: 'sc-data',
      pypi: 'sparecores-data',
      description: 'Wrapper around data collected using the Crawler.',
      data: 'https://sc-data-public-40e9d310.s3.amazonaws.com/sc-data-all.db.bz2',
    },
    {
      component: 'SC Keeper',
      status: 'Alpha',
      description: 'API to search the Data.',
      github: 'sc-keeper',
      docs: 'https://keeper.sparecores.net/docs',
      api: 'https://keeper.sparecores.net',
    },
    {
      component: 'SC Scanner',
      status: 'Stable',
      description: 'Web frontend and programming language SDKs for Keeper.',
      www: 'https://github.com/SpareCores/sc-www',
    },
    {
      component: 'SC Runner',
      status: 'Beta',
      description: 'Launching actual cloud instances.',
      github: 'sc-runner',
    }
  ];


  @ViewChild('tooltipVendors') tooltip!: ElementRef;
  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: 'Home',
      url: '/'
    },
    {
      name: 'About'
    },
    {
      name: 'Navigator',
      url: '/about/navigator'
    }
  ];

  ngOnInit() {
    this.SEOHandler.updateTitleAndMetaTags(
      // TODO update title and description
       'Spare Cores: Inventory and Tooling for Cloud Compute Resources',
       'Harnessing the compute resources of the cloud to optimize efficiency and costs of batch and service tasks.',
       'cloud, server, price, comparison, sparecores');
    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/landing_image.png');
  }

  showTooltip(el: any) {
    const tooltip = this.tooltip.nativeElement;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    tooltip.style.left = `${el.target.getBoundingClientRect().left - 25}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().bottom + 5 + scrollPosition}px`;

    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
  }
  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }
}
