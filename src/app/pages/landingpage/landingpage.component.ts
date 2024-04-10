import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ArticleMeta, ArticlesService } from '../../services/articles.service';
import { isPlatformBrowser } from '@angular/common';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { spinner_initial_data } from './spinner_initial_data';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss'
})
export class LandingpageComponent {

  features: any[] = [
    {
      count: '8',
      text: 'vendors'
    },
    {
      count: '67',
      text: 'datacenters'
    },
    {
      count: '234',
      text: 'availability zones'
    },
    {
      count: '2494',
      text: 'server types'
    },
    {
      count: '121.312',
      text: 'price records'
    },
    {
      count: '2.5M',
      text: 'records updated daily'
    },

    {
      count: '36M',
      text: 'historical records'
    },
  ];

  gitHubComponents: any[] = [
    {
      component: 'SC Crawler',
      status: 'alpha',
      repository: 'sc-crawler',
      description: 'Inventory cloud resources into a SQlite database.'
    },
    {
      component: 'SC Data',
      status: 'alpha',
      repository: 'sc-data',
      description: 'Wrapper around data collected using the Crawler.'
    },
    {
      component: 'SC Keeper',
      status: 'pre-alpha',
      repository: 'sc-keeper',
      description: 'API to search the database.'
    },
    {
      component: 'SC Scanner',
      status: 'pre-alpha',
      repository: undefined,
      description: 'Programming language SDKs to use the API for searching.'
    },
    {
      component: 'SC Runner',
      status: 'pre-alpha',
      repository: undefined,
      description: 'Launching actual cloud instances.'
    }
  ];

  featuredArticles: ArticleMeta[] = [];

  priceValue = '$100';
  cpuCount = 2;
  ramCount = 4;
  animPriceStart = 100;
  animPriceEnd = 10;
  cheapestMachine: any = {};

  spinnerContents: any = [[], [], []];
  SPINNER_COUNT = 36;
  SPINNER_RADIUS = 780;

  isSpinning = false;
  spinnerClicked = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private keeperAPI: KeeperAPIService,
              private articles: ArticlesService) { }

  ngOnInit() {
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
      this.spinnerContents = spinner_initial_data;

      this.welcomeAnim();

      // test query remove it later
      this.keeperAPI.getServer('aws', 'a1.2xlarge').then(server => {
        console.log('Server:', server);
      }).catch(err => {
        console.error(err);
      });


    }
  }

  welcomeAnim(startingDelay: number = 1000) {

    // get the cheapest machine
    this.keeperAPI.searchServers({vcpus_min: this.cpuCount, memory_min: this.ramCount * 1024, limit: 100}).then(servers => {
      this.animPriceStart = servers[servers.length-1].price;
      this.animPriceEnd = servers[0].price;
      this.cheapestMachine = servers[0];
      console.log('Cheapest machine:', this.animPriceEnd);
      console.log(servers[0]);

      if(servers.length >= this.SPINNER_COUNT) {
        for(let i = 0; i < this.SPINNER_COUNT; i++) {
          this.spinnerContents[0][i] = { name: servers[i].vendor.vendor_id.toString().toUpperCase() };
          this.spinnerContents[1][i] = { name: servers[i].server.name};
          // reaplce datacenter name, remove the part inside ()
          this.spinnerContents[2][i] = {
            name: servers[i].datacenter?.name?.toString().replace(/\(.*\)/, ''),
            city: servers[i].datacenter?.city?.toString() };
        }
      }

      console.log('Cheapest machine:', this.spinnerContents);

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
          this.spinAnim(true);
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
    if(this.isSpinning) {
      return ''
    }
    return 'background: rgba(255,255,255,1) !important; color: #000 !important;';
  }

  spinClicked() {
    this.keeperAPI.searchServers({vcpus_min: this.cpuCount, memory_min: this.ramCount * 1024, limit: 100}).then(servers => {
      this.animPriceStart = servers[servers.length-1].price;
      this.animPriceEnd = servers[0].price;
      this.cheapestMachine = servers[0];

      this.spinAnim();
    }).catch(err => {
      console.error(err);
    });
  }

  spinAnim(isFake = false) {

    if(this.isSpinning) {
      return;
    }

    if(!isFake) {
      this.spinnerClicked = true;

      const spinButton = document.getElementById('spin_button');
      if (spinButton) {
        spinButton.style.animation = 'none';
      }
    }

    const spinners = ['ring1', 'ring2', 'ring3'];
    spinners.forEach((spinner, i) => {
      const el = document.getElementById(spinner);
      if (el) {
        el.style.animation = `${Math.random() > 0.5 ? 'spin' : 'spin-back'} ${(3.5 + i * 0.25)}s ease-in-out`;
      }
    });

    this.isSpinning = true;

    let price = this.animPriceStart;
    let fraction = (this.animPriceStart - this.animPriceEnd) / 50;

    // convert fraction to 5 decimal precision
    fraction = Math.floor(fraction * 100000) / 100000;

    let interval = setInterval(() => {
      price -= fraction;
      if(price < this.animPriceEnd) {
        price = this.animPriceEnd;
      }
      this.priceValue = '$' + Math.round(price * 10000) / 10000;
    }, 50);

    setTimeout(() => {
      this.spinnerContents[0][0] = { name: this.cheapestMachine.vendor.vendor_id.toString().toUpperCase()};
      this.spinnerContents[1][0] = { name: this.cheapestMachine.server.name};
      this.spinnerContents[2][0] = {
        name: this.cheapestMachine.datacenter?.name?.toString().replace(/\(.*\)/, ''),
        city: this.cheapestMachine.datacenter?.city?.toString()
      };
    }, 200);

    setTimeout(() => {
      spinners.forEach(spinner => {
        const el = document.getElementById(spinner);
        if (el) {
          el.style.animation = 'none';
        }
      });
      clearInterval(interval);
      this.priceValue = '$' + this.animPriceEnd;
      this.isSpinning = false;
    }, 4200)
  }

}
