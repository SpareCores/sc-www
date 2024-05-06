import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ArticleMeta, ArticlesService } from '../../services/articles.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { spinner_initial_data } from '../../tools/spinner_initial_data';
import { SearchServerSearchGetData } from '../../../../sdk/data-contracts';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FormsModule } from '@angular/forms';
import { ThemeTextComponent } from '../../components/theme-text/theme-text.component';
import { RouterLink } from '@angular/router';
import { TimeToShortDatePipe } from '../../pipes/time-to-short-date.pipe';
import { LucideAngularModule } from 'lucide-angular';
import { ArticleCardComponent } from '../../components/article-card/article-card.component';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeTextComponent, RouterLink, TimeToShortDatePipe, LucideAngularModule, ArticleCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss'
})
export class LandingpageComponent {

  features: any[] = [
    {
      count: '3',
      text: '(out of 8 planned) vendors'
    },
    {
      count: '76',
      text: 'datacenters'
    },
    {
      count: '338',
      text: 'availability zones'
    },
    {
      count: '1354',
      text: 'server types'
    },
    {
      count: '133.483',
      text: 'price records'
    },
    {
      count: '~5k',
      text: 'records updated hourly'
    },

    {
      count: '~10M',
      text: 'historical records'
    },
  ];

  gitHubComponents: any[] = [
    {
      component: 'SC Crawler',
      status: 'alpha',
      github: 'sc-crawler',
      pypi: 'sparecores-crawler',
      docs: 'sc-crawler',
      description: 'Inventory cloud resources into a SQlite database.'
    },
    {
      component: 'SC Inspector',
      status: 'planning',
      description: 'Inspect and benchmark cloud resources.'
    },
    {
      component: 'SC Data',
      status: 'alpha',
      github: 'sc-data',
      pypi: 'sparecores-data',
      description: 'Wrapper around data collected using the Crawler.'
    },
    {
      component: 'SC Keeper',
      status: 'pre-alpha',
      description: 'API to search the Data.',
      github: 'sc-keeper',
    },
    {
      component: 'SC Scanner',
      status: 'pre-alpha',
      description: 'Web frontend and programming language SDKs for Keeper.',
      www: 'https://github.com/SpareCores/sc-www'
    },
    {
      component: 'SC Runner',
      status: 'planning',
      description: 'Launching actual cloud instances.'
    }
  ];

  featuredArticles: ArticleMeta[] = [];

  priceValue = '$0.00150';
  cpuCount = 2;
  ramCount = 4;

  spinnerContents: any = spinner_initial_data;
  SPINNER_COUNT = 36;
  SPINNER_RADIUS = 780;
  MAX_CPU_COUNT = 128;
  MAX_RAM_COUNT = 512;

