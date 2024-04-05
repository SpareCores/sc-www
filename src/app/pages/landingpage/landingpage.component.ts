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
      github: 'sc-crawler',
      pypi: 'sparecores-crawler',
      docs: 'sc-crawler',
      description: 'Inventory cloud resources into a SQlite database.'
    },
    {
      component: 'SC Inspector',
      status: 'pre-alpha',
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
      description: 'API to search the Data.'
    },
    {
      component: 'SC Scanner',
      status: 'pre-alpha',
      description: 'Web frontend and programming language SDKs for Keeper.',
      www: 'https://github.com/SpareCores/sc-www'
    },
    {
      component: 'SC Runner',
      status: 'pre-alpha',
      description: 'Launching actual cloud instances.'
    }
  ];

  featuredArticles: ArticleMeta[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private articles: ArticlesService) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.articles.getArticlesByType('featured').then(articles => {
        this.featuredArticles = articles;
      });
    }
  }

}
