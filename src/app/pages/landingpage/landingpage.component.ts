import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { ArticleMeta, ArticlesService } from '../../services/articles.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { spinner_initial_data } from '../../tools/spinner_initial_data';
import { SeoHandlerService } from '../../services/seo-handler.service';
import { FormsModule } from '@angular/forms';
import { ThemeTextComponent } from '../../components/theme-text/theme-text.component';
import { RouterLink } from '@angular/router';
import { TimeToShortDatePipe } from '../../pipes/time-to-short-date.pipe';
import { LucideAngularModule } from 'lucide-angular';
import { ArticleCardComponent } from '../../components/article-card/article-card.component';
import { SearchServerPricesServerPricesGetData } from '../../../../sdk/data-contracts';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeTextComponent, RouterLink, TimeToShortDatePipe, LucideAngularModule, ArticleCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss'
})
export class LandingpageComponent implements OnInit {

  features: any[] = [
    {
      count: '3',
      text: '(out of 8 planned) vendors'
    },
    {
      count: '217',
      text: 'availability zones'
    },
    {
      count: '1120',
      text: 'server types'
    },
    {
      count: '216,714',
      text: 'benchmark scores'
    },
    {
      count: '135,988',
      text: 'live price records'
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
              private articles: ArticlesService,
              private analyticsService: AnalyticsService) { }

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

      const spinner1 = [];
      const spinner2 = [];
      const spinner3 = [];
      for(let i = 0; i < this.SPINNER_COUNT; i++) {
        spinner1.push({name: 'AWS'});
        spinner2.push({name: 't4g.nano'});
        spinner3.push({name: 'US East', city: 'Ashburn'});
      }
      this.welcomeAnim();

      document.getElementById('ramCount')?.addEventListener('keypress', function(e) {
        if (!/[0-9]/.test(String.fromCharCode(e.which))) {
          e.preventDefault();
        }
      });

      document.getElementById('cpuCount')?.addEventListener('keypress', function(e) {
        if (!/[0-9]/.test(String.fromCharCode(e.which))) {
          e.preventDefault();
        }
      });

    }
  }

  welcomeAnim(startingDelay: number = 1000) {

    // get the cheapest machine
    this.keeperAPI.searchServerPrices({vcpus_min: this.cpuCount, memory_min: this.ramCount, limit: 100}).then(servers => {

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
            spinButton.style.animation = 'press 1.0s';
          }

          this.spinAnim(servers.body, true);
        }, startingDelay);
      }

    }).catch(err => {
      console.error(err);
    });
  }

  getStyle(i: number) {
    const transform = 'rotateX(' + (360 / this.SPINNER_COUNT * i) + 'deg) translateZ(' + this.SPINNER_RADIUS + 'px)';
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

    if(Number.isNaN(this.cpuCount) || !this.cpuCount || this.cpuCount < 1) {
      this.cpuCount = 2;
    }

    if(Number.isNaN(this.ramCount) || !this.ramCount || this.ramCount < 0.1) {
      this.ramCount = 4;
    }

    if(this.cpuCount > this.MAX_CPU_COUNT) {
      this.cpuCount = this.MAX_CPU_COUNT;
    }
    if(this.ramCount > this.MAX_RAM_COUNT) {
      this.ramCount = this.MAX_RAM_COUNT;
    }

    const spinButton = document.getElementById('spin_button');
    if (spinButton) {
      spinButton.style.animation = 'press 1.0s';
    }

    this.keeperAPI.searchServerPrices({vcpus_min: this.cpuCount, memory_min: this.ramCount, limit: 100}).then(servers => {
      this.spinAnim(servers.body);
    }).catch(err => {
      console.error(err);
    });
  }

  spinAnim(servers: SearchServerPricesServerPricesGetData, isFake = false) {

    this.analyticsService.trackEvent('slot machine started', {'autostarted': isFake});
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

    const animPriceStart = servers[servers.length-1].price;
    const animPriceEnd = servers[0].price;

    let price = animPriceStart;
    let fraction = (animPriceStart - animPriceEnd) / 50;

    // convert fraction to 5 decimal precision
    fraction = Math.floor(fraction * 100000) / 100000;

    const interval = setInterval(() => {
      price -= fraction;
      if(price < animPriceEnd) {
        price = animPriceEnd;
      }
      this.priceValue = '$' + Math.round(price * 10000) / 10000;
    }, 50);

    setTimeout(() => {
      const indices = [0, 1, 35];
      let top3server = servers.slice(0, 3);

      // try to find 3 different machines from servers
      for(let i = 1; i < 3; i++) {
        let server = servers.find(s => top3server.findIndex((t)=> t.server.server_id === s.server.server_id) === -1);
        if(server) {
          top3server[i] = server;
        }
      }

      indices.forEach((index, i) => {
        this.spinnerContents[0][index] = { name: top3server[i].vendor.vendor_id.toString().toUpperCase(), logo: top3server[i].vendor.logo};
        this.spinnerContents[1][index] = { name: top3server[i].server.display_name, architecture: top3server[i].server.cpu_architecture};
        this.spinnerContents[2][index] = {
          name: top3server[i].region?.display_name,
          city: top3server[i].zone?.display_name
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
      this.analyticsService.trackEvent('slot machine finished', {'autostarted': isFake});
    }, 4200)
  }
}
