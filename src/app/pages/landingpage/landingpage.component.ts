import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ArticleMeta, ArticlesService } from '../../services/articles.service';
import { isPlatformBrowser } from '@angular/common';

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

  priceValue = '$3';
  cpuCount = 2;
  ramCount = 4;

  spinnerContents: any = [[], [], []];
  SPINNER_COUNT = 36;
  SPINNER_RADIUS = 780;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
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
        spinner1.push(i);
        spinner2.push(i);
        spinner3.push(i);
      }
      this.spinnerContents = [spinner1, spinner2, spinner3];
    }
  }

  getStyle(i: number) {
    let transform = 'rotateX(' + (360 / this.SPINNER_COUNT * i) + 'deg) translateZ(' + this.SPINNER_RADIUS + 'px)';
    return {
      transform: transform
    };
  }

  spinClicked() {
    console.log('spin clicked');
    let ring = document.getElementById('ring2');
    if(ring) {
      ring.style.animation = "spin 4s ease-in-out";
    }
    let ring1 = document.getElementById('ring1');
    if(ring1) {
      ring1.style.animation = "spin-back 4s ease-in-out";
    }
    let ring3 = document.getElementById('ring3');
    if(ring3) {
      ring3.style.animation = "spin 4s ease-in-out";
    }

    setTimeout(() => {
      let ring = document.getElementById('ring2');
      if(ring) {
        ring.style.animation = "none";
      }
      let ring1 = document.getElementById('ring1');
      if(ring1) {
        ring1.style.animation = "none";
      }
      let ring3 = document.getElementById('ring3');
      if(ring3) {
        ring3.style.animation = "none";
      }
    }, 5000)
  }

}