  isSpinning = false;
  spinnerClicked = false;
  hasRealValues = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService,
              private SEOHandler: SeoHandlerService,
              private articles: ArticlesService) { }

  ngOnInit() {

    this.SEOHandler.updateTitleAndMetaTags(
       'Spare Cores: Inventory and Tooling for Cloud Compute Resources',
       'Harnessing the compute resources of the cloud to optimize efficiency and costs of batch and service tasks.',
       'cloud, server, price, comparison, sparecores');

    this.SEOHandler.updateThumbnail('https://sparecores.com/assets/images/media/landing_image.png');

    if (isPlatformBrowser(this.platformId)) {
      this.articles.getArticlesByType('featured').then(articles => {
        this.featuredArticles = articles;
      });

      let spinner1 = [];
      let spinner2 = [];
      let spinner3 = [];
      for(let i = 0; i < this.SPINNER_COUNT; i++) {
        spinner1.push({name: 'AWS'});
        spinner2.push({name: 't4g.nano'});
        spinner3.push({name: 'US East', city: 'Ashburn'});
      }
      this.welcomeAnim();
    }
  }

  welcomeAnim(startingDelay: number = 1000) {

    // get the cheapest machine
    this.keeperAPI.searchServers({vcpus_min: this.cpuCount, memory_min: this.ramCount * 1024, limit: 100}).then(servers => {

      if(!this.spinnerClicked) {

        setTimeout(() => {
          if(!this.spinnerClicked) {
            // move spin_button up and down a bit to attact attention
            const spinButton = document.getElementById('spin_button');
            if (spinButton) {
              spinButton.style.animation = 'bounce 1s 3';
            }
          }
        }, startingDelay + 7000);

        setTimeout(() => {

          const spinButton = document.getElementById('spin_button');
          if (spinButton) {
            spinButton.style.animation = 'press 2.5s';
          }

          this.spinAnim(servers.body, true);
        }, startingDelay);
      }

    }).catch(err => {
      console.error(err);
    });
  }

  getStyle(i: number) {
    let transform = 'rotateX(' + (360 / this.SPINNER_COUNT * i) + 'deg) translateZ(' + this.SPINNER_RADIUS + 'px)';
    return {
      transform: transform
    };
  }

  getInnerStyle(i: number) {
    if(i > 0) {
      return '';
    }

    if(this.isSpinning || !this.hasRealValues) {
      return ''
    }

    return 'background: rgba(255,255,255,1) !important; color: #000 !important;';
  }

  spinClicked() {

    if(this.cpuCount > this.MAX_CPU_COUNT) {
      this.cpuCount = this.MAX_CPU_COUNT;
    }
    if(this.ramCount > this.MAX_RAM_COUNT) {
      this.ramCount = this.MAX_RAM_COUNT;
    }

    const spinButton = document.getElementById('spin_button');
    if (spinButton) {
      spinButton.style.animation = 'press 2.5s';
    }

    this.keeperAPI.searchServers({vcpus_min: this.cpuCount, memory_min: this.ramCount * 1024, limit: 100}).then(servers => {
      console.log('Servers:', servers);
      this.spinAnim(servers.body);
    }).catch(err => {
      console.error(err);
    });
  }

  spinAnim(servers: SearchServerSearchGetData, isFake = false) {

    if(this.isSpinning) {
      return;
    }

    if(!isFake) {
      this.spinnerClicked = true;
    }

    const spinners = ['ring1', 'ring2', 'ring3'];
    spinners.forEach((spinner, i) => {
      const el = document.getElementById(spinner);
      if (el) {
        el.style.animation = `${Math.random() > 0.5 ? 'spin-slot' : 'spin-back-slot'} ${(3.5 + i * 0.25)}s ease-in-out`;
      }
    });

    this.isSpinning = true;

    let animPriceStart = servers[servers.length-1].price;
    let animPriceEnd = servers[0].price;

    let price = animPriceStart;
    let fraction = (animPriceStart - animPriceEnd) / 50;

    // convert fraction to 5 decimal precision
    fraction = Math.floor(fraction * 100000) / 100000;

    let interval = setInterval(() => {
      price -= fraction;
      if(price < animPriceEnd) {
        price = animPriceEnd;
      }
      this.priceValue = '$' + Math.round(price * 10000) / 10000;
    }, 50);

    setTimeout(() => {
      let indices = [0, 1, 35];
      indices.forEach((index, i) => {
        this.spinnerContents[0][index] = { name: servers[i].vendor.vendor_id.toString().toUpperCase(), logo: servers[i].vendor.logo};
        this.spinnerContents[1][index] = { name: servers[i].server.name, architecture: servers[i].server.cpu_architecture};
        this.spinnerContents[2][index] = {
          name: servers[i].datacenter?.city?.toString() || servers[i].datacenter?.state?.toString(),
          city: servers[i].zone?.name?.toString().replace(/\(.*\)/, '')
        };
      });
    }, 500);

    setTimeout(() => {
      const spinButton = document.getElementById('spin_button');
      if (spinButton) {
        spinButton.style.animation = 'none';
      }

      spinners.forEach(spinner => {
        const el = document.getElementById(spinner);
        if (el) {
          el.style.animation = 'none';
        }
      });
      clearInterval(interval);
      this.priceValue = '$' + animPriceEnd;
      this.isSpinning = false;
      this.hasRealValues = true;
    }, 4200)
  }
}
